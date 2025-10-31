package storage

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
)

// S3Storage handles file operations with AWS S3
type S3Storage struct {
	client          *s3.Client
	bucket          string
	region          string
	cloudFrontURL   string
	presignClient   *s3.PresignClient
}

// NewS3Storage creates a new S3 storage instance
func NewS3Storage() (*S3Storage, error) {
	bucket := os.Getenv("S3_BUCKET")
	if bucket == "" {
		return nil, fmt.Errorf("S3_BUCKET environment variable not set")
	}

	region := os.Getenv("AWS_REGION")
	if region == "" {
		region = "us-east-1" // default
	}

	cloudFrontURL := os.Getenv("CLOUDFRONT_DOMAIN")
	if cloudFrontURL == "" {
		return nil, fmt.Errorf("CLOUDFRONT_DOMAIN environment variable not set")
	}

	// Load AWS configuration
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(region),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to load AWS config: %w", err)
	}

	client := s3.NewFromConfig(cfg)

	log.Printf("✅ S3 Storage initialized: bucket=%s, region=%s, cloudfront=%s",
		bucket, region, cloudFrontURL)

	return &S3Storage{
		client:        client,
		bucket:        bucket,
		region:        region,
		cloudFrontURL: cloudFrontURL,
		presignClient: s3.NewPresignClient(client),
	}, nil
}

// UploadFile uploads a file to S3
// Returns the CloudFront URL for accessing the file
func (s *S3Storage) UploadFile(ctx context.Context, key string, file io.Reader, contentType string) (string, error) {
	// Read file content into buffer
	buf := new(bytes.Buffer)
	size, err := io.Copy(buf, file)
	if err != nil {
		return "", fmt.Errorf("failed to read file: %w", err)
	}

	log.Printf("[S3] Uploading file: key=%s, size=%d bytes, contentType=%s", key, size, contentType)

	// Upload to S3
	_, err = s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:        aws.String(s.bucket),
		Key:           aws.String(key),
		Body:          bytes.NewReader(buf.Bytes()),
		ContentType:   aws.String(contentType),
		ContentLength: aws.Int64(size),
		// Cache control for CloudFront
		CacheControl: aws.String("public, max-age=31536000, immutable"),
		// ACL: private (access only through CloudFront)
		ACL: types.ObjectCannedACLPrivate,
	})

	if err != nil {
		return "", fmt.Errorf("failed to upload to S3: %w", err)
	}

	// Return CloudFront URL
	url := fmt.Sprintf("https://%s/%s", s.cloudFrontURL, key)
	log.Printf("[S3] Upload successful: %s", url)

	return url, nil
}

// DeleteFile deletes a file from S3
func (s *S3Storage) DeleteFile(ctx context.Context, key string) error {
	log.Printf("[S3] Deleting file: key=%s", key)

	_, err := s.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	})

	if err != nil {
		return fmt.Errorf("failed to delete from S3: %w", err)
	}

	log.Printf("[S3] Delete successful: %s", key)
	return nil
}

// GetPresignedURL generates a presigned URL for temporary access to a file
// Used for premium content that requires authentication
func (s *S3Storage) GetPresignedURL(ctx context.Context, key string, duration time.Duration) (string, error) {
	request, err := s.presignClient.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	}, func(opts *s3.PresignOptions) {
		opts.Expires = duration
	})

	if err != nil {
		return "", fmt.Errorf("failed to generate presigned URL: %w", err)
	}

	return request.URL, nil
}

// FileExists checks if a file exists in S3
func (s *S3Storage) FileExists(ctx context.Context, key string) (bool, error) {
	_, err := s.client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	})

	if err != nil {
		// Check if error is "NotFound"
		return false, nil
	}

	return true, nil
}

// GetFileSize returns the size of a file in S3
func (s *S3Storage) GetFileSize(ctx context.Context, key string) (int64, error) {
	result, err := s.client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	})

	if err != nil {
		return 0, fmt.Errorf("failed to get file info: %w", err)
	}

	return aws.ToInt64(result.ContentLength), nil
}

// GetCloudFrontURL returns the CloudFront URL for a given S3 key
func (s *S3Storage) GetCloudFrontURL(key string) string {
	return fmt.Sprintf("https://%s/%s", s.cloudFrontURL, key)
}

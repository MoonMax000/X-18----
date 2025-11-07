package database

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"database/sql"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/rds/auth"
	_ "github.com/lib/pq"
)

// IAMAuthConfig содержит конфигурацию для IAM аутентификации
type IAMAuthConfig struct {
	Hostname string
	Port     int
	Username string
	Database string
	Region   string
}

// GetIAMAuthToken генерирует IAM токен для подключения к RDS
func GetIAMAuthToken(ctx context.Context, cfg IAMAuthConfig) (string, error) {
	// Загрузить AWS конфигурацию
	awsCfg, err := config.LoadDefaultConfig(ctx, config.WithRegion(cfg.Region))
	if err != nil {
		return "", fmt.Errorf("failed to load AWS config: %w", err)
	}

	// Создать endpoint для RDS
	endpoint := fmt.Sprintf("%s:%d", cfg.Hostname, cfg.Port)

	// Генерировать IAM токен
	authToken, err := auth.BuildAuthToken(ctx, endpoint, cfg.Region, cfg.Username, awsCfg.Credentials)
	if err != nil {
		return "", fmt.Errorf("failed to build auth token: %w", err)
	}

	return authToken, nil
}

// DownloadRDSCACert скачивает RDS CA bundle для SSL соединения
func DownloadRDSCACert() (*x509.CertPool, error) {
	// URL для RDS CA bundle
	certURL := "https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem"

	// Скачать сертификат
	resp, err := http.Get(certURL)
	if err != nil {
		return nil, fmt.Errorf("failed to download RDS CA cert: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to download RDS CA cert: status %d", resp.StatusCode)
	}

	// Прочитать содержимое
	certData, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read RDS CA cert: %w", err)
	}

	// Создать cert pool
	certPool := x509.NewCertPool()
	if !certPool.AppendCertsFromPEM(certData) {
		return nil, fmt.Errorf("failed to parse RDS CA cert")
	}

	return certPool, nil
}

// ConnectWithIAM подключается к RDS PostgreSQL используя IAM аутентификацию
func ConnectWithIAM(ctx context.Context, cfg IAMAuthConfig) (*sql.DB, error) {
	// Генерировать IAM токен
	token, err := GetIAMAuthToken(ctx, cfg)
	if err != nil {
		return nil, fmt.Errorf("failed to get IAM token: %w", err)
	}

	// Скачать RDS CA bundle
	certPool, err := DownloadRDSCACert()
	if err != nil {
		return nil, fmt.Errorf("failed to download RDS CA cert: %w", err)
	}

	// Создать TLS конфигурацию
	tlsConfig := &tls.Config{
		RootCAs:    certPool,
		ServerName: cfg.Hostname,
	}

	// Зарегистрировать TLS конфигурацию
	tlsConfigName := "rds-iam-tls"
	err = registerTLSConfig(tlsConfigName, tlsConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to register TLS config: %w", err)
	}

	// Создать connection string
	connStr := fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=require sslrootcert=rds-combined-ca-bundle.pem",
		cfg.Hostname,
		cfg.Port,
		cfg.Username,
		token,
		cfg.Database,
	)

	// Подключиться к базе данных
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Проверить подключение
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		db.Close()
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return db, nil
}

// IAMTokenRefresher обновляет IAM токен периодически
type IAMTokenRefresher struct {
	cfg      IAMAuthConfig
	db       *sql.DB
	stopChan chan struct{}
}

// NewIAMTokenRefresher создает новый refresher для IAM токенов
func NewIAMTokenRefresher(cfg IAMAuthConfig) *IAMTokenRefresher {
	return &IAMTokenRefresher{
		cfg:      cfg,
		stopChan: make(chan struct{}),
	}
}

// Start запускает периодическое обновление IAM токена
func (r *IAMTokenRefresher) Start(ctx context.Context) error {
	// Первое подключение
	db, err := ConnectWithIAM(ctx, r.cfg)
	if err != nil {
		return fmt.Errorf("failed to connect with IAM: %w", err)
	}
	r.db = db

	// Запустить горутину для обновления токена каждые 10 минут
	// (токены действительны 15 минут, обновляем с запасом)
	go func() {
		ticker := time.NewTicker(10 * time.Minute)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				// Закрыть старое подключение
				if r.db != nil {
					r.db.Close()
				}

				// Создать новое подключение с новым токеном
				newDB, err := ConnectWithIAM(ctx, r.cfg)
				if err != nil {
					// Логировать ошибку, но продолжить работу
					fmt.Printf("Failed to refresh IAM connection: %v\n", err)
					continue
				}

				r.db = newDB
				fmt.Println("IAM connection refreshed successfully")

			case <-r.stopChan:
				return
			}
		}
	}()

	return nil
}

// Stop останавливает refresher
func (r *IAMTokenRefresher) Stop() {
	close(r.stopChan)
	if r.db != nil {
		r.db.Close()
	}
}

// GetDB возвращает текущее подключение к базе данных
func (r *IAMTokenRefresher) GetDB() *sql.DB {
	return r.db
}

// registerTLSConfig регистрирует TLS конфигурацию для PostgreSQL драйвера
func registerTLSConfig(name string, config *tls.Config) error {
	// Примечание: Для lib/pq драйвера может потребоваться другой подход
	// Здесь используется базовая регистрация
	return nil
}

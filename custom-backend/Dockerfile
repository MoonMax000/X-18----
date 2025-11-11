# Multi-stage build for optimal image size
# Stage 1: Build the application
FROM golang:1.24-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git make gcc musl-dev

# Set working directory
WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies with caching
RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download

# Copy source code
COPY . .

# Build the application with caching
# CGO_ENABLED=1 required for go-webp library
# -ldflags for smaller binary size
RUN --mount=type=cache,target=/root/.cache/go-build \
    --mount=type=cache,target=/go/pkg/mod \
    CGO_ENABLED=1 GOOS=linux go build \
    -ldflags="-w -s" \
    -o /app/server \
    ./cmd/server

# Stage 2: Runtime image
FROM alpine:latest

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates tzdata

# Set timezone to UTC
ENV TZ=UTC

# Create non-root user for security
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser

# Set working directory
WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/server .

# Copy migrations (if needed at runtime)
COPY --from=builder /app/internal/database/migrations ./migrations

# Create directory for Apple keys and copy the key file
RUN mkdir -p /app/apple-keys
COPY AuthKey_4QUQ4U396S.p8 /app/apple-keys/
RUN chmod 600 /app/apple-keys/AuthKey_4QUQ4U396S.p8

# Change ownership to non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Run the application
CMD ["./server"]

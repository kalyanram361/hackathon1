# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application code
COPY package*.json ./
COPY src ./src

# Create data directory for SQLite
RUN mkdir -p data

# Expose port
EXPOSE 5000

# Run migrations on startup
RUN echo '#!/bin/sh\nnode src/migrate-sqlite.js && node src/server.js' > /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

# Use dumb-init to handle signals properly
ENTRYPOINT ["/usr/sbin/dumb-init", "--"]

# Start the application
CMD ["sh", "/app/entrypoint.sh"]

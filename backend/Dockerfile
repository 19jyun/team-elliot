# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/
COPY scripts ./scripts/

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Merge multi-schema files before Prisma commands
RUN node scripts/merge-schemas.js

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install OpenSSL and PostgreSQL client for Prisma and backup
RUN apk add --no-cache openssl postgresql-client

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application and necessary files
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/scripts ./scripts

# Create uploads and backups directories and set permissions
RUN mkdir -p /app/uploads/teacher-photos /app/uploads/principal-photos /app/uploads/ballet-poses /app/backups
RUN chown -R nestjs:nodejs /app/uploads /app/backups /app/scripts

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node scripts/health-check.js || exit 1

# Start the application with migration
# Note: Schema is already merged during build, so we can use the merged schema.prisma
CMD ["sh", "-c", "npx prisma migrate deploy && npm run seed:deploy && node dist/src/main"] 
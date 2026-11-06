# ==============================================================================
# BuildIntel Frontend Dockerfile
# Multi-stage build producing production Angular SPA served via Nginx reverse proxy
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Angular SPA
# ------------------------------------------------------------------------------
FROM node:24-alpine AS builder
WORKDIR /app

# Install dependencies first for Docker layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source code and compile production bundles
COPY . .
RUN npm run build -- --configuration production

# ------------------------------------------------------------------------------
# Stage 2: Serve via Nginx with API Reverse Proxy
# ------------------------------------------------------------------------------
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Clean default Nginx files
RUN rm -rf ./*

# Copy built browser bundle from builder stage
COPY --from=builder /app/dist/buildintel-frontend/browser ./

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]


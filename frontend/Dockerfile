# ============================================================
# BloodLife Frontend — Production Dockerfile
# ============================================================
# MULTI-STAGE BUILD:
#   Stage 1: Build the React app (Node.js)
#   Stage 2: Serve static files via Nginx (tiny image)
# ============================================================

# ---------- STAGE 1: BUILD ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (dev + prod, needed for Vite)
RUN npm install

# Copy source code
COPY . .

# Build the production bundle
# VITE_API_URL is passed at build time — see docker-compose.yml
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---------- STAGE 2: SERVE ----------
FROM nginx:alpine

# Remove default Nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy built React app from stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (Nginx default)
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start Nginx (runs in foreground)
CMD ["nginx", "-g", "daemon off;"]
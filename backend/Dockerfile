# ============================================================
# BloodLife Backend — Production Dockerfile
# ============================================================
# Base: Node.js 20 on Alpine Linux (tiny, ~50 MB vs 900 MB)
# ============================================================

FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files first (better Docker layer caching)
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy the rest of the backend code
COPY . .

# Expose port 5000 (Express default)
EXPOSE 5000

# Health check (Docker can monitor this)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start the server
CMD ["npm", "start"]
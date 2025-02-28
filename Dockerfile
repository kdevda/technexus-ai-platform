FROM node:18-alpine

WORKDIR /app

# Copy package.json files
COPY server/package*.json ./server/

# Install server dependencies
RUN cd server && npm install

# Copy server source code
COPY server ./server/

# Build server
RUN cd server && npm run build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8000

# Start the server
CMD cd server && npx prisma migrate deploy && node dist/index.js 
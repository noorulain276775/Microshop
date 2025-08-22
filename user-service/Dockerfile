# Use Node 18 Alpine
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and tsconfig
COPY package*.json tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 4000

# Start app
CMD ["npm", "start"]

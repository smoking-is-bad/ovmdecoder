FROM node:24-slim

WORKDIR /app

# Install necessary build dependencies for native modules
RUN apt-get update && apt-get install -y \
  build-essential \
  python3 \
  && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json (if exists)
COPY package.json .
COPY package-lock.json .

# Install dependencies
RUN npm install

# Copy the rest of your application
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]

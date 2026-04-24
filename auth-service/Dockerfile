FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY node_modules ./node_modules
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]

FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY node_modules ./node_modules
COPY . .
EXPOSE 3003
CMD ["node", "server.js"]

FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY node_modules ./node_modules
COPY . .
RUN mkdir -p uploads
EXPOSE 3002
CMD ["node", "server.js"]

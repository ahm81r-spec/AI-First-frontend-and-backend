FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY database ./database
COPY api-product/src/products.js ./api-product/src/products.js

USER node
EXPOSE 3000

CMD ["node", "src/server.js"]

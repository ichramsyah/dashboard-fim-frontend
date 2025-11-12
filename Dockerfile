FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./

RUN npm install --production --legacy-peer-deps

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

EXPOSE 3000

CMD ["npm", "start"]

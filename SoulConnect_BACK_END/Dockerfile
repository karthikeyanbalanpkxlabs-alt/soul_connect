FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN apk add --no-cache socat
COPY . .
RUN npm run build
EXPOSE 3000
CMD socat TCP-LISTEN:4000,fork TCP:host.docker.internal:4000 & npm start

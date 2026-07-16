# ---------- deps stage ----------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# ---------- build stage ----------
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- runtime stage: serve the static export with nginx ----------
FROM nginx:1.27-alpine AS runner
COPY --from=build /app/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

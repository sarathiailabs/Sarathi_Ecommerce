# Build Stage
FROM node:20-alpine AS build

WORKDIR /frontend

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build -- --outDir dist 2>&1 || (echo "Build failed, showing error details:" && exit 1)

# Production Stage
FROM nginx:stable-alpine

# Copy build artifacts to nginx public directory
COPY --from=build /frontend/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]

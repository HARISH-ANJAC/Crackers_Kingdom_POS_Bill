# Stage 1: Build Admin Web App
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies inside the container
# Use --legacy-peer-deps as React Native projects often have dependency conflicts
RUN npm install --legacy-peer-deps

COPY . .

ENV PUBLIC_URL=/admin/

# Build using Webpack (output goes to /dist)
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

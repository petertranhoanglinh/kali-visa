# Stage 1: Build the Angular app
FROM node:18-alpine AS build
WORKDIR /app

# Chỉ copy file quản lý thư viện trước
COPY package*.json ./

# Cài đặt thư viện - Bước này sẽ được CACHED nếu package.json không đổi
RUN npm install --quiet

# Copy toàn bộ source code (Đã loại bỏ node_modules qua .dockerignore)
COPY . .

# Build dự án
RUN npm run build -- --configuration production

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Lưu ý: Kiểm tra chính xác folder trong dist/ là gì (thường là tên project)
COPY --from=build /app/dist/angular-metarial /usr/share/nginx/html

# Copy file cấu hình nginx của bạn
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
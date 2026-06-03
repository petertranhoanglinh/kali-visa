FROM nginx:alpine

# Xóa sạch các file cấu hình mặc định cấu trúc của Nginx
RUN rm -rf /usr/share/nginx/html/*

# SỬA DÒNG NÀY: Thêm /browser vào sau tên project của bạn
COPY dist/angular-metarial /usr/share/nginx/html

# Copy file cấu hình nginx của bạn vào (nếu có)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
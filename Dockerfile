FROM nginx:1.27-alpine

COPY index.html /usr/share/nginx/html/index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 7575

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO /dev/null http://127.0.0.1:7575/ || exit 1

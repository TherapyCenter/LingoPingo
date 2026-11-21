FROM node:22-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json server.js docker-entrypoint.sh ./
COPY public ./public
RUN sed -i 's/\r$//' docker-entrypoint.sh && chmod +x docker-entrypoint.sh && mkdir -p /data && chown -R node:node /data
ENV PORT=8080 HTTPS_PORT=8443 DATA_DIR=/data NODE_ENV=production
USER node
EXPOSE 8080 8443
VOLUME ["/data"]
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
ENTRYPOINT ["./docker-entrypoint.sh"]

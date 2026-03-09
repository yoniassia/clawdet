FROM node:22-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
    bash curl wget git jq python3 python3-pip ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /workspace
WORKDIR /app
COPY server.js .
ENV WORKSPACE_DIR=/app/workspace
EXPOSE 18789
CMD ["node", "server.js"]

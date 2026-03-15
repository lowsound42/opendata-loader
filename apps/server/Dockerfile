FROM node:23-alpine
ARG USE_EXTRA_CERTS=false

COPY ./extra-ca-certs.cer /usr/local/share/ca-certificates/extra-ca-certs.crt
ARG NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/extra-ca-certs.crt

RUN if [ "$USE_EXTRA_CERTS" = "true" ]; then \
        cat /usr/local/share/ca-certificates/extra-ca-certs.crt >> /etc/ssl/certs/ca-certificates.crt; \
    fi && \
    apk --no-cache add curl

ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/extra-ca-certs.crt

WORKDIR /app

COPY ./ ./
RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev"]

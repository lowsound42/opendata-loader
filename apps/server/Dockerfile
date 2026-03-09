FROM node:20-alpine
COPY ./extra-ca-certs.cer /usr/local/share/ca-certificates/extra-ca-certs.crt
ARG NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/extra-ca-certs.crt

RUN cat /usr/local/share/ca-certificates/extra-ca-certs.crt >> /etc/ssl/certs/ca-certificates.crt && \
    apk --no-cache add \
        curl


WORKDIR /app

COPY ./ ./
RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev"]

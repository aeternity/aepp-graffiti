FROM node:10-alpine

RUN apk add --no-cache --virtual .build-deps make gcc g++ python

WORKDIR /app
COPY . /app

RUN npm install

RUN apk del .build-deps

CMD ["node", "server.js"]

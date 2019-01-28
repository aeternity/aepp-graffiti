FROM node:10

RUN apt update
RUN apt install -y software-properties-common ca-certificates wget curl ssh git python build-essential imagemagick

WORKDIR /app
COPY . /app

RUN npm install

CMD ["node", "server.js"]

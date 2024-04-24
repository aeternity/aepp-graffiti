FROM node:20

RUN apt update
RUN apt install -y software-properties-common ca-certificates wget curl ssh git python build-essential

WORKDIR /app
COPY . /app

RUN npm install

RUN apt purge -y software-properties-common ca-certificates wget curl ssh git python build-essential && apt autoremove -y
ENV OPENSSL_CONF=/dev/null
CMD ["node", "server.js"]

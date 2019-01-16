FROM node:10 as build

RUN apt update
RUN apt dist-upgrade -y
RUN apt install -y software-properties-common ca-certificates wget curl ssh git python build-essential

RUN adduser --disabled-password --gecos "" app

WORKDIR /app
COPY . /app

RUN chown -R app:app /app
USER app

RUN git init

RUN npm install
RUN npm run build

FROM nginx:alpine as server

COPY default.conf /etc/nginx/conf.d/
COPY --from=build /app/dist/ /usr/share/nginx/html/

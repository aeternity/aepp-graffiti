FROM node:14 as aepp-build

RUN apt update && apt install -y make gcc g++ python git libvips-dev libvips

RUN mkdir -p /home/node/app
WORKDIR /home/node/app

COPY package.json /home/node/app/
COPY package-lock.json /home/node/app/

RUN chown -R node:node /home/node/

USER node

RUN npm ci
COPY --chown=node:node . /home/node/app

ARG COMMAND
RUN npm run build:$COMMAND

FROM nginx:alpine
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=aepp-build /home/node/app/dist /usr/share/nginx/html

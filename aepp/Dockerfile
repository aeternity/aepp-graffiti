FROM node:14 as aepp-build
RUN apt update && apt install -y make gcc g++ python git libvips-dev libvips
RUN mkdir -p /home/node/app
WORKDIR /home/node/app
COPY package.json /home/node/app/
RUN chown -R node:node /home/node/

USER node

RUN npm install
COPY --chown=node:node . /home/node/app
ARG COMMAND
RUN npm run $COMMAND

FROM nginx:1.13.7-alpine
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf 
COPY --from=aepp-build /home/node/app/dist /usr/share/nginx/html

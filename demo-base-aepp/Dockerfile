FROM node:10 as build

RUN apt update
RUN apt dist-upgrade -y
RUN apt install -y software-properties-common ca-certificates wget curl ssh git python build-essential

RUN adduser --disabled-password --gecos "" app

WORKDIR /app

RUN chown -R app:app /app
USER app

RUN git clone -b feature/sdk-intergation https://github.com/aeternity/aepp-base.git .

# adjust demo data
RUN sed -i -e 's/localhost:9001/aepp.dronegraffiti.piwo.app/g' src/lib/appsRegistry.js
RUN sed -i -e 's/Drone Project/Drone Graffiti/g' src/lib/appsRegistry.js
RUN sed -i -e "s/Base æpp/Drone Graffiti Demo/g" vue.config.js
RUN sed -i -e "s/Base æpp/Drone Graffiti Demo/g" public/default.webmanifest
RUN sed -i -e "s/Base æpp/Drone Graffiti Demo/g" public/index.html
RUN sed -i -e '/Roma-net/d' src/lib/networksRegistry.js
RUN sed -i -e '/Edgenet/d' src/lib/networksRegistry.js
RUN sed -i -e "s/sdk-testnet.aepps.com/testnet.dronegrafitti.piwo.app/g" src/lib/networksRegistry.js
RUN sed -i -e "s/Testnet/Art Testnet/g" src/lib/networksRegistry.js

# add demo seed
RUN sed -i -e "s/seed: ''/seed: 'flower run enforce width destroy fence term leader layer leave worry veteran'/g" src/pages/mobile/Recover.vue

RUN npm install
RUN npm run build

FROM nginx:alpine as server

COPY default.conf /etc/nginx/conf.d/
COPY --from=build /app/dist/ /usr/share/nginx/html/


#!/bin/bash

cd ../server
docker build -t aeternity/graffiti-server .
docker push aeternity/graffiti-server:latest

ssh graffiti-server 'docker-compose pull; docker-compose up -d'
ssh graffiti-server 'docker image prune -af'


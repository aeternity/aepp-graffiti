#!/bin/bash

cd ../node-server
docker build -t dronegraffiti/server .
docker push dronegraffiti/server:latest

ssh drone-backend 'docker-compose pull; docker-compose up -d'

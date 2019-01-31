#!/bin/bash

cd ../node-server
docker build -t dronegraffiti/server .
docker push dronegraffiti/server:latest

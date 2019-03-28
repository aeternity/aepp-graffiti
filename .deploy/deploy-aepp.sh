#!/bin/bash

cd ../aepp
rm -rf node_modules && npm i
rm -r dist/
npm run build
aws s3 sync dist/ s3://aepp-dronegraffiti/ --acl public-read

#!/bin/bash

cd ../aepp-base
rm -rf node_modules && npm i
rm -r dist/
npm run build
aws s3 sync dist/ s3://base-aepp.dronegraffiti.com/ --acl public-read

# Drone Graffiti Backend Server

This server provides the required backend services for the 
[drone graffiti vue.js frontend](https://github.com/aeternity/aepp-graffiti/tree/master/aepp) and allows for 
[sanity checking bids](https://github.com/aeternity/aepp-graffiti/blob/master/server/docs/SANITY.md).

## Setup

Clone this repository by running
```
git clone git@github.com:aeternity/aepp-graffiti.git
```
Install the dependencies
```
cd aepp-graffiti/server && npm install
```
Setup an [aeternity node](https://github.com/aeternity/aeternity) and an 
[ipfs node](https://docs.ipfs.io/introduction/install/). This can be easily done using docker. Check the 
docker-compose.yml file for the recommended images.

In order to run you also need to provide an aws s3 bucket where the backups are held. This is configured via the following 
environment variables:
```
S3_KEY=YOURKEY;
S3_SECRET=YOURSECRET;
S3_REGION=your-bucket-region;
S3_BUCKET=your-bucket-name;
```
Once the setup is completed you can simply run
```
npm run start
```

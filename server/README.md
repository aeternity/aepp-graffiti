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

Environments for Aeternity Blockchain, IPFS and the Graffiti Contract are needed.

```
CONTRACT_ADDRESS=
IPFS_URL=
NODE_URL=
```

Optionally a full sync of storages at startup can be enabled using `SYNC_STORAGE=true`.

There seems to be some issue in the svg library with requires `OPENSSL_CONF=/dev/null` to be set to work.

In order for the backend to be able to backup and restore source images you also need to provide an aws s3 bucket where the backups are held. This is configured via the following 
environment variables:
```
S3_KEY=;
S3_SECRET=;
S3_REGION=;
S3_BUCKET=;
```
Once the setup is completed you can simply run
```
npm run start
```

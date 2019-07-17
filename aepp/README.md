# Drone Graffiti Vue.JS Frontend

This repository provides the source code for the Drone Graffiti Aepp running
at [https://aepp.dronegraffiti.com/](https://aepp.dronegraffiti.com/). 

## Setup

Clone this repository by running
```
git clone git@github.com:aeternity/aepp-graffiti.git
```
Install the dependencies
```
cd aepp-graffiti/aepp && npm install
```

In order to run you need to provide a bugsnag secret and an momoto instance.
The mamoto integration can be configured or disabled in the `src/main.js`. Bugsnag is more tightly
integrated and some refactoring would need to be done. To run this repo provide the bugsnag
secret in the file `src/secret.js` which should be a copy from `src/secret.sample.js`.

Once the setup is completed you can simply run
```
npm run dev
```

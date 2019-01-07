const Ae = require('@aeternity/aepp-sdk').Universal;
const Deployer = require('forgae').Deployer;
const gasLimit = 1000000;

const deploy = async (network, privateKey) => {
    let deployer = new Deployer(network, privateKey);

    let result = await deployer.deploy("./contracts/FirstComeAuction.aes");
};

module.exports = {
    deploy
};

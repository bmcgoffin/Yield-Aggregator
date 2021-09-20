const YieldAggregator = artifacts.require("YieldAggregator");

module.exports = function(deployer) {
    deployer.deploy(YieldAggregator);
};
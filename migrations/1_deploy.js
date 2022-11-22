const merkleroutine = artifacts.require("MerkleRoutine");

module.exports = function(deployer) {
  deployer.deploy(merkleroutine);
};

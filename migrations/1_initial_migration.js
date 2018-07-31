var Migrations = artifacts.require("./Migrations.sol");

module.exports = function (deployer) {
  deployer.deploy(Migrations, { gasPrice: 0, from: "0x3b07f15efb10f29b3fc222fb7e717e9af0cc4243" });
};

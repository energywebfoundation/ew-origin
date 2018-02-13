// Place your contract inputs here
var CoO = artifacts.require("CoO")

var UserLogic = artifacts.require("UserLogic")
var UserDB = artifacts.require("UserDB")

var AssetRegistryLogic = artifacts.require("AssetRegistryLogic")
var AssetRegistryDB = artifacts.require("AssetRegistryDB")

var CertificateLogic = artifacts.require("CertificateLogic")
var CertificateDB = artifacts.require("CertificateDB")

var UserLogicUpdate = artifacts.require("UserLogic")
var AssetRegistryLogicUpdate = artifacts.require("AssetRegistryLogic")
var CertificateLogicUpdate = artifacts.require("CertificateLogic")

var DemandLogic = artifacts.require("DemandLogic")
var DemandDB = artifacts.require("DemandDB")


// This is the actual migration function. All deployment is happening here
module.exports = async (deployer, network, accounts) => {
  //deploying CoO contract
  var cooInstance
  var certificateLogicInstance
  var userLogicInstance
  var assetRegistryLogicInstance
  var demandLogicInstance


  var certificateLogicUpdateInstance
  var userLogicUpdateInstance
  var assetRegistryLogicUpdateInstance

  await deployer.deploy(CoO).then(
    async () => { cooInstance = await CoO.deployed() }
  ).then(async () => {
    await deployer.deploy(CertificateLogic, cooInstance.address).then(
      async () => { certificateLogicInstance = await CertificateLogic.deployed() }
    )
  }).then(async () => {
    await deployer.deploy(CertificateDB, CertificateLogic.address).then(
      async () => { await CertificateDB.deployed() }
    )
  }).then(async () => {
    await deployer.deploy(UserLogic, cooInstance.address).then(
      async () => { userLogicInstance = await UserLogic.deployed() }
    )
  }).then(async () => {
    await deployer.deploy(UserDB, UserLogic.address).then(
      async () => { await UserDB.deployed() }
    )
  }).then(async () => {
    await deployer.deploy(DemandLogic, cooInstance.address).then(
      async () => { demandLogicInstance = await DemandLogic.deployed() }
    )
  })

    .then(async () => {
      await deployer.deploy(DemandDB, DemandLogic.address).then(
        async () => { await DemandDB.deployed() }
      )
    })
    .then(async () => {
      await deployer.deploy(AssetRegistryLogic, cooInstance.address).then(
        async () => { assetRegistryLogicInstance = await AssetRegistryLogic.deployed() }
      )
    }).then(async () => {
      await deployer.deploy(AssetRegistryDB, assetRegistryLogicInstance.address).then(
        async () => { await AssetRegistryDB.deployed() }
      )
    })
    .then(async () => {
      await userLogicInstance.init(UserDB.address)
    })
    .then(async () => {
      await assetRegistryLogicInstance.init(AssetRegistryDB.address)
    })
    .then(async () => {
      await certificateLogicInstance.init(CertificateDB.address)
    })
    .then(async () => {
      await demandLogicInstance.init(DemandDB.address)
    })
    .then(async () => {
      await cooInstance.init(UserLogic.address, AssetRegistryLogic.address, CertificateLogic.address, DemandLogic.address)
    })
    .then(async () => {
      // accounts[2] = assetAdmin
      await userLogicInstance.setUser(accounts[3],
        web3.fromAscii('John'),
        web3.fromAscii("Doe"),
        web3.fromAscii('testorganization'),
        web3.fromAscii('Main St'), 123,
        web3.fromAscii('01234'),
        web3.fromAscii('Anytown'),
        web3.fromAscii('USA'),
        web3.fromAscii('AnyState'))
    })
    .then(async () => {
      // accounts[1] = userAdmin
      await userLogicInstance.setUser(accounts[1],
        web3.fromAscii('John-user'),
        web3.fromAscii("Doe-user"),
        web3.fromAscii('testorganization'),
        web3.fromAscii('Main St'), 123,
        web3.fromAscii('01234'),
        web3.fromAscii('Anytown'),
        web3.fromAscii('USA'),
        web3.fromAscii('AnyState'))
    })
    .then(async () => {
      // accounts[2] = assetAdmin
      await userLogicInstance.setUser(accounts[2],
        web3.fromAscii('John-asset'),
        web3.fromAscii("Doe-asset"),
        web3.fromAscii('testorganization'),
        web3.fromAscii('Main St'), 123,
        web3.fromAscii('01234'),
        web3.fromAscii('Anytown'),
        web3.fromAscii('USA'),
        web3.fromAscii('AnyState'))
    })
    .then(async () => {
      // accounts[2] = assetAdmin
      await userLogicInstance.setUser(accounts[5],
        web3.fromAscii('John-testadmin'),
        web3.fromAscii("Doe-testadmin"),
        web3.fromAscii('testorganization'),
        web3.fromAscii('Main St'), 123,
        web3.fromAscii('01234'),
        web3.fromAscii('Anytown'),
        web3.fromAscii('USA'),
        web3.fromAscii('AnyState'))
    })
    .then(async () => {
      // accounts[2] = assetAdmin
      await userLogicInstance.setUser(accounts[0],
        web3.fromAscii('John-owner'),
        web3.fromAscii("Doe-owner"),
        web3.fromAscii('testorganization'),
        web3.fromAscii('Main St'), 123,
        web3.fromAscii('01234'),
        web3.fromAscii('Anytown'),
        web3.fromAscii('USA'),
        web3.fromAscii('AnyState'))
    })
    .then(async () => {
      // accounts[2] = assetAdmin
      await userLogicInstance.setUser(accounts[9],
        web3.fromAscii('John-tradadmin'),
        web3.fromAscii("Doe-tradeadmin"),
        web3.fromAscii('testorganization'),
        web3.fromAscii('Main St'), 123,
        web3.fromAscii('01234'),
        web3.fromAscii('Anytown'),
        web3.fromAscii('USA'),
        web3.fromAscii('AnyState'))
    }).then(async () => {
      // accounts[1] = userAdmin
      await userLogicInstance.setRoles(accounts[1], 2)
    })
    .then(async () => {
      // accounts[2] = assetAdmin
      await userLogicInstance.setRoles(accounts[2], 4)
    })
    .then(async () => {
      // accounts[2] = agreement-Admin
      await userLogicInstance.setRoles(accounts[9], 8)
    })

}
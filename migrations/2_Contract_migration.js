// Place your contract inputs here
var CoO = artifacts.require("CoO")

var UserLogic = artifacts.require("UserLogic")
var UserDB = artifacts.require("UserDB")

var AssetProducingRegistryLogic = artifacts.require("AssetProducingRegistryLogic")
var AssetProducingRegistryDB = artifacts.require("AssetProducingRegistryDB")

var AssetConsumingRegistryLogic = artifacts.require("AssetConsumingRegistryLogic")
var AssetConsumingRegistryDB = artifacts.require("AssetConsumingRegistryDB")

var CertificateLogic = artifacts.require("CertificateLogic")
var CertificateDB = artifacts.require("CertificateDB")

var UserLogicUpdate = artifacts.require("UserLogic")
var AssetProducingRegistryLogicUpdate = artifacts.require("AssetProducingRegistryLogic")
var CertificateLogicUpdate = artifacts.require("CertificateLogic")

var DemandLogic = artifacts.require("DemandLogic")
var DemandDB = artifacts.require("DemandDB")


// This is the actual migration function. All deployment is happening here
module.exports = async (deployer, network, accounts) => {
  //deploying CoO contract
  var cooInstance
  var certificateLogicInstance
  var userLogicInstance
  var assetProducingRegistryLogicInstance
  var assetConsumingLogicInstance
  var demandLogicInstance


  var certificateLogicUpdateInstance
  var userLogicUpdateInstance

  await deployer.deploy(CoO).then(
    async () => { cooInstance = await CoO.deployed() }
  ).then(async () => {
    await deployer.deploy(CertificateLogic, cooInstance.address, { gas: 79000000 }).then(
      async () => { certificateLogicInstance = await CertificateLogic.deployed() }
    )
  }).then(async () => {
    await deployer.deploy(CertificateDB, CertificateLogic.address, { gas: 79000000 }).then(
      async () => { await CertificateDB.deployed() }
    )
  }).then(async () => {
    await deployer.deploy(UserLogic, cooInstance.address, { gas: 79000000 }).then(
      async () => { userLogicInstance = await UserLogic.deployed() }
    )
  }).then(async () => {
    await deployer.deploy(UserDB, UserLogic.address, { gas: 79000000 }).then(
      async () => { await UserDB.deployed() }
    )
  }).then(async () => {
    await deployer.deploy(DemandLogic, cooInstance.address, { gas: 79000000 }).then(
      async () => { demandLogicInstance = await DemandLogic.deployed() }
    )
  })

    .then(async () => {
      await deployer.deploy(DemandDB, DemandLogic.address, { gas: 79000000 }).then(
        async () => { await DemandDB.deployed() }
      )
    })
    .then(async () => {
      await deployer.deploy(AssetProducingRegistryLogic, cooInstance.address, { gas: 79000000 }).then(
        async () => { assetProducingRegistryLogicInstance = await AssetProducingRegistryLogic.deployed() }
      )
    }).then(async () => {
      await deployer.deploy(AssetProducingRegistryDB, assetProducingRegistryLogicInstance.address, { gas: 79000000 }).then(
        async () => { await AssetProducingRegistryDB.deployed() }
      )
    })
    .then(async () => {
      await deployer.deploy(AssetConsumingRegistryLogic, cooInstance.address, { gas: 79000000 }).then(
        async () => { assetConsumingRegistryLogicInstance = await AssetConsumingRegistryLogic.deployed() }
      )
    }).then(async () => {
      await deployer.deploy(AssetConsumingRegistryDB, assetConsumingRegistryLogicInstance.address, { gas: 79000000 }).then(
        async () => { await AssetConsumingRegistryDB.deployed() }
      )
    })
    .then(async () => {
      await userLogicInstance.init(UserDB.address)
    })
    .then(async () => {
      await assetProducingRegistryLogicInstance.init(AssetProducingRegistryDB.address)
    })
    .then(async () => {
      await certificateLogicInstance.init(CertificateDB.address)
    })
    .then(async () => {
      await demandLogicInstance.init(DemandDB.address)
    })
    .then(async () => {
      await assetConsumingRegistryLogicInstance.init(AssetConsumingRegistryDB.address)
    })
    .then(async () => {
      await cooInstance.init(UserLogic.address, AssetProducingRegistryLogic.address, CertificateLogic.address, DemandLogic.address, AssetConsumingRegistryLogic.address)
    })
    .then(async () => {
      // accounts[2] = assetAdmin
      await userLogicInstance.setUser(accounts[3],
        web3.fromAscii('John'),
        web3.fromAscii("Doe"),
        web3.fromAscii('testorganization'),
        web3.fromAscii('Main St'),
        web3.fromAscii('123'),
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
        web3.fromAscii('Main St'),
        web3.fromAscii('123'),
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
        web3.fromAscii('Main St'),
        web3.fromAscii('123'),
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
        web3.fromAscii('Main St'),
        web3.fromAscii('123'),
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
        web3.fromAscii('Main St'),
        web3.fromAscii('123'),
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
        web3.fromAscii('Main St'),
        web3.fromAscii('123'),
        web3.fromAscii('01234'),
        web3.fromAscii('Anytown'),
        web3.fromAscii('USA'),
        web3.fromAscii('AnyState'))
    })
    .then(async () => {
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
    .then(async () => {
      // accounts[2] = agreement-Admin
      await userLogicInstance.addTraderRole(accounts[9])
    })
    .then(async () => {
      // accounts[2] = agreement-Admin
      await userLogicInstance.addTraderRole(accounts[0])
    }).then(async () => {
      // accounts[2] = agreement-Admin
      await userLogicInstance.addAssetManagerRole(accounts[0])
    })
    .then(async () => {
      // accounts[8] = matcher
      await userLogicInstance.addMatcherRole(accounts[8])
    })



}
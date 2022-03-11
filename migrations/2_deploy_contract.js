const TnoEats = artifacts.require("TnoEats");
const EurTno = artifacts.require("EurTno");

module.exports = async (deployer) => {
  await deployer.deploy(EurTno, 100000);
  await deployer.deploy(TnoEats, EurTno.address);
};

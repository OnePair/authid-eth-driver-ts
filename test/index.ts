import { JsonRpcProvider } from "ethers/providers";
import { EthUsername, UsernameRegistryContract } from "eth-username";
import { Wallet } from "ethers";
import { EthAuthIDDriver } from "../src";
import { Processor } from "ethb-did";
import { expect, assert } from "chai";

import ganache from "ganache-cli";
import Web3 from "web3";
import fs from "fs";


/*
* Test fails
*/
describe("Testing eth-driver", () => {
  const IPFS_HOST = "/ip4/127.0.0.1/tcp/5001";
  const RPC_HOST = "http://127.0.0.1:9545";

  const password = "password123";
  const username = "user1";

  let ethServer: any;
  let rpcProvider: JsonRpcProvider;
  let web3: Web3;

  let driverAddress: string;
  let did: string;

  let ethDriver: EthAuthIDDriver;

  before(async () => {
    ethServer = ganache.server();
    ethServer.listen(9545);
    rpcProvider = new JsonRpcProvider(RPC_HOST);

    web3 = new Web3(new Web3.providers.HttpProvider(RPC_HOST));

    // The wallet used to deploy the test username contract
    let usernameContractWallet: Wallet = Wallet.createRandom().connect(rpcProvider);

    let accounts = await web3.eth.getAccounts();

    await web3.eth.sendTransaction({
      from: accounts[1],
      to: usernameContractWallet.address,
      value: web3.utils.toWei("5", "ether")
    });

    let usernameContractAddress = await UsernameRegistryContract.deploy(usernameContractWallet);

    ethDriver = new EthAuthIDDriver("./test-driver-dir", rpcProvider,
      IPFS_HOST, EthUsername.LOCAL_TESTNET,
      { usernameContract: usernameContractAddress });
  });

  describe("Driver setup", () => {
    it("Should initilize driver", (done) => {
      assert.doesNotThrow(async () => {
        try {
          await ethDriver.init();
          done();
        } catch (err) {
          done(new Error(err));
        }
      });
    });

    it("Should get an Ethereum address from the wallet", (done) => {
      assert.doesNotThrow(async () => {
        try {
          this.driverAddress = await ethDriver.getAddress(password);
          done();
        } catch (err) {
          done(new Error(err));
        }
      });
    });
  });

  describe("Wallet tests", () => {
    let firstKeys;

    let wallet;
    let mnemonicSeed;

    before(async () => {
      let driverInfo = await ethDriver.getInfo();
      this.wallet = await driverInfo["wallet"];
      this.firstKeys = await this.wallet.unlockKeys(password);
    });

    it("Should get mnemonicSeed", (done) => {
      assert.doesNotThrow(async () => {
        try {
          this.mnemonicSeed = await this.wallet.getMnemonic(password);
          done();
        } catch (err) {
          done(new Error(err));
        }
      });
    });

    it("Should recover wallet from mnemonic seed", (done) => {
      assert.doesNotThrow(async () => {
        try {
          await this.wallet.recoverFromMnemonic(this.mnemonicSeed, password)
          let newKeys = await this.wallet.unlockKeys(password);

          let firstControllerPrivateKey = this.firstKeys["controller"]["privateKey"];
          let newControllerPrivateKey = newKeys["controller"]["privateKey"];

          let firstAuthPrivateKey = this.firstKeys["authorizationKey"]["privateKey"];
          let newAuthPrivateKey = newKeys["authorizationKey"]["privateKey"];

          if ((firstControllerPrivateKey != newControllerPrivateKey) ||
            (firstAuthPrivateKey != newAuthPrivateKey)) {
            done(new Error("Recovered keys are invalid!"));
          } else {
            done();
          }

        } catch (err) {
          done(new Error(err));
        }
      });
    });

    it("Password should be invalid", (done) => {
      assert.doesNotThrow(async () => {
        try {
          let address = await ethDriver.getAddress("wrongpassword");
          done(new Error("Password should be invalid!"));
        } catch (err) {
          done();
        }
      });
    });

    it("Should get public keys", (done) => {
      assert.doesNotThrow(async () => {
        try {
          let publicKeys = await ethDriver.getPublicKeys(password);
          if (!("authorizationKey" in publicKeys)
            || !("controllerAddress" in publicKeys)) {
            done(new Error("Missing keys!"));
          } else {
            done();
          }
        } catch (err) {
          done(new Error(err))
        }
      });
    });
  });

  describe("Driver tests", () => {
    const processorPrivateKey = "c38135f7f7cf1a37c28139adc772bebcb14e101e0b3a61202850a76f9cdfc6c1";
    const processorPublicKey = "04d09e007bcd7e16c9b290bfeaf464741d1bf1bf7e95606e711ffb8ffac509151878aedab61ad665f975e427a64b1b46335ffd19e95188921898c03b8b7dbca4e5";
    const processorId = "processor";

    const wrongProcessorPrivateKey = "bdb5e9b06786166dfe71461227b276a4daf1a8cdf23fcdb9910ae0888e58822e";

    const claims = { key: "value" };
    const authClaims = { sig: "sig" };

    let processorToken: string;
    let jwt: string;
    let authJwt: string;

    before(async () => {
      console.log("Funding the authid ethereum address...");
      let accounts = await web3.eth.getAccounts();

      await web3.eth.sendTransaction({
        from: accounts[1],
        to: this.driverAddress,
        value: web3.utils.toWei("5", "ether")
      });
    });

    it("Should register a new DID", (done) => {
      assert.doesNotThrow(async () => {
        try {
          this.did = await ethDriver.registerDID(password);
          console.log("Registered did:", this.did);
          done();
        } catch (err) {
          done(new Error(err));
        }
      });
    });

    it("Should register a username", (done) => {
      assert.doesNotThrow(async () => {
        try {
          await ethDriver.registerName(password, username);
          done();
        } catch (err) {
          done(new Error(err));
        }
      });
    });

    it("Should authorize a processor", (done) => {
      assert.doesNotThrow(async () => {
        try {
          this.processorToken = await ethDriver.authorizeProcessor(password, "processor", processorPublicKey, true, true);
          done();
        } catch (err) {
          done(new Error(err));
        }
      });
    });

    it("Should import processor", (done) => {
      assert.doesNotThrow(async () => {
        try {
          await ethDriver.importProcessor(password, processorId, this.processorToken, processorPrivateKey);
          done();
        } catch (err) {
          done(new Error(err));
        }
      });
    });

    it("Externally signed jwt should be valid", (done) => {
      assert.doesNotThrow(async () => {
        let processor = Processor.parse(this.processorToken);
        let jwt = processor.createJwt(claims, "5 days", processorPrivateKey);

        try {
          await ethDriver.verifyJwt(jwt, this.did);
          done();
        } catch (err) {
          done(new Error(err));
        }
      });
    });

    it("Externally signed jwt should be invalid", (done) => {
      assert.doesNotThrow(async () => {
        let processor = Processor.parse(this.processorToken);
        let jwt = processor.createJwt(claims, "5 days", wrongProcessorPrivateKey);

        try {
          await ethDriver.verifyJwt(jwt, this.did);
          done(new Error("JWT should be invalid!"));
        } catch (err) {
          done();
        }
      });
    });

    it("Should revoke processor", (done) => {
      assert.doesNotThrow(async () => {
        try {
          await ethDriver.revokeProcessor(password, processorId);
          done();
        } catch (err) {
          done(new Error(err));
        }
      });
    });

    it("Jwt signed by revoked processor should be invalid", (done) => {
      assert.doesNotThrow(async () => {
        let processor = Processor.parse(this.processorToken);
        let jwt = processor.createJwt(claims, "5 days", processorPrivateKey);
        try {
          await ethDriver.verifyJwt(jwt, this.did);
          done(new Error("JWT should be invalid!"));
        } catch (err) {
          done();
        }
      });
    });

    it("Should create a Jwt", (done) => {
      assert.doesNotThrow(async () => {
        try {
          this.jwt = await ethDriver.createJwt(password, claims, "1 day");
          done();
        } catch (err) {
          done(new Error(err));
        }
      });
    });

    it("Should create a Jwt for auth", (done) => {
      assert.doesNotThrow(async () => {
        try {
          this.jwt =
            await ethDriver.createJwt(password, authClaims, "1 day", "auth");
          done();
        } catch (err) {
          done(new Error(err));
        }
      });
    });


    it("Jwt should be valid against the did", (done) => {
      assert.doesNotThrow(async () => {
        try {
          await ethDriver.verifyJwt(this.jwt, this.did);
          done();
        } catch (err) {
          done(new Error(err));
        }
      });
    });

    it("Jwt should be valid against the name", (done) => {
      assert.doesNotThrow(async () => {
        try {
          await ethDriver.verifyJwt(this.jwt, "user1.eth");
          done();
        } catch (err) {
          done(new Error(err));
        }
      });
    });
  });

  after(() => {
    ethServer.close();
  });
});

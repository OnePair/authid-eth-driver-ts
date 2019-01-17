import { randomBytes } from "crypto";
import { entropyToMnemonic, fromMnemonic, mnemonicToEntropy } from "ethers/utils/hdnode";
import { Processor } from "ethb-did";

import fs from "fs";
import mkdirp from "mkdirp"
import cryptoJSON from "crypto-json";
import Crypto from "crypto";
import Path from "path";
import Storage from "node-persist";
import Secp256k1 from "secp256k1";


const KEYS_FILE_NAME: string = "keys.json";
//const INFO_FILE_NAME: string = "authid_info.json";
const PROCESSORS_STORAGE = "processors.storage";
const INFO_STORAGE = "info.storage"

const AUTH_PROCESSORS = "auth_processors";
const SIG_PROCESSORS = "sig_processors";

const AES_256: string = "AES256";



/*
* TODO: Implement wallet locking function or ask for password everytime the wallet is needed
*/
export class EthAuthIDWallet {
  private walletDirPath: string;
  private keysFilePath: string;

  private processors: Storage;
  private infoStorage: Storage;

  constructor(walletDirPath: string) {
    this.walletDirPath = walletDirPath;
    this.keysFilePath = Path.join(walletDirPath, KEYS_FILE_NAME);
  }

  /*
  * Public functions
  */

  public setDid(did: string): Promise<void> {
    return new Promise(async (onSuccess: Function, onError: Function) => {
      try {
        await this.infoStorage.set("did", did);
        onSuccess();
      } catch (err) {
        onError(err);
      }
    });
  }

  public importProcessor(processorId: string, processor: Processor,
    privateKey: string, password: string): Promise<void> {
    return new Promise(async (onSuccess: Function, onError: Function) => {
      try {
        let processorObj = { token: processor.getToken(), privateKey: privateKey }
        let encrypted = cryptoJSON.encrypt(processorObj, password, { algorithm: AES_256, encoding: "hex" });

        this.processors.set(processorId, encrypted);

        let permissions = processor.getPermissions();

        if (permissions.indexOf("auth") != -1) {
          let authProcessors = await this.infoStorage.get(AUTH_PROCESSORS);

          if (authProcessors == undefined)
            authProcessors = [];

          authProcessors.push(processorId);
          await this.infoStorage.set(AUTH_PROCESSORS, authProcessors);
        }

        if (permissions.indexOf("signing") != -1) {
          let sigProcessors = await this.infoStorage.get(SIG_PROCESSORS);

          if (sigProcessors == undefined)
            sigProcessors = [];

          sigProcessors.push(processorId);
          await this.infoStorage.set(SIG_PROCESSORS, sigProcessors);
        }
        onSuccess();
      } catch (err) {
        onError(err);
      }
    });
  }

  public getProcessor(permission: string, password: string): Promise<object> {
    return new Promise(async (onSuccess: Function, onError: Function) => {
      try {
        let processorId: string;

        // Get a processorId
        if (permission == "auth") {
          let authProcessorIds = await this.infoStorage.get(AUTH_PROCESSORS);

          if (authProcessorIds == undefined || authProcessorIds.length == 0)
            throw new Error("No processors found!");

          processorId = authProcessorIds[0];
        } else if (permission == "signing") {
          let sigProcessorIds = await this.infoStorage.get(AUTH_PROCESSORS);

          if (sigProcessorIds == undefined || sigProcessorIds.length == 0)
            throw new Error("No processors found!");

          processorId = sigProcessorIds[0];
        } else {
          throw new Error("Invalid permission!");
        }

        // Get the encrypted processor toke and private key
        let processorObjEncrypted = await this.processors.get(processorId);

        // Decrypt
        let processorObject = cryptoJSON.decrypt(processorObjEncrypted, password);

        onSuccess(processorObject);
      } catch (err) {
        onError(err);
      }
    });

  }

  public deleteProcessor(processorId: string): Promise<string> {
    return new Promise(async (onSuccess: Function, onError: Function) => {
      try {
        let authProcessors = await this.infoStorage.get(AUTH_PROCESSORS);
        let sigProcessors = await this.infoStorage.get(SIG_PROCESSORS);

        // Remove from the auth processors list
        if (authProcessors != undefined) {
          let authIndex: number;
          if ((authIndex = authProcessors.indexOf(processorId)) != -1) {
            authProcessors.splice(authIndex, 1);
            await this.infoStorage.set(AUTH_PROCESSORS, authProcessors);
          }
        }

        // Remove from the sig processors list
        if (sigProcessors != undefined) {
          let sigIndex: number;
          if ((sigIndex = sigProcessors.indexOf(processorId)) != -1) {
            sigProcessors.splice(sigIndex, 1);
            await this.infoStorage.set(SIG_PROCESSORS, sigProcessors);
          }
        }

        // Remove from the processors list
        await this.processors.removeItem(processorId);

        onSuccess();
      } catch (err) {
        onError(err);
      }
    });
  }

  public unlockKeys(password: string): Promise<object> {
    return new Promise(async (onSuccess: Function, onError: Function) => {
      let keys: object;

      if (fs.existsSync(this.keysFilePath)) {
        // load wallet if it exists
        let encryptedKeys = JSON.parse(fs.readFileSync(this.keysFilePath).toString());
        keys = cryptoJSON.decrypt(encryptedKeys, password, { algorithm: AES_256, encoding: "hex" });
      } else {
        keys = EthAuthIDWallet.createKeys();
        this.saveKeys(keys, password);
      }

      onSuccess(keys);
    });
  }

  public saveKeys(keys: object, password: string): Promise<void> {
    return new Promise(async (onSuccess: Function, onError: Function) => {
      let options = {};
      options["processorKey"] = keys["processorKey"];

      let encrypted = cryptoJSON.encrypt(keys, password, { algorithm: AES_256, encoding: "hex" });
      fs.writeFileSync(this.keysFilePath, JSON.stringify(encrypted));
      onSuccess();
    });
  }

  public getKeyPair(password: string): Promise<object> {
    return new Promise(async (onSuccess: Function, onError: Function) => {
      let keys = await this.unlockKeys(password);
      let controller = keys["controller"];
      let keyPair = { address: controller["address"], privateKey: controller["privateKey"] };

      onSuccess(keyPair);
    });
  }

  public getInfo(): Promise<object> {
    return new Promise(async (onSuccess: Function, onError: Function) => {
      try {
        let info = {};
        await this.infoStorage.forEach(async (dantum) => {
          info[dantum.key] = dantum.value
        });
        onSuccess(info);
      }
      catch (err) {
        onError(err);
      }
    });
  }

  public getMnemonic(password: string): Promise<string> {
    return new Promise(async (onSuccess: Function, onError: Function) => {
      let keys = await this.unlockKeys(password);
      onSuccess(keys["controller"]["mnemonic"]);
    });
  }

  public recoverFromMnemonic(mnemonic: string, password: string): Promise<string> {
    return new Promise(async (onSuccess: Function, onError: Function) => {

      /*
      * Recover the controller key
      */
      let controllerHDNode = fromMnemonic(mnemonic);

      let controller = {
        address: controllerHDNode["address"],
        privateKey: controllerHDNode["privateKey"],
        mnemonic: controllerHDNode["mnemonic"]
      }

      /*
      * Recover the authorization key
      */
      let controllerEntropy = mnemonicToEntropy(mnemonic);

      /*
      * Recover the auth key
      */
      let authKeyEntropy = Crypto.createHash("sha256")
        .update(controllerEntropy)
        .digest();

      // hash again
      let authPrivateKey = Crypto.createHash("sha256")
        .update(authKeyEntropy)
        .digest();

      let authPublicKey = Secp256k1.publicKeyCreate(authPrivateKey);

      let privateKeyHex = Buffer.from(authPrivateKey).toString("hex");
      let publicKeyHex = Buffer.from(authPublicKey).toString("hex");

      let authorizationKey = {
        privateKey: privateKeyHex,
        publicKey: publicKeyHex
      }

      let keys = { controller: controller, authorizationKey: authorizationKey };
      await this.saveKeys(keys, password);

      onSuccess();
    });
  }

  public init(): Promise<void> {
    return new Promise(async (onSuccess: Function, onError: Function) => {
      try {
        this.initEnv();

        let processorsPath = Path.join(this.walletDirPath, PROCESSORS_STORAGE);
        let infoPath = Path.join(this.walletDirPath, INFO_STORAGE);

        this.processors = Storage.create({ dir: processorsPath });
        this.infoStorage = Storage.create({ dir: infoPath })

        await Storage.init({ dir: processorsPath });
        await Storage.init({ dir: infoPath })

        onSuccess();
      } catch (err) {
        onError(err);
      }
    });
  }

  /*
  * Private functions
  */

  private initEnv(): void {
    if (!fs.existsSync(this.walletDirPath)) {
      mkdirp.sync(this.walletDirPath);
    }
  }

  /*
  * Private static functions
  */
  private static createKeys(): object {
    let entropy = "0x" + Buffer.from(randomBytes(32)).toString("hex");
    let mnemonic = entropyToMnemonic(entropy);

    let controllerHDNode = fromMnemonic(mnemonic);
    let controller = {
      address: controllerHDNode["address"],
      privateKey: controllerHDNode["privateKey"],
      mnemonic: controllerHDNode["mnemonic"]
    }

    let authKeyEntropy = Crypto.createHash("sha256")
      .update(entropy)
      .digest();

    // hash again
    let authPrivateKey = Crypto.createHash("sha256")
      .update(authKeyEntropy)
      .digest();

    let authPublicKey = Secp256k1.publicKeyCreate(authPrivateKey);

    let privateKeyHex = Buffer.from(authPrivateKey).toString("hex");
    let publicKeyHex = Buffer.from(authPublicKey).toString("hex");

    let authorizationKey = {
      privateKey: privateKeyHex,
      publicKey: publicKeyHex
    }

    return { controller: controller, authorizationKey: authorizationKey };
  }

}

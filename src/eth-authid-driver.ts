import { EthAuthIDWallet } from "./eth-authid-wallet";
import { Provider } from "ethers/providers";
import { EthBDID, Processor } from "ethb-did";
import { randomBytes } from "crypto";

import Path from "path";
import Storage from "node-persist";
import Secp256k1 from "secp256k1";

const WALLET_DIR_NAME = "wallet";
const PROCESSORS_STORAGE = "processors.storage";

export class EthAuthIDDriver {
  private filePath: string;
  private provider: Provider; // Note: Provider is causing issues
  private ipfsHost: string;

  private wallet: EthAuthIDWallet;
  private processors: Storage;

  constructor(filePath: string, provider: Provider, ipfsHost: string) {
    this.filePath = filePath;
    this.provider = provider;
    this.ipfsHost = ipfsHost;
  }

  /*
  * Gets the crypto/ledger address.
  *
  * @param {string} password The wallet password.
  *
  * @return {Promise<string>} The address.
  */
  public getAddress(password: string): Promise<string> {
    return new Promise(async (onSuccess: Function, onError: Function) => {
      try {
        let keyPair = await this.wallet.getKeyPair(password);
        onSuccess(keyPair["address"]);
      } catch (err) {
        onError(err);
      }
    });
  }

  /*
  * Register a DID.
  *
  * @param {string} password The wallet password.
  *
  * @return {Promise<string>} The uri of the did.
  */
  public registerDID(password: string): Promise<string> {
    return new Promise(async (onSuccess: Function, onError: Function) => {
      try {
        let info = await this.getInfo();
        if ("did" in info)
          throw new Error("This wallet already contains a DID!");

        let keys = await this.wallet.unlockKeys(password);
        let controller = keys["controller"];
        let authorizationKey = keys["authorizationKey"];

        // 1) Create the did
        let did = await EthBDID.create(controller["privateKey"], controller["address"],
          authorizationKey["publicKey"], this.provider);
        let didUri = did["didUri"];

        // 2) Save the did
        this.wallet.setDid(didUri);

        // 3) Authorize a processor for local use
        let processorKeyPair = EthAuthIDDriver.createKeyPair();
        let processorId = "local";
        let localProcessor = await this.authorizeProcessor(password, processorId,
          processorKeyPair["publicKey"], true, true, did);

        // 3) Import the processor
        await this.importProcessor(password, processorId, localProcessor, processorKeyPair["privateKey"]);

        onSuccess(didUri);
      } catch (err) {
        onError(err);
      }
    });
  }

  /*
  * Import a DID.
  *
  * @param {string} password The wallet password.
  * @param {string} password The wallet password.
  *
  * @param {Promise<void>}
  */
  public importDID(password: string, did: string): Promise<void> {
    return new Promise(async (onSuccess: Function, onError: Function) => {
      // Check if the wallet contains a did
      try {
        let info = await this.getInfo();
        if ("did" in info)
          throw new Error("This wallet already contains a DID!");

        // Resolve the did
        let ethbDID = await EthBDID.resolve(did, this.provider);
        let controller = ethbDID.getController();

        let walletAddress = await this.getAddress(password);

        if (controller != walletAddress)
          throw new Error("This wallet does not have the correct keys for the DID!");

        this.wallet.setDid(did);

        onSuccess();
      } catch (err) {
        onError(err);
      }
    });
  }

  /*
  * Authorize a processor.
  *
  * @param {string} password The wallet password.
  * @param {string} processorId String used to identify the processor.
  * @param {string} publicKey The public key of the processor.
  * @param {boolean} sig Permission for authentication.
  * @param {boolean} auth Permission for authentication.
  * @param {EthBDID} did EthBDID instance
  *
  * @param {string} The processor token.
  */
  public authorizeProcessor(password: string, processorId: string,
    publicKey: string, sig: boolean, auth: boolean): Promise<string>;
  public authorizeProcessor(password: string, processorId: string,
    publicKey: string, sig: boolean, auth: boolean, did?: EthBDID): Promise<string>;
  public authorizeProcessor(password: string, processorId: string,
    publicKey: string, sig: boolean, auth: boolean, did?: EthBDID): Promise<string> {
    return new Promise(async (onSuccess: Function, onError: Function) => {
      try {
        let processorInfo: object;

        if (!did) {
          let info = await this.getInfo();

          if (!("did" in info))
            throw new Error("This wallet does not contain a DID!");

          did = await EthBDID.resolve(info["did"], this.provider);
        }

        processorInfo = await this.processors.get(processorId);

        if (processorInfo != undefined)
          throw new Error("Processor ID is already taken!");

        let keys = await this.wallet.unlockKeys(password);
        let authKeyPair = keys["authorizationKey"];

        // 1) Create the processor
        let processor = did.authorizeProcessor(publicKey, sig, auth, authKeyPair["privateKey"])

        // 2) Save the processor info
        processorInfo = { publicKey: processor.getPublicKey() };
        await this.processors.set(processorId, processorInfo);

        onSuccess(processor.getToken());
      } catch (err) {
        onError(err);
      }
    });
  }

  /*
  * Import a processor.
  *
  * @param {string} password The wallet password.
  * @param {string} processorId String used to indentify the processor.
  * @param {string} processorToken The processor token.
  * @param {string} privateKey The private key of the processor.
  */
  public importProcessor(password: string, processorId: string,
    processorToken: string, privateKey: string): Promise<void> {
    return new Promise(async (onSuccess: Function, onError: Function) => {
      try {
        let info = await this.wallet.getInfo();
        if (!("did" in info))
          throw new Error("This wallet does not contain a DID!");

        let processor = Processor.parse(processorToken);
        let issuer = processor.getIssuer();

        if (issuer["type"] != "controller" || issuer["did"] != info["did"])
          throw new Error("Invalid issuer");

        await this.wallet.importProcessor(processorId, processor, privateKey, password);

        onSuccess();
      } catch (err) {
        onError(err);
      }
    });
  }

  /*
  * Revoke a processor.
  *
  * @param {string} password The wallet password.
  * @param {string} processorId The string used to identify the processor.
  */
  public revokeProcessor(password: string, processorId: string): Promise<void> {
    return new Promise(async (onSuccess: Function, onError: Function) => {
      try {
        let info = await this.getInfo();
        if (!("did" in info))
          throw new Error("This wallet does not contain a DID!");

        // Get the processor info
        let processorInfo = await this.processors.get(processorId);

        if (processorInfo == undefined)
          throw new Error("Could not find processor info.");

        // Unlock the control key
        let keys = await this.wallet.unlockKeys(password);

        // Resolve the did
        let did = await EthBDID.resolve(info["did"], this.provider);

        // Revoke the processor
        await did.revokeProcessorKey(processorInfo["publicKey"], keys["controller"]["privateKey"]);

        // Delete the processor from the wallet
        await this.wallet.deleteProcessor(processorId);

        onSuccess();
      } catch (err) {
        onError(err);
      }
    });
  }

  /*
  * Create a new JWT.
  *
  * @param {string} password The wallet password.
  * @param {object} claims The claims for the jwt.
  * @param {string} expiresIn Expiry time.
  *
  * @return {Promise<string>} The jwt.
  */
  public createJwt(password: string, claims: object, expiresIn: string): Promise<string> {
    return new Promise(async (onSuccess: Function, onError: Function) => {
      try {
        let info = await this.getInfo();
        if (!("did" in info))
          throw new Error("This wallet does not contain a DID!");

        // Get a processor key for signing
        let processorObj = await this.wallet.getProcessor("auth", password);
        let processor = Processor.parse(processorObj["token"]);
        let privateKey = processorObj["privateKey"];

        let jwt = processor.createJwt(claims, expiresIn, privateKey);

        onSuccess(jwt)
      } catch (err) {
        onError(err);
      }
    });
  }

  /*
  * Verify a jwt.
  *
  * @param {string} jwt The json web token.
  * @param {string} id The id that signed the jwt.
  *
  * @return {Promis<object>} The verification result.
  */
  public verifyJwt(jwt: string, id: string): Promise<object> {
    return new Promise(async (onSuccess: Function, onError: Function) => {
      try {
        // 2) Resolve the did
        let did = await EthBDID.resolve(id, this.provider);
        // 3) Verify the jwt against the did
        let verified = await did.verifyJwt(jwt, "signing");

        onSuccess(verified)
      } catch (err) {
        onError(err);
      }
    });
  }

  public getInfo(): Promise<object> {
    return new Promise(async (onSuccess: Function, onError: Function) => {
      try {
        let info = await this.wallet.getInfo();
        info["wallet"] = this.wallet;

        onSuccess(info);
      } catch (err) {
        onError(err);
      }
    });
  }

  public getPublicKeys(password: string): Promise<object> {
    return new Promise(async (onSuccess: Function, onError: Function) => {
      try {
        let publicKeys = await this.wallet.getPublicKeys(password);

        onSuccess(publicKeys);
      } catch (err) {
        onError(err);
      }
    });
  }

  public init(): Promise<void> {
    return new Promise(async (onSuccess: Function, onError: Function) => {
      try {
        this.wallet = new EthAuthIDWallet(Path.join(this.filePath, WALLET_DIR_NAME));
        await this.wallet.init();

        let processorStorageDir = Path.join(this.filePath, PROCESSORS_STORAGE);
        this.processors = Storage.create({ dir: processorStorageDir });
        await Storage.init({ dir: processorStorageDir });

        EthBDID.connectToIpfs(this.ipfsHost);

        onSuccess();
      } catch (err) {
        onError(err);
      }
    });
  }

  /*
  * Private functions
  */

  private static createKeyPair(): object {
    let privateKey = randomBytes(32);
    let publicKey = Secp256k1.publicKeyCreate(privateKey);

    let privateKeyHex = Buffer.from(privateKey).toString("hex");
    let publicKeyHex = Buffer.from(publicKey).toString("hex");

    return { privateKey: privateKeyHex, publicKey: publicKeyHex }
  }
}

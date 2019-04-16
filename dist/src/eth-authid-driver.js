"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var eth_authid_wallet_1 = require("./eth-authid-wallet");
var ethers_1 = require("ethers");
var ethb_did_1 = require("ethb-did");
var eth_username_1 = require("eth-username");
var crypto_1 = require("crypto");
var path_1 = __importDefault(require("path"));
var url_1 = __importDefault(require("url"));
var node_persist_1 = __importDefault(require("node-persist"));
var secp256k1_1 = __importDefault(require("secp256k1"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var WALLET_DIR_NAME = "wallet";
var PROCESSORS_STORAGE = "processors.storage";
/*
* TODO: add type to promises
*/
var EthAuthIDDriver = /** @class */ (function () {
    function EthAuthIDDriver(filePath, provider, ipfsHost, network, options) {
        this.filePath = filePath;
        this.provider = provider;
        this.ipfsHost = ipfsHost;
        this.network = network;
        this.usernameContract = options && options["usernameContract"] || null;
    }
    /*
    * Gets the crypto/ledger address.
    *
    * @param {string} password The wallet password.
    *
    * @return {Promise<string>} The address.
    */
    EthAuthIDDriver.prototype.getAddress = function (password) {
        var _this = this;
        return new Promise(function (onSuccess, onError) { return __awaiter(_this, void 0, void 0, function () {
            var keyPair, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.wallet.getKeyPair(password)];
                    case 1:
                        keyPair = _a.sent();
                        onSuccess(keyPair["address"]);
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _a.sent();
                        onError(err_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /*
    * Register a DID.
    *
    * @param {string} password The wallet password.
    *
    * @return {Promise<string>} The uri of the did.
    */
    EthAuthIDDriver.prototype.registerDID = function (password) {
        var _this = this;
        return new Promise(function (onSuccess, onError) { return __awaiter(_this, void 0, void 0, function () {
            var info, keys, controller, authorizationKey, did, didUri, processorKeyPair, processorId, localProcessor, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.getInfo()];
                    case 1:
                        info = _a.sent();
                        if ("did" in info)
                            throw new Error("This wallet already contains a DID!");
                        return [4 /*yield*/, this.wallet.unlockKeys(password)];
                    case 2:
                        keys = _a.sent();
                        controller = keys["controller"];
                        authorizationKey = keys["authorizationKey"];
                        return [4 /*yield*/, ethb_did_1.EthBDID.create(controller["privateKey"], controller["address"], authorizationKey["publicKey"], this.provider)];
                    case 3:
                        did = _a.sent();
                        didUri = did["didUri"];
                        // 2) Save the did
                        this.wallet.setDid(didUri);
                        processorKeyPair = EthAuthIDDriver.createKeyPair();
                        processorId = "local";
                        return [4 /*yield*/, this.authorizeProcessor(password, processorId, processorKeyPair["publicKey"], true, true, did)];
                    case 4:
                        localProcessor = _a.sent();
                        // 3) Import the processor
                        return [4 /*yield*/, this.importProcessor(password, processorId, localProcessor, processorKeyPair["privateKey"])];
                    case 5:
                        // 3) Import the processor
                        _a.sent();
                        onSuccess(didUri);
                        return [3 /*break*/, 7];
                    case 6:
                        err_2 = _a.sent();
                        onError(err_2);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
    };
    /*
    * Import a DID.
    *
    * @param {string} password The wallet password.
    * @param {string} password The wallet password.
    *
    * @param {Promise<void>}
    */
    EthAuthIDDriver.prototype.importDID = function (password, did) {
        var _this = this;
        return new Promise(function (onSuccess, onError) { return __awaiter(_this, void 0, void 0, function () {
            var info, ethbDID, controller, walletAddress, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.getInfo()];
                    case 1:
                        info = _a.sent();
                        if ("did" in info)
                            throw new Error("This wallet already contains a DID!");
                        return [4 /*yield*/, ethb_did_1.EthBDID.resolve(did, this.provider)];
                    case 2:
                        ethbDID = _a.sent();
                        controller = ethbDID.getController();
                        return [4 /*yield*/, this.getAddress(password)];
                    case 3:
                        walletAddress = _a.sent();
                        if (controller != walletAddress)
                            throw new Error("This wallet does not have the correct keys for the DID!");
                        this.wallet.setDid(did);
                        onSuccess();
                        return [3 /*break*/, 5];
                    case 4:
                        err_3 = _a.sent();
                        onError(err_3);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); });
    };
    /*
    * Register a name.
    * TODO: Save info in wallet (or do we???). Check if name already exists
    * @param {string} password The wallet password.
    * @param {string} name The name to register.
    *
    * @return {Promise<string>} The transaction address.
    */
    EthAuthIDDriver.prototype.registerName = function (password, name) {
        var _this = this;
        return new Promise(function (onSuccess, onError) { return __awaiter(_this, void 0, void 0, function () {
            var info, profile, signedProfile, keys, privateKey, usernameWallet, options, ethUsername, transaction, err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.getInfo()];
                    case 1:
                        info = _a.sent();
                        if (!("did" in info))
                            throw new Error("This wallet does not contain a DID!");
                        if ("name" in info)
                            throw new Error("This wallet already contains a name!");
                        profile = { username: name, did: info["did"] };
                        return [4 /*yield*/, this.createJwt(password, profile, null)];
                    case 2:
                        signedProfile = _a.sent();
                        return [4 /*yield*/, this.wallet.unlockKeys(password)];
                    case 3:
                        keys = _a.sent();
                        privateKey = keys["controller"]["privateKey"];
                        usernameWallet = new ethers_1.Wallet(privateKey, this.provider);
                        options = {};
                        if (this.usernameContract)
                            options["contractAddress"] = this.usernameContract;
                        return [4 /*yield*/, eth_username_1.EthUsername.load(usernameWallet, this.network, options)];
                    case 4:
                        ethUsername = _a.sent();
                        return [4 /*yield*/, ethUsername.registerUsername(name, { did: signedProfile })];
                    case 5:
                        transaction = _a.sent();
                        this.wallet.setName(name);
                        onSuccess(transaction["hash"]);
                        return [3 /*break*/, 7];
                    case 6:
                        err_4 = _a.sent();
                        onError(err_4);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
    };
    /*
    * Import an already registered name.
    *
    * @param {string} password The wallet password.
    * @param {string} name The name to import.
    */
    EthAuthIDDriver.prototype.importName = function (name) {
        throw new Error("Not implemented!");
    };
    EthAuthIDDriver.prototype.authorizeProcessor = function (password, processorId, publicKey, sig, auth, did) {
        var _this = this;
        return new Promise(function (onSuccess, onError) { return __awaiter(_this, void 0, void 0, function () {
            var processorInfo, info, keys, authKeyPair, processor, err_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        processorInfo = void 0;
                        if (!!did) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.getInfo()];
                    case 1:
                        info = _a.sent();
                        if (!("did" in info))
                            throw new Error("This wallet does not contain a DID!");
                        return [4 /*yield*/, ethb_did_1.EthBDID.resolve(info["did"], this.provider)];
                    case 2:
                        did = _a.sent();
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this.processors.get(processorId)];
                    case 4:
                        processorInfo = _a.sent();
                        if (processorInfo != undefined)
                            throw new Error("Processor ID is already taken!");
                        return [4 /*yield*/, this.wallet.unlockKeys(password)];
                    case 5:
                        keys = _a.sent();
                        authKeyPair = keys["authorizationKey"];
                        processor = did.authorizeProcessor(publicKey, sig, auth, authKeyPair["privateKey"]);
                        // 2) Save the processor info
                        processorInfo = { publicKey: processor.getPublicKey() };
                        return [4 /*yield*/, this.processors.set(processorId, processorInfo)];
                    case 6:
                        _a.sent();
                        onSuccess(processor.getToken());
                        return [3 /*break*/, 8];
                    case 7:
                        err_5 = _a.sent();
                        onError(err_5);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        }); });
    };
    /*
    * Import a processor.
    *
    * @param {string} password The wallet password.
    * @param {string} processorId String used to indentify the processor.
    * @param {string} processorToken The processor token.
    * @param {string} privateKey The private key of the processor.
    */
    EthAuthIDDriver.prototype.importProcessor = function (password, processorId, processorToken, privateKey) {
        var _this = this;
        return new Promise(function (onSuccess, onError) { return __awaiter(_this, void 0, void 0, function () {
            var info, processor, issuer, err_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.wallet.getInfo()];
                    case 1:
                        info = _a.sent();
                        if (!("did" in info))
                            throw new Error("This wallet does not contain a DID!");
                        processor = ethb_did_1.Processor.parse(processorToken);
                        issuer = processor.getIssuer();
                        if (issuer["type"] != "controller" || issuer["did"] != info["did"])
                            throw new Error("Invalid issuer");
                        return [4 /*yield*/, this.wallet.importProcessor(processorId, processor, privateKey, password)];
                    case 2:
                        _a.sent();
                        onSuccess();
                        return [3 /*break*/, 4];
                    case 3:
                        err_6 = _a.sent();
                        onError(err_6);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    };
    /*
    * Revoke a processor.
    *
    * @param {string} password The wallet password.
    * @param {string} processorId The string used to identify the processor.
    */
    EthAuthIDDriver.prototype.revokeProcessor = function (password, processorId) {
        var _this = this;
        return new Promise(function (onSuccess, onError) { return __awaiter(_this, void 0, void 0, function () {
            var info, processorInfo, keys, did, err_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, this.getInfo()];
                    case 1:
                        info = _a.sent();
                        if (!("did" in info))
                            throw new Error("This wallet does not contain a DID!");
                        return [4 /*yield*/, this.processors.get(processorId)];
                    case 2:
                        processorInfo = _a.sent();
                        if (processorInfo == undefined)
                            throw new Error("Could not find processor info.");
                        return [4 /*yield*/, this.wallet.unlockKeys(password)];
                    case 3:
                        keys = _a.sent();
                        return [4 /*yield*/, ethb_did_1.EthBDID.resolve(info["did"], this.provider)];
                    case 4:
                        did = _a.sent();
                        // Revoke the processor
                        return [4 /*yield*/, did.revokeProcessorKey(processorInfo["publicKey"], keys["controller"]["privateKey"])];
                    case 5:
                        // Revoke the processor
                        _a.sent();
                        // Delete the processor from the wallet
                        return [4 /*yield*/, this.wallet.deleteProcessor(processorId)];
                    case 6:
                        // Delete the processor from the wallet
                        _a.sent();
                        onSuccess();
                        return [3 /*break*/, 8];
                    case 7:
                        err_7 = _a.sent();
                        onError(err_7);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        }); });
    };
    /*
    * Create a new JWT.
    *
    * @param {string} password The wallet password.
    * @param {object} claims The claims for the jwt.
    * @param {string} expiresIn Expiry time.
    *
    * @return {Promise<string>} The jwt.
    */
    EthAuthIDDriver.prototype.createJwt = function (password, claims, expiresIn) {
        var _this = this;
        return new Promise(function (onSuccess, onError) { return __awaiter(_this, void 0, void 0, function () {
            var info, processorObj, processor, privateKey, jwt, err_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getInfo()];
                    case 1:
                        info = _a.sent();
                        if (!("did" in info))
                            throw new Error("This wallet does not contain a DID!");
                        if ("name" in claims)
                            throw new Error("'name' is a reserved key!");
                        if ("name" in info)
                            claims["name"] = info["name"] + ".eth";
                        return [4 /*yield*/, this.wallet.getProcessor("auth", password)];
                    case 2:
                        processorObj = _a.sent();
                        processor = ethb_did_1.Processor.parse(processorObj["token"]);
                        privateKey = processorObj["privateKey"];
                        jwt = processor.createJwt(claims, expiresIn, privateKey);
                        onSuccess(jwt);
                        return [3 /*break*/, 4];
                    case 3:
                        err_8 = _a.sent();
                        onError(err_8);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    };
    /*
    * Verify a jwt.
    *
    * @param {string} jwt The json web token.
    * @param {string} id The id that signed the jwt.
    *
    * @return {Promis<object>} The verification result.
    */
    EthAuthIDDriver.prototype.verifyJwt = function (jwt, id) {
        var _this = this;
        return new Promise(function (onSuccess, onError) { return __awaiter(_this, void 0, void 0, function () {
            var didUri, parsed, options, ethUsername, username, profile, decoded, signedUsername, claimedDid, did, verified, err_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 9, , 10]);
                        didUri = void 0;
                        parsed = url_1.default.parse(id);
                        if (!(parsed.protocol != null && parsed.protocol.toUpperCase() == "DID:")) return [3 /*break*/, 1];
                        didUri = id;
                        return [3 /*break*/, 6];
                    case 1:
                        options = {};
                        if (this.usernameContract)
                            options["contractAddress"] = this.usernameContract;
                        return [4 /*yield*/, eth_username_1.EthUsername.load(ethers_1.Wallet.createRandom().connect(this.provider), this.network, options)];
                    case 2:
                        ethUsername = _a.sent();
                        username = EthAuthIDDriver.cleanName(id);
                        return [4 /*yield*/, ethUsername.getProfile(username)];
                    case 3:
                        profile = _a.sent();
                        return [4 /*yield*/, jsonwebtoken_1.default.decode(profile["did"])];
                    case 4:
                        decoded = _a.sent();
                        signedUsername = decoded["username"];
                        claimedDid = decoded["did"];
                        if (signedUsername != username)
                            throw new Error("The username does not own this DID!");
                        // Verify the claim
                        return [4 /*yield*/, this.verifyJwt(profile["did"], claimedDid)];
                    case 5:
                        // Verify the claim
                        _a.sent();
                        didUri = claimedDid;
                        _a.label = 6;
                    case 6: return [4 /*yield*/, ethb_did_1.EthBDID.resolve(didUri, this.provider)];
                    case 7:
                        did = _a.sent();
                        return [4 /*yield*/, did.verifyJwt(jwt, "signing")];
                    case 8:
                        verified = _a.sent();
                        onSuccess(verified);
                        return [3 /*break*/, 10];
                    case 9:
                        err_9 = _a.sent();
                        onError(err_9);
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        }); });
    };
    EthAuthIDDriver.prototype.getInfo = function () {
        var _this = this;
        return new Promise(function (onSuccess, onError) { return __awaiter(_this, void 0, void 0, function () {
            var info, err_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.wallet.getInfo()];
                    case 1:
                        info = _a.sent();
                        info["wallet"] = this.wallet;
                        onSuccess(info);
                        return [3 /*break*/, 3];
                    case 2:
                        err_10 = _a.sent();
                        onError(err_10);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    EthAuthIDDriver.prototype.getPublicKeys = function (password) {
        var _this = this;
        return new Promise(function (onSuccess, onError) { return __awaiter(_this, void 0, void 0, function () {
            var publicKeys, err_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.wallet.getPublicKeys(password)];
                    case 1:
                        publicKeys = _a.sent();
                        onSuccess(publicKeys);
                        return [3 /*break*/, 3];
                    case 2:
                        err_11 = _a.sent();
                        onError(err_11);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    EthAuthIDDriver.prototype.init = function () {
        var _this = this;
        return new Promise(function (onSuccess, onError) { return __awaiter(_this, void 0, void 0, function () {
            var processorStorageDir, err_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        this.wallet = new eth_authid_wallet_1.EthAuthIDWallet(path_1.default.join(this.filePath, WALLET_DIR_NAME));
                        return [4 /*yield*/, this.wallet.init()];
                    case 1:
                        _a.sent();
                        processorStorageDir = path_1.default.join(this.filePath, PROCESSORS_STORAGE);
                        this.processors = node_persist_1.default.create({ dir: processorStorageDir });
                        return [4 /*yield*/, node_persist_1.default.init({ dir: processorStorageDir })];
                    case 2:
                        _a.sent();
                        ethb_did_1.EthBDID.connectToIpfs(this.ipfsHost);
                        eth_username_1.EthUsername.connectToIpfs(this.ipfsHost);
                        onSuccess();
                        return [3 /*break*/, 4];
                    case 3:
                        err_12 = _a.sent();
                        onError(err_12);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    };
    /*
    * Private functions
    */
    EthAuthIDDriver.createKeyPair = function () {
        var privateKey = crypto_1.randomBytes(32);
        var publicKey = secp256k1_1.default.publicKeyCreate(privateKey);
        var privateKeyHex = Buffer.from(privateKey).toString("hex");
        var publicKeyHex = Buffer.from(publicKey).toString("hex");
        return { privateKey: privateKeyHex, publicKey: publicKeyHex };
    };
    EthAuthIDDriver.cleanName = function (name) {
        return name.substring(0, name.lastIndexOf(".eth"));
    };
    return EthAuthIDDriver;
}());
exports.EthAuthIDDriver = EthAuthIDDriver;

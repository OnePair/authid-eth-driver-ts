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
var crypto_1 = require("crypto");
var hdnode_1 = require("ethers/utils/hdnode");
var fs_1 = __importDefault(require("fs"));
var mkdirp_1 = __importDefault(require("mkdirp"));
var crypto_json_1 = __importDefault(require("crypto-json"));
var crypto_2 = __importDefault(require("crypto"));
var path_1 = __importDefault(require("path"));
var node_persist_1 = __importDefault(require("node-persist"));
var secp256k1_1 = __importDefault(require("secp256k1"));
var KEYS_FILE_NAME = "keys.json";
//const INFO_FILE_NAME: string = "authid_info.json";
var PROCESSORS_STORAGE = "processors.storage";
var INFO_STORAGE = "info.storage";
var AUTH_PROCESSORS = "auth_processors";
var SIG_PROCESSORS = "sig_processors";
var AES_256 = "AES256";
/*
* TODO: Implement wallet locking function or ask for password everytime the wallet is needed
*/
var EthAuthIDWallet = /** @class */ (function () {
    function EthAuthIDWallet(walletDirPath) {
        this.walletDirPath = walletDirPath;
        this.keysFilePath = path_1.default.join(walletDirPath, KEYS_FILE_NAME);
    }
    /*
    * Public functions
    */
    EthAuthIDWallet.prototype.setDid = function (did) {
        var _this = this;
        return new Promise(function (onSuccess, onError) { return __awaiter(_this, void 0, void 0, function () {
            var err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.infoStorage.set("did", did)];
                    case 1:
                        _a.sent();
                        onSuccess();
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
    EthAuthIDWallet.prototype.importProcessor = function (processorId, processor, privateKey, password) {
        var _this = this;
        return new Promise(function (onSuccess, onError) { return __awaiter(_this, void 0, void 0, function () {
            var processorInfo, processorObj, encrypted, permissions, authProcessors, sigProcessors, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        return [4 /*yield*/, this.processors.get(processorId)];
                    case 1:
                        processorInfo = _a.sent();
                        if (processorInfo != undefined)
                            throw new Error("Processor ID is already taken!");
                        processorObj = { token: processor.getToken(), privateKey: privateKey };
                        encrypted = crypto_json_1.default.encrypt(processorObj, password, { algorithm: AES_256, encoding: "hex" });
                        this.processors.set(processorId, encrypted);
                        permissions = processor.getPermissions();
                        if (!(permissions.indexOf("auth") != -1)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.infoStorage.get(AUTH_PROCESSORS)];
                    case 2:
                        authProcessors = _a.sent();
                        if (authProcessors == undefined)
                            authProcessors = [];
                        authProcessors.push(processorId);
                        return [4 /*yield*/, this.infoStorage.set(AUTH_PROCESSORS, authProcessors)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!(permissions.indexOf("signing") != -1)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.infoStorage.get(SIG_PROCESSORS)];
                    case 5:
                        sigProcessors = _a.sent();
                        if (sigProcessors == undefined)
                            sigProcessors = [];
                        sigProcessors.push(processorId);
                        return [4 /*yield*/, this.infoStorage.set(SIG_PROCESSORS, sigProcessors)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        onSuccess();
                        return [3 /*break*/, 9];
                    case 8:
                        err_2 = _a.sent();
                        onError(err_2);
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        }); });
    };
    EthAuthIDWallet.prototype.getProcessor = function (permission, password) {
        var _this = this;
        return new Promise(function (onSuccess, onError) { return __awaiter(_this, void 0, void 0, function () {
            var processorId, authProcessorIds, sigProcessorIds, processorObjEncrypted, processorObject, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        processorId = void 0;
                        if (!(permission == "auth")) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.infoStorage.get(AUTH_PROCESSORS)];
                    case 1:
                        authProcessorIds = _a.sent();
                        if (authProcessorIds == undefined || authProcessorIds.length == 0)
                            throw new Error("No processors found!");
                        processorId = authProcessorIds[0];
                        return [3 /*break*/, 5];
                    case 2:
                        if (!(permission == "signing")) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.infoStorage.get(AUTH_PROCESSORS)];
                    case 3:
                        sigProcessorIds = _a.sent();
                        if (sigProcessorIds == undefined || sigProcessorIds.length == 0)
                            throw new Error("No processors found!");
                        processorId = sigProcessorIds[0];
                        return [3 /*break*/, 5];
                    case 4: throw new Error("Invalid permission!");
                    case 5: return [4 /*yield*/, this.processors.get(processorId)];
                    case 6:
                        processorObjEncrypted = _a.sent();
                        processorObject = crypto_json_1.default.decrypt(processorObjEncrypted, password);
                        onSuccess(processorObject);
                        return [3 /*break*/, 8];
                    case 7:
                        err_3 = _a.sent();
                        onError(err_3);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        }); });
    };
    EthAuthIDWallet.prototype.deleteProcessor = function (processorId) {
        var _this = this;
        return new Promise(function (onSuccess, onError) { return __awaiter(_this, void 0, void 0, function () {
            var authProcessors, sigProcessors, authIndex, sigIndex, err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        return [4 /*yield*/, this.infoStorage.get(AUTH_PROCESSORS)];
                    case 1:
                        authProcessors = _a.sent();
                        return [4 /*yield*/, this.infoStorage.get(SIG_PROCESSORS)];
                    case 2:
                        sigProcessors = _a.sent();
                        if (!(authProcessors != undefined)) return [3 /*break*/, 4];
                        authIndex = void 0;
                        if (!((authIndex = authProcessors.indexOf(processorId)) != -1)) return [3 /*break*/, 4];
                        authProcessors.splice(authIndex, 1);
                        return [4 /*yield*/, this.infoStorage.set(AUTH_PROCESSORS, authProcessors)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!(sigProcessors != undefined)) return [3 /*break*/, 6];
                        sigIndex = void 0;
                        if (!((sigIndex = sigProcessors.indexOf(processorId)) != -1)) return [3 /*break*/, 6];
                        sigProcessors.splice(sigIndex, 1);
                        return [4 /*yield*/, this.infoStorage.set(SIG_PROCESSORS, sigProcessors)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: 
                    // Remove from the processors list
                    return [4 /*yield*/, this.processors.removeItem(processorId)];
                    case 7:
                        // Remove from the processors list
                        _a.sent();
                        onSuccess();
                        return [3 /*break*/, 9];
                    case 8:
                        err_4 = _a.sent();
                        onError(err_4);
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        }); });
    };
    EthAuthIDWallet.prototype.unlockKeys = function (password) {
        var _this = this;
        return new Promise(function (onSuccess, onError) { return __awaiter(_this, void 0, void 0, function () {
            var keys, encryptedKeys;
            return __generator(this, function (_a) {
                try {
                    keys = void 0;
                    if (fs_1.default.existsSync(this.keysFilePath)) {
                        encryptedKeys = JSON.parse(fs_1.default.readFileSync(this.keysFilePath).toString());
                        keys = crypto_json_1.default.decrypt(encryptedKeys, password, { algorithm: AES_256, encoding: "hex" });
                    }
                    else {
                        keys = EthAuthIDWallet.createKeys();
                        this.saveKeys(keys, password);
                    }
                    onSuccess(keys);
                }
                catch (err) {
                    onError(err);
                }
                return [2 /*return*/];
            });
        }); });
    };
    EthAuthIDWallet.prototype.saveKeys = function (keys, password) {
        var _this = this;
        return new Promise(function (onSuccess, onError) { return __awaiter(_this, void 0, void 0, function () {
            var options, encrypted;
            return __generator(this, function (_a) {
                options = {};
                options["processorKey"] = keys["processorKey"];
                encrypted = crypto_json_1.default.encrypt(keys, password, { algorithm: AES_256, encoding: "hex" });
                fs_1.default.writeFileSync(this.keysFilePath, JSON.stringify(encrypted));
                onSuccess();
                return [2 /*return*/];
            });
        }); });
    };
    EthAuthIDWallet.prototype.getKeyPair = function (password) {
        var _this = this;
        return new Promise(function (onSuccess, onError) { return __awaiter(_this, void 0, void 0, function () {
            var keys, controller, keyPair, err_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.unlockKeys(password)];
                    case 1:
                        keys = _a.sent();
                        controller = keys["controller"];
                        keyPair = { address: controller["address"], privateKey: controller["privateKey"] };
                        onSuccess(keyPair);
                        return [3 /*break*/, 3];
                    case 2:
                        err_5 = _a.sent();
                        onError(err_5);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    EthAuthIDWallet.prototype.getInfo = function () {
        var _this = this;
        return new Promise(function (onSuccess, onError) { return __awaiter(_this, void 0, void 0, function () {
            var info_1, err_6;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        info_1 = {};
                        return [4 /*yield*/, this.infoStorage.forEach(function (dantum) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    info_1[dantum.key] = dantum.value;
                                    return [2 /*return*/];
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        onSuccess(info_1);
                        return [3 /*break*/, 3];
                    case 2:
                        err_6 = _a.sent();
                        onError(err_6);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    EthAuthIDWallet.prototype.getPublicKeys = function (password) {
        var _this = this;
        return new Promise(function (onSuccess, onError) { return __awaiter(_this, void 0, void 0, function () {
            var keys, publicKeys, err_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.unlockKeys(password)];
                    case 1:
                        keys = _a.sent();
                        publicKeys = {
                            authorizationKey: keys["authorizationKey"]["publicKey"],
                            controllerAddress: keys["controller"]["address"]
                        };
                        onSuccess(publicKeys);
                        return [3 /*break*/, 3];
                    case 2:
                        err_7 = _a.sent();
                        onError(err_7);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    EthAuthIDWallet.prototype.getMnemonic = function (password) {
        var _this = this;
        return new Promise(function (onSuccess, onError) { return __awaiter(_this, void 0, void 0, function () {
            var keys, err_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.unlockKeys(password)];
                    case 1:
                        keys = _a.sent();
                        onSuccess(keys["controller"]["mnemonic"]);
                        return [3 /*break*/, 3];
                    case 2:
                        err_8 = _a.sent();
                        onError(err_8);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    EthAuthIDWallet.prototype.recoverFromMnemonic = function (mnemonic, password) {
        var _this = this;
        return new Promise(function (onSuccess, onError) { return __awaiter(_this, void 0, void 0, function () {
            var controllerHDNode, controller, controllerEntropy, authKeyEntropy, authPrivateKey, authPublicKey, privateKeyHex, publicKeyHex, authorizationKey, keys, err_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        controllerHDNode = hdnode_1.fromMnemonic(mnemonic);
                        controller = {
                            address: controllerHDNode["address"],
                            privateKey: controllerHDNode["privateKey"],
                            mnemonic: controllerHDNode["mnemonic"]
                        };
                        controllerEntropy = hdnode_1.mnemonicToEntropy(mnemonic);
                        authKeyEntropy = crypto_2.default.createHash("sha256")
                            .update(controllerEntropy)
                            .digest();
                        authPrivateKey = crypto_2.default.createHash("sha256")
                            .update(authKeyEntropy)
                            .digest();
                        authPublicKey = secp256k1_1.default.publicKeyCreate(authPrivateKey);
                        privateKeyHex = Buffer.from(authPrivateKey).toString("hex");
                        publicKeyHex = Buffer.from(authPublicKey).toString("hex");
                        authorizationKey = {
                            privateKey: privateKeyHex,
                            publicKey: publicKeyHex
                        };
                        keys = { controller: controller, authorizationKey: authorizationKey };
                        return [4 /*yield*/, this.saveKeys(keys, password)];
                    case 1:
                        _a.sent();
                        onSuccess();
                        return [3 /*break*/, 3];
                    case 2:
                        err_9 = _a.sent();
                        onError(err_9);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    EthAuthIDWallet.prototype.init = function () {
        var _this = this;
        return new Promise(function (onSuccess, onError) { return __awaiter(_this, void 0, void 0, function () {
            var processorsPath, infoPath, err_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        this.initEnv();
                        processorsPath = path_1.default.join(this.walletDirPath, PROCESSORS_STORAGE);
                        infoPath = path_1.default.join(this.walletDirPath, INFO_STORAGE);
                        this.processors = node_persist_1.default.create({ dir: processorsPath });
                        this.infoStorage = node_persist_1.default.create({ dir: infoPath });
                        return [4 /*yield*/, node_persist_1.default.init({ dir: processorsPath })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, node_persist_1.default.init({ dir: infoPath })];
                    case 2:
                        _a.sent();
                        onSuccess();
                        return [3 /*break*/, 4];
                    case 3:
                        err_10 = _a.sent();
                        onError(err_10);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    };
    /*
    * Private functions
    */
    EthAuthIDWallet.prototype.initEnv = function () {
        if (!fs_1.default.existsSync(this.walletDirPath)) {
            mkdirp_1.default.sync(this.walletDirPath);
        }
    };
    /*
    * Private static functions
    */
    EthAuthIDWallet.createKeys = function () {
        var entropy = "0x" + Buffer.from(crypto_1.randomBytes(32)).toString("hex");
        var mnemonic = hdnode_1.entropyToMnemonic(entropy);
        var controllerHDNode = hdnode_1.fromMnemonic(mnemonic);
        var controller = {
            address: controllerHDNode["address"],
            privateKey: controllerHDNode["privateKey"],
            mnemonic: controllerHDNode["mnemonic"]
        };
        var authKeyEntropy = crypto_2.default.createHash("sha256")
            .update(entropy)
            .digest();
        // hash again
        var authPrivateKey = crypto_2.default.createHash("sha256")
            .update(authKeyEntropy)
            .digest();
        var authPublicKey = secp256k1_1.default.publicKeyCreate(authPrivateKey);
        var privateKeyHex = Buffer.from(authPrivateKey).toString("hex");
        var publicKeyHex = Buffer.from(authPublicKey).toString("hex");
        var authorizationKey = {
            privateKey: privateKeyHex,
            publicKey: publicKeyHex
        };
        return { controller: controller, authorizationKey: authorizationKey };
    };
    return EthAuthIDWallet;
}());
exports.EthAuthIDWallet = EthAuthIDWallet;

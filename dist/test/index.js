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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var providers_1 = require("ethers/providers");
var src_1 = require("../src");
var ethb_did_1 = require("ethb-did");
var chai_1 = require("chai");
var ganache_cli_1 = __importDefault(require("ganache-cli"));
var web3_1 = __importDefault(require("web3"));
describe("Testing eth-driver", function () {
    var IPFS_HOST = "/ip4/127.0.0.1/tcp/5001";
    var RPC_HOST = "http://127.0.0.1:9545";
    var password = "password123";
    var ethServer;
    var rpcProvider;
    var web3;
    var driverAddress;
    var did;
    var ethDriver;
    before(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            ethServer = ganache_cli_1.default.server();
            ethServer.listen(9545);
            rpcProvider = new providers_1.JsonRpcProvider(RPC_HOST);
            web3 = new web3_1.default(new web3_1.default.providers.HttpProvider(RPC_HOST));
            ethDriver = new src_1.EthAuthIDDriver("./test-driver-dir", rpcProvider, IPFS_HOST);
            return [2 /*return*/];
        });
    }); });
    describe("Driver setup", function () {
        it("Should initilize driver", function (done) {
            chai_1.assert.doesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                var err_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, ethDriver.init()];
                        case 1:
                            _a.sent();
                            done();
                            return [3 /*break*/, 3];
                        case 2:
                            err_1 = _a.sent();
                            done(new Error(err_1));
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
        });
        it("Should get an Ethereum address from the wallet", function (done) {
            chai_1.assert.doesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                var _a, err_2;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            _a = this;
                            return [4 /*yield*/, ethDriver.getAddress(password)];
                        case 1:
                            _a.driverAddress = _b.sent();
                            done();
                            return [3 /*break*/, 3];
                        case 2:
                            err_2 = _b.sent();
                            done(new Error(err_2));
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
        });
    });
    describe("Wallet tests", function () {
        var firstKeys;
        var wallet;
        var mnemonicSeed;
        before(function () { return __awaiter(_this, void 0, void 0, function () {
            var driverInfo, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, ethDriver.getInfo()];
                    case 1:
                        driverInfo = _c.sent();
                        _a = this;
                        return [4 /*yield*/, driverInfo["wallet"]];
                    case 2:
                        _a.wallet = _c.sent();
                        _b = this;
                        return [4 /*yield*/, this.wallet.unlockKeys(password)];
                    case 3:
                        _b.firstKeys = _c.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("Should get mnemonicSeed", function (done) {
            chai_1.assert.doesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                var _a, err_3;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            _a = this;
                            return [4 /*yield*/, this.wallet.getMnemonic(password)];
                        case 1:
                            _a.mnemonicSeed = _b.sent();
                            done();
                            return [3 /*break*/, 3];
                        case 2:
                            err_3 = _b.sent();
                            done(new Error(err_3));
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
        });
        it("Should recover wallet from mnemonic seed", function (done) {
            chai_1.assert.doesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                var newKeys, firstControllerPrivateKey, newControllerPrivateKey, firstAuthPrivateKey, newAuthPrivateKey, err_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            return [4 /*yield*/, this.wallet.recoverFromMnemonic(this.mnemonicSeed, password)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this.wallet.unlockKeys(password)];
                        case 2:
                            newKeys = _a.sent();
                            firstControllerPrivateKey = this.firstKeys["controller"]["privateKey"];
                            newControllerPrivateKey = newKeys["controller"]["privateKey"];
                            firstAuthPrivateKey = this.firstKeys["authorizationKey"]["privateKey"];
                            newAuthPrivateKey = newKeys["authorizationKey"]["privateKey"];
                            if ((firstControllerPrivateKey != newControllerPrivateKey) ||
                                (firstAuthPrivateKey != newAuthPrivateKey)) {
                                done(new Error("Recovered keys are invalid!"));
                            }
                            else {
                                done();
                            }
                            return [3 /*break*/, 4];
                        case 3:
                            err_4 = _a.sent();
                            done(new Error(err_4));
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
        });
        it("Password should be invalid", function (done) {
            chai_1.assert.doesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                var address, err_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, ethDriver.getAddress("wrongpassword")];
                        case 1:
                            address = _a.sent();
                            done(new Error("Password should be invalid!"));
                            return [3 /*break*/, 3];
                        case 2:
                            err_5 = _a.sent();
                            done();
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
        });
        it("Should get public keys", function (done) {
            chai_1.assert.doesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                var publicKeys, err_6;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, ethDriver.getPublicKeys(password)];
                        case 1:
                            publicKeys = _a.sent();
                            if (!("authorizationKey" in publicKeys)
                                || !("controllerAddress" in publicKeys)) {
                                done(new Error("Missing keys!"));
                            }
                            else {
                                done();
                            }
                            return [3 /*break*/, 3];
                        case 2:
                            err_6 = _a.sent();
                            done(new Error(err_6));
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
        });
    });
    describe("Driver tests", function () {
        var processorPrivateKey = "c38135f7f7cf1a37c28139adc772bebcb14e101e0b3a61202850a76f9cdfc6c1";
        var processorPublicKey = "04d09e007bcd7e16c9b290bfeaf464741d1bf1bf7e95606e711ffb8ffac509151878aedab61ad665f975e427a64b1b46335ffd19e95188921898c03b8b7dbca4e5";
        var processorId = "processor";
        var wrongProcessorPrivateKey = "bdb5e9b06786166dfe71461227b276a4daf1a8cdf23fcdb9910ae0888e58822e";
        var claims = { key: "value" };
        var processorToken;
        var jwt;
        before(function () { return __awaiter(_this, void 0, void 0, function () {
            var accounts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Funding the authid ethereum address...");
                        return [4 /*yield*/, web3.eth.getAccounts()];
                    case 1:
                        accounts = _a.sent();
                        return [4 /*yield*/, web3.eth.sendTransaction({
                                from: accounts[1],
                                to: this.driverAddress,
                                value: web3_1.default.utils.toWei("5", "ether")
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("Should register a new DID", function (done) {
            chai_1.assert.doesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                var _a, err_7;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            _a = this;
                            return [4 /*yield*/, ethDriver.registerDID(password)];
                        case 1:
                            _a.did = _b.sent();
                            console.log("Registered did:", this.did);
                            done();
                            return [3 /*break*/, 3];
                        case 2:
                            err_7 = _b.sent();
                            done(new Error(err_7));
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
        });
        it("Should authorize a processor", function (done) {
            chai_1.assert.doesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                var _a, err_8;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            _a = this;
                            return [4 /*yield*/, ethDriver.authorizeProcessor(password, "processor", processorPublicKey, true, true)];
                        case 1:
                            _a.processorToken = _b.sent();
                            done();
                            return [3 /*break*/, 3];
                        case 2:
                            err_8 = _b.sent();
                            done(new Error(err_8));
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
        });
        it("Should import processor", function (done) {
            chai_1.assert.doesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                var err_9;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, ethDriver.importProcessor(password, processorId, this.processorToken, processorPrivateKey)];
                        case 1:
                            _a.sent();
                            done();
                            return [3 /*break*/, 3];
                        case 2:
                            err_9 = _a.sent();
                            done(new Error(err_9));
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
        });
        it("Externally signed jwt should be valid", function (done) {
            chai_1.assert.doesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                var processor, jwt, err_10;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            processor = ethb_did_1.Processor.parse(this.processorToken);
                            jwt = processor.createJwt(claims, "5 days", processorPrivateKey);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, ethDriver.verifyJwt(jwt, this.did)];
                        case 2:
                            _a.sent();
                            done();
                            return [3 /*break*/, 4];
                        case 3:
                            err_10 = _a.sent();
                            done(new Error(err_10));
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
        });
        it("Externally signed jwt should be invalid", function (done) {
            chai_1.assert.doesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                var processor, jwt, err_11;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            processor = ethb_did_1.Processor.parse(this.processorToken);
                            jwt = processor.createJwt(claims, "5 days", wrongProcessorPrivateKey);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, ethDriver.verifyJwt(jwt, this.did)];
                        case 2:
                            _a.sent();
                            done(new Error("JWT should be invalid!"));
                            return [3 /*break*/, 4];
                        case 3:
                            err_11 = _a.sent();
                            done();
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
        });
        it("Should revoke processor", function (done) {
            chai_1.assert.doesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                var err_12;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, ethDriver.revokeProcessor(password, processorId)];
                        case 1:
                            _a.sent();
                            done();
                            return [3 /*break*/, 3];
                        case 2:
                            err_12 = _a.sent();
                            done(new Error(err_12));
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
        });
        it("Jwt signed by revoked processor should be invalid", function (done) {
            chai_1.assert.doesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                var processor, jwt, err_13;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            processor = ethb_did_1.Processor.parse(this.processorToken);
                            jwt = processor.createJwt(claims, "5 days", processorPrivateKey);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, ethDriver.verifyJwt(jwt, this.did)];
                        case 2:
                            _a.sent();
                            done(new Error("JWT should be invalid!"));
                            return [3 /*break*/, 4];
                        case 3:
                            err_13 = _a.sent();
                            done();
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
        });
        it("Should create a Jwt", function (done) {
            chai_1.assert.doesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                var _a, err_14;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            _a = this;
                            return [4 /*yield*/, ethDriver.createJwt(password, claims, "1 day")];
                        case 1:
                            _a.jwt = _b.sent();
                            done();
                            return [3 /*break*/, 3];
                        case 2:
                            err_14 = _b.sent();
                            done(new Error(err_14));
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
        });
        it("Jwt should be valid", function (done) {
            chai_1.assert.doesNotThrow(function () { return __awaiter(_this, void 0, void 0, function () {
                var err_15;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, ethDriver.verifyJwt(this.jwt, this.did)];
                        case 1:
                            _a.sent();
                            done();
                            return [3 /*break*/, 3];
                        case 2:
                            err_15 = _a.sent();
                            done(new Error(err_15));
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
        });
    });
    after(function () {
        ethServer.close();
    });
});

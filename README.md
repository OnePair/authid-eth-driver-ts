
# authid-eth-driver-ts

> An AuthID Ethereum driver reference implementation built in typescript.


## Install

```npm install```

## Usage

Driver setup
```js
import { EthAuthIDDriver } "authid-eth-driver";
import { JsonRpcProvider } from "ethers/providers"; // Import an ethers provider

const filePath = "<DIR_PATH>";
const rpcHost = "<RPC_HOST>";
const ipfsHost = "<IPFS_HOST>";

// 1) Create an ethers provider instance
let rpcProvider = new new JsonRpcProvider(rpcHost);

// 2) Create an AuthIDEthDriver instance
let ethDriver = new AuthIDEthDriver();
// 3) Initialize it
await ethDriver.init();

```


## Build

```npm run build```

## Test

```npm run test```

// src/index.ts
import { Command } from "commander";

// src/bot.ts
import Anthropic from "@anthropic-ai/sdk";

// src/modules/mud/setup.ts
import {
  createPublicClient,
  createWalletClient,
  http,
  getContract
} from "viem";
import { privateKeyToAccount, nonceManager } from "viem/accounts";
import { createWorld } from "@latticexyz/recs";
import { encodeEntity, syncToRecs } from "@latticexyz/store-sync/recs";
import { transportObserver } from "@latticexyz/common";
import { transactionQueue } from "@latticexyz/common/actions";

// ../contracts/worlds.json
var worlds_default = {
  "690": {
    address: "0x4ab7e8b94347cb0236e3de126db9c50599f7db2d",
    blockNumber: 1193554
  },
  "4242": {
    address: "0x27bae7cea782a5232f8aab546db2639d05d3a40c",
    blockNumber: 43079054
  },
  "8453": {
    address: "0x28d10E6aAb1a749Be792b4D8aa0519c70E83386a",
    blockNumber: 36961789
  },
  "17001": {
    address: "0xe833b782f63f7f0cb754b3259780a2b0a291dd80",
    blockNumber: 3017754
  },
  "17069": {
    address: "0x6f9eCC22096A5A34c58FEA8FCdaF4aBE914475Cd",
    blockNumber: 13567658
  },
  "31337": {
    address: "0x6439113f0e1f64018c3167DA2aC21e2689818086"
  },
  "84532": {
    address: "0xAD73982AE505ba40d98b375B5f65C4B265a8C193",
    blockNumber: 33500368
  },
  "695569": {
    address: "0x78a2B029a5B5600d87b4951D5108E02F87D12806",
    blockNumber: 4446914
  }
};

// src/modules/mud/supportedChains.ts
import { base as baseConfig, baseSepolia as baseSepoliaConfig } from "viem/chains";
import { mudFoundry } from "@latticexyz/common/chains";
var RPC_HTTP_URL = process.env.RPC_HTTP_URL;
var extendedBase = {
  ...baseConfig,
  rpcUrls: {
    default: {
      http: RPC_HTTP_URL ? [RPC_HTTP_URL, ...baseConfig.rpcUrls.default.http] : baseConfig.rpcUrls.default.http,
      webSocket: void 0
    }
  },
  indexerUrl: "https://base.rat-fun-indexer.com"
};
var extendedBaseSepolia = {
  ...baseSepoliaConfig,
  rpcUrls: {
    default: {
      http: RPC_HTTP_URL ? [RPC_HTTP_URL, ...baseSepoliaConfig.rpcUrls.default.http] : baseSepoliaConfig.rpcUrls.default.http,
      webSocket: void 0
    }
  },
  indexerUrl: "https://base-sepolia.rat-fun-indexer.com"
};
var supportedChains = [mudFoundry, extendedBase, extendedBaseSepolia];

// src/modules/mud/networkConfig.ts
async function getNetworkConfig(chainId, worldAddressOverride) {
  const chainIndex = supportedChains.findIndex((c) => c.id === chainId);
  const chain = supportedChains[chainIndex];
  if (!chain) {
    throw new Error(`Chain ${chainId} not supported. Supported chains: ${supportedChains.map((c) => c.id).join(", ")}`);
  }
  const world = worlds_default[chain.id.toString()];
  const worldAddress = worldAddressOverride || world?.address;
  if (!worldAddress) {
    throw new Error(`World address not found for chain ${chainId}. Set WORLD_ADDRESS env var.`);
  }
  const initialBlockNumber = world?.blockNumber ?? 0;
  return {
    chainId,
    chain,
    worldAddress,
    initialBlockNumber,
    indexerUrl: chain.indexerUrl
  };
}

// ../contracts/out/IWorld.sol/IWorld.abi.json
var IWorld_abi_default = [
  {
    type: "function",
    name: "batchCall",
    inputs: [
      {
        name: "systemCalls",
        type: "tuple[]",
        internalType: "struct SystemCallData[]",
        components: [
          {
            name: "systemId",
            type: "bytes32",
            internalType: "ResourceId"
          },
          {
            name: "callData",
            type: "bytes",
            internalType: "bytes"
          }
        ]
      }
    ],
    outputs: [
      {
        name: "returnDatas",
        type: "bytes[]",
        internalType: "bytes[]"
      }
    ],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "batchCallFrom",
    inputs: [
      {
        name: "systemCalls",
        type: "tuple[]",
        internalType: "struct SystemCallFromData[]",
        components: [
          {
            name: "from",
            type: "address",
            internalType: "address"
          },
          {
            name: "systemId",
            type: "bytes32",
            internalType: "ResourceId"
          },
          {
            name: "callData",
            type: "bytes",
            internalType: "bytes"
          }
        ]
      }
    ],
    outputs: [
      {
        name: "returnDatas",
        type: "bytes[]",
        internalType: "bytes[]"
      }
    ],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "call",
    inputs: [
      {
        name: "systemId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "callData",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    outputs: [
      {
        name: "",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "callFrom",
    inputs: [
      {
        name: "delegator",
        type: "address",
        internalType: "address"
      },
      {
        name: "systemId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "callData",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    outputs: [
      {
        name: "",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "creator",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "deleteRecord",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "getDynamicField",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]"
      },
      {
        name: "dynamicFieldIndex",
        type: "uint8",
        internalType: "uint8"
      }
    ],
    outputs: [
      {
        name: "",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getDynamicFieldLength",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]"
      },
      {
        name: "dynamicFieldIndex",
        type: "uint8",
        internalType: "uint8"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getDynamicFieldSlice",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]"
      },
      {
        name: "dynamicFieldIndex",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "start",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "end",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [
      {
        name: "data",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getField",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]"
      },
      {
        name: "fieldIndex",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "fieldLayout",
        type: "bytes32",
        internalType: "FieldLayout"
      }
    ],
    outputs: [
      {
        name: "data",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getField",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]"
      },
      {
        name: "fieldIndex",
        type: "uint8",
        internalType: "uint8"
      }
    ],
    outputs: [
      {
        name: "data",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getFieldLayout",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId"
      }
    ],
    outputs: [
      {
        name: "fieldLayout",
        type: "bytes32",
        internalType: "FieldLayout"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getFieldLength",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]"
      },
      {
        name: "fieldIndex",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "fieldLayout",
        type: "bytes32",
        internalType: "FieldLayout"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getFieldLength",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]"
      },
      {
        name: "fieldIndex",
        type: "uint8",
        internalType: "uint8"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getKeySchema",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId"
      }
    ],
    outputs: [
      {
        name: "keySchema",
        type: "bytes32",
        internalType: "Schema"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getRecord",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]"
      },
      {
        name: "fieldLayout",
        type: "bytes32",
        internalType: "FieldLayout"
      }
    ],
    outputs: [
      {
        name: "staticData",
        type: "bytes",
        internalType: "bytes"
      },
      {
        name: "encodedLengths",
        type: "bytes32",
        internalType: "EncodedLengths"
      },
      {
        name: "dynamicData",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getRecord",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]"
      }
    ],
    outputs: [
      {
        name: "staticData",
        type: "bytes",
        internalType: "bytes"
      },
      {
        name: "encodedLengths",
        type: "bytes32",
        internalType: "EncodedLengths"
      },
      {
        name: "dynamicData",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getStaticField",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]"
      },
      {
        name: "fieldIndex",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "fieldLayout",
        type: "bytes32",
        internalType: "FieldLayout"
      }
    ],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getValueSchema",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId"
      }
    ],
    outputs: [
      {
        name: "valueSchema",
        type: "bytes32",
        internalType: "Schema"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "grantAccess",
    inputs: [
      {
        name: "resourceId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "grantee",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "initialize",
    inputs: [
      {
        name: "initModule",
        type: "address",
        internalType: "contract IModule"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "installModule",
    inputs: [
      {
        name: "module",
        type: "address",
        internalType: "contract IModule"
      },
      {
        name: "encodedArgs",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "installRootModule",
    inputs: [
      {
        name: "module",
        type: "address",
        internalType: "contract IModule"
      },
      {
        name: "encodedArgs",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "popFromDynamicField",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]"
      },
      {
        name: "dynamicFieldIndex",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "byteLengthToPop",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "pushToDynamicField",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]"
      },
      {
        name: "dynamicFieldIndex",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "dataToPush",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "ratfun__applyOutcome",
    inputs: [
      {
        name: "_ratId",
        type: "bytes32",
        internalType: "bytes32"
      },
      {
        name: "_tripId",
        type: "bytes32",
        internalType: "bytes32"
      },
      {
        name: "_balanceTransferToOrFromRat",
        type: "int256",
        internalType: "int256"
      },
      {
        name: "_itemsToRemoveFromRat",
        type: "bytes32[]",
        internalType: "bytes32[]"
      },
      {
        name: "_itemsToAddToRat",
        type: "tuple[]",
        internalType: "struct Item[]",
        components: [
          {
            name: "name",
            type: "string",
            internalType: "string"
          },
          {
            name: "value",
            type: "uint256",
            internalType: "uint256"
          }
        ]
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "ratfun__balanceOf",
    inputs: [
      {
        name: "playerId",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "ratfun__closeTrip",
    inputs: [
      {
        name: "_tripId",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "ratfun__createRat",
    inputs: [
      {
        name: "_name",
        type: "string",
        internalType: "string"
      }
    ],
    outputs: [
      {
        name: "ratId",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "ratfun__createTrip",
    inputs: [
      {
        name: "_playerId",
        type: "bytes32",
        internalType: "bytes32"
      },
      {
        name: "_tripId",
        type: "bytes32",
        internalType: "bytes32"
      },
      {
        name: "_tripCreationCost",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "_prompt",
        type: "string",
        internalType: "string"
      }
    ],
    outputs: [
      {
        name: "newTripId",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "ratfun__giveCallerTokens",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "ratfun__giveMasterKey",
    inputs: [
      {
        name: "playerId",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "ratfun__liquidateRat",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "ratfun__removeWorldEvent",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "ratfun__setCooldownCloseTrip",
    inputs: [
      {
        name: "_cooldownCloseTrip",
        type: "uint32",
        internalType: "uint32"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "ratfun__setMaxValuePerWin",
    inputs: [
      {
        name: "_maxValuePerWin",
        type: "uint32",
        internalType: "uint32"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "ratfun__setMinRatValueToEnter",
    inputs: [
      {
        name: "_minRatValueToEnter",
        type: "uint32",
        internalType: "uint32"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "ratfun__setRatsKilledForAdminAccess",
    inputs: [
      {
        name: "_ratsKilledForAdminAccess",
        type: "uint32",
        internalType: "uint32"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "ratfun__setTaxationCloseTrip",
    inputs: [
      {
        name: "_taxationCloseTrip",
        type: "uint32",
        internalType: "uint32"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "ratfun__setTaxationLiquidateRat",
    inputs: [
      {
        name: "_taxationLiquidateRat",
        type: "uint32",
        internalType: "uint32"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "ratfun__setWorldEvent",
    inputs: [
      {
        name: "cmsId",
        type: "string",
        internalType: "string"
      },
      {
        name: "title",
        type: "string",
        internalType: "string"
      },
      {
        name: "prompt",
        type: "string",
        internalType: "string"
      },
      {
        name: "durationInBlocks",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "ratfun__spawn",
    inputs: [
      {
        name: "_name",
        type: "string",
        internalType: "string"
      }
    ],
    outputs: [
      {
        name: "playerId",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "ratfun__unlockAdmin",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "registerDelegation",
    inputs: [
      {
        name: "delegatee",
        type: "address",
        internalType: "address"
      },
      {
        name: "delegationControlId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "initCallData",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "registerFunctionSelector",
    inputs: [
      {
        name: "systemId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "systemFunctionSignature",
        type: "string",
        internalType: "string"
      }
    ],
    outputs: [
      {
        name: "worldFunctionSelector",
        type: "bytes4",
        internalType: "bytes4"
      }
    ],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "registerNamespace",
    inputs: [
      {
        name: "namespaceId",
        type: "bytes32",
        internalType: "ResourceId"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "registerNamespaceDelegation",
    inputs: [
      {
        name: "namespaceId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "delegationControlId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "initCallData",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "registerRootFunctionSelector",
    inputs: [
      {
        name: "systemId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "worldFunctionSignature",
        type: "string",
        internalType: "string"
      },
      {
        name: "systemFunctionSignature",
        type: "string",
        internalType: "string"
      }
    ],
    outputs: [
      {
        name: "worldFunctionSelector",
        type: "bytes4",
        internalType: "bytes4"
      }
    ],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "registerStoreHook",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "hookAddress",
        type: "address",
        internalType: "contract IStoreHook"
      },
      {
        name: "enabledHooksBitmap",
        type: "uint8",
        internalType: "uint8"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "registerSystem",
    inputs: [
      {
        name: "systemId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "system",
        type: "address",
        internalType: "contract System"
      },
      {
        name: "publicAccess",
        type: "bool",
        internalType: "bool"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "registerSystemHook",
    inputs: [
      {
        name: "systemId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "hookAddress",
        type: "address",
        internalType: "contract ISystemHook"
      },
      {
        name: "enabledHooksBitmap",
        type: "uint8",
        internalType: "uint8"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "registerTable",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "fieldLayout",
        type: "bytes32",
        internalType: "FieldLayout"
      },
      {
        name: "keySchema",
        type: "bytes32",
        internalType: "Schema"
      },
      {
        name: "valueSchema",
        type: "bytes32",
        internalType: "Schema"
      },
      {
        name: "keyNames",
        type: "string[]",
        internalType: "string[]"
      },
      {
        name: "fieldNames",
        type: "string[]",
        internalType: "string[]"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [
      {
        name: "namespaceId",
        type: "bytes32",
        internalType: "ResourceId"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "revokeAccess",
    inputs: [
      {
        name: "resourceId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "grantee",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "setDynamicField",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]"
      },
      {
        name: "dynamicFieldIndex",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "setField",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]"
      },
      {
        name: "fieldIndex",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "setField",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]"
      },
      {
        name: "fieldIndex",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes"
      },
      {
        name: "fieldLayout",
        type: "bytes32",
        internalType: "FieldLayout"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "setRecord",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]"
      },
      {
        name: "staticData",
        type: "bytes",
        internalType: "bytes"
      },
      {
        name: "encodedLengths",
        type: "bytes32",
        internalType: "EncodedLengths"
      },
      {
        name: "dynamicData",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "setStaticField",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]"
      },
      {
        name: "fieldIndex",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes"
      },
      {
        name: "fieldLayout",
        type: "bytes32",
        internalType: "FieldLayout"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "spliceDynamicData",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]"
      },
      {
        name: "dynamicFieldIndex",
        type: "uint8",
        internalType: "uint8"
      },
      {
        name: "startWithinField",
        type: "uint40",
        internalType: "uint40"
      },
      {
        name: "deleteCount",
        type: "uint40",
        internalType: "uint40"
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "spliceStaticData",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        internalType: "bytes32[]"
      },
      {
        name: "start",
        type: "uint48",
        internalType: "uint48"
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "storeVersion",
    inputs: [],
    outputs: [
      {
        name: "version",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "transferBalanceToAddress",
    inputs: [
      {
        name: "fromNamespaceId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "toAddress",
        type: "address",
        internalType: "address"
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "transferBalanceToNamespace",
    inputs: [
      {
        name: "fromNamespaceId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "toNamespaceId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [
      {
        name: "namespaceId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "newOwner",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "unregisterDelegation",
    inputs: [
      {
        name: "delegatee",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "unregisterNamespaceDelegation",
    inputs: [
      {
        name: "namespaceId",
        type: "bytes32",
        internalType: "ResourceId"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "unregisterStoreHook",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "hookAddress",
        type: "address",
        internalType: "contract IStoreHook"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "unregisterSystemHook",
    inputs: [
      {
        name: "systemId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "hookAddress",
        type: "address",
        internalType: "contract ISystemHook"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "worldVersion",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "event",
    name: "HelloStore",
    inputs: [
      {
        name: "storeVersion",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "HelloWorld",
    inputs: [
      {
        name: "worldVersion",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "Store_DeleteRecord",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        indexed: true,
        internalType: "ResourceId"
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        indexed: false,
        internalType: "bytes32[]"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "Store_SetRecord",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        indexed: true,
        internalType: "ResourceId"
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        indexed: false,
        internalType: "bytes32[]"
      },
      {
        name: "staticData",
        type: "bytes",
        indexed: false,
        internalType: "bytes"
      },
      {
        name: "encodedLengths",
        type: "bytes32",
        indexed: false,
        internalType: "EncodedLengths"
      },
      {
        name: "dynamicData",
        type: "bytes",
        indexed: false,
        internalType: "bytes"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "Store_SpliceDynamicData",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        indexed: true,
        internalType: "ResourceId"
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        indexed: false,
        internalType: "bytes32[]"
      },
      {
        name: "dynamicFieldIndex",
        type: "uint8",
        indexed: false,
        internalType: "uint8"
      },
      {
        name: "start",
        type: "uint48",
        indexed: false,
        internalType: "uint48"
      },
      {
        name: "deleteCount",
        type: "uint40",
        indexed: false,
        internalType: "uint40"
      },
      {
        name: "encodedLengths",
        type: "bytes32",
        indexed: false,
        internalType: "EncodedLengths"
      },
      {
        name: "data",
        type: "bytes",
        indexed: false,
        internalType: "bytes"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "Store_SpliceStaticData",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        indexed: true,
        internalType: "ResourceId"
      },
      {
        name: "keyTuple",
        type: "bytes32[]",
        indexed: false,
        internalType: "bytes32[]"
      },
      {
        name: "start",
        type: "uint48",
        indexed: false,
        internalType: "uint48"
      },
      {
        name: "data",
        type: "bytes",
        indexed: false,
        internalType: "bytes"
      }
    ],
    anonymous: false
  },
  {
    type: "error",
    name: "EncodedLengths_InvalidLength",
    inputs: [
      {
        name: "length",
        type: "uint256",
        internalType: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "FieldLayout_Empty",
    inputs: []
  },
  {
    type: "error",
    name: "FieldLayout_InvalidStaticDataLength",
    inputs: [
      {
        name: "staticDataLength",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "computedStaticDataLength",
        type: "uint256",
        internalType: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "FieldLayout_StaticLengthDoesNotFitInAWord",
    inputs: [
      {
        name: "index",
        type: "uint256",
        internalType: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "FieldLayout_StaticLengthIsNotZero",
    inputs: [
      {
        name: "index",
        type: "uint256",
        internalType: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "FieldLayout_StaticLengthIsZero",
    inputs: [
      {
        name: "index",
        type: "uint256",
        internalType: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "FieldLayout_TooManyDynamicFields",
    inputs: [
      {
        name: "numFields",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "maxFields",
        type: "uint256",
        internalType: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "FieldLayout_TooManyFields",
    inputs: [
      {
        name: "numFields",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "maxFields",
        type: "uint256",
        internalType: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "Module_AlreadyInstalled",
    inputs: []
  },
  {
    type: "error",
    name: "Module_MissingDependency",
    inputs: [
      {
        name: "dependency",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "Module_NonRootInstallNotSupported",
    inputs: []
  },
  {
    type: "error",
    name: "Module_RootInstallNotSupported",
    inputs: []
  },
  {
    type: "error",
    name: "Schema_InvalidLength",
    inputs: [
      {
        name: "length",
        type: "uint256",
        internalType: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "Schema_StaticTypeAfterDynamicType",
    inputs: []
  },
  {
    type: "error",
    name: "Slice_OutOfBounds",
    inputs: [
      {
        name: "data",
        type: "bytes",
        internalType: "bytes"
      },
      {
        name: "start",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "end",
        type: "uint256",
        internalType: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "Store_IndexOutOfBounds",
    inputs: [
      {
        name: "length",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "accessedIndex",
        type: "uint256",
        internalType: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "Store_InvalidBounds",
    inputs: [
      {
        name: "start",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "end",
        type: "uint256",
        internalType: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "Store_InvalidFieldNamesLength",
    inputs: [
      {
        name: "expected",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "received",
        type: "uint256",
        internalType: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "Store_InvalidKeyNamesLength",
    inputs: [
      {
        name: "expected",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "received",
        type: "uint256",
        internalType: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "Store_InvalidResourceType",
    inputs: [
      {
        name: "expected",
        type: "bytes2",
        internalType: "bytes2"
      },
      {
        name: "resourceId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "resourceIdString",
        type: "string",
        internalType: "string"
      }
    ]
  },
  {
    type: "error",
    name: "Store_InvalidSplice",
    inputs: [
      {
        name: "startWithinField",
        type: "uint40",
        internalType: "uint40"
      },
      {
        name: "deleteCount",
        type: "uint40",
        internalType: "uint40"
      },
      {
        name: "fieldLength",
        type: "uint40",
        internalType: "uint40"
      }
    ]
  },
  {
    type: "error",
    name: "Store_InvalidStaticDataLength",
    inputs: [
      {
        name: "expected",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "received",
        type: "uint256",
        internalType: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "Store_InvalidValueSchemaDynamicLength",
    inputs: [
      {
        name: "expected",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "received",
        type: "uint256",
        internalType: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "Store_InvalidValueSchemaLength",
    inputs: [
      {
        name: "expected",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "received",
        type: "uint256",
        internalType: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "Store_InvalidValueSchemaStaticLength",
    inputs: [
      {
        name: "expected",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "received",
        type: "uint256",
        internalType: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "Store_TableAlreadyExists",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "tableIdString",
        type: "string",
        internalType: "string"
      }
    ]
  },
  {
    type: "error",
    name: "Store_TableNotFound",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "tableIdString",
        type: "string",
        internalType: "string"
      }
    ]
  },
  {
    type: "error",
    name: "World_AccessDenied",
    inputs: [
      {
        name: "resource",
        type: "string",
        internalType: "string"
      },
      {
        name: "caller",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "World_AlreadyInitialized",
    inputs: []
  },
  {
    type: "error",
    name: "World_CallbackNotAllowed",
    inputs: [
      {
        name: "functionSelector",
        type: "bytes4",
        internalType: "bytes4"
      }
    ]
  },
  {
    type: "error",
    name: "World_DelegationNotFound",
    inputs: [
      {
        name: "delegator",
        type: "address",
        internalType: "address"
      },
      {
        name: "delegatee",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "World_FunctionSelectorAlreadyExists",
    inputs: [
      {
        name: "functionSelector",
        type: "bytes4",
        internalType: "bytes4"
      }
    ]
  },
  {
    type: "error",
    name: "World_FunctionSelectorNotFound",
    inputs: [
      {
        name: "functionSelector",
        type: "bytes4",
        internalType: "bytes4"
      }
    ]
  },
  {
    type: "error",
    name: "World_InsufficientBalance",
    inputs: [
      {
        name: "balance",
        type: "uint256",
        internalType: "uint256"
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256"
      }
    ]
  },
  {
    type: "error",
    name: "World_InterfaceNotSupported",
    inputs: [
      {
        name: "contractAddress",
        type: "address",
        internalType: "address"
      },
      {
        name: "interfaceId",
        type: "bytes4",
        internalType: "bytes4"
      }
    ]
  },
  {
    type: "error",
    name: "World_InvalidNamespace",
    inputs: [
      {
        name: "namespace",
        type: "bytes14",
        internalType: "bytes14"
      }
    ]
  },
  {
    type: "error",
    name: "World_InvalidResourceId",
    inputs: [
      {
        name: "resourceId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "resourceIdString",
        type: "string",
        internalType: "string"
      }
    ]
  },
  {
    type: "error",
    name: "World_InvalidResourceType",
    inputs: [
      {
        name: "expected",
        type: "bytes2",
        internalType: "bytes2"
      },
      {
        name: "resourceId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "resourceIdString",
        type: "string",
        internalType: "string"
      }
    ]
  },
  {
    type: "error",
    name: "World_ResourceAlreadyExists",
    inputs: [
      {
        name: "resourceId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "resourceIdString",
        type: "string",
        internalType: "string"
      }
    ]
  },
  {
    type: "error",
    name: "World_ResourceNotFound",
    inputs: [
      {
        name: "resourceId",
        type: "bytes32",
        internalType: "ResourceId"
      },
      {
        name: "resourceIdString",
        type: "string",
        internalType: "string"
      }
    ]
  },
  {
    type: "error",
    name: "World_SystemAlreadyExists",
    inputs: [
      {
        name: "system",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "World_UnlimitedDelegationNotAllowed",
    inputs: []
  }
];

// ../contracts/mud.config.ts
import { defineWorld } from "@latticexyz/world";

// ../contracts/enums.ts
var ENTITY_TYPE = /* @__PURE__ */ ((ENTITY_TYPE3) => {
  ENTITY_TYPE3[ENTITY_TYPE3["NONE"] = 0] = "NONE";
  ENTITY_TYPE3[ENTITY_TYPE3["PLAYER"] = 1] = "PLAYER";
  ENTITY_TYPE3[ENTITY_TYPE3["RAT"] = 2] = "RAT";
  ENTITY_TYPE3[ENTITY_TYPE3["TRIP"] = 3] = "TRIP";
  ENTITY_TYPE3[ENTITY_TYPE3["ITEM"] = 4] = "ITEM";
  return ENTITY_TYPE3;
})(ENTITY_TYPE || {});
function getEnumKeys(enumObj) {
  return Object.values(enumObj).filter((key) => isNaN(Number(key)));
}
var ENTITY_TYPE_ARRAY = getEnumKeys(ENTITY_TYPE);

// ../contracts/mud.config.ts
var mud_config_default = defineWorld({
  namespace: "ratfun",
  enums: {
    ENTITY_TYPE: ENTITY_TYPE_ARRAY
  },
  codegen: {
    generateSystemLibraries: true
  },
  deploy: {
    upgradeableWorldImplementation: true
  },
  tables: {
    GameConfig: {
      key: [],
      schema: {
        adminAddress: "address",
        adminId: "bytes32",
        ratCreationCost: "uint256",
        maxInventorySize: "uint32",
        maxTripPromptLength: "uint32",
        cooldownCloseTrip: "uint32",
        ratsKilledForAdminAccess: "uint32"
      },
      codegen: {
        dataStruct: true
      }
    },
    GamePercentagesConfig: {
      key: [],
      schema: {
        maxValuePerWin: "uint32",
        // Limits how much a rat can extract from trip in one run
        minRatValueToEnter: "uint32",
        // Minimum total value of rat to enter trip.
        taxationLiquidateRat: "uint32",
        taxationCloseTrip: "uint32"
      }
    },
    WorldStats: {
      key: [],
      schema: {
        globalTripIndex: "uint256",
        globalRatIndex: "uint256",
        globalRatKillCount: "uint256",
        lastKilledRatBlock: "uint256"
      }
    },
    ExternalAddressesConfig: {
      key: [],
      schema: {
        erc20Address: "address",
        gamePoolAddress: "address",
        mainSaleAddress: "address",
        serviceAddress: "address",
        feeAddress: "address"
      },
      codegen: {
        dataStruct: true
      }
    },
    WorldEvent: {
      key: [],
      schema: {
        creationBlock: "uint256",
        expirationBlock: "uint256",
        cmsId: "string",
        title: "string",
        prompt: "string"
      }
    },
    // = = = = = = = = = =
    Name: "string",
    // Set on player, rat and trip
    EntityType: "ENTITY_TYPE",
    CreationBlock: "uint256",
    // Set on player, rat and trip
    LastVisitBlock: "uint256",
    // Set on trip
    // = = = = = = = = = =
    Balance: "uint256",
    // Amount of credits. Set on player, rat and trip.
    // = = = = = = = = = =
    Dead: "bool",
    // Set on rat
    Liquidated: "bool",
    // Set on rat and trip when it is liquidated by owner
    LiquidationValue: "uint256",
    // Set on rat and trip when it is liquidated, gross value (before taxation)
    LiquidationTaxPercentage: "uint256",
    // Set on rat and trip when it is liquidated
    LiquidationBlock: "uint256",
    // Set on rat and trip when it is liquidated
    // = = = = = = = = = =
    Inventory: "bytes32[]",
    // Items carried by player and rat
    // = = = = = = = = = =
    MasterKey: "bool",
    // Set on player. Gives access to in-game admin area.
    Index: "uint256",
    // Set on rat and trip
    Value: "uint256",
    // Set on items
    CurrentRat: "bytes32",
    // Set on player
    PastRats: "bytes32[]",
    // Set on player. List of rats the player has owned.
    Owner: "bytes32",
    // Set on trip and rat
    VisitCount: "uint256",
    // Set on trip
    KillCount: "uint256",
    // Set on trip
    TripCount: "uint256",
    // Set on rat
    // = = = = = = = = = =
    Prompt: "string",
    // = = = = = = = = = =
    TripCreationCost: "uint256"
    // Initial balance of trip.
  },
  systems: {
    // DevSystem is conditionally deployed for local/test chains in PostDeploy
    DevSystem: {
      deploy: {
        disabled: true
      }
    }
  },
  modules: [
    {
      artifactPath: "@latticexyz/world-modules/out/UniqueEntityModule.sol/UniqueEntityModule.json",
      root: true,
      args: []
    }
  ]
});

// src/modules/mud/setup.ts
async function setupMud(privateKey, chainId, worldAddressOverride) {
  const networkConfig = await getNetworkConfig(chainId, worldAddressOverride);
  const world = createWorld();
  console.log(`Setting up MUD for chain ${chainId}...`);
  console.log(`World address: ${networkConfig.worldAddress}`);
  console.log(`Indexer URL: ${networkConfig.indexerUrl}`);
  const clientOptions = {
    chain: networkConfig.chain,
    transport: transportObserver(http(networkConfig.chain.rpcUrls.default.http[0])),
    pollingInterval: 1e3
  };
  const publicClient = createPublicClient(clientOptions);
  const account = privateKeyToAccount(privateKey, { nonceManager });
  console.log(`Bot wallet address: ${account.address}`);
  const walletClient = createWalletClient({
    ...clientOptions,
    account
  }).extend(transactionQueue());
  const worldContract = getContract({
    address: networkConfig.worldAddress,
    abi: IWorld_abi_default,
    client: { public: publicClient, wallet: walletClient }
  });
  console.log("Syncing MUD state from indexer...");
  const { components, waitForTransaction } = await syncToRecs({
    world,
    config: mud_config_default,
    address: networkConfig.worldAddress,
    publicClient,
    startBlock: BigInt(networkConfig.initialBlockNumber),
    indexerUrl: networkConfig.indexerUrl
  });
  console.log("MUD sync complete!");
  return {
    world,
    components,
    playerEntity: encodeEntity({ address: "address" }, { address: walletClient.account.address }),
    publicClient,
    walletClient,
    waitForTransaction,
    worldContract
  };
}

// src/modules/mud/actions/spawn.ts
async function spawn(mud, name) {
  console.log(`Spawning player with name: ${name}...`);
  const tx = await mud.worldContract.write.ratfun__spawn([name]);
  console.log(`Spawn transaction sent: ${tx}`);
  await mud.waitForTransaction(tx);
  console.log(`Player spawned successfully!`);
  return tx;
}

// src/modules/mud/actions/createRat.ts
async function createRat(mud, name) {
  console.log(`Creating rat with name: ${name}...`);
  const tx = await mud.worldContract.write.ratfun__createRat([name]);
  console.log(`CreateRat transaction sent: ${tx}`);
  await mud.waitForTransaction(tx);
  console.log(`Rat created successfully!`);
  return tx;
}

// src/modules/mud/actions/approveTokens.ts
import { maxUint256, erc20Abi } from "viem";
import { getComponentValue } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
async function approveMaxTokens(mud) {
  const externalAddresses = getComponentValue(mud.components.ExternalAddressesConfig, singletonEntity);
  if (!externalAddresses) {
    throw new Error("ExternalAddressesConfig not found in MUD state");
  }
  const erc20Address = externalAddresses.erc20Address;
  const gamePoolAddress = externalAddresses.gamePoolAddress;
  console.log(`Approving max tokens for game pool...`);
  console.log(`  ERC20 address: ${erc20Address}`);
  console.log(`  Game pool address: ${gamePoolAddress}`);
  const tx = await mud.walletClient.writeContract({
    address: erc20Address,
    abi: erc20Abi,
    functionName: "approve",
    args: [gamePoolAddress, maxUint256]
  });
  console.log(`Approve transaction sent: ${tx}`);
  await mud.publicClient.waitForTransactionReceipt({ hash: tx });
  console.log(`Tokens approved successfully!`);
  return tx;
}
async function getAllowance(mud, ownerAddress) {
  const externalAddresses = getComponentValue(mud.components.ExternalAddressesConfig, singletonEntity);
  if (!externalAddresses) {
    throw new Error("ExternalAddressesConfig not found in MUD state");
  }
  const erc20Address = externalAddresses.erc20Address;
  const gamePoolAddress = externalAddresses.gamePoolAddress;
  const allowance = await mud.publicClient.readContract({
    address: erc20Address,
    abi: erc20Abi,
    functionName: "allowance",
    args: [ownerAddress, gamePoolAddress]
  });
  return allowance;
}

// src/modules/mud/actions/getTrips.ts
import { getComponentValue as getComponentValue2 } from "@latticexyz/recs";
import { singletonEntity as singletonEntity2 } from "@latticexyz/store-sync/recs";
import { ENTITY_TYPE as ENTITY_TYPE2 } from "contracts/enums";
function getAvailableTrips(mud) {
  const { EntityType, Balance, Prompt, TripCreationCost, Owner } = mud.components;
  const trips = [];
  EntityType.values.value.forEach((entityType, entityKey) => {
    const entityId = entityKey.description;
    if (entityType === ENTITY_TYPE2.TRIP) {
      const balance = Number(getComponentValue2(Balance, entityId)?.value ?? 0);
      if (balance > 0) {
        const prompt = getComponentValue2(Prompt, entityId)?.value ?? "";
        const tripCreationCost = Number(getComponentValue2(TripCreationCost, entityId)?.value ?? 0);
        const owner = getComponentValue2(Owner, entityId)?.value ?? "";
        trips.push({
          id: entityId,
          prompt,
          balance,
          tripCreationCost,
          owner
        });
      }
    }
  });
  return trips;
}
function getPlayer(mud, playerId) {
  const { Name, Balance, CurrentRat } = mud.components;
  const name = getComponentValue2(Name, playerId)?.value;
  if (!name) return null;
  const balance = Number(getComponentValue2(Balance, playerId)?.value ?? 0);
  const currentRat = getComponentValue2(CurrentRat, playerId)?.value ?? null;
  return {
    id: playerId,
    name,
    balance,
    currentRat
  };
}
function getRat(mud, ratId) {
  const { Name, Balance, Dead, Owner, TripCount, Inventory } = mud.components;
  const name = getComponentValue2(Name, ratId)?.value;
  if (!name) return null;
  const balance = Number(getComponentValue2(Balance, ratId)?.value ?? 0);
  const dead = Boolean(getComponentValue2(Dead, ratId)?.value ?? false);
  const owner = getComponentValue2(Owner, ratId)?.value ?? "";
  const tripCount = Number(getComponentValue2(TripCount, ratId)?.value ?? 0);
  const inventory = getComponentValue2(Inventory, ratId)?.value ?? [];
  return {
    id: ratId,
    name,
    balance,
    dead,
    owner,
    tripCount,
    inventory
  };
}
function getGameConfig(mud) {
  const gameConfig = getComponentValue2(mud.components.GameConfig, singletonEntity2);
  if (!gameConfig) {
    throw new Error("GameConfig not found in MUD state");
  }
  return {
    ratCreationCost: Number(gameConfig.ratCreationCost),
    adminId: gameConfig.adminId
  };
}
function getGamePercentagesConfig(mud) {
  const config = getComponentValue2(mud.components.GamePercentagesConfig, singletonEntity2);
  if (!config) {
    throw new Error("GamePercentagesConfig not found in MUD state");
  }
  return {
    maxValuePerWin: Number(config.maxValuePerWin),
    minRatValueToEnter: Number(config.minRatValueToEnter)
  };
}
function getRatTotalValue(mud, rat) {
  const { Value } = mud.components;
  let totalValue = rat.balance;
  for (const itemId of rat.inventory) {
    if (itemId) {
      const itemValue = Number(getComponentValue2(Value, itemId)?.value ?? 0);
      totalValue += itemValue;
    }
  }
  return totalValue;
}
function canRatEnterTrip(mud, rat, trip) {
  const config = getGamePercentagesConfig(mud);
  const ratValue = getRatTotalValue(mud, rat);
  const minRequired = Math.floor(trip.tripCreationCost * config.minRatValueToEnter / 100);
  return ratValue >= minRequired;
}

// src/modules/signature/index.ts
async function signRequest(data, walletClient) {
  const info = {
    timestamp: Date.now(),
    nonce: Math.floor(Math.random() * 1e12),
    calledFrom: null
    // Bot uses direct wallet, not delegation
  };
  const message = JSON.stringify({ data, info });
  const signature = await walletClient.signMessage({
    message
  });
  return {
    data,
    info,
    signature
  };
}

// src/modules/server/enterTrip.ts
async function enterTrip(serverUrl, walletClient, tripId, ratId) {
  const requestBody = {
    tripId,
    ratId
  };
  const signedRequest = await signRequest(requestBody, walletClient);
  const url = `${serverUrl}/trip/enter`;
  console.log(`Calling server: ${url}`);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45e3);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(signedRequest),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Server error: ${error.error}: ${error.message}`);
    }
    const outcome = await response.json();
    return outcome;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        throw new Error("Request timed out after 45 seconds");
      }
      if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        throw new Error(`Network error: ${err.message}`);
      }
    }
    throw err;
  }
}

// src/modules/trip-selector/heuristic.ts
function selectTripHeuristic(trips) {
  if (trips.length === 0) return null;
  const sorted = [...trips].sort((a, b) => b.balance - a.balance);
  return sorted[0];
}

// src/modules/trip-selector/claude.ts
async function selectTripWithClaude(anthropic, trips, rat) {
  if (trips.length === 0) return null;
  if (trips.length === 1) return trips[0];
  const tripsForPrompt = trips.map((t) => ({
    id: t.id,
    prompt: t.prompt,
    balance: t.balance
  }));
  const prompt = `You are an AI assistant helping a rat named "${rat.name}" choose which trip to enter in a game.

The rat currently has:
- Balance: ${rat.balance} credits
- ${rat.inventory.length} items in inventory

Available trips to choose from:
${JSON.stringify(tripsForPrompt, null, 2)}

Analyze each trip's prompt and balance. Consider:
1. Which trip scenario seems most favorable for the rat?
2. Which trip has a good balance (more potential rewards)?
3. Which trip prompt suggests interesting or manageable challenges?

Respond with ONLY the trip ID of your chosen trip. No explanation, just the ID.`;
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 100,
      messages: [{ role: "user", content: prompt }]
    });
    const content = response.content[0];
    if (content.type !== "text") {
      console.warn("Unexpected response type from Claude, falling back to heuristic");
      return trips.sort((a, b) => b.balance - a.balance)[0];
    }
    const selectedId = content.text.trim();
    const selectedTrip = trips.find((t) => t.id === selectedId);
    if (!selectedTrip) {
      console.warn(`Claude selected unknown trip ID: ${selectedId}, falling back to heuristic`);
      return trips.sort((a, b) => b.balance - a.balance)[0];
    }
    return selectedTrip;
  } catch (error) {
    console.error("Error calling Claude API:", error);
    console.warn("Falling back to heuristic selection");
    return trips.sort((a, b) => b.balance - a.balance)[0];
  }
}

// src/modules/trip-selector/index.ts
async function selectTrip(config, trips, rat, anthropic) {
  if (trips.length === 0) {
    return null;
  }
  if (config.tripSelector === "claude" && anthropic) {
    console.log("Using Claude AI to select trip...");
    return selectTripWithClaude(anthropic, trips, rat);
  } else {
    console.log("Using heuristic (highest balance) to select trip...");
    return selectTripHeuristic(trips);
  }
}

// src/modules/utils.ts
function addressToId(address) {
  if (!address) return "0x0";
  return "0x" + address.slice(2).padStart(64, "0").toLowerCase();
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function retryUntilResult(fn, timeoutMs = 5e3, retryIntervalMs = 100, condition) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    const result = fn();
    const isValid = condition ? condition(result) : Boolean(result);
    if (isValid) {
      return result;
    }
    await sleep(retryIntervalMs);
  }
  return null;
}

// src/modules/logger.ts
var colors = {
  reset: "\x1B[0m",
  bright: "\x1B[1m",
  dim: "\x1B[2m",
  red: "\x1B[31m",
  green: "\x1B[32m",
  yellow: "\x1B[33m",
  blue: "\x1B[34m",
  magenta: "\x1B[35m",
  cyan: "\x1B[36m"
};
function logInfo(message) {
  console.log(`${colors.cyan}[INFO]${colors.reset} ${message}`);
}
function logSuccess(message) {
  console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`);
}
function logWarning(message) {
  console.log(`${colors.yellow}[WARNING]${colors.reset} ${message}`);
}
function logError(message) {
  console.log(`${colors.red}[ERROR]${colors.reset} ${message}`);
}
function logTrip(tripNumber, message) {
  console.log(`${colors.magenta}[TRIP ${tripNumber}]${colors.reset} ${message}`);
}
function logRat(ratName, message) {
  console.log(`${colors.blue}[RAT: ${ratName}]${colors.reset} ${message}`);
}
function logDeath(ratName, tripCount) {
  console.log(`${colors.red}${colors.bright}`);
  console.log(`==========================================`);
  console.log(`  RAT "${ratName}" HAS DIED`);
  console.log(`  Survived ${tripCount} trips`);
  console.log(`==========================================`);
  console.log(`${colors.reset}`);
}
function logStats(stats) {
  const profitLoss = stats.finalBalance - stats.startingBalance;
  const profitLossColor = profitLoss >= 0 ? colors.green : colors.red;
  console.log(`${colors.bright}`);
  console.log(`==========================================`);
  console.log(`  RUN STATISTICS`);
  console.log(`==========================================`);
  console.log(`${colors.reset}`);
  console.log(`  Rat Name:        ${stats.ratName}`);
  console.log(`  Total Trips:     ${stats.totalTrips}`);
  console.log(`  Starting Balance: ${stats.startingBalance}`);
  console.log(`  Final Balance:    ${stats.finalBalance}`);
  console.log(`  ${profitLossColor}Profit/Loss:     ${profitLoss >= 0 ? "+" : ""}${profitLoss}${colors.reset}`);
  console.log(``);
}

// src/bot.ts
async function runBot(config) {
  logInfo("Starting Rattus Bot...");
  logInfo(`Chain ID: ${config.chainId}`);
  logInfo(`Server URL: ${config.serverUrl}`);
  logInfo(`Trip selector: ${config.tripSelector}`);
  logInfo(`Auto-respawn: ${config.autoRespawn}`);
  let anthropic;
  if (config.tripSelector === "claude") {
    anthropic = new Anthropic({ apiKey: config.anthropicApiKey });
    logInfo("Claude API client initialized");
  }
  logInfo("Setting up MUD connection...");
  const mud = await setupMud(config.privateKey, config.chainId, config.worldAddress);
  logSuccess("MUD setup complete!");
  const walletAddress = mud.walletClient.account.address;
  const playerId = addressToId(walletAddress);
  logInfo(`Wallet address: ${walletAddress}`);
  logInfo(`Player ID: ${playerId}`);
  logInfo("Checking player status...");
  let player = getPlayer(mud, playerId);
  if (!player) {
    logWarning("Player not found, spawning...");
    await spawn(mud, config.ratName);
    logInfo("Waiting for player to sync...");
    player = await retryUntilResult(
      () => getPlayer(mud, playerId),
      1e4,
      500
    );
    if (!player) {
      throw new Error("Failed to create player - timeout waiting for sync");
    }
    logSuccess(`Player spawned: ${player.name}`);
  } else {
    logSuccess(`Player found: ${player.name}`);
  }
  logInfo("Checking token allowance...");
  const gameConfig = getGameConfig(mud);
  const allowance = await getAllowance(mud, walletAddress);
  const requiredAllowance = BigInt(gameConfig.ratCreationCost) * BigInt(10 ** 18);
  if (allowance < requiredAllowance) {
    logWarning("Insufficient token allowance, approving max...");
    await approveMaxTokens(mud);
    logSuccess("Token allowance approved!");
  } else {
    logSuccess("Token allowance sufficient");
  }
  logInfo("Checking rat status...");
  let rat = null;
  let ratId = player.currentRat;
  if (ratId) {
    rat = getRat(mud, ratId);
    if (rat && !rat.dead) {
      logSuccess(`Found live rat: ${rat.name} (balance: ${rat.balance})`);
    } else if (rat?.dead) {
      logWarning(`Rat ${rat.name} is dead`);
      rat = null;
      ratId = null;
    }
  }
  if (!rat) {
    logInfo(`Creating new rat: ${config.ratName}...`);
    await createRat(mud, config.ratName);
    logInfo("Waiting for rat to sync...");
    await sleep(3e3);
    player = getPlayer(mud, playerId);
    if (player?.currentRat) {
      ratId = player.currentRat;
      rat = await retryUntilResult(
        () => getRat(mud, ratId),
        1e4,
        500
      );
    }
    if (!rat) {
      throw new Error("Failed to create rat - timeout waiting for sync");
    }
    logSuccess(`Rat created: ${rat.name} (balance: ${rat.balance})`);
  }
  let tripCount = 0;
  const startingBalance = rat.balance;
  const startingRatName = rat.name;
  logInfo("Starting main loop...");
  logInfo("==========================================");
  while (true) {
    const trips = getAvailableTrips(mud);
    logInfo(`Found ${trips.length} available trips`);
    if (trips.length === 0) {
      logWarning("No trips available, waiting 10 seconds...");
      await sleep(1e4);
      continue;
    }
    const enterableTrips = trips.filter((trip) => canRatEnterTrip(mud, rat, trip));
    logInfo(`${enterableTrips.length} trips are enterable with current rat value`);
    if (enterableTrips.length === 0) {
      logWarning("Rat value too low to enter any trips, waiting 10 seconds...");
      await sleep(1e4);
      continue;
    }
    const selectedTrip = await selectTrip(config, enterableTrips, rat, anthropic);
    if (!selectedTrip) {
      logError("Failed to select a trip");
      await sleep(5e3);
      continue;
    }
    tripCount++;
    logTrip(tripCount, `Entering: "${selectedTrip.prompt.slice(0, 60)}..."`);
    logTrip(tripCount, `Trip balance: ${selectedTrip.balance}`);
    try {
      const outcome = await enterTrip(config.serverUrl, mud.walletClient, selectedTrip.id, rat.id);
      if (outcome.log && outcome.log.length > 0) {
        console.log("");
        for (const entry of outcome.log) {
          console.log(`  ${entry.text}`);
        }
        console.log("");
      }
      if (outcome.ratDead) {
        logDeath(rat.name, tripCount);
        logStats({
          ratName: startingRatName,
          totalTrips: tripCount,
          startingBalance,
          finalBalance: 0
        });
        if (config.autoRespawn) {
          logInfo("Auto-respawn enabled, creating new rat...");
          await createRat(mud, config.ratName);
          await sleep(3e3);
          player = getPlayer(mud, playerId);
          if (player?.currentRat) {
            ratId = player.currentRat;
            rat = await retryUntilResult(
              () => getRat(mud, ratId),
              1e4,
              500
            );
          }
          if (!rat) {
            throw new Error("Failed to create new rat after death");
          }
          logSuccess(`New rat created: ${rat.name} (balance: ${rat.balance})`);
          tripCount = 0;
        } else {
          logInfo("Auto-respawn disabled, exiting...");
          break;
        }
      } else {
        await sleep(2e3);
        rat = getRat(mud, rat.id);
        if (rat) {
          const totalValue = getRatTotalValue(mud, rat);
          logRat(rat.name, `Balance: ${rat.balance}, Total Value: ${totalValue}, Trips: ${tripCount}`);
        }
      }
      await sleep(2e3);
    } catch (error) {
      logError(`Failed to enter trip: ${error instanceof Error ? error.message : String(error)}`);
      await sleep(5e3);
    }
  }
  logInfo("Bot stopped.");
}

// src/config.ts
function getServerUrl(chainId) {
  switch (chainId) {
    case 8453:
      return "https://base.rat.fun";
    case 84532:
      return "https://base-sepolia.rat.fun";
    default:
      return "http://localhost:3131";
  }
}
function loadConfig(opts) {
  const chainId = Number(opts.chain || process.env.CHAIN_ID || "84532");
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY environment variable is required");
  }
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicApiKey) {
    throw new Error("ANTHROPIC_API_KEY environment variable is required");
  }
  return {
    privateKey,
    anthropicApiKey,
    chainId,
    serverUrl: process.env.SERVER_URL || getServerUrl(chainId),
    tripSelector: opts.selector || process.env.TRIP_SELECTOR || "claude",
    autoRespawn: opts.autoRespawn ?? process.env.AUTO_RESPAWN === "true",
    ratName: opts.name || process.env.RAT_NAME || "RattusBot",
    worldAddress: process.env.WORLD_ADDRESS,
    rpcHttpUrl: process.env.RPC_HTTP_URL
  };
}

// src/index.ts
var program = new Command().name("rattus-bot").description("Autonomous rat.fun player bot").version("1.0.0").option("-c, --chain <id>", "Chain ID (8453=Base, 84532=Base Sepolia, 31337=local)").option("-s, --selector <type>", "Trip selector: claude or heuristic").option("-r, --auto-respawn", "Automatically create new rat on death").option("-n, --name <name>", "Name for the rat").action(async (options) => {
  try {
    const config = loadConfig({
      chain: options.chain,
      selector: options.selector,
      autoRespawn: options.autoRespawn,
      name: options.name
    });
    await runBot(config);
  } catch (error) {
    console.error("Fatal error:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
});
program.parse();
//# sourceMappingURL=index.js.map
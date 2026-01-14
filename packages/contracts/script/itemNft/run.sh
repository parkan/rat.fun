#!/bin/bash

# ItemNFT Deployment Script
# =========================
# This script deploys the ItemNFT contract and registers it in ItemNftConfig.
#
# Prerequisites:
# - PRIVATE_KEY environment variable must be set
# - Contracts must be built: pnpm build

set -e

# # # # # # # # # # # #
# LOCALHOST
# # # # # # # # # # # #

# LOCALHOST_WORLD_ADDRESS=0x...
# LOCALHOST_RPC_URL=http://localhost:8545

# forge script ./DeployItemNFT.s.sol --sig 'run(address)' $LOCALHOST_WORLD_ADDRESS --rpc-url $LOCALHOST_RPC_URL --broadcast -vvv

# # # # # # # # # # # #
# TESTNET (Base Sepolia)
# # # # # # # # # # # #

TESTNET_WORLD_ADDRESS=0xb559D9fb876F6fC3AC05B21004B33760B3582042
TESTNET_RPC_URL=https://base-sepolia.g.alchemy.com/v2/xEQqRE27u_VVjfn5HlN2J

# Full deploy (first time):
# forge script ./DeployItemNFT.s.sol --sig 'run(address)' $TESTNET_WORLD_ADDRESS --rpc-url $TESTNET_RPC_URL -vvv --broadcast

# Upgrade NFT contract only (keeps system, updates config):
forge script ./UpgradeItemNFT.s.sol --sig 'run(address)' $TESTNET_WORLD_ADDRESS --rpc-url $TESTNET_RPC_URL -vvv --broadcast

# # # # # # # # # # # #
# MAINNET (Base Mainnet)
# # # # # # # # # # # #

# MAINNET_WORLD_ADDRESS=0x28d10E6aAb1a749Be792b4D8aa0519c70E83386a
# MAINNET_RPC_URL=https://base-mainnet.g.alchemy.com/v2/-hnbjcqjwXmO7ip5cyHBh

#forge script ./DeployItemNFT.s.sol --sig 'run(address)' $MAINNET_WORLD_ADDRESS --rpc-url $MAINNET_RPC_URL --broadcast -vvv

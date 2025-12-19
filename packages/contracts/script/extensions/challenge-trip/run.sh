#!/bin/bash

# Challenge Trip Upgrade Deployment Script
# =========================================
# This script deploys the challenge trip feature to an existing MUD world:
# - Registers 4 new tables: ChallengeTrip, ChallengeWinner, FixedMinValueToEnter, OverrideMaxValuePerWinPercentage
# - Updates TripSystem with new createTrip signature (challenge trip params)
# - Updates ManagerSystem to set ChallengeWinner to player ID (not rat ID)
#
# Prerequisites:
# - PRIVATE_KEY environment variable must be set
# - Contracts must be built: pnpm build

set -e

# # # # # # # # # # # #
# LOCALHOST
# # # # # # # # # # # #

# LOCALHOST_WORLD_ADDRESS=0x6439113f0e1f64018c3167DA2aC21e2689818086
# LOCALHOST_RPC_URL=http://localhost:8545

# forge script ./DeployChallengeTripUpgrade.s.sol --sig run\(address\) $LOCALHOST_WORLD_ADDRESS --rpc-url $LOCALHOST_RPC_URL --broadcast -vvv

# # # # # # # # # # # #
# TESTNET (Base Sepolia)
# # # # # # # # # # # #

# TESTNET_WORLD_ADDRESS=0xb559D9fb876F6fC3AC05B21004B33760B3582042
# TESTNET_RPC_URL=https://sepolia.base.org

# forge script ./DeployChallengeTripUpgrade.s.sol --sig run\(address\) $TESTNET_WORLD_ADDRESS --rpc-url $TESTNET_RPC_URL --broadcast -vvv

# # # # # # # # # # # #
# MAINNET (Base Mainnet)
# # # # # # # # # # # #

MAINNET_WORLD_ADDRESS=0x28d10E6aAb1a749Be792b4D8aa0519c70E83386a
MAINNET_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Uncomment to run:
# forge script ./DeployChallengeTripUpgrade.s.sol --sig run\(address\) $MAINNET_WORLD_ADDRESS --rpc-url $MAINNET_RPC_URL --broadcast -vvv

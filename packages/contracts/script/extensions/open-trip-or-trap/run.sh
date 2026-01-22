#!/bin/bash

# Open Trip or Trap Upgrade Deployment Script
# ============================================
# This script deploys the global one-active-challenge feature to an existing MUD world:
# - Registers ChallengeConfig table (singleton for min cost and active period)
# - Registers ActiveChallenge table (singleton for global active challenge tracking)
# - Updates TripSystem with global challenge limit and setChallengeConfig function
# - Updates ManagerSystem to clear ActiveChallenge on challenge win
# - Initializes ChallengeConfig with default values (5000 min cost, 43200 blocks = 24h)
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

# forge script ./DeployOpenTripOrTrap.s.sol --sig run\(address\) $LOCALHOST_WORLD_ADDRESS --rpc-url $LOCALHOST_RPC_URL --broadcast -vvv

# # # # # # # # # # # #
# TESTNET (Base Sepolia)
# # # # # # # # # # # #

# TESTNET_WORLD_ADDRESS=0xb559D9fb876F6fC3AC05B21004B33760B3582042
# TESTNET_RPC_URL=https://base-sepolia.g.alchemy.com/v2/xEQqRE27u_VVjfn5HlN2J

# forge script ./DeployOpenTripOrTrap.s.sol --sig run\(address\) $TESTNET_WORLD_ADDRESS --rpc-url $TESTNET_RPC_URL -vvv --broadcast
# forge script ./VerifyDeployment.s.sol --sig 'run(address)' $TESTNET_WORLD_ADDRESS --rpc-url $TESTNET_RPC_URL -vvv


# # # # # # # # # # # #
# MAINNET (Base Mainnet)
# # # # # # # # # # # #

#MAINNET_WORLD_ADDRESS=0x28d10E6aAb1a749Be792b4D8aa0519c70E83386a
# MAINNET_RPC_URL=https://base-mainnet.g.alchemy.com/v2/-hnbjcqjwXmO7ip5cyHBh

# Full upgrade (tables + systems + init):
# forge script ./DeployOpenTripOrTrap.s.sol --sig run\(address\) $MAINNET_WORLD_ADDRESS --rpc-url $MAINNET_RPC_URL -vvv --broadcast
# forge script ./VerifyDeployment.s.sol --sig 'run(address)' $MAINNET_WORLD_ADDRESS --rpc-url $MAINNET_RPC_URL -vvv


# # # # # # # # # # # #
# REGISTER TABLES ONLY
# # # # # # # # # # # #
# Use this if the main script fails at table registration

# forge script ./RegisterTables.s.sol --sig 'run(address)' $MAINNET_WORLD_ADDRESS --rpc-url $MAINNET_RPC_URL --broadcast -vvv

# # # # # # # # # # # #
# DEPLOY SYSTEMS ONLY
# # # # # # # # # # # #
# Use this if tables are registered but system deployment failed

# forge script ./DeploySystems.s.sol --sig 'run(address)' $MAINNET_WORLD_ADDRESS --rpc-url $MAINNET_RPC_URL --broadcast -vvv

# # # # # # # # # # # #
# VERIFY DEPLOYMENT STATE
# # # # # # # # # # # #
# Run this to check tables and config values

# forge script ./VerifyDeployment.s.sol --sig 'run(address)' $MAINNET_WORLD_ADDRESS --rpc-url $MAINNET_RPC_URL -vvv

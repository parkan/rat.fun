#!/bin/bash

# Deploy all frontends to both mainnet and testnet
# This script runs all deployment scripts in sequence

echo "Starting deployment of all frontends..."

# Deploy client to mainnet
echo "=== Deploying client to mainnet ==="
./deploy-client-mainnet.sh

# Deploy client to testnet
echo "=== Deploying client to testnet ==="
./deploy-client-testnet.sh

# Deploy dashboard to mainnet
echo "=== Deploying dashboard to mainnet ==="
./deploy-dashboard-mainnet.sh

# Deploy dashboard to testnet
echo "=== Deploying dashboard to testnet ==="
./deploy-dashboard-testnet.sh

echo "All deployments completed!"

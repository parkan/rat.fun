# # # # # # # # # # # #
# LOCALHOST
# # # # # # # # # # # #

# LOCALHOST_WORLD_ADDRESS=0x6439113f0e1f64018c3167DA2aC21e2689818086
#LOCALHOST_RPC_URL=http://localhost:8545

# forge script InstallCallWithSignatureAltModule --sig run\(address\) $LOCALHOST_WORLD_ADDRESS --rpc-url $LOCALHOST_RPC_URL --broadcast -vvv --batch-size 5

# # # # # # # # # # # #
# MAINNET (Base Mainnet)
# # # # # # # # # # # #

MAINNET_WORLD_ADDRESS=0x28d10E6aAb1a749Be792b4D8aa0519c70E83386a
MAINNET_RPC_URL=https://base-mainnet.g.alchemy.com/v2/-hnbjcqjwXmO7ip5cyHBh

forge script InstallCallWithSignatureAltModule --sig run\(address\) $MAINNET_WORLD_ADDRESS --rpc-url $MAINNET_RPC_URL --broadcast -vvv --batch-size 5
# BASE MAINNET
WORLD_ADDRESS=0x28d10E6aAb1a749Be792b4D8aa0519c70E83386a
NEW_ERC20_ADDRESS=0xf2dd384662411a21259ab17038574289091f2d41
RPC_URL=https://base-mainnet.g.alchemy.com/v2/o0Q1hppQS1CH1vqg63edZ

forge script ../SwitchErc20.s.sol:SwitchErc20 --sig "run(address,address)" $WORLD_ADDRESS $NEW_ERC20_ADDRESS --rpc-url $RPC_URL --broadcast
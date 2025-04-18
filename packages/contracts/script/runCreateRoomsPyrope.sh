RPC=https://rpc.pyropechain.com
WORLD_ADDRESS=0xa86196bBdC69095bD8E846Fdb94f976121CB08A9

BATCH_SIZE=5

forge script CreateRooms --sig run\(address\) $WORLD_ADDRESS --broadcast --rpc-url $RPC -vvvv --batch-size $BATCH_SIZE
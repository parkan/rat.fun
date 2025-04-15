

RPC=https://rpc.pyropechain.com
WORLD_ADDRESS=0x5D9A0D58293f2A623A8480963E6f7A96c391fd91

BATCH_SIZE=5

forge script CreateRooms --sig run\(address\) $WORLD_ADDRESS --broadcast --rpc-url $RPC -vvvv --batch-size $BATCH_SIZE
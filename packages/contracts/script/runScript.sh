

RPC=https://rpc.pyropechain.com
WORLD_ADDRESS=0xed2CA57b699376dA8B44B1ad57DcAC3FFf021617

BATCH_SIZE=5

forge script CreateRooms --sig run\(address\) $WORLD_ADDRESS --broadcast --rpc-url $RPC -vvvv --batch-size $BATCH_SIZE
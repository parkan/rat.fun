#!/bin/bash

# Load environment variables
source ../.env

# Send POST request to update server
curl -X POST -H "Content-Type: application/json" \
    -H "Authorization: Bearer $SERVER_UPDATE_SECRET" \
    -d '{}' \
    "$SERVER_UPDATE_ENDPOINT"
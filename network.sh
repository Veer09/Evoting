network config
#!/bin/bash

# Generate crypto materials
cryptogen generate --config=./crypto-config.yaml

# Create channel artifacts
configtxgen -profile TwoOrgsOrdererGenesis -outputBlock ./channel-artifacts/genesis.block
configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/mychannel.tx -channelID mychannel

# Start network
docker-compose up -d

# Create channel
docker exec cli peer channel create -o orderer.example.com:7050 -c mychannel -f ./channel-artifacts/mychannel.tx

# Join peers to channel
docker exec cli peer channel join -b mychannel.block

# Install chaincode
docker exec cli peer lifecycle chaincode install voting.tar.gz

# Approve chaincode
docker exec cli peer lifecycle chaincode approveformyorg \
    -o orderer.example.com:7050 --channelID mychannel \
    --name voting --version 1.0 --sequence 1

# Commit chaincode
docker exec cli peer lifecycle chaincode commit \
    -o orderer.example.com:7050 --channelID mychannel \
    --name voting --version 1.0 --sequence 1
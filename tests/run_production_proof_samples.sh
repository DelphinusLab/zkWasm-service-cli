#!/bin/bash

# Ensure your server has the right merkle data, untar and copy the contents of the following tar file into your rocksdb folder.
# The tar file can be found on the server 138.217.142.94 located here: 
#   /home/yymone/yyu/ExplorerServerBackup/RocksDB/e2e/rocksdb-production-samples-for-e2e.tar.gz

# Script for running extra tests first time. Cli will be built, image will be added and script will wait for everything to finish.
bash scripts/cli/scripts/add_multiple_proofs.sh true "scripts/cli/inputs/production.json"

# Script for running extra tests after the first time. Image add will be skipped and script will not wait for proof to finish.
# bash scripts/cli/scripts/add_multiple_proofs.sh false "scripts/cli/inputs/production.json" false false false

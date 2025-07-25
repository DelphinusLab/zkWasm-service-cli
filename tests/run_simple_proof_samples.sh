#!/bin/bash

# Script for running extra tests first time. Cli will be built, image will be added and script will wait for everything to finish.
bash tests/scripts/add_multiple_proofs.sh

# Script for running extra tests after the first time. Image add will be skipped and script will not wait for proof to finish.
# bash tests/scripts/add_multiple_proofs.sh false "tests/inputs/simple.json" false false false

#!/bin/bash

cli_setup=${1:-"true"}

echo "Running all cli tests ..." \
    && bash tests/scripts/add_image.sh "$cli_setup" \
    && bash tests/scripts/add_manual_proving_task.sh "$cli_setup" \
    && bash tests/scripts/add_auto_proving_task.sh "$cli_setup" \
    && bash tests/scripts/query.sh "$cli_setup" || exit 1;
echo "Passed all tests";

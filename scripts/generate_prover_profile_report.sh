# This command will fetch the node statistics in memory, run the prover profile, and output the differences after the last task completes to the specified file.

node dist/index.js prover-profile \
    -r "http://101.36.120.170:20130" \
    --compare-with "node_statistics_1723451218170.json" \
    --report-out "prover_profile.json" # or prover_profile.json
#node dist/index.js query_nodes_tasks_time_range_stat \
#    -r "https://rpc.zkwasmhub.com"
#    --addr-file "nodes_addresses.txt" \
#    --time-start "2025-07-01T00:00:00Z" \
#    --time-end "2025-08-01T00:00:00Z"

# Example: For one specific node address
# node dist/index.js query_nodes_tasks_time_range_stat \
#     -r "https://rpc.zkwasmhub.com" \
#     --addr "0xc5d4df95798a76fb8155eb09b3e8e900c83748b0" \
#     --time-start "2025-07-01T00:00:00Z" \
#     --time-end "2025-08-01T00:00:00Z"

# Example: For all nodes
node dist/index.js query_nodes_tasks_time_range_stat \
    -r "https://rpc.zkwasmhub.com" \
    --all-nodes \
    --time-start "2025-07-01T00:00:00Z" \
    --time-end "2025-08-01T00:00:00Z" \
    --output-file "nodes_time_range_stats.csv"



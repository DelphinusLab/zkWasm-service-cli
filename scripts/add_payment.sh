node dist/index.js addpayment \
    -r "service-endpoint" \
    -u "user_address" \
    -x "private_key" \
    --amount "NUM" \
    --provider "rpc_url"

# Example:
# node dist/index.js addpayment \
#     -r "http://localhost:8108" \
#     -u "0x000000..." \
#     -x "00000000..." \
#     -a "0.00001" \
#     -p "https://sepolia-rpc.scroll.io"

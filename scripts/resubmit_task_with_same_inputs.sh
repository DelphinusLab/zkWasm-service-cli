node dist/index.js resubmittasks \
    -r "destination-service-endpoint" \
    -x "private_key" \
    --source_url "source-service-endpoint" \
    --taskids task_0 task_1 task_2 ...

# Example:
# node dist/index.js resubmittasks \
#     -r "http://localhost:8108" \
#     -x "00000000..." \
#     --source_url "https://rpc.zkwasmhub.com:8090" \
#     --taskids 67f5e1d9b5c1e853341ee4ab 67f4a2edb5c1e853341ee4a1 67f3311fb5c1e853341ee46a

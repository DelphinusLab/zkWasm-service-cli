node dist/index.js querytask \
    -r "service-endpoint" \
    --md5 "Image MD5" \
    --tasktype "Setup|Prove|Verify|Batch|Deploy|Reset" \
    --taskstatus "Pending|DryRunSuccess|Processing|DryRunFailed|Done|Fail|Unprovable|Stale" \
    --start X \
    --total Y \
    --concise true

# Example:
# node dist/index.js querytask \
#     -r "http://localhost:8108" \
#     --md5 D2144252F3C9DDCA5CA86C23D2EE97E9 \
#     --tasktype Prove \
#     --taskstatus Done \
#     --start 0 \
#     --total 10 \
#     --concise true

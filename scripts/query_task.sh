node dist/index.js querytask \
    -r "service-endpoint" \
    --task_id "Task id" \
    --user_address "User address" \
    --md5 "Image MD5" \
    --tasktype "Setup|Prove|Verify|Batch|Deploy|Reset" \
    --taskstatus "Pending|DryRunSuccess|Processing|DryRunFailed|Done|Fail|Unprovable|Stale" \
    --start X \
    --total Y \
    --concise true \
    --verbose true

# Note: only service-endpoint is required. If no query params are given, will return the latest task.

# Example:
# node dist/index.js querytask \
#     -r "http://localhost:8108" \
#    --task_id "000000..." \
#    --user_address "0x000000..." \
#    --md5 "D2144252F3C9DDCA5CA86C23D2EE97E9" \
#    --tasktype "Setup" \
#    --taskstatus "Pending" \
#    --start 0 \
#    --total 10 \
#    --concise true \
#    --verbose true

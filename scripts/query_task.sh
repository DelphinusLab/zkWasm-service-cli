node dist/index.js querytask \
    -r "service-endpoint" \
    --task_id "Task id" \
    --user_address "User address" \
    --md5 "Image MD5" \
    --tasktype "Setup|Prove|Verify|Batch|Deploy|Reset" \
    --taskstatus "Pending|DryRunSuccess|Processing|DryRunFailed|Done|Fail|Unprovable|Stale"

# Note: only service-endpoint is required. If no query params are given, will return the latest task.

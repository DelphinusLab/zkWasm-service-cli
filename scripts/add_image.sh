node dist/index.js addimage \
    -r "service-endpoint" \
    -u "user_address" \
    -x "private_key" \
    --path "image.wasm" \
    --name "Image name" \
    -d "Image description" \
    -c 22 \
    --creator_paid_proof false \
    --creator_only_add_prove_task false \
    --auto_submit_network_ids x y z \
    --import_data_image "Image md5"
    
# Optional: add this param to import merkle data from image by specifying md5, e.g.
# --import_data_image "9E3FD7F8B867F9CAE3494FA76F70E627"

# Optional: add this param to restrict add prove task to only the creator of the image, e.g.
# --creator_only_add_prove_task true

# Example:
# node dist/index.js addimage \
#     -r "http://localhost:8108" \
#     -u "0x000000..." \
#     -x "00000000..." \
#     --path "image.wasm" \
#     --name "Image name" \
#     -d "Image description" \
#     -c 22 \
#     --creator_paid_proof false \
#     --creator_only_add_prove_task false \
#     --auto_submit_network_ids 97 42 100 \
#     --import_data_image "9E3FD7F8B867F9CAE3494FA76F70E627"

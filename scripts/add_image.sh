node dist/index.js addimage \
    -r "service-endpoint" \
    -u "user_address" \
    -x "private_key" \
    --path "image.wasm" \
    --description "Image description"

# Optional: add this param to specify the name of the image    
# --name "Image name"
    
# Optional: add this param to import merkle data from image by specifying md5
# --import_data_image "9E3FD7F8B867F9CAE3494FA76F70E627"

# Optional: add this param to restrict add prove task to only the creator of the image
# --creator_only_add_prove_task true

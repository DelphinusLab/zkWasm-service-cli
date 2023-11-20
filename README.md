# zkwasm-service-helper CLI Application

The `zkwasm-service-cli` is a command-line interface application that provides functionalities to interact with the `zkwasm` cloud service. This application can be executed using the `npx` command.

## Usage

The application can be executed using the following command:

`npx dist/index.js <command> <options>`

## Options

The following options are available for the `zkwasm-service-cli` command:

- `-r, --resturl <url>`: The rest url of zkwasm cloud service. This option is **required**.

## Commands

- [addimage](#command-addimage)
- [addprovingtask](#command-addprovingtask)
- [adddeploytask](#command-adddeploytask)
- [addpayment](#command-addpayment)

## Command: addimage

Add a new wasm image.

### Usage

`node dist/index.js addimage -r <resturl> -p <path> -u <address> -x <priv> -n <name> [-d <description>] [-c <circuit_size>]`

### Options

The following options are available for the `addimage` command:

- `-r, --resturl <url>`: The rest url of zkwasm cloud service. This option is **required**.
- `-p, --path <path>`: The path to the wasm image. This option is **required**.
- `-u, --address <address>`: The user address which adding the image. This option is **required**.
- `-x, --priv <priv>`: The private key of user address. This option is **required** for signing the message.
- `-n, --name <name>`: The name of the image. This option is **required**.
- `-d, --description <description>`: The description of the image. If not specified, the name will be used.
- `-c, --circuit_size <circuit_size>`: The circuit size of the image. If not specified, the default size is 18.

## Command: addprovingtask

Add proving task.

### Usage

`node dist/index.js addprovingtask -r <resturl> -i <image> -u <address> -x <priv> [--public_input <public_input>] [--private_input <private_input>]`

### Options

The following options are available for the `addprovingtask` command:

- `-r, --resturl <url>`: The rest url of zkwasm cloud service. This option is **required**.
- `-i, --image <image>`: The md5 hash of the image to be used for the proving task. This option is **required**.
- `-u, --address <address>`: The user address which adds the proving task. This option is **required**.
- `-x, --priv <priv>`: The private key of user address. This option is **required** for signing the message.
- `--public_input <public_input>`: The public input of the proof, inputs must have the format (0x)[0-f]\*:(i64|bytes|bytes-packed) and be separated by spaces (e.g.: 0x12:i64 44:i64 32:i64).
- `--private_input <private_input>`: The private input of the proof. Currently not supported.

## Command: adddeploytask

Adds a deploy task to the zkwasm cloud service.

### Usage

`node dist/index.js adddeploytask [options]`

### Options

- `-r, --resturl <string>` - The rest url of zkwasm cloud service. (required)
- `-i, --image <string>` - Image md5. (required)
- `-u, --address <string>` - User address which is deploying the contract. (required)
- `-x, --priv <string>` - The priv of the user address for signing message. (required)
- `-c, --chain_id <number>` - Chain ID of the network to deploy. (required)

### Examples

- Adds a deploy task:

  ```
  node dist/index.js adddeploytask -r "http://127.0.0.1:8080" -i "4CB1FBCCEC0C107C41405FC1FB380799" -u "0x278847f04E166451182dd30E33e09667bA31e6a8" -x "xxxxxxx" -c 5
  ```

## Command: addpayment

Add payment.

### Usage

`node dist/index.js addpayment -r <resturl> [-t <tx>] [-p <provider>] [-x <priv>] [-a <amount>]`

### Options

The following options are available for the `addpayment` command:

- `-r, --resturl <url>`: The rest url of zkwasm cloud service. This option is **required**.
- `-t, --tx <tx>`: The transaction hash. If provided, this option will be used to add the payment.
- `-p, --provider <provider>`: The provider to connect to a network. Required to send transaction.
- `-x, --priv <priv>`: The private key of user address. Required to send transaction.
- `-a, --amount <amount>`: The amount of payment. Required to send transaction.

### Examples

Existing Tx hash - `npx dist/index.js addpayment -r "http://127.0.0.1:8080" -t "<transactionhash>"`

Create a new transaction - `npx dist/index.js addpayment -r "http://127.0.0.1:8080" -p "https://goerli.infura.io/v3/xxxxxxx" -u "YOUR_ADDRESS" -x "YOUR_PRIVATE_KEY" -a "0.00001"`

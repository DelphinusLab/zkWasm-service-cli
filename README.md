# zkwasm-service-helper CLI Application

The `zkwasm-service-cli` is a command-line interface application that provides functionalities to interact with the `zkwasm` cloud service. This application can be executed using the `node` command.

## Usage

`npm install`

Then the application can be executed using the following command:

`node dist/index.js <command> <options>`

## Options

The following options are available for the `zkwasm-service-cli` command:

- `-r, --resturl <url>`: The rest url of zkwasm cloud service. This option is **required**.

## Commands

- [addimage](#command-addimage)
- [addprovingtask](#command-addprovingtask)
- [adddeploytask](#command-adddeploytask)
- [addpayment](#command-addpayment)
- [pressuretest](#command-pressuretest)
- [setmaintenancemode](#command-setmaintenancemode)

## Command: addimage

Add a new wasm image.

### Usage

`node dist/index.js addimage -r <resturl> -p <path> -u <address> -x <priv> [-n <name>] [-d <description>] [-c <circuit_size>] [--creator_paid_proof <true|false>] --auto_submit_network_ids x y z`

### Options

The following options are available for the `addimage` command:

- `-r, --resturl <url>`: The rest url of zkwasm cloud service. This option is **required**.
- `-p, --path <path>`: The path to the wasm image. This option is **required**.
- `-u, --address <address>`: The user address which adding the image. This option is **required**.
- `-x, --priv <priv>`: The private key of user address. This option is **required** for signing the message.
- `-n, --name <name>`: The name of the image (legacy and not using).
- `-d, --description <description>`: The description of the image. If not specified, the name will be used.
- `-c, --circuit_size <circuit_size>`: The circuit size of the image. If not specified, the default size is 18.
- `--creator_paid_proof <true|false>`: Whether the proving fee is charged to the image creator or not. If not specified, the default is false.
- `--auto_submit_network_ids <network_id1 network_id2 ...>`: List of network IDs to automatically submit the image to. If not specified, the image will not be automatically submitted to any networks.

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
- `--submit-mode <submit_mode>`: The submit mode of the proving task. Specify "Auto" or "Manual". If not specified, the default is "Manual".

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

Existing Tx hash - `node dist/index.js addpayment -r "http://127.0.0.1:8080" -t "<transactionhash>"`

Create a new transaction - `node dist/index.js addpayment -r "http://127.0.0.1:8080" -p "https://goerli.infura.io/v3/xxxxxxx" -u "YOUR_ADDRESS" -x "YOUR_PRIVATE_KEY" -a "0.00001"`

## Command: pressuretest

Run pressure test of zkwasm playground: send prove request and query requests in parallel over their respective intervals.

### Usage

`node dist/index.js pressuretest -r <resturl> -u <address> -x <priv> [--public_input <public_input>] [--private_input <private_input>] --num_prove_tasks <number> --interval_prove_tasks_ms <number> --num_query_tasks <number> --interval_query_tasks_ms <number> --total_time_sec <number>`

### Options

The following options are available for the `pressuretest` command:

- `-r, --resturl <url>`: The rest url of zkwasm cloud service. This option is **required**.
- `-u, --address <address>`: The user address which adds the proving task. This option is **required**.
- `-x, --priv <priv>`: The private key of user address. This option is **required** for signing the message.
- `--public_input <public_input>`: The public input of the proof, inputs must have the format (0x)[0-f]\*:(i64|bytes|bytes-packed) and be separated by spaces (e.g.: 0x12:i64 44:i64 32:i64).
- `--private_input <private_input>`: The private input of the proof. Currently not supported.
- `--num_prove_tasks <number>`: Number of prove tasks to run during a single interval in the pressure test.
- `--interval_prove_tasks_ms <number>`: Interval (msec) in which to run prove tasks during pressure test.
- `--num_query_tasks <number>`: Number of query tasks to run during a single interval in the pressure test.
- `--interval_query_tasks_ms <number>`: Interval (msec) in which to run query tasks during pressure test, default is 100".
- `--total_time_sec <number>`: Total time of pressure test (sec).
- `--verbose <true|false>`: Whether or not to print every request response to the console.
- `--query_task_only <true|false>`: When generating random queries for pressure test, only generate ones that query 'task' collection.
- `--image_md5s <image0_md5,image1_md5,...>: List of image md5s (one or more, comma seperated) to use for prove tasks. Overrides original behaviour of randomly selectly available images.

## Command: prover-profile

This command will fetch the node statistics from the server and save it to a local `node_statistics_{timestamp}.json` file. If the `--compare-with` option is specified, the command will compare the current node statistics with the specified file and output the differences to the specified `--report-out` file.

We do not require any user information as this is purely querying the server for statistics and optionally comparing them.

If you want to add tasks to force value updates, you can use `addProvingTask` or `pressuretest` commands.

### Usage

`node dist/index.js prover-profile -r <resturl> --compare-with <file> --report-out <file>`

### Options

The following options are available for the `prover-profile` command:

- `-r, --resturl <url>`: The rest url of zkwasm cloud service. This option is **required**.
- `--compare-with <file>`: The file to compare the current node statistics with. This option is required if `--report-out` is specified.
- `--report-out <file>`: The file to output the node statistics to. This can be a .json or .csv file. This option is required if `--compare-with` is specified.

## Command: setmaintenancemode

Set maintenance mode to active or inactive. Maintenance mode denies certain requests which allows the server to be safely shutdown.

### Usage

`node dist/index.js setmaintenancemode -r <resturl> -x <priv> --active <true|false>`

### Options

The following options are available for the `pressuretest` command:

- `-r, --resturl <url>`: The rest url of zkwasm cloud service. This option is **required**.
- `-x, --priv <priv>`: The private key of the address of the administrator sending maintenance mode request.
- `--active <true|false>`: True or False, determines if maintenance mode should be activated or deactivated.

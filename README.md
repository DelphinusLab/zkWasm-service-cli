# zkwasm-service-helper CLI Application

The `zkwasm-service-cli` is a command-line interface application that provides functionalities to interact with the `zkwasm` cloud service. This application can be executed using the `node` command.

## Table of Contents

- [Usage](#usage)
- [Commands](#commands)
  - [addimage](#addimage)
    - [Usage](#usage-1)
    - [Example](#example)
    - [Options](#options)
  - [resetimage](#resetimage)
    - [Usage](#usage-2)
    - [Example](#example-1)
    - [Options](#options-1)
  - [addprovingtask](#addprovingtask)
    - [Usage](#usage-3)
    - [Example](#example-2)
    - [Options](#options-2)
  - [addpayment](#addpayment)
    - [Usage](#usage-4)
    - [Example](#example-3)
    - [Options](#options-3)
  - [prover-profile](#prover-profile)
    - [Usage](#usage-5)
    - [Example](#example-4)
    - [Options](#options-4)
  - [querytask](#querytask)
    - [Usage](#usage-6)
    - [Example](#example-5)
    - [Options](#options-5)
  - [queryimage](#queryimage)
    - [Usage](#usage-7)
    - [Example](#example-6)
    - [Options](#options-6)
  - [queryuser](#queryuser)
    - [Usage](#usage-8)
    - [Example](#example-7)
    - [Options](#options-7)
  - [gettaskexternalhosttable](#gettaskexternalhosttable)
    - [Usage](#usage-9)
    - [Example](#example-8)
    - [Options](#options-8)
  - [forceunprovabletoreprocess](#forceunprovabletoreprocess)
    - [Usage](#usage-10)
    - [Example](#example-9)
    - [Options](#options-9)
  - [forcedryrunfailstoreprocess](#forcedryrunfailstoreprocess)
    - [Usage](#usage-11)
    - [Example](#example-10)
    - [Options](#options-10)
- [Testing](#testing)
  - [Config for CLI Tests](#config-for-cli-tests)
  - [Quick Start](#quick-start)
  - [Details on scripts for CLI Tests](#details-on-scripts-for-cli-tests)
    - [Add image](#add-image)
    - [Add proof](#add-proof)
    - [Queries](#queries)
    - [Test all](#test-all)
    - [Multi-Prove Sample Wasm Tests](#multi-prove-sample-wasm-tests)
    - [Custom Multi-Prove Tests](#custom-multi-prove-tests)
    - [Extreme pressure test](#extreme-pressure-test)
      - [Start script](#start-script)
      - [Stop script](#stop-script)
  - [Debugging output](#debugging-output)

## Usage

Install dependencies:

```bash
npm install
```

Then the application can be executed using the following command:

```bash
node dist/index.js <command> <options>
```

To view the available options, execute the following:

```bash
node dist/index.js --help
```

To view the available options for each command, execute the following:

```bash
node dist/index.js <command> --help
```

All example usages of the cli are available in the [scripts folder](scripts).

## Commands

### addimage

Add a new wasm image.

#### Usage

```
node dist/index.js addimage \
    -r <resturl> \
    -u <address> \
    -x <priv> \
    -p <path> \
    [-d <description>] \
    [-c <circuit_size>] \
    [--creator_paid_proof <true|false>] \
    [--creator_only_add_prove_task <true|false>] \
    [--auto_submit_network_ids x y z] \
    [--import_data_image <image_md5>]
```

#### Example

- [Add image command with all parameters specified](scripts/add_image.sh)

#### Options

Use the following to display options:

```
node dist/index.js addimage --help
```

The following options are available for the `addimage` command:

```
  -r, --resturl                      The rest url of zkwasm cloud serivce.
                                                             [string] [required]
  -u, --address                      User address which is adding the image
                                                             [string] [required]
  -x, --priv                         The private key of user address.
                                                             [string] [required]
  -p, --path                         Wasm image path         [string] [required]
  -n, --name                         The name of the image (legacy and not used)
                                             [deprecated] [string] [default: ""]
  -c, --circuit_size                 The circuit size of the image. If not
                                     specified, the default size is 22
                                                          [number] [default: 22]
  -d, --description                  The description of the image. If not
                                     specified, the name will be used   [string]
      --creator_paid_proof           Specify if proofs for this image will be
                                     charged to the creator of the image
                                                      [boolean] [default: false]
      --creator_only_add_prove_task  Specify if proofs for this image are
                                     restricted to only be added by the creator
                                     of the image     [boolean] [default: false]
      --auto_submit_network_ids      List of network ids to automatically submit
                                     proofs to. If not specified, proofs will
                                     not be automatically submitted.
                                                           [array] [default: []]
      --import_data_image            The MD5 in which to inherit merkle data
                                     from                               [string]
```

### resetimage

Add reset image task with the given parameters.

#### Usage

```
node dist/index.js resetimage \
    -r <resturl> \
    -u <address> \
    -x <priv> \
    -i <image_md5> \
    [-c <circuit_size>] \
    [--creator_paid_proof <true|false>] \
    [--creator_only_add_prove_task <true|false>] \
    [--auto_submit_network_ids x y z]
```

#### Example

- [Reset image command with all parameters specified](scripts/reset_image.sh)

#### Options

Use the following to display options:

```
node dist/index.js resetimage --help
```

The following options are available for the `resetimage` command:

```
  -r, --resturl                      The rest url of zkwasm cloud serivce.
                                                             [string] [required]
  -u, --address                      User address which is adding the image
                                                             [string] [required]
  -x, --priv                         The private key of user address.
                                                             [string] [required]
  -i, --image                        The MD5 of the wasm image
                                                             [string] [required]
  -c, --circuit_size                 The circuit size of the image. If not
                                     specified, the default size is 22
                                                          [number] [default: 22]
      --creator_paid_proof           Specify if proofs for this image will be
                                     charged to the creator of the image
                                                      [boolean] [default: false]
      --creator_only_add_prove_task  Specify if proofs for this image are
                                     restricted to only be added by the creator
                                     of the image     [boolean] [default: false]
      --auto_submit_network_ids      List of network ids to automatically submit
                                     proofs to. If not specified, proofs will
                                     not be automatically submitted.
                                                           [array] [default: []]
```

### addprovingtask

Add proving task.

#### Usage

```
node dist/index.js addprovingtask \
    -r <resturl> \
    -u <address> \
    -x <priv> \
    -i <image> \
    [--public_input <public_input>] \
    [--private_input <private_input>] \
    [--submit_mode <Manual|Auto>]
```

#### Example

- [Add proving task command with manual submit mode](scripts/add_manual_proof_task.sh)
- [Add proving task command with auto submit mode](scripts/add_auto_proof_task.sh)

#### Options

Use the following to display options:

```
node dist/index.js addprovingtask --help
```

The following options are available for the `addprovingtask` command:

```
  -r, --resturl        The rest url of zkwasm cloud serivce. [string] [required]
  -u, --address        User address which is adding the image[string] [required]
  -x, --priv           The private key of user address.      [string] [required]
  -i, --image          The MD5 of the wasm image             [string] [required]
      --public_input   public input of the proof, inputs must have format
                       (0x)[0-f]*:(i64|bytes|bytes-packed) and been separated by
                       spaces (eg: 0x12:i64 44:i64 32:i64).             [string]
      --private_input  The private input of the proof. Currently not supported.
                                                                        [string]
      --submit_mode    The submit mode of the proving task. Specify 'Auto' or
                       'Manual'. If not specified, the default is 'Manual'
                                                    [string] [default: "Manual"]
```

### addpayment

Add payment either by creating an new transaction or using a exiting one.

#### Usage

```
node dist/index.js addpayment \
     -r <resturl> \
     [-t <tx>] \
     [-p <provider>] \
     [-x <priv>] \
     [-a <amount>]
```

#### Example

- [Add payment with new transaction](scripts/add_payment.sh)
- [Add payment using existing transaction hash](scripts/add_payment_with_tx.sh)

#### Options

Use the following to display options:

```
node dist/index.js addpayment --help
```

The following options are available for the `addpayment` command:

```
  -r, --resturl   The rest url of zkwasm cloud serivce.      [string] [required]
  -x, --priv      The private key of user address, required only when creating a
                  new transaction                                       [string]
  -p, --provider  The provider to connect to a network, required only when
                  creating a new transaction                            [string]
  -a, --amount    The amount of payment, required only when creating a new
                  transaction                                           [string]
  -t, --tx        The transaction hash. If provided, will use existing
                  transaction hash to add the payment, no other options are
                  required                                              [string]
```

### prover-profile

This command will fetch the node statistics from the server and save it to a local `node_statistics_{timestamp}.json` file. If the `--compare-with` option is specified, the command will compare the current node statistics with the specified file and output the differences to the specified `--report-out` file.

We do not require any user information as this is purely querying the server for statistics and optionally comparing them.

If you want to add tasks to force value updates, you can use `addProvingTask` or `pressuretest` commands.

#### Usage

```
node dist/index.js prover-profile \
     -r <resturl> \
     --compare-with <file> \
     --report-out <file>
```

#### Example

- [Generate prover profile report](scripts/generate_prover_profile_report.sh)
- [Generate current node statistics file](scripts/generate_current_node_stats.sh)

```
node dist/index.js prover-profile \
    -r "http://localhost:8108" \
    --compare-with "compare.json" \
    --report-out "report.json"
```

#### Options

Use the following to display options:

```
node dist/index.js prover-profile --help
```

The following options are available for the `prover-profile` command:

```
  -r, --resturl       The rest url of zkwasm cloud serivce.  [string] [required]
      --compare-with  The file to compare the current node statistics with, this
                      option is required if `--report-out` is specified [string]
      --report-out    The file to output the node statistics to, this can be a
                      .json or .csv file, this option is required if
                      `--compare-with` is specified                     [string]
```

### querytask

Query Task with given parameters.

#### Usage

```
node dist/index.js querytask \
     -r <resturl> \
     [--task_id <task_id>] \
     [--user_address <user_address>] \
     [--md5 <md5>] \
     [--tasktype <Setup|Prove|Verify|Batch|Deploy|Reset>] \
     [--taskstatus <Pending|DryRunSuccess|Processing|DryRunFailed|Done|Fail|Unprovable|Stale>] \
     [--start <start_n>] \
     [--total <total_n>] \
     [--concise <true|false>] \
     [--verbose <true|false>]
```

#### Example

- [Query with all parameters specified](scripts/query_task.sh)
- [Find most recent 10 finished proof associate with D2144252F3C9DDCA5CA86C23D2EE97E9 image](scripts/query_prove_done_task.sh)

#### Options

Use the following to display options:

```
node dist/index.js querytask --help
```

The following options are available for the `querytask` command:

```
  -r, --resturl       The rest url of zkwasm cloud serivce.  [string] [required]
      --task_id       Id of the task to query                           [string]
      --user_address  User address of the task to query                 [string]
      --md5           Image MD5 of the task to query                    [string]
      --tasktype      Type of the task to query, options:
                      Setup|Prove|Verify|Batch|Deploy|Reset             [string]
      --taskstatus    Status of the task to query, options: Pending|DryRunSucces
                      s|Processing|DryRunFailed|Done|Fail|Unprovable|Stale
                                                                        [string]
      --start         Number of tasks to skip before counting total number of
                      tasks to output, default is 0        [number] [default: 0]
      --total         Total number of tasks to output, max is 100 and default is
                      1                                    [number] [default: 1]
      --concise       Print concise output or regular, default is false
                                                      [boolean] [default: false]
      --verbose       Enable task to be printed to stdout, default is true
                                                       [boolean] [default: true]
```

### queryimage

Query Image with given parameters.

#### Usage

```
node dist/index.js queryimage \
     -r <resturl> \
     --md5 <Image MD5>
```

#### Example

- [Query image with MD5](scripts/query_image.sh)

#### Options

Use the following to display options:

```
node dist/index.js queryimage --help
```

The following options are available for the `queryimage` command:

```
  -r, --resturl  The rest url of zkwasm cloud serivce.       [string] [required]
      --md5      MD5 of the image to query                   [string] [required]
```

### queryuser

Query user with given parameters.

#### Usage

```
node dist/index.js querytask \
     -r <resturl> \
     --user_address <user_address>
```

#### Example

- [Query user with address](scripts/query_user.sh)

#### Options

Use the following to display options:

```
node dist/index.js queryuser --help
```

The following options are available for the `queryuser` command:

```
  -r, --resturl       The rest url of zkwasm cloud serivce.  [string] [required]
      --user_address  Address of the user to query           [string] [required]
```

### gettaskexternalhosttable

Get task's external host table file.

#### Usage

```
node dist/index.js gettaskexternalhosttable \
     -r <resturl> \
     --task_id <task_id>
```

#### Example

- [Get task external host table file](scripts/get_task_external_host_table.sh)

#### Options

Use the following to display options:

```
node dist/index.js gettaskexternalhosttable --help
```

The following options are available for the `gettaskexternalhosttable` command:

```
  -r, --resturl  The rest url of zkwasm cloud serivce.       [string] [required]
      --task_id  Id of the task to query                                [string]
```

### forceunprovabletoreprocess

Force an `Unprovable` task into a `Fail` state to allow it's proof to be retried.

#### Usage

```
node dist/index.js forceunprovabletoreprocess \
     -r <resturl> \
     -x <priv> \
     --task_ids <task_id_0> <task_id_1> <task_id_1>
```

#### Example

- [Force unprovable to reprocess file](scripts/force_unprovable_to_reprocess.sh)

#### Options

Use the following to display options:

```
node dist/index.js forceunprovabletoreprocess --help
```

The following options are available for the `forceunprovabletoreprocess` command:

```
  -r, --resturl  The rest url of zkwasm cloud serivce.       [string] [required]
  -x, --priv      The private key of user address.           [string] [required]
      --task_ids  Id of the task to reprocess                [string] [required]
```

### forcedryrunfailstoreprocess

Force an `DryRunFailed` task into a `Pending` state to allow it's dry run to be retried.

#### Usage

```
node dist/index.js forcedryrunfailstoreprocess \
     -r <resturl> \
     -x <priv> \
     --task_ids <task_id_0> <task_id_1> <task_id_1>
```

#### Example

- [Force dry run fails to reprocess file](scripts/force_dryrun_fails_to_reprocess.sh)

#### Options

Use the following to display options:

```
node dist/index.js forcedryrunfailstoreprocess --help
```

The following options are available for the `forcedryrunfailstoreprocess` command:

```
  -r, --resturl   The rest url of zkwasm cloud serivce.      [string] [required]
  -x, --priv      The private key of user address.           [string] [required]
      --task_ids  Id of the tasks to reprocess  [array] [required] [default: []]
```

## Testing

### Config for CLI Tests

User specific config values must be provided in the [.env](tests/.env) file:

- Change the values of `SERVER_URL`, `USER_ADDRESS`, and `PRIVATE_KEY` to your own.
- Update the `CHAIN_IDS` to only include network chain ids which have been deployed on the server.

### Quick Start

1. Run CLI tests for setup/reset image, prove auto/manual task, and query functionality:
   ```
   bash tests/run_cli_tests.sh
   ```
2. Run multiple sample proofs (simple checks and merkle functionality tested):
   ```
   bash tests/run_simple_proof_samples.sh
   ```
3. Run multiple production sample proofs (production merkle functionality tested):
   ```
   bash tests/run_production_proof_samples.sh
   ```

### Details on scripts for CLI Tests

#### Add image

[Add image script](tests/scripts/add_image.sh) creates a new image or resets an existing one given a wasm image.

Usage:

```bash
# <install_and_build_cli> : true or false; setup the zkWasm service cli submodule; download, installs and builds.
# <wasm_path> : path to wasm file under test.
# <wasm_md5> : MD5 of wasm image.
# <import_data_image> : MD5 of image of which merkle data will be imported from.
# <poll> : true or false; enable waiting for task to successfully finish.

bash tests/scripts/add_image.sh <install_and_build_cli> <wasm_path> <wasm_md5> <import_data_image> <poll>
```

Example with defaults:

```bash
bash tests/scripts/add_image.sh true "wasms/equality.wasm" F7D4555F3368026CDA92FB611EB9AEA2 None true
```

#### Add proof

[Add proof script](tests/scripts/add_proof.sh) creates a proof task for image.

Usage:

```bash
# <install_and_build_cli> : true or false; setup the zkWasm service cli submodule; download, installs and builds.
# <mode> : "Auto" or "Manual"; whether to use proof batching or not.
# <wasm_md5> : MD5 of wasm image.
# <pub> : Public inputs for the proof.
# <pri> : Private inputs for the proof.
# <context_file> : Binary file containing context input for proof.
# <poll> : true or false; enable waiting for task to successfully finish.

bash tests/scripts/add_proof.sh <install_and_build_cli> <mode> <wasm_md5> <pub> <pri> <context_file> <poll>
```

Example with defaults:

```bash
bash tests/scripts/add_proof.sh true Manual F7D4555F3368026CDA92FB611EB9AEA2 "" "0:i64 0:i64" None true
```

- [default manual script example](tests/scripts/add_manual_proving_task.sh)
- [default auto script example](tests/scripts/add_auto_proving_task.sh)

#### Queries

[Query script](tests/scripts/query.sh) runs get requests for task, image and user.

Usage:

```bash
# <install_and_build_cli> : true or false; setup the zkWasm service cli submodule; download, installs and builds.
# <wasm_md5> : MD5 of wasm image.

bash tests/scripts/query.sh <install_and_build_cli> <wasm_md5>
```

Example with defaults:

```bash
bash tests/scripts/query.sh true F7D4555F3368026CDA92FB611EB9AEA2
```

#### Test all

[Test all script](tests/run_cli_tests.sh) runs each cli test sequentially with default arguments to the scripts.

Usage:

```bash
# <install_and_build_cli> : true or false; setup the zkWasm service cli by installing and building.

bash tests/run_cli_tests.sh <install_and_build_cli>
```

Example with defaults:

```bash
bash tests/run_cli_tests.sh true
```

#### Multi-Prove Sample Wasm Tests

[Simple multi-prove sample test script](tests/run_simple_proof_samples.sh) Creates/reset a series of different images and runs various proofs.
The file [simple.json](tests/inputs/simple.json) contains the inputs for "simple" proofs (this includes the merkle benchmark image and zkWasm-rust image) and [production.json](tests/inputs/production.json) contains the inputs for proofs that use production merkle data.

Please note production merkle data is required for `production.json` it can be installed by untarring the tar file located
the server 138.217.142.94 here: `/home/yymone/yyu/ExplorerServerBackup/RocksDB/e2e/rocksdb-production-samples-for-e2e.tar.gz`.
It must be installed in your `rocksdb` folder and the ownership of the untarred folder should be changed the be owned by you.
E.g.

```
sudo tar xzf /home/yymone/yyu/ExplorerServerBackup/RocksDB/e2e/rocksdb-production-samples-for-e2e.tar.gz
sudo chown -R username:username ./rocksdb
```

Usage:

```bash
# <install_and_build_cli> : true or false; setup the zkWasm service cli submodule; download, installs and builds.
# <inputs_json> : Json file containing md5 and proof inputs.
# <add_image> : true or false; adds create/reset image task before proof is run.
# <poll_add_image> : true or false; enable waiting for image task to successfully finish.
# <poll_add_prove> : true or false; enable waiting for proof task to successfully finish.

bash tests/run_simple_proof_samples.sh <install_and_build_cli> <inputs_json> <add_image> <poll_add_image> <poll_add_prove>
```

Example with defaults:

```bash
bash tests/run_simple_proof_samples.sh true "tests/inputs/simple.json" true true true
```

- [Simple multi-prove sample test script](tests/run_simple_proof_samples.sh) runs a number of proofs for different images.
- [Production multi-prove sample test script](tests/run_production_proof_samples.sh) runs a number of proofs for different images with merkle data.

#### Custom Multi-Prove Tests

[`run_production_proof_samples.sh`](tests/run_production_proof_samples.sh) is designed to showcase how to leverage the cli e2e framework
for your own testing purposes. You can modify the json file to include your own test cases.
In [production.json](tests/inputs/production.json), the first example shows a simple prove and the second shows how to specify
`import_data_image` and `context_file`. Inputs must be stored under `tests/inputs/` and wasm files must be stored under `wasms/`.

#### Extreme pressure test

The "extreme" pressure test runs 100 tmux sessions each with a individual pressure test. It tests how the server handles the load of many simultaneous requests.
Each session gets its own socket connection to the server and this simulates what 100 clients sending requests all at once would be like.
Each session sends 20 requests per second to test burst handling, and then the request number averages to about 4 requests per second for each session.

##### Start script

[Start script](tests/scripts/pressure_test/start.sh) Creates 100 sessions each with a pressure test.

Usage:

```bash
# <install_and_build_cli> : true or false; setup the zkWasm service cli submodule; download, installs and builds.

bash tests/scripts/pressure_test/start.sh <install_and_build_cli>
```

Example with defaults:

```bash
bash tests/scripts/pressure_test/start.sh true
```

##### Stop script

[Stop script](tests/scripts/pressure_test/stop.sh) Kills all the running sessions of the test.

Usage:

```bash
bash tests/scripts/pressure_test/stop.sh
```

Example with defaults:

```bash
bash tests/scripts/pressure_test/stop.sh
```

### Debugging output

To enable debugging output, which can be useful for showing the commands being executed, use the `-x` bash arg. Note that this must be passed into the script itself, not the `run_cli_tests.sh` script.

Example:

```bash
bash -x tests/scripts/add_image.sh
```

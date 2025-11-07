import { Arguments, Argv } from "yargs";
import {
  NodeStatistics,
  NodeStatisticsQueryParams,
  ZkWasmServiceHelper,
  ProverNodeTimeRangeStatsParams,
  ProverNodeTimeRangeStats,
} from "zkwasm-service-helper";
import fs from "fs/promises";
import path from "path";

export const command = "query_nodes_tasks_time_range_stat";
export const desc = "Query nodes tasks statistics in a time range";

export const builder = (yargs: Argv) => {
  return yargs
    .option("addr"  , {
      describe: "The address of the node to query, only for a single node address",
      type: "string",
    })
    .option("addr-file", {
      describe:
        "The file contain the addresses of the nodes to query, one address per line",
      type: "string",
    })
    .option("all-nodes", {
      describe: "Query all nodes tasks statistics on the server",
      type: "boolean",
      default: false,
    })
    .option("time-start", {
      describe:
        "The start time of the time range to query, in ISO 8601 format, e.g., 2023-01-01T00:00:00Z",
      type: "string",
    })
    .option("time-end", {
      describe:
        "The end time of the time range to query, in ISO 8601 format, e.g., 2023-01-02T00:00:00Z",
      type: "string",
    })
    .option("output-file", {
      describe: "Output file path to save the results (optional)",
      type: "string",
    });
};

export const handler = async (argv: Arguments) => {
  const restURL = argv.r as string;

  // If both time-start and time-end are provided, use them to filter the tasks
  let timeStart: Date | undefined = undefined;
  let timeEnd: Date | undefined = undefined;

  if (argv["time-start"]) {
    timeStart = new Date(argv["time-start"] as string);
    if (isNaN(timeStart.getTime())) {
      console.error("Invalid time-start format. Please use ISO 8601 format.");
      return;
    }
  }

  if (argv["time-end"]) {
    timeEnd = new Date(argv["time-end"] as string);
    if (isNaN(timeEnd.getTime())) {
      console.error("Invalid time-end format. Please use ISO 8601 format.");
      return;
    }
  }

  // if all-nodes is not set, either addr or addr-file must be provided
  // if all-nodes is set, addr and addr-file are ignored
  if (!argv["all-nodes"]) {
    // If all-nodes is not set, either addr or addr-file must be provided
    if (!argv.addr && !argv["addr-file"]) {
      console.error("Error: Either --addr or --addr-file must be provided when --all-nodes is not set.");
      return;
    }
    
    // Only one of addr or addr-file should be provided
    if (argv.addr && argv["addr-file"]) {
      console.error("Error: Cannot use both --addr and --addr-file options together.");
      return;
    }
  } else {
    // If all-nodes is set, warn if addr or addr-file are also provided
    if (argv.addr || argv["addr-file"]) {
      console.warn("Warning: --addr and --addr-file options are ignored when --all-nodes is set.");
    }
  }

  // Determine which addresses to query
  let addressesToQuery: string[] = [];
  
  if (argv["all-nodes"]) {
    // Will query all nodes - addresses will be extracted from currentStats later
  } else if (argv.addr) {
    addressesToQuery = [argv.addr as string];
  } else if (argv["addr-file"]) {
    try {
      const addrFilePath = path.resolve(argv["addr-file"] as string);
      const fileContent = await fs.readFile(addrFilePath, "utf-8");
      addressesToQuery = fileContent
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      if (addressesToQuery.length === 0) {
        console.error("Error: Address file is empty or contains no valid addresses.");
        return;
      }
    } catch (err) {
      console.error("Error reading address file:", err);
      return;
    }
  }

  // if it is not all-nodes mode, just query the node statistics directly in loop for each address in addressesToQuery
  let helper = new ZkWasmServiceHelper(restURL, "", "");
  let allStatsWithAddresses: Array<{ address: string; stat: ProverNodeTimeRangeStats }> = [];
  
  try {
    if (argv["all-nodes"]) {
      // Query all nodes - get all node addresses first
      const allNodeAddresses = await getAllNodeAddresses(helper);
      console.log(`Found ${allNodeAddresses.length} nodes on the server.`);
      
      if (allNodeAddresses.length === 0) {
        console.log("No nodes found on the server.");
        return;
      }
      
      // Query with batching for all node addresses
      allStatsWithAddresses = await queryProverNodeTimeRangeStatsWithBatching(
        helper,
        allNodeAddresses,
        timeStart,
        timeEnd
      );
    } else {
      // Query with batching for addresses
      allStatsWithAddresses = await queryProverNodeTimeRangeStatsWithBatching(
        helper,
        addressesToQuery,
        timeStart,
        timeEnd
      );
    }
    
    // Output the results - only show stats attribute
    console.log("Prover Node Time Range Statistics:");
    console.log("=================================");
    
    if (allStatsWithAddresses.length === 0) {
      console.log("No statistics found for the specified criteria.");
    } else {
      const outputLines: string[] = [];
      
      allStatsWithAddresses.forEach(({ address, stat: nodeStat }) => {
        const line = `Addr: ${address}, successful: ${nodeStat.stats.successful}, failed: ${nodeStat.stats.failed}, timed_out: ${nodeStat.stats.timed_out}`;
        console.log(line);
        outputLines.push(line);
      });
      
      // Optionally save to file
      const outputFile = argv["output-file"] as string;
      if (outputFile) {
        const outputPath = path.resolve(outputFile);
        await fs.writeFile(outputPath, outputLines.join("\n"));
        console.log(`\nResults saved to: ${outputPath}`);
      }
    }

  } catch (err) {
    console.error("Error querying prover node time range statistics:", err);
    return;
  }
  
  // Since we've completed the time range query, we can exit here
  console.log("\nProver node time range statistics query completed.");
  return;
};

async function getAllNodeAddresses(helper: ZkWasmServiceHelper): Promise<string[]> {
  try {
    let args: NodeStatisticsQueryParams = {
      total: 10000,
    };
    const result = await helper.queryNodeStatistics(args);
    const nodeStatistics: NodeStatistics[] = result.data;
    
    // Extract only the address field from each node
    const addresses = nodeStatistics.map((node) => node.address);
    return addresses;
  } catch (err) {
    console.error("Error fetching node addresses:", err);
    throw err;
  }
}

async function queryProverNodeTimeRangeStats(
  helper: ZkWasmServiceHelper,
  query: ProverNodeTimeRangeStatsParams
) {
  const response: ProverNodeTimeRangeStats[] =
    await helper.queryProverNodeTimeRangeStats(query);
  return response;
}

async function queryProverNodeTimeRangeStatsWithBatching(
  helper: ZkWasmServiceHelper,
  addresses: string[],
  timeStart: Date | undefined,
  timeEnd: Date | undefined
): Promise<Array<{ address: string; stat: ProverNodeTimeRangeStats }>> {
  const BATCH_SIZE = 100;
  const allStatsWithAddresses: Array<{ address: string; stat: ProverNodeTimeRangeStats }> = [];
  
  // Split addresses into batches of max 100
  for (let i = 0; i < addresses.length; i += BATCH_SIZE) {
    const batchAddresses = addresses.slice(i, i + BATCH_SIZE);
    console.log(`Querying batch ${Math.floor(i / BATCH_SIZE) + 1} with ${batchAddresses.length} addresses...`);
    
    // Create ranges for this batch
    const ranges = batchAddresses.map((address) => ({
      address,
      start: timeStart || new Date(0),
      end: timeEnd || new Date(),
    }));
    
    const query: ProverNodeTimeRangeStatsParams = {
      ranges,
    };
    
    try {
      const stats = await queryProverNodeTimeRangeStats(helper, query);
      // Map each stat back to its corresponding address
      stats.forEach((stat, index) => {
        allStatsWithAddresses.push({
          address: batchAddresses[index],
          stat,
        });
      });
    } catch (err) {
      console.error(`Error querying batch ${Math.floor(i / BATCH_SIZE) + 1}:`, err);
      throw err;
    }
  }
  
  return allStatsWithAddresses;
}
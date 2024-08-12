import { Arguments, Argv } from "yargs";
import {
  NodeStatistics,
  NodeStatisticsQueryParams,
  ZkWasmServiceHelper,
} from "zkwasm-service-helper";
import fs from "fs/promises";
import path from "path";

export const command = "prover-profile";
export const desc = "Profile Prover nodes statistics and generate report";

export const builder = (yargs: Argv) => {
  return yargs
    .option("compare-with", {
      describe: "Optional path to a JSON file containing other node statistics",
      type: "string",
    })
    .option("report-out", {
      describe:
        "Output file path for the report. This is only required if 'compare-with' is also provided",
      type: "string",
    });
};

export const handler = async (argv: Arguments) => {
  const restURL = argv.r as string;

  const getNodeStatistics = async () => {
    let helper = new ZkWasmServiceHelper(restURL, "", "");
    let args: NodeStatisticsQueryParams = {
      total: 500,
    };
    let stats = helper
      .queryNodeStatistics(args)
      .then((res) => {
        return res;
      })
      .catch((err) => {
        console.log("Error fetching Current node statistics", err);
        throw err;
      });

    return stats;
  };

  // Get initial node statistics
  let currentStats: NodeStatistics[] = [];

  try {
    currentStats = await getNodeStatistics();
  } catch (err) {
    console.log("Error fetching Current node statistics", err);
    return;
  }
  console.log("Current node statistics fetched");
  console.log("Saving current node statistics locally");

  await saveNodeStatistics(currentStats, "node_statistics.json");

  console.log("Current node statistics saved locally");
  // Check the compare-with option to load initial statistics from a file
  const compareWith = argv["compare-with"];
  if (compareWith) {
    console.log("Comparing current with previous found at: ", compareWith);
    const statsPath = path.resolve(compareWith as string);
    const prevStats = await loadNodeStatisticsFile(statsPath);

    const report = compareNodeStats(prevStats, currentStats).filter(
      Boolean
    ) as NodeStats[];

    // Write report to file
    const outputPath = path.resolve(argv["report-out"] as string);

    saveReportFile(report, outputPath);

    console.log(`Prover profile report has been saved to ${outputPath}`);
  } else {
    // If no compare-with option is provided, no report will be generated
    console.log("No comparison statistics provided. Exiting...");
  }
};

// save the statistics locally with a timestamp
async function saveNodeStatistics(stats: NodeStatistics[], outFile: string) {
  // append timestamp to the file name
  // Split by '.' and insert timestamp before the last element
  const parts = outFile.split(".");
  const fileName = parts.slice(0, -1).join(".").concat(`_${Date.now()}`);
  const fileExtension = parts[parts.length - 1];
  const statsPath = path.resolve(`${fileName}.${fileExtension}`);

  await fs.writeFile(statsPath, JSON.stringify(stats, null, 2));
}

async function loadNodeStatisticsFile(
  statsPath: string
): Promise<NodeStatistics[]> {
  try {
    const stats = await fs.readFile(statsPath, "utf-8");
    return JSON.parse(stats);
  } catch (err) {
    console.error("Error loading local statistics", err);
    return [];
  }
}

async function saveReportFile(report: NodeStats[], outFile: string) {
  // Check extension of the output file
  const fileExtension = path.extname(outFile).toLowerCase();

  if (fileExtension === ".json") {
    await fs.writeFile(outFile, JSON.stringify(report, null, 2));
  } else if (fileExtension === ".csv") {
    const headers = Object.keys(report[0]).join(",");
    const rows = report.map((row) => Object.values(row).join(","));
    await fs.writeFile(outFile, [headers, ...rows].join("\n"));
  } else {
    console.error(
      "Unsupported file format. Please use .json or .csv extension."
    );
  }
}

function compareNodeStats(
  initialStats: NodeStatistics[],
  finalStats: NodeStatistics[]
) {
  return finalStats.map((finalNode) => {
    const initialNode = initialStats.find(
      (node) => node.address === finalNode.address
    );
    // we can remove some new nodes that are not in the initial stats
    if (!initialNode) return null;

    const diff: NodeStats = {
      address: finalNode.address,
      successful_tasks:
        finalNode.statistics.successful_tasks -
        initialNode.statistics.successful_tasks,
      failed_tasks:
        finalNode.statistics.failed_tasks - initialNode.statistics.failed_tasks,
      total_tasks:
        finalNode.statistics.total_tasks - initialNode.statistics.total_tasks,
      timed_out_count:
        finalNode.statistics.timed_out_count -
        initialNode.statistics.timed_out_count,
    };

    if (
      finalNode.statistics.setup_timing_stats &&
      initialNode.statistics.setup_timing_stats
    ) {
      diff.setup_time_diff =
        finalNode.statistics.setup_timing_stats.latest_time_taken_secs -
        initialNode.statistics.setup_timing_stats.latest_time_taken_secs;
    }

    if (
      finalNode.statistics.proof_timing_stats &&
      initialNode.statistics.proof_timing_stats
    ) {
      diff.proof_time_diff =
        finalNode.statistics.proof_timing_stats.latest_time_taken_secs -
        initialNode.statistics.proof_timing_stats.latest_time_taken_secs;
    }

    return diff;
  });
}

// Type for saving node statistics locally from CLI
interface NodeStats {
  address: string;
  successful_tasks: number;
  failed_tasks: number;
  total_tasks: number;
  timed_out_count: number;
  setup_time_diff?: number;
  proof_time_diff?: number;
}

import getAllDataSets from "./getDataSets";
import { processData } from "./process/processData";

const runPipeLines = async (tableName: string, packageId: string) => {
  const datasets = await getAllDataSets(tableName, packageId);
  try {
    for (const dataset of datasets) {
      await processData(dataset, tableName);
    }
    return { success: true };
  } catch (err) {
    console.log(err);
    throw new Error("failed data processing");
  }
};

export { runPipeLines };

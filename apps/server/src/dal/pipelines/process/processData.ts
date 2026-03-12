import { Data, DataResult, TableCheck } from "../../../core/datasets/Dataset";
import { createTable, insertData } from "../../datasets/DatasetsDAO";
import { db, pg } from "../../db";
import { Downloads } from "../getDataSets";
import { baseUrl } from "../../../web/urlStore";

const checkIfTableExists = async (tableName: string) => {
  console.log("checking table");
  const sql = `
    SELECT EXISTS (
        SELECT FROM
            pg_tables
        WHERE
            schemaname = 'datasets' AND
            tablename  = $(tableName)
        );

    `;
  const result: TableCheck = await db.one(sql, {
    tableName,
  });
  return result.exists;
};

const uploadData = async (id: string, tableName: string) => {
  let offset = 0;
  while (true) {
    const response = await fetch(
      `${await baseUrl()}/api/3/action/datastore_search?resource_id=${id}&limit=100&offset=${offset}`,
    );
    const data: Data = (await response.json()) as Data;

    if (!(await checkIfTableExists(tableName)))
      await createTable(data, tableName);

    if (data.result.records.length === 0) break;

    await insertData(data.result, tableName, data.result.resource_id);
    offset += 100;
  }

  return true;
};

const processData = async (dataset: Downloads, tableName: string) => {
  let offset = 0;
  while (true) {
    console.log(offset);
    const response = await fetch(
      `${await baseUrl()}/api/3/action/datastore_search?resource_id=${dataset.id}&limit=100&offset=${offset}`,
    );
    const data: Data = (await response.json()) as Data;

    if (!(await checkIfTableExists(tableName)))
      await createTable(data, tableName);

    if (data.result.records.length === 0) break;

    await insertData(data.result, tableName, data.result.resource_id);
    offset += 100;
  }

  return true;
};

export { processData, uploadData };

import { Data, DataResult, TableCheck } from "../../../core/datasets/Dataset";
import { db, pg } from "../../db";
import { Downloads } from "../getDataSets";

const ALLOWED_TYPES = new Set([
  "int",
  "int2",
  "int4",
  "int8",
  "float4",
  "float8",
  "numeric",
  "text",
  "varchar",
  "bool",
  "timestamp",
  "timestamptz",
  "date",
  "json",
  "jsonb",
]);

const checkIfResourceAlreadyProcessed = async (
  tableName: string,
  resourceId: string,
) => {
  const exists = await db.oneOrNone(
    `SELECT 1 FROM datasets.${pg.as.name(tableName)} WHERE resource_id = $1 LIMIT 1`,
    [resourceId],
  );
  return exists;
};

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

const createTable = async (data: Data, tableName: string) => {
  console.log("creating table");
  const constraintName = `${tableName}_pkey`;
  const fieldCreators = [];
  for (const field of data.result.fields) {
    if (!ALLOWED_TYPES.has(field.type.toLowerCase())) {
      throw new Error(`Invalid column type: ${field.type}`);
    }
    const columnIdentifier = `${pg.as.name(field.id)} ${field.type} NULL`;

    fieldCreators.push(columnIdentifier);
  }
  const sql = `
      CREATE TABLE IF NOT EXISTS datasets.${pg.as.name(tableName)} (
        id int8 GENERATED ALWAYS AS IDENTITY,
        resource_id varchar(100) NOT NULL,
        ${fieldCreators.join(",\n      ")},
        CONSTRAINT ${pg.as.name(constraintName)} PRIMARY KEY (id),
        CONSTRAINT ${pg.as.name(`${tableName}_resource_record_uq`)} UNIQUE (resource_id, _id)
      )`;
  try {
    await db.none(sql, { tableName });
  } catch (err) {
    throw new Error(String(err));
  }
};

const insertData = async (
  data: DataResult,
  tableName: string,
  resourceId: string,
) => {
  console.log("inserting data");
  const rows = data.records.map((row) => ({ ...row, resource_id: resourceId }));
  const columns = ["resource_id", ...data.fields.map((f) => f.id)];
  const cs = new pg.helpers.ColumnSet(columns, {
    table: { table: tableName, schema: "datasets" },
  });

  const sql =
    pg.helpers.insert(rows, cs) +
    ` ON CONFLICT (resource_id, _id) DO UPDATE SET ${cs.assignColumns({ from: "EXCLUDED", skip: ["id", "resource_id", "_id"] })}`;

  try {
    await db.none(sql);
  } catch (err) {
    throw new Error(String(err));
  }
  return true;
};

const processData = async (dataset: Downloads, tableName: string) => {
  let done = false;
  let offset = 0;
  while (true) {
    console.log(offset);
    const response = await fetch(
      `https://ckan0.cf.opendata.inter.prod-toronto.ca/api/3/action/datastore_search?resource_id=${dataset.id}&limit=100&offset=${offset}`,
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

export { processData };

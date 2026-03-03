import {
  getCityDatasets,
  getDatasetByIdString,
} from "../../CKANApi/apiRequests";
import {
  Data,
  DataResult,
  DataSets,
  ResourceArray,
} from "../../core/datasets/Dataset";
import { db, pg } from "../db";

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

const checkIfTableColumnsExist = async (columns: string[]) => {
  const numColumns = columns.length;
  const sql = `
    SELECT table_name
    FROM information_schema.columns
    WHERE column_name IN ($(columns:csv))
      AND table_schema = 'datasets'
    GROUP BY table_name
    HAVING COUNT(DISTINCT column_name) = $(numColumns);
    `;

  const result = await db.oneOrNone(sql, {
    columns,
    numColumns,
  });

  if (result) {
    return result.table_name;
  } else return null;
};

const getDataSetsFromCKAN = async () => {
  const response = await getCityDatasets();
  const { result } = (await response.json()) as DataSets;
  return result;
};

const getDatasetMetaById = async (id: string) => {
  const response = await getDatasetByIdString(id);
  const result = (await response.json()) as ResourceArray;
  return result;
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

export {
  getDataSetsFromCKAN,
  getDatasetMetaById,
  checkIfTableColumnsExist,
  createTable,
  insertData,
};

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
import { TableStatus } from "../../core/TableStatus";
import { updateTableStatus, insertTableLog } from "../dashboard/DashDAO";
import { db, pg } from "../db";
export const normalize = (name: string) =>
  name
    .replace(/[^a-zA-Z0-9_]/g, '_')  // replace any invalid char with _
    .replace(/^(\d)/, '_$1')           // prefix with _ if starts with digit
    .replace(/_+/g, '_')               // collapse multiple _ into one
    .toLowerCase();

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
    const normalizedColumns = columns.map(c => {
        return normalize(c)
    })
    const numColumns = columns.length;
  const sql = `
    SELECT table_name
    FROM information_schema.columns
    WHERE column_name IN ($(normalizedColumns:csv))
      AND table_schema = 'datasets'
    GROUP BY table_name
    HAVING COUNT(DISTINCT column_name) = $(numColumns);
    `;
    
  const result = await db.manyOrNone(sql, {
    normalizedColumns,
    numColumns,
  });
  if (result) {
    return result;
  } else return null;
};

const checkIfTableExists = async (tableName: string) => {
  const sql = `
    SELECT id from data_sources
    where table_name = $(tableName);
  `
  try{
    const {id} = await db.oneOrNone(sql, { tableName });
    return id;
  } catch (err) {
    return null
  }
}

const checkIfTableHasData = async (tableName: string) => {
  const sql = `
    SELECT id from data_sources
    where table_name = $(tableName)
    and current_status = 'populated';
  `
  try{
    const {id} = await db.oneOrNone(sql, { tableName });
    return id;
  } catch (err) {
    return null
  }
}

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
  const resourceId = data.result.resource_id;
  const constraintName = `${tableName}_pkey`;
  const fieldCreators = [];
  for (const field of data.result.fields) {
    if (!ALLOWED_TYPES.has(field.type.toLowerCase())) {
      throw new Error(`Invalid column type: ${field.type}`);
    }
    const columnIdentifier = `${pg.as.name(normalize(field.id))} ${field.type} NULL`;
    console.log(columnIdentifier)
    fieldCreators.push(columnIdentifier);
  }
  const sql = `
      CREATE TABLE IF NOT EXISTS datasets.${pg.as.name(tableName)} (
        row_id int8 GENERATED ALWAYS AS IDENTITY,
        resource_id varchar(100) NOT NULL,
        ${fieldCreators.join(",\n      ")},
        CONSTRAINT ${pg.as.name(constraintName)} PRIMARY KEY (row_id),
        CONSTRAINT ${pg.as.name(`${tableName}_resource_record_uq`)} UNIQUE (resource_id, _id)
      )`;
  try {
    const id = await insertTableLog(tableName, resourceId, TableStatus.init);
    await db.none(sql, { tableName });
    await updateTableStatus(id, TableStatus.created);
    return true;
  } catch (err) {
    throw new Error(String(err));
  }
};

const insertData = async (
  data: DataResult,
  tableName: string,
  resourceId: string,
) => {
  const id = await checkIfTableExists(tableName);
  const rows = data.records.map((row) => {
    const normalized: Record<string, unknown> = { resource_id: resourceId };
    for (const [key, value] of Object.entries(row)) {
      normalized[normalize(key)] = value;
    }
    return normalized;
  });
  const columns = [
    { name: "resource_id" },
    ...data.fields.map((f) => ({ name: normalize(f.id) })),
  ];
  const cs = new pg.helpers.ColumnSet(columns, {
    table: { table: tableName, schema: "datasets" },
  });

  const sql =
    pg.helpers.insert(rows, cs) +
    ` ON CONFLICT (resource_id, _id) DO UPDATE SET ${cs.assignColumns({ from: "EXCLUDED", skip: ["id", "resource_id", "_id"] })}`;
  try {
    await updateTableStatus(id, TableStatus.populating );
    await db.none(sql);
    await updateTableStatus(id, TableStatus.populated);
  } catch (err) {
    await updateTableStatus(id, TableStatus.errored);
    throw new Error(String(err));
  }
  return true;
};

export {
  getDataSetsFromCKAN,
  checkIfTableHasData,
  checkIfTableExists,
  getDatasetMetaById,
  checkIfTableColumnsExist,
  createTable,
  insertData,
};

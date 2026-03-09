import { TableStatus } from "../../core/TableStatus";
import { db } from "../db";

const insertTableLog = async (
  tableName: string,
  resourceId: string,
  status: TableStatus,
) => {
  const sql = `
      INSERT INTO data_sources (
        table_name, resource_id, current_status
      ) VALUES (
        $(tableName), $(resourceId), $(status)
      )
      RETURNING id;
    `;

  const result = await db.one(sql, {
    tableName,
    resourceId,
    status,
  });
  return result.id;
};

const completeTableLog = async (id: number, status: TableStatus) => {
  const sql = `
      UPDATE data_sources
      SET current_status = $(status)
      WHERE id = $(id);
    `;

  await db.none(sql, { id, status });
};

export { insertTableLog, completeTableLog };

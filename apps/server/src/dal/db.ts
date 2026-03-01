import pgPromise from "pg-promise";
import loadConfig from "../config";

const pg = pgPromise({
  capSQL: true,
});
const { INT8, NUMERIC } = pg.pg.types.builtins;
pg.pg.types.setTypeParser(INT8, (value) => parseInt(value, 10));
pg.pg.types.setTypeParser(NUMERIC, (val) => parseFloat(val));
const db = pg(loadConfig().DB_CONNECTION);

export { db, pg };

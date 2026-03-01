import path from "path";
import dotenv from "dotenv";
function loadConfig() {
  if (process.env["NODE_ENV"] === "local") {
    dotenv.config({ path: path.resolve(__dirname, ".server.env") });
  }

  const { DB_CONNECTION, PORT = "3000" } = process.env;

  if (!DB_CONNECTION) {
    throw new Error("Missing required env var: DB_CONNECTION");
  }

  return {
    DB_CONNECTION,
    PORT,
  } as const;
}

export default loadConfig;

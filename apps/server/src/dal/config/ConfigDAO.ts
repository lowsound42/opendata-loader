import { db } from "../db";

const getBaseUrl = async (): Promise<string> => {
    const sql = `
      SELECT base_url FROM config;
    `;
    const result = await db.one(sql);
    return result.base_url;
};


const setBaseUrl = async(url: string, id: string): Promise<string> => {
    const sql = `
      UPDATE config SET base_url = $(url), ckan_set = $(id)
      RETURNING base_url;
    `;
    console.log(url)
    const result = await db.one(sql, {
        url, id
    });
    return result.base_url;
};

const getAllSources = async (): Promise<any[]> => {
    const sql = `
      SELECT * FROM ckan_sets;
    `;
    const result = await db.many(sql);
    return result;
};

export { getBaseUrl, setBaseUrl, getAllSources };

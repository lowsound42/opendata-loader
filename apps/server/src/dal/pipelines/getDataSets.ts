import { baseUrl } from "../../web/urlStore";

type APIResult = {
  result: {
    resources: any[];
  };
};

export type Downloads = {
  name: string;
  url: string;
  id: string;
};

const downloadResources: Downloads[] = [];

const callCKAN = async (packageId: string) => {
  const result = fetch(
    `${await baseUrl()}/api/3/action/package_show?id=${packageId}`,
    { method: "GET" },
  );

  return result;
};

const getAllDataSets = async (tableName: string, packageId: string) => {
  const response = await callCKAN(packageId);
  const data: APIResult = (await response.json()) as APIResult;
  const rawDataResources = data.result.resources.filter(
    (r) => r.name.startsWith(tableName) && r.datastore_active,
  );
  rawDataResources.forEach((element) => {
    downloadResources.push({
      name: element.name,
      url: element.url,
      id: element.id,
    });
  });
  return downloadResources;
};

export default getAllDataSets;

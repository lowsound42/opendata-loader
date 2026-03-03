import { Data } from "../../core/datasets/Dataset";
import {
  getDatasetMetaById,
  getDataSetsFromCKAN,
} from "../../dal/datasets/DatasetsDAO";

const getCityDatasets = async () => {
  const datasets = await getDataSetsFromCKAN();
  const rows = datasets
    .map(
      (id, i) => `<tr>
          <td>${i + 1}</td>
          <td>
            <a href="/resources-page?id=${id}"><button>${id}</button></a>
          </td>
        </tr>`,
    )
    .join("");
  return rows;
};

const getDatasetFieldsById = async (id: string) => {
  console.log(id);
  const datasetMeta = await fetch(
    `https://ckan0.cf.opendata.inter.prod-toronto.ca/api/3/action/datastore_search?resource_id=${id}&limit=100&offset=${0}`,
  );
  const response = (await datasetMeta.json()) as Data;

  return response.result.fields;
};

const getDatasetById = async (id: string) => {
  const datasetMeta = await getDatasetMetaById(id);
  const datastoreRows = datasetMeta.result.resources
    .filter((r) => r.datastore_active && r.datastore_active !== "False")
    .map((r) => {
      const resourceId =
        r.datastore_resource_id && r.datastore_resource_id !== ""
          ? r.datastore_resource_id
          : r.id;
      return `
       <tr class="resource-rows">
         <td class="td-name">${r.name}</td>
         <td class="td-record-count">${r.record_count?.toLocaleString() ?? "—"}</td>
         <td class="td-resource-id">${resourceId}</td>
         <td>
           <a href="/fields-page?id=${resourceId}"><button>check it out</button></a>
         </td>
       </tr>
     `;
    })
    .join("");

  const downloadRows = datasetMeta.result.resources
    .filter((r) => !r.datastore_active || r.datastore_active === "False")
    .map((r) => {
      const resourceId =
        r.datastore_resource_id && r.datastore_resource_id !== ""
          ? r.datastore_resource_id
          : r.id;
      return `
       <tr class="resource-rows">
         <td class="td-name">${r.name}</td>
         <td class="td-record-count">${r.record_count?.toLocaleString() ?? "—"}</td>
         <td class="td-resource-id">${resourceId}</td>
         <td class="td-link"><a href=https://ckan0.cf.opendata.inter.prod-toronto.ca/api/3/action/datastore_search?resource_id=${resourceId}&limit=100&offset=0>go</a></td>
       </tr>
     `;
    })
    .join("");

  return `
    <tbody id="datastore-resources">
      ${datastoreRows}
    </tbody>
    <tbody id="download-resources" hx-swap-oob="true">
      ${downloadRows}
    </tbody>
  `;
};

export { getCityDatasets, getDatasetById, getDatasetFieldsById };

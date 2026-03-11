import { Data } from "../../core/datasets/Dataset";
import {
  checkIfTableColumnsExist,
  checkIfTableExists,
  checkIfTableHasData,
  createTable,
  getDatasetMetaById,
  getDataSetsFromCKAN,
} from "../../dal/datasets/DatasetsDAO";
import { uploadData } from "../../dal/pipelines/process/processData";

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "for",
  "of",
  "to",
  "in",
  "on",
  "at",
  "by",
  "with",
  "from",
  "is",
  "its",
  "as",
  "be",
  "are",
  "was",
  "were",
]);

const fixTableName = (name: string) => {
  return name
    .toLowerCase()
    .replace(/\b\d{1,4}[-\/]\d{1,2}[-\/]\d{1,4}\b/g, "")
    .replace(
      /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{2,4}\b/g,
      "",
    )
    .split(/[^a-z0-9]+/)
    .filter((word) => word && !STOP_WORDS.has(word))
    .join("-")
    .slice(0, 63)
    .replace(/\b\d{4}\b/g, "")
    .replace(/-+$/g, "");
};

const getCityDatasets = async () => {
  const datasets = await getDataSetsFromCKAN();
  const rows = datasets
    .map(
      (id, i) => `<tr>
          <td>${i + 1}</td>
          <td>
            <a href="/resources-page?id=${id}">${id}</a>
          </td>
        </tr>`,
    )
    .join("");
  return rows;
};

const getDatasetFieldsById = async (id: string, name: string) => {
  const datasetMeta = await fetch(
    `https://ckan0.cf.opendata.inter.prod-toronto.ca/api/3/action/datastore_search?resource_id=${id}&limit=100&offset=${0}`,
  );
  const response = (await datasetMeta.json()) as Data;
  const fields = response.result.fields.map((f) => {
    return f.id;
  });
  const status = await checkIfTableExists(fixTableName(name));
  let populated = false;
  if(status){
    populated = await checkIfTableHasData(fixTableName(name));
  }
  const rows = response.result.fields
    .map(
      (f) => `<tr>
        <td>${f.id}</td>
        <td>${f.type}</td>
        <td>${f.info?.notes ?? ""}</td>
      </tr>`,
    )
    .join("");
  const createButton = `<button
    hx-post="create"
    hx-vals='{"id": "${id}", "name": "${fixTableName(name)}"}'
    >create table</button>`;
  const uploadButton = `<button
    hx-post="upload"
    hx-vals='{"id": "${id}", "name": "${fixTableName(name)}"}'
    >upload resource into table</button>`;
  return `
    <div id="fields-status">
      ${status ? `<p>Table Exists <span class="greenStatus"></span></p>` : `<p>Table Does Not Exist <span class="redStatus"></span></p>`}
      ${!status ? createButton :  !populated ? uploadButton : "<p>Table and data exist!</p>"}
    </div>
    <table>
      <tbody id="fields" hx-swap-oob="true">
        ${rows}
      </tbody>
    </table>`;
};

const createNewTable = async (id: string, name: string) => {
  const response = await fetch(
    `https://ckan0.cf.opendata.inter.prod-toronto.ca/api/3/action/datastore_search?resource_id=${id}&limit=100&offset=${0}`,
  );
  const data: Data = (await response.json()) as Data;
  return await createTable(data, name);
};

const uploadIntoTable = async (id: string, name: string) => {
  return await uploadData(id, name);
};

const getDatastoresById = async (id: string) => {
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
           <a href="/fields-page?id=${resourceId}&name=${r.name}"><button>check it out</button></a>
         </td>
       </tr>
     `;
    })
    .join("");
  return `
  <thead>
    <tr>
      <th>Name</th>
      <th>Records</th>
      <th>Resource ID</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    ${datastoreRows}
  </tbody>
  `;
};

const getDatafilesById = async (id: string) => {
  const datasetMeta = await getDatasetMetaById(id);
  const downloadRows = datasetMeta.result.resources
    .filter((r) => !r.datastore_active || r.datastore_active === "False")
    .map((r) => {
      const resourceId =
        r.datastore_resource_id && r.datastore_resource_id !== ""
          ? r.datastore_resource_id
          : r.id;
      return `
       <tr >
         <td class="td-name">${r.name}</td>
         <td class="td-record-count">${r.record_count?.toLocaleString() ?? "—"}</td>
         <td class="td-resource-id">${resourceId}asdads</td>
         <td class="td-link"><a href=${r.url}>go</a></td>
       </tr>
     `;
    })
    .join("");

  return `
  <thead>
    <tr>
      <th>Name</th>
      <th>Records</th>
      <th>Resource ID</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    ${downloadRows}
  </tbody>
  `;
};

export {
  getCityDatasets,
  getDatastoresById,
  getDatafilesById,
  getDatasetFieldsById,
  createNewTable,
  uploadIntoTable,
};

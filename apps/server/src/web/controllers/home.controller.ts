import { getDatasetMeta } from "../../dal/datasets/DatasetsDAO";
const clean = (s: string) => s?.replace(/\\n/g, "").trim() ?? "";

const datasetMeta = async () => {
    const meta = await getDatasetMeta();
    meta.forEach((e) => {
        console.log(e)
    })
    const rows = meta
      .map(
        (item, i) => `<tr>
            <td>${i + 1}</td>
            <td>${clean(item.url)}</td>
            <td>${clean(item.source)}</td>
            <td>${clean(item.schema_name)}</td>
          </tr>`,
      )
      .join("");
    return rows;
};


export {datasetMeta}

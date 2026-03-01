import { getDatasetByIdString } from "../../CKANApi/apiRequests";
import {
  getDatasetMetaById,
  getDataSetsFromCKAN,
} from "../../dal/datasets/DatasetsDAO";

const getCityDatasets = async () => {
  const datasets = await getDataSetsFromCKAN();
  return datasets;
};

const getDatasetById = async (id: string) => {
  const datasetMeta = await getDatasetMetaById(id);
  return datasetMeta;
};

export { getCityDatasets, getDatasetById };

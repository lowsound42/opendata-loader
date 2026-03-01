import {
  getCityDatasets,
  getDatasetByIdString,
} from "../../CKANApi/apiRequests";
import { Data, DataSets } from "../../core/datasets/Dataset";
import { db } from "../db";

const getDataSetsFromCKAN = async () => {
  const response = await getCityDatasets();
  const { result } = (await response.json()) as DataSets;
  console.log(result);
  return result;
};

const getDatasetMetaById = async (id: string) => {
  const response = await getDatasetByIdString(id);
  const { result } = (await response.json()) as DataSets | Data;
  console.log(result);
  return result;
};

export { getDataSetsFromCKAN, getDatasetMetaById };

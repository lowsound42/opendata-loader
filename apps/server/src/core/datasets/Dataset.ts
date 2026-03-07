type DataResult = {
  resource_id: string;
  records: any[];
  _links: {
    start: string;
    next: string;
  };
  total: number;
  fields: [
    {
      id: string;
      type: string;
      info?: { notes?: string };
    },
  ];
};

type Resource = {
  datastore_active: boolean | string;
  datastore_resource_id: number | string;
  id: number;
  name: string;
  record_count: number;
};

type ResourceArray = {
  result: {
    id: number;
    resources: Resource[];
  };
};

type Data = {
  result: DataResult;
};

type TableCheck = {
  exists: boolean;
};

type DataSets = {
  result: string[];
};

export { Data, DataResult, TableCheck, DataSets, ResourceArray };

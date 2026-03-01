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
      info?: string;
    },
  ];
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

export { Data, DataResult, TableCheck, DataSets };

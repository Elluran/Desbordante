/* eslint-disable */

import axios, { AxiosResponse } from "axios";

const serverURL = "http://localhost:5000";

export async function getData(property: string) {
  const response = await axios.get(`${serverURL}/${property}`);
  return response.data;
}

type parameters = {
  algName: string;
  semicolon: string;
  errorPercent: number;
  hasHeader: boolean;
  maxLHS: number;
};

export function submitDatasetWthParameters(
  dataSet: File,
  parameters: parameters,
  onProgress: (progressEvent: any) => void,
  onComplete: (res: AxiosResponse) => void
) {
  const json = JSON.stringify(parameters);
  const blob = new Blob([json], {
    type: "application/json",
  });

  const data = new FormData();

  // Update the formData object
  if (dataSet) {
    data.append("file", dataSet, dataSet.name);
  }

  data.append("document", blob);

  // Request made to the backend api
  // Send formData object
  const config = {
    headers: { "Content-Type": "text/csv" },
    onUploadProgress: (progressEvent: ProgressEvent) =>
      onProgress(progressEvent.loaded / progressEvent.total),
  };

  axios.post(`${serverURL}/createTask`, data, config).then((response) => {
    onComplete(response);
  });
}

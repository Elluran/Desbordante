import axios, { AxiosResponse } from "axios";

export const serverURL = "http://192.168.1.36:5000";

/* eslint-disable no-console */

export async function getData(property: string) {
  try {
    const response = await axios.get(`${serverURL}/${property}`);
    return response.data;
  } catch (e) {
    return e;
  }
}

type parameters = {
  algName: string;
  semicolon: string;
  errorPercent: number;
  hasHeader: boolean;
  maxLHS: number;
};

/* eslint-disable no-unused-vars */
export function submitDatasetWthParameters(
  dataSet: File,
  params: parameters,
  onProgress: (n: number) => void,
  onComplete: (res: AxiosResponse) => void,
) {
  const json = JSON.stringify(params);
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
    onUploadProgress: (progressEvent: ProgressEvent) => {
      onProgress(progressEvent.loaded / progressEvent.total);
    },
  };

  axios.post(`${serverURL}/createTask`, data, config).then((response) => {
    onComplete(response);
  });
}

import { useState } from "react";
import { api, fileApi } from '../config/api';

export default function useFileUploader(projectID) {
  const [files, setFiles] = useState([]);
  const [project] = useState(projectID);

  async function sendChunk(file, id) {
    var chunkSize = 1024 * 1024 * 4;
    var numOfChunks = Math.ceil(file.file.size / chunkSize);

    var start = file.chunkN || 0;
    for (let i = start; i < numOfChunks; i++) {
      file.chunkN = i;

      var data = {
        file: file.file.slice(i * chunkSize, chunkSize * (i + 1)),
        file_meta: JSON.stringify({
          file_name: file.name,
          file_extension: file.extension,
          file_type: file.type
        })
      }

      var config = {
        method: 'post',
        data,
        headers: {
          "Authorization": "Bearer " + localStorage.getItem("dtcAccess"),
          'Content-Type': 'multipart/form-data',
          'Chunk': i + 1,
          'Total-Chunks': numOfChunks
        }
      }
      var response = await fileApi.request(
        `/api/storage/project_${project}/${id}/`,
        config
      );
      file.progress = (i + 1) * 100 / numOfChunks;
      if (response.data.transfer_complete) file.status = 'a';
      setFiles([...files]);
    }
  }

  async function createFiles(formData) {
    return await api.request(`/api/files/project/${project}/`, {
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        "Authorization": "Bearer " + localStorage.getItem("dtcAccess"),
      }
    })
  }

  async function deleteFile(fileId) {
    await api.delete(
      `/api/files/${fileId}/`,
      { headers: { "Authorization": "Bearer " + localStorage.getItem("dtcAccess") } }
    );
  }

  // TODO: rework: 1) create all at once; 2) async pool
  async function proceedUpload() {
    var proceedFiles = files.filter(({ status }) => status !== "a");

    for (var file of proceedFiles) {
      var file_id;

      var formData = new FormData();
      var { name, extension, type, atrsGroups } = file;

      formData.append('meta[]', JSON.stringify({ name, extension, type, atrsGroups }));

      try {
        var { data } = await createFiles(formData);
        file_id = data?.created_files[0];
        if (!file_id && !file_id.id) throw new Error('corrupted file response');
        await sendChunk(file, file_id.id);
      }
      catch ({ message, response }) {
        var authFailed = response && (response.status == 401 || response.status == 403);
        if (authFailed) {
          var error = new Error(message);
          error.authFailed = authFailed;
          throw error;
        }
        if (file_id && file_id.id) deleteFile(file_id.id);
        file.status = 'f';
        file.error = response.data?.ok || message;
        setFiles([...files]);
      }
    }
  }

  return { files, setFiles, proceedUpload };
}

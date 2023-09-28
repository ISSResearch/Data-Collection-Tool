import { useState } from "react";
import { api, fileApi } from '../config/api';

export default function useFileUploader(projectID) {
  const [files, setFiles] = useState([]);
  const [project] = useState(projectID);

  async function sendChunk(file, id) {
    const chunkSize = 1024 * 1024 * 4;
    const numOfChunks = Math.ceil(file.file.size / chunkSize);
    for (let i = 0; i < numOfChunks; i++) {
      const data = {
        file: file.file.slice(i * chunkSize, chunkSize * (i + 1)),
        file_meta: JSON.stringify({
          file_name: file.name,
          file_extension: file.extension,
          file_type: file.type
        })
      }

      const config = {
        method: 'post',
        data,
        headers: {
          "Authorization": "Bearer " + localStorage.getItem("dtcAccess"),
          'Content-Type': 'multipart/form-data',
          'Chunk': i + 1,
          'Total-Chunks': numOfChunks
        }
      }
      const response = await fileApi.request(
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
    await api.delete(`/api/files/${fileId}/`)
  }

  async function proceedUpload() {
    for (const file of files) {
      let file_id;
      const formData = new FormData();
      const { name, extension, type, atrsGroups } = file;
      formData.append('meta[]', JSON.stringify({ name, extension, type, atrsGroups }));
      try {
        const { data } = await createFiles(formData);
        file_id = data?.created_files[0];
        if (!file_id && !file_id.id) throw new Error('corrupted file response');
        await sendChunk(file, file_id.id);
      }
      catch (error) {
        if (file_id && file_id.id) deleteFile(file_id.id);
        file.status = 'f';
        file.error = error.message;
        setFiles([...files]);
      }
    }
  }

  return { files, setFiles, proceedUpload };
}

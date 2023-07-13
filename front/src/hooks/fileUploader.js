import { useState } from "react";
import api from '../config/api';

export default function useFileUploader(projectID) {
  const [files, setFiles] = useState([]);
  const [project] = useState(projectID);

  async function sendChunk(file, id) {
    const chunkSize = 1024 * 1024 * 10;
    const numOfChunks = Math.ceil(file.file.size / chunkSize);
    for (let i = 0; i < numOfChunks; i++) {
      const form = new FormData();
      const chunk = file.file.slice(i * chunkSize, chunkSize * (i + 1));
      form.append('chunk', chunk);
      const data = await api.request(`/api/files/upload/${id}/`, {
        method: 'post',
        data: form,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Chunk': i + 1,
          'Total-Chunks': numOfChunks
        },
      })
      file.progress = (i + 1) * 100 / numOfChunks;
      if (data.data.transfer_complete) file.status = 'a';
      setFiles([...files]);
    }
  }

  async function createFiles(formData) {
    return await api.request(`/api/files/project/${project}/`, {
      method: 'post',
      data: formData,
      headers: {'Content-Type': 'multipart/form-data',}
    })
  }

  async function deleteFile(fileId) {
    await api.delete(`/api/files/${fileId}/`)
  }

  async function proceedUpload() {
    for (const file of files) {
      let file_id;
      const formData = new FormData();
      const {name, extension, type, atrsGroups} = file;
      formData.append('meta[]', JSON.stringify({name, extension, type, atrsGroups}));
      try {
        const data = await createFiles(formData);
        file_id = data.data.created_files[0];
        await sendChunk(file, file_id.id);
      }
      catch {
        deleteFile(file_id.id)
        file.status = 'f';
        setFiles([...files]);
      }
    }
  }

  return { files, setFiles, proceedUpload };
}

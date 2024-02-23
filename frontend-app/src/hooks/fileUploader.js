import { useState } from "react";
import { api, fileApi } from '../config/api';

/**
* @param {number} projectID
* @returns {{files: object[], setFiles: Function, proceedUpload: Function}}
*/
export default function useFileUploader(projectID) {
  const [files, setFiles] = useState([]);
  const [project] = useState(projectID);

  /**
  * @param {object} file
  * @returns {Promise<string>}
  */
  async function _writeFile(file) {
    var data = {
      file: file.file,
      file_meta: JSON.stringify({
        file_name: file.name,
        file_extension: file.extension,
        file_type: file.type
      })
    };

    var config = {
      method: 'post',
      data,
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("dtcAccess"),
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: ({ loaded, total }) => {
          file.progress = Math.round((loaded * 100) / total);
          setFiles((prev) => [...prev]);
      },
    };

    var response = await fileApi.request(
      `/api/storage/project_${project}/`,
      config
    );

    file.status = "a";
    setFiles((prev) => [...prev]);

    return response.data.result;
  }

  /**
  * @param {object} file
  * @param {string} fileID
  * @returns {Promise<{data: object}>}
  */
  async function _writeObject(file, fileID) {
    var formData = new FormData();
    var { name, extension, type, atrsGroups } = file;

    formData.append(
      'meta',
      JSON.stringify({ fileID, name, extension, type, atrsGroups })
    );

    return await api.request(`/api/files/project/${project}/`, {
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        "Authorization": "Bearer " + localStorage.getItem("dtcAccess"),
      }
    });
  }

  /**
  * @param {string} fileID
  * @returns {Promise<object>}
  */
  async function _deleteFile(fileID) {
    await fileApi.delete(
      `/api/storage/project_${project}/${fileID}/`,
      { headers: { "Authorization": "Bearer " + localStorage.getItem("dtcAccess") } }
    );
  }

  async function _proceedFile(file) {
    try {
      var fileID = await _writeFile(file);
      await _writeObject(file, fileID);
    }
    catch ({ message, response }) {
      var authFailed = response && (response.status == 401 || response.status == 403);
      if (authFailed) {
        var error = new Error(message);
        error.authFailed = authFailed;
        throw error;
      }
      if (fileID) _deleteFile(fileID);
      file.status = 'f';
      file.error = response.data?.result || message;
      setFiles((prev) => [...prev]);
    }
  }

  // TODO: rework: rewrite pool
  /**
  * @returns {Promise<undefined>}
  */
  async function proceedUpload() {
    const atOnce = 5;
    var proceedFiles = files.filter(({ status }) => status !== "a");

    for (var i = 0; i < Math.ceil(proceedFiles.length / atOnce); i++) {
      await Promise.all(
        proceedFiles
          .slice(atOnce * i, atOnce * (i + 1))
          .map((file) => _proceedFile(file))
      );
    }
  }

  return { files, setFiles, proceedUpload };
}

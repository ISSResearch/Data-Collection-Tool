import { useState } from "react";
import { attributeGroupsAdapter } from "../adapters";

/**
* @returns {{ files: object[], setFiles: Function, initFiles: Function }}
*/
export default function useFiles() {
  const [files, setFiles] = useState([]);

  /**
  * @param {object[]} filesData
  * @returns {void}
  */
  function initFiles(filesData) {
    filesData.forEach((file) => {
      var { attributes } = file;
      file.attributeGroups = attributeGroupsAdapter(attributes);
    });
    setFiles(filesData);
  }

  return { files, setFiles, initFiles };
}

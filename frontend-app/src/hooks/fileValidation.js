import { useState } from "react";
import { attributeGroupsAdapter } from "../adapters";

export default function useFiles() {
  const [files, setFiles] = useState([]);

  function initFiles(filesData) {
    filesData.forEach(file => {
      var { attributes } = file;
      file.attributeGroups = attributeGroupsAdapter(attributes);
    });
    setFiles(filesData);
  }

  return { files, setFiles, initFiles };
}

import { useState } from "react";
import { attributeGroupsAdapter } from "../adapters";

export default function useFiles() {
  const [files, setFiles] = useState([]);

  function initFiles(filesData) {
    filesData.forEach(file => {
      const { attributes } = file;
      file.attributeGroups = attributeGroupsAdapter(attributes);
    });
    setFiles(filesData);
  }

  function filterBy(field, value) {
    return files.filter(file => file[field] === value);
  }

  return { files, setFiles, initFiles, filterBy };
}

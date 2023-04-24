import { useState } from "react";

export default function useFiles() {
  const [files, setFiles] = useState([]);

  function initFiles(filesData) {
    filesData.forEach(file => {
      const { attributes } = file;
      file.attributeGroups = {};
      attributes.forEach(({ uid, attributes}) => {
        file.attributeGroups[uid] = attributes;
      })
    });
    setFiles(filesData);
  }

  return { files, setFiles, initFiles };
}
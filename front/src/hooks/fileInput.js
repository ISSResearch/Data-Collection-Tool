import { useState } from 'react';

export default function useFileInput() {
  const [files, setFiles] = useState([]);

  function handleUpload(uploaded) {
    const newFiles = uploaded.map((file) => {
      const [name, extension] = file.name.split('.');
      const [type] = file.type.split('/');
      return { file, name, extension, type, attributeGroups: {} };
    });
    const threshold = 100 - files.length;
    setFiles([
      ...files,
      ...(newFiles.length <= threshold ? newFiles : newFiles.splice(0, threshold))
    ]);
  }

  function handleNameChange({value}, index) {
    const newFiles = [...files];
    newFiles[index].name = value;
    setFiles(newFiles);
  }

  function handleDelete(index) {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  }

  function setAttributeGroups({ fileIndex, ids, selectorKey, selInd, del, set }) {
    if (set) return files[fileIndex].attributeGroups = ids;
    const {attributeGroups: target} = files[fileIndex];
    if (del) return delete target[selectorKey];
    if (!target[selectorKey]) target[selectorKey] = {};
    target[selectorKey][selInd] = [...ids];
  }

  // TODO: fix structure difference and (b undefined issue)?
  function gatherFiles() {
    files.forEach(file => {
      const preparedAtrs = Object.values(file.attributeGroups)
        .reduce((acc, ids) => {
          return [
            ...acc,
            (Array.isArray(ids) ? ids : Object.values(ids))
              .reduce((a, b) => [...a, ...(b || [])], [])
          ]
        }, []);
      file.atrsGroups = preparedAtrs;
    });
    return files;
  }

  // TODO: fix 'b' undefined issue
  function validate(attributes) {
    if (!files.length) return {isValid: false, message: 'No files attached!'};
    for (const file of files) {
      const error = { isValid: false, message: 'File attributes are supposed to be set at least on first levels!' };
      const { attributeGroups } = file;
      if (!attributeGroups || !Object.values(attributeGroups).length ) return error
      for (const group of Object.values(attributeGroups)) {
        const groupData = Object.values(group);
        if (
            groupData.length < Object.values(attributes).length
            || !groupData.reduce((a, b) => a + (b?.length || 0), 0)
        ) return error;
      }
    }
    return { isValid: true, message: 'ok' };
  }

  return {
    files,
    handleUpload,
    handleNameChange,
    handleDelete,
    setAttributeGroups,
    gatherFiles,
    validate
  };
}

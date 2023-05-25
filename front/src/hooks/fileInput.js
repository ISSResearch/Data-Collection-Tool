import { useState } from 'react';
import { findRequired, formError } from '../utils/utils';

export default function useFileInput() {
  const [files, setFiles] = useState([]);

  function handleUpload(uploaded) {
    const newFiles = uploaded.map((file) => {
      const [name, extension] = file.name.split('.');
      const [type] = file.type.split('/');
      return { file, name, extension, type, attributeGroups: {} };
    });
    const threshold = 20 - files.length;
    setFiles([
      ...files,
      ...(newFiles.length <= threshold ? newFiles : newFiles.splice(threshold))
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

  // TODO: optimize
  function validate(attributes) {
    if (!files.length) return {isValid: false, message: 'No files attached!'};
    const requiredLevels = findRequired(attributes);
    const requiredIds = requiredLevels.map(({attributes}) => attributes);
    for (const file of files) {
      const { attributeGroups, name } = file;
      if (!Object.values(attributeGroups || {}).length) return formError(name, requiredLevels);
      for (const group of Object.values(attributeGroups)) {
        const missingValues = [];
        const groupData = Object.values(group);
        requiredIds.forEach((ids, index) => {
          let found;
          for (const idx in groupData) {
            if (groupData[idx].filter(id => ids.includes(id)).length) {
              found = true;
              break;
            }
          }
          if (!found) missingValues.push(requiredLevels[index]);
        });
        if (missingValues.length) return formError(name, missingValues);
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

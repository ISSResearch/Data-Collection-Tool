import { useState } from 'react';
import { findRequired, formError, formUID } from '../utils/utils';

export default function useFileInput() {
  const [files, setFiles] = useState({});

  function handleUpload(uploaded) {
    const newFiles = uploaded.map((file) => {
      const [name, extension] = file.name.split('.');
      const [type] = file.type.split('/');
      return { file, name, extension, type, attributeGroups: {} };
    });
    const threshold = 20 - Object.values(files).length;
    const newData = {...files};
    (newFiles.length <= threshold ? newFiles : newFiles.splice(threshold)).forEach(el => {
      newData[formUID()] = el;
    })
    setFiles(newData);
  }

  function handleNameChange({value}, chandeID) {
    setFiles(prev => {
      const newFiles = {...prev};
      newFiles[chandeID].name = value;
      return newFiles;
    });
  }

  function handleDelete(deleteId) {
    setFiles(prev => {
      const newFiles = {...prev};
      delete newFiles[deleteId]
      return newFiles;
    });
  }

  function setAttributeGroups({ fileID, ids, selectorKey, selInd, del, set }) {
    if (set) return files[fileID].attributeGroups = ids;
    const {attributeGroups: target} = files[fileID];
    if (del) return delete target[selectorKey];
    if (!target[selectorKey]) target[selectorKey] = {};
    target[selectorKey][selInd] = [...ids];
  }

  // TODO: fix structure difference and (b undefined issue)?
  function gatherFiles() {
    Object.values(files).forEach((file) => {
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
    return Object.values(files);
  }

  // TODO: optimize
  function validate(attributes) {
    if (!Object.values(files).length) return {isValid: false, message: 'No files attached!'};
    const requiredLevels = findRequired(attributes);
    const requiredIds = requiredLevels.map(({attributes}) => attributes);
    for (const file of Object.values(files)) {
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
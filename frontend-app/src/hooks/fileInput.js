import { useState } from 'react';
import { findRequired, formError, formUID, deepCopy } from '../utils/';

const TYPES_MAP = {
  'jpg': "image",
  'mkv': "video",
  'mov': "video",
  'x-matroska': "video",
  'mp4': "video",
  'quicktime': "video",
  'jpeg': "image",
  "png": "image",
  "webp": "video"
}

export default function useFileInput() {
  const [files, setFiles] = useState({});
  const [applyGroups, setApplyGroups] = useState(null);

  function handleUpload(uploaded) {
    var newFiles = uploaded.map((file) => {
      var [type, typeExt] = file.type.split('/');
      var nameSplit = file.name.split('.');
      var extension;
      if (nameSplit.length > 1) {
        var nameExt = nameSplit.pop()
        extension = typeExt || nameExt;
      }
      else extension = typeExt || '';
      const name = nameSplit.join('');
      return {
        file,
        name,
        extension,
        type: type || TYPES_MAP[extension],
        attributeGroups: useState(deepCopy(applyGroups || {}))
      };
    });
    const threshold = 20 - Object.values(files).length;
    const newData = { ...files };
    if (newFiles.length > threshold) newFiles.splice(threshold);
    newFiles.forEach(el => newData[formUID()] = el);
    setFiles(newData);
  }

  function handleApplyGroups(groups) {
    var newApplyGroups = deepCopy(groups);
    setApplyGroups(() => newApplyGroups);
    files.forEach(file => file.attributeGroups = useState(deepCopy(newApplyGroups || {})));
  }

  function handleNameChange({ value }, chandeID) {
    setFiles(prev => {
      const newFiles = { ...prev };
      newFiles[chandeID].name = value;
      return newFiles;
    });
  }

  function handleDelete(deleteId) {
    setFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[deleteId]
      return newFiles;
    });
  }

  function setAttributeGroups({ fileID, ids, selectorKey, selInd, del, set }) {
    if (set) return files[fileID].attributeGroups = ids;
    const { attributeGroups: target } = files[fileID];
    if (del) return delete target[selectorKey];
    if (!target[selectorKey]) target[selectorKey] = {};
    target[selectorKey][selInd] = [...ids];
  }

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

  function validate(attributes) {
    if (!Object.values(files).length) return { isValid: false, message: 'No files attached!' };
    const requiredLevels = findRequired(attributes);
    if (!requiredLevels.length) return { isValid: true, message: 'ok' };
    const requiredIds = requiredLevels.map(({ attributes }) => attributes);
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
    validate,
    handleApplyGroups
  };
}

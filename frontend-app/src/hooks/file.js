import { useState } from 'react';
import { deepCopy, findRequired, formError } from '../utils/';

export default function useFile() {
  const [file, setFile] = useState({});

  function initFile(entry) {
    const newFile = deepCopy(entry);
    setFile(newFile);
  }

  function changeName({ value }) {
    const updatedFile = deepCopy(file);
    updatedFile.file_name = value;
    setFile(updatedFile);
  }

  function setAttributeGroups({ ids, selectorKey, selInd, del, set }) {
    if (set) return file.attributeGroups = ids;
    const { attributeGroups: target } = file;
    if (del) return delete target[selectorKey];
    if (!target[selectorKey]) target[selectorKey] = {};
    target[selectorKey][selInd] = [...ids];
  }

  function validate(attributes) {
    const requiredLevels = findRequired(attributes);
    const requiredIds = requiredLevels.map(({ attributes }) => attributes);
    const { attributeGroups, file_name } = file;
    if (!Object.values(attributeGroups || {}).length) return formError(file_name, requiredLevels);
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
      if (missingValues.length) return formError(file_name, missingValues);
    }
    return { isValid: true, message: 'ok' };
  }

  return {
    file,
    initFile,
    changeName,
    setAttributeGroups,
    validate
  };
}

import { useState } from 'react';
import { deepCopy, findRequired, formError, formUID } from '../utils/';

export default function useFile() {
  const [file, setFile] = useState({});

  function initFile(entry) {
    const newFile = deepCopy(entry);
    setFile(newFile);
  }

  function changeName({ value }) {
    setFile(prev => {
      return { ...prev, file_name: value };
    });
  }

  function handleGroupChange({ key, type, payload }) {
    var changeMap = {
      "add": ({ attributeGroups }) => attributeGroups[formUID()] = {},
      "delete": ({ attributeGroups }, key) => delete attributeGroups[key],
      "copy": ({ attributeGroups }, key) => attributeGroups[formUID()] = deepCopy(attributeGroups[key]),
      "set": ({ attributeGroups }, key, { selected, index, selInd }) => {
        var target = attributeGroups[key];
        if (!target[selInd]) target[selInd] = [...selected];
        else {
          target[selInd].splice(index);
          target[selInd].push(...selected);
        }
      }
    }

    setFile(prev => {
      changeMap[type](prev, key, payload);
      return { ...prev };
    });
  }

  function validate(attributes) {
    var requiredLevels = findRequired(attributes);
    var requiredIds = requiredLevels.map(({ attributes }) => attributes);
    var { attributeGroups, file_name } = file;

    if (!requiredIds.length) return { isValid: true, message: 'ok' };
    if (!Object.values(attributeGroups || {}).length) return formError(file_name, requiredLevels);

    for (const group of Object.values(attributeGroups)) {
      var missingValues = [];
      var groupData = Object.values(group);
      requiredIds.forEach((ids, index) => {
        let found;
        for (var idx in groupData) {
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
    handleGroupChange,
    validate
  };
}

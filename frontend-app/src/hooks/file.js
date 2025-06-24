import { useState } from 'react';
import { deepCopy, findRequired, formError, formUID } from '../utils/';

/**
* @returns {{
* file: object,
* initFile: Function,
* changeName: Function,
* handleGroupChange: Function,
* validate: Function,
* prepareAttributes: Function
* }}
*/
export default function useFile() {
  const [file, setFile] = useState({});

  /**
  * @param {object} entry
  * @returns {void}
  */
  function initFile(entry) {
    var newFile = deepCopy(entry);
    setFile(newFile);
  }

  /**
  * @param {object} target
  * @param {string} target.value
  * @returns {void}
  */
  function changeName({ value }) {
    setFile((prev) => {
      return { ...prev, file_name: value };
    });
  }

  /**
  * @param {object} changeItem
  * @param {number} changeItem.key
  * @param {string} changeItem.type
  * @param {object} changeItem.payload
  * @returns {void}
  */
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
    };

    setFile((prev) => {
      changeMap[type](prev, key, payload);
      return { ...prev };
    });
  }

  /**
  * @param {object[]} attributes
  * @returns {undefined|{isValid: boolean, message?: string}}
  */
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
          if (groupData[idx].filter((id) => ids.includes(id)).length) {
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

  /**
  * @returns {object}
  */
  function prepareAttributes() {
    return Object.entries(file.attributeGroups || {})
      .reduce((acc, [key, val]) => {
        return {
          ...acc,
          [key]: (Array.isArray(val) ? val : Object.values(val))
            .reduce((newacc, ids) => [...newacc, ...ids], [])
        };
      }, {});
  }

  return {
    file,
    initFile,
    changeName,
    handleGroupChange,
    validate,
    prepareAttributes
  };
}

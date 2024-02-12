import { useState } from 'react';
import { findRequired, formError, deepCopy, formUID } from '../utils/';
import { inputFilesAdapter } from '../adapters';

/**
* @returns {{
* files: object,
* handleUpload: Function,
* handleNameChange: Function,
* handleDelete: Function,
* handleGroupChange: Function,
* gatherFiles: Function,
* validate: Function,
* handleApplyGroups: Function,
* count: Function,
* uploadCount: Function
* }}
*/
export default function useFileInput() {
  const [files, setFiles] = useState({});
  const [applyGroups, setApplyGroups] = useState({});

  /**
  * @param {File[]} uploaded
  * @returns {undefined}
  */
  function handleUpload(uploaded) {
    setFiles((prev) => {
      return { ...prev, ...inputFilesAdapter(uploaded, applyGroups) };
    });
  }

  /**
  * @param {object} groups
  * @returns {undefined}
  */
  function handleApplyGroups(groups) {
    var newApplyGroups = deepCopy(groups);
    setApplyGroups(() => newApplyGroups);
    Object.values(files)
      .forEach((file) => file.attributeGroups = deepCopy(newApplyGroups || {}));
  }

  /**
  * @param {object} target
  * @param {string} target.value
  * @param {number} chandeID
  * @returns {undefined}
  */
  function handleNameChange({ value }, chandeID) {
    setFiles((prev) => {
      var newFiles = { ...prev };
      newFiles[chandeID].name = value;
      return newFiles;
    });
  }

  /**
  * @param {number} deleteId
  * @returns {undefined}
  */
  function handleDelete(deleteId) {
    setFiles((prev) => {
      var newFiles = { ...prev };
      URL.revokeObjectURL(newFiles[deleteId].blob);
      delete newFiles[deleteId];
      return newFiles;
    });
  }

  /**
  * @param {object} changeItem
  * @param {number} changeItem.fileID
  * @param {number} changeItem.key
  * @param {string} changeItem.type
  * @param {object} changeItem.payload
  * @returns {undefined}
  */
  function handleGroupChange({ fileID, key, type, payload }) {
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

    setFiles((prev) => {
      var newFiles = { ...prev };
      changeMap[type](newFiles[fileID], key, payload);
      return newFiles;
    });
  }

  /**
  * @returns {object[]}
  */
  function gatherFiles() {
    Object.values(files).forEach((file) => {
      URL.revokeObjectURL(file.blob);

      file.atrsGroups = Object.values(file.attributeGroups)
        .reduce((acc, group) => {
          var groupIds = Object.values(group)
            .reduce((acc, ids) => {
              if (ids && ids.length) acc.push(...ids);
              return acc;
            }, []);
          acc.push(groupIds);
          return acc;
        }, []);
    });

    return Object.values(files);
  }

  /**
  * @param {object[]} requiredLevels
  * @returns {undefined|{isValid: boolean, message?: string}}
  */
  function checkRequired(requiredLevels) {
    var requiredIds = requiredLevels.map(({ attributes }) => attributes);

    for (var file of Object.values(files)) {
      var { attributeGroups, name } = file;
      var fileGroups = Object.values(attributeGroups);

      if (!fileGroups.length) return formError(name, requiredLevels);

      for (var group of fileGroups) {
        var missingValues = [];
        var groupData = Object.values(group);

        requiredIds.forEach((ids, index) => {
          var found;
          for (var idx in groupData) {
            if (groupData[idx].filter((id) => ids.includes(id)).length) {
              found = true;
              break;
            }
          }
          if (!found) missingValues.push(requiredLevels[index]);
        });

        if (missingValues.length) return formError(name, missingValues);
      }
    }
  }

  /**
  * @param {object[]} attributes
  * @returns {{isValid: boolean, message?: string}}
  */
  function validate(attributes) {
    var resultMap = {
      "ok": { isValid: true, message: 'ok' },
      "noFiles": { isValid: false, message: 'No files attached!' }
    };

    if (!Object.values(files).length) return resultMap.noFiles;

    var requiredLevels = findRequired(attributes);
    if (!requiredLevels.length) return resultMap.ok;

    var error = checkRequired(requiredLevels);

    return error || resultMap.ok;
  }

  /**
  * @returns {number}
  */
  function count() { return Object.keys(files).length; }

  /**
  * @returns {number}
  */
  function uploadCount() {
    return Object.values(files).filter(({ status }) => !status).length;
  }

  return {
    files,
    handleUpload,
    handleNameChange,
    handleDelete,
    handleGroupChange,
    gatherFiles,
    validate,
    handleApplyGroups,
    count,
    uploadCount
  };
}

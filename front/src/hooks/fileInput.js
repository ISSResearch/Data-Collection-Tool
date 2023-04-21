import { useState } from 'react';
import { deepCopy } from '../utils/utils';

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

  function setAttributeGroups({ fileIndex, ids, selectorIndex, selInd, del, set }) {
    if (set) return files[fileIndex].attributeGroups = ids;
    const {attributeGroups: target} = files[fileIndex];
    if (del) return delete target[selectorIndex];
    if (!target[selectorIndex]) target[selectorIndex] = {};
    target[selectorIndex][selInd] = [...ids];
  }

  function gatherFiles() {
    const filesToSend = deepCopy(files).slice(0, 100);
    filesToSend.forEach(file => {
      const preparedAtrs = Object.values(file.attributeGroups)
        .reduce((acc, ids) => {
          return [...acc, ids.reduce((a, b) => [...a, ...b], [])]
        }, []);
      file.atrsGroups = preparedAtrs;
    });
    return filesToSend;
  }

  return {
    files,
    handleUpload,
    handleNameChange,
    handleDelete,
    setAttributeGroups,
    gatherFiles
  };
}

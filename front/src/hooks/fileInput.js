import { useState } from 'react';

export default function useFileInput() {
  const [files, setFiles] = useState([]);

  function handleUpload(uploaded) {
    const newFiles = uploaded.map((file) => {
      const [name, extension] = file.name.split('.');
      const [type] = file.type.split('/');
      return { file, name, extension, type, atrsId: {} };
    });
    setFiles([...files, ...newFiles]);
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

  function attributeFile({ fileIndex, selectorIndex, id, clear, isNew, index }) {
    const {atrsId: target} = files[fileIndex];
    if (isNew) return target[selectorIndex] = [...isNew];
    if (target[selectorIndex]) {
      target[selectorIndex].splice(index, target[selectorIndex].length);
      if (!clear) target[selectorIndex].push(id);
    }
    else target[selectorIndex] = [id];
  }

  return { files, handleUpload, handleNameChange, handleDelete, attributeFile };
}

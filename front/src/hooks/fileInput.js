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

  function attributeFile({ fileIndex, selectorIndex, value, clear, isNew }) {
    const target = files[fileIndex].atrsId;
    if (isNew) return target[selectorIndex] = [...isNew];
    if (clear) target[selectorIndex].splice(value, target[selectorIndex].length);
    else target[selectorIndex]
      ? target[selectorIndex].push(value)
      : target[selectorIndex] = [value];
  }

  return { files, handleUpload, handleNameChange, handleDelete, attributeFile };
}

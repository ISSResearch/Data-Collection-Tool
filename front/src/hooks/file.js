import { useState } from 'react';
import { deepCopy } from '../utils/utils';

export default function useFile() {
  const [file, setFile] = useState({});

  function initFile(entry) {
    const newFile = deepCopy(entry);
    newFile.atrsId = {};
    setFile(newFile);
  }

  function changeName({value}) {
    const updatedFile = deepCopy(file);
    updatedFile.file_name = value;
    setFile(updatedFile);
  }

  function attributeFile({ selectorIndex, value, clear, isNew }) {
    const target = file.atrsId;
    if (isNew) target[selectorIndex] = [...isNew];
    else if (clear) target[selectorIndex].splice(value, target[selectorIndex].length);
    else target[selectorIndex]
      ? target[selectorIndex].push(value)
      : target[selectorIndex] = [value];;
  }

  return { file, initFile, changeName, attributeFile };
}

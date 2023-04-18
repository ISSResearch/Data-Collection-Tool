import { useState } from 'react';
import { deepCopy } from '../utils/utils';

export default function useFile() {
  const [file, setFile] = useState({});

  function initFile(entry) {
    const newFile = deepCopy(entry);
    newFile.atrsId = {};
    newFile.additionalAttrs = {};
    setFile(newFile);
  }

  function changeName({value}) {
    const updatedFile = deepCopy(file);
    updatedFile.file_name = value;
    setFile(updatedFile);
  }

  function attributeFile({ selectorIndex, id, clear, isNew, index }) {
    const {atrsId: target} = file;
    if (isNew) return target[selectorIndex] = [...isNew];
    if (target[selectorIndex]) {
      target[selectorIndex].splice(index, target[selectorIndex].length);
      if (!clear) target[selectorIndex].push(id);
    }
    else target[selectorIndex] = [id];
  }

  function addAdditional(ids, selectorIndex, index) {
    const {additionalAttrs: target} = file;
    target[selectorIndex] = ids;

    console.log(file)
    // if (target[selectorIndex]) {
    //   target[selectorIndex].splice(index, target[selectorIndex].length);
    //   target[selectorIndex].push(...ids);
    // }
    // else target[selectorIndex] = ids;
  }

  return { file, initFile, changeName, attributeFile, addAdditional };
}

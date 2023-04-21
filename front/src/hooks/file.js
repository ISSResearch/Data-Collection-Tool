import { useState } from 'react';
import { deepCopy } from '../utils/utils';

export default function useFile() {
  const [file, setFile] = useState({});

  function initFile(entry) {
    const newFile = deepCopy(entry);
    newFile.attributeGroups = {};
    setFile(newFile);
  }

  function changeName({value}) {
    const updatedFile = deepCopy(file);
    updatedFile.file_name = value;
    setFile(updatedFile);
  }

  function setAttributeGroups({ ids, selectorKey, selInd, del, set }) {
    // if (set) return files[fileIndex].attributeGroups = ids;
    const {attributeGroups: target} = file;
    if (del) return delete target[selectorKey];
    if (!target[selectorKey]) target[selectorKey] = {};
    target[selectorKey][selInd] = [...ids];
  }

  // TODO: refactor
  function formApplyOption(attrs) {
    if (!attrs?.length || !file.attributes?.length) return [];
    const applyOptions = [];
    const lookUpAttrs = deepCopy(attrs);
    file.attributes.forEach( lookUpdId => {
      for (const index in lookUpAttrs) {
        const {children, attributes, selectIndex} = lookUpAttrs[index];
        if (children) lookUpAttrs.push(
          ...children.map( child => {
            child.selectIndex = selectIndex || index;
            return child;
          })
        );
        const lookUpChild = attributes?.find(({id}) => id === lookUpdId);
        if (lookUpChild) {
          applyOptions[selectIndex || index]
            ? applyOptions[selectIndex || index].push([lookUpdId, children])
            : applyOptions[selectIndex || index] = [[lookUpdId, children]];
          break;
        }
      }
    });
    return applyOptions;
  }

  return { file, initFile, changeName, setAttributeGroups, formApplyOption };
}

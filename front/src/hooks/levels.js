import { useState } from 'react';
import { formUID } from '../utils/utils';

export default function useLevels() {
  const [levels, setLevels] = useState({});

  function initLevel(formId, initData=[]) {
    setLevels((prev) => {
      return {...prev, [formId]: initData}
    });
  }

  function destroyLevel(formId) {
    const newLevels = {...levels};
    delete newLevels[formId];
    setLevels(newLevels);
  }

  function addLevel(formId) {
    const newLevels = {...levels};
    const prevValues = [...newLevels[formId]];
    newLevels[formId] = [ ...prevValues, { id: formUID(), name: '' } ];
    setLevels(newLevels);
  }

  function delLevel(formId, index) {
    const newLevels = {...levels};
    const prevValues = newLevels[formId]
    prevValues.splice(index, 1);
    newLevels[formId] = prevValues;
    setLevels(newLevels);
  }

  function changeLevel(formId, {value}, index) {
    const newLevels = {...levels};
    const prevValues = newLevels[formId]
    prevValues[index].name = value;
    newLevels[formId] = prevValues;
    setLevels(newLevels);
  }

  return { levels, addLevel, delLevel, changeLevel, initLevel, destroyLevel };
}
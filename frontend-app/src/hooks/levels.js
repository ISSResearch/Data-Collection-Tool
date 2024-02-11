import { useState } from 'react';
import { formUID, traverseWithReplace } from '../utils/';

export default function useLevels() {
  const [levels, setLevels] = useState({});
  const [deletedOriginLevels, setDeletedOriginLevels] = useState([]);

  function initLevel(formId, initData = []) {
    setLevels((prev) => {
      return { ...prev, [formId]: initData };
    });
  }

  function destroyLevel(formId) {
    var newLevels = { ...levels };
    delete newLevels[formId];
    setLevels(newLevels);
  }

  function addLevel(formId) {
    if (levels[formId][levels[formId].length - 1]?.multiple)
      throw new Error('You can`t set new level after multiple one.');

    var newLevels = { ...levels };
    var prevValues = [...newLevels[formId]];

    newLevels[formId] = [...prevValues, { id: formUID(), name: '' }];
    setLevels(newLevels);
  }

  function delLevel(formId, index) {
    var newLevels = { ...levels };
    var prevValues = newLevels[formId];

    prevValues.splice(index, 1);
    newLevels[formId] = prevValues;

    setLevels(newLevels);
  }

  function changeLevel(formId, { value }, index) {
    var newLevels = { ...levels };
    var prevValues = newLevels[formId];

    prevValues[index].name = value;
    newLevels[formId] = prevValues;

    setLevels(newLevels);
  }

  function setMultiple(formId, index, target) {
    if (index + 1 < levels[formId].length) {
      target.checked = false;
      throw new Error('Delete previous levels. No levels allowed after multiple one.');
    }

    var newLevels = { ...levels };
    var prevValues = newLevels[formId];

    prevValues[index].multiple = !prevValues[index].multiple;
    newLevels[formId] = prevValues;

    setLevels(newLevels);
  }

  function setRequired(formId, index) {
    var newLevels = { ...levels };
    var prevValues = newLevels[formId];

    prevValues[index].required = !prevValues[index].required;
    newLevels[formId] = prevValues;

    setLevels(newLevels);
  }

  function findAndReplace(replaceTo="", replaceWith="") {
    const newLevels = { ...levels };

    Object.values(newLevels).forEach((items) => {
      traverseWithReplace(items, "name", replaceTo, replaceWith);
    });

    setLevels(newLevels);
  }

  return {
    levels,
    addLevel,
    delLevel,
    changeLevel,
    initLevel,
    destroyLevel,
    setMultiple,
    setRequired,
    deletedOriginLevels,
    setDeletedOriginLevels,
    findAndReplace,
  };
}

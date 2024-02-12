import { useState } from 'react';
import { formUID, traverseWithReplace } from '../utils/';

/**
* @returns {{
* levels: object,
* addLevel: Function,
* delLevel: Function,
* changeLevel: Function,
* initLevel: Function,
* destroyLevel: Function,
* setMultiple: Function,
* setRequired: Function,
* deletedOriginLevels: Function,
* setDeletedOriginLevels: Function,
* findAndReplace: Function,
* }}
*/
export default function useLevels() {
  const [levels, setLevels] = useState({});
  const [deletedOriginLevels, setDeletedOriginLevels] = useState([]);

  /**
  * @param {number} formId
  * @param {number[]} initData
  * @returns {undefined}
  */
  function initLevel(formId, initData = []) {
    setLevels((prev) => {
      return { ...prev, [formId]: initData };
    });
  }

  /**
  * @param {number} formId
  * @returns {undefined}
  */
  function destroyLevel(formId) {
    var newLevels = { ...levels };
    delete newLevels[formId];
    setLevels(newLevels);
  }

  /**
  * @throws {{message}} Error
  * @param {number} formId
  * @returns {undefined}
  */
  function addLevel(formId) {
    if (levels[formId][levels[formId].length - 1]?.multiple)
      throw new Error('You can`t set new level after multiple one.');

    var newLevels = { ...levels };
    var prevValues = [...newLevels[formId]];

    newLevels[formId] = [...prevValues, { id: formUID(), name: '' }];
    setLevels(newLevels);
  }

  /**
  * @param {number} formId
  * @param {number} index
  * @returns {undefined}
  */
  function delLevel(formId, index) {
    var newLevels = { ...levels };
    var prevValues = newLevels[formId];

    prevValues.splice(index, 1);
    newLevels[formId] = prevValues;

    setLevels(newLevels);
  }

  /**
  * @param {number} formId
  * @param {object} target
  * @param {string} target.value
  * @param {number} index
  * @returns {undefined}
  */
  function changeLevel(formId, { value }, index) {
    var newLevels = { ...levels };
    var prevValues = newLevels[formId];

    prevValues[index].name = value;
    newLevels[formId] = prevValues;

    setLevels(newLevels);
  }

  /**
  * @throws {{message}} Error
  * @param {number} formId
  * @param {number} index
  * @param {object} target
  * @returns {undefined}
  */
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

  /**
  * @param {number} formId
  * @param {number} index
  * @returns {undefined}
  */
  function setRequired(formId, index) {
    var newLevels = { ...levels };
    var prevValues = newLevels[formId];

    prevValues[index].required = !prevValues[index].required;
    newLevels[formId] = prevValues;

    setLevels(newLevels);
  }

  /**
  * @param {string} replaceTo
  * @param {string} replaceWith
  * @returns {undefined}
  */
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

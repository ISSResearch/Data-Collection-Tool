import { useState } from 'react';
import {
  deepFind,
  refreshPath,
  formUID,
  spreadChildren,
  traverseWithReplace,
  drawPaths
} from '../utils/';

/**
* @returns {{
* attributes: object,
* addAttribute: Function,
* delAttribute: Function,
* handleChange: Function,
* initAttribute: Function,
* destroyAttribute: Function,
* handleLevelRemove: Function,
* deletedOriginAttributes: Function,
* setDeletedOriginAttributes: Function,
* findAndReplace: Function,
* moveUp: Function,
* moveDown: Function,
* gather: Function
* }}
*/
export default function useAttributes() {
  const [attributes, setAttributes] = useState({});
  const [deletedOriginAttributes, setDeletedOriginAttributes] = useState([]);

  /**
  * @param {number} formId
  * @param {number[]} initData
  * @returns {undefined}
  */
  function initAttribute(formId, initData = []) {
    setAttributes((prev) => {
      return { ...prev, [formId]: initData };
    });
  }

  /**
  * @param {number} formId
  * @returns {undefined}
  */
  function destroyAttribute(formId) {
    var newAttributes = { ...attributes };
    delete newAttributes[formId];
    setAttributes(newAttributes);
  }

  /**
  * @param {number} formId
  * @param {string} position
  * @returns {undefined}
  */
  function addAttribute(formId, position = null) {
    let path;
    var id = formUID();
    var newAttributes = { ...attributes };
    var target = newAttributes[formId];

    if (position) {
      var atrPath = position.split('_');
      var targetChild = deepFind(target, atrPath);

      path = `${position}_${targetChild.children.length}`;
      targetChild.children.push({ id, path, name: '', children: [] });
    }
    else {
      path = String(target.length);
      target.push({ id, path, name: '', children: [] });
    }

    setAttributes(newAttributes);
  }

  /**
  * @param {number} formId
  * @param {string} position
  * @param {boolean} isChild
  * @returns {undefined}
  */
  function delAttribute(formId, position, isChild=false) {
    var newAttributes = { ...attributes };
    var target = newAttributes[formId];
    var path = position.split('_');

    var targetNode = isChild
      ? deepFind(target, path.slice(0, path.length - 1)).children
      : target;

    targetNode.splice(path[path.length - 1], 1);

    refreshPath(targetNode, null, Number(path[path.length - 1]));
    setAttributes(newAttributes);
  }

  /**
  * @param {number} formId
  * @param {number} levelIndex
  * @returns {undefined}
  */
  function handleLevelRemove(formId, levelIndex) {
    var newAttributes = { ...attributes };
    var target = newAttributes[formId];

    spreadChildren(target).forEach((el) => {
      if (el.path.split('_').length === levelIndex) el.children.splice(0);
    });
    setAttributes(newAttributes);
  }

  /**
  * @param {number} formId
  * @param {object} target
  * @param {string} target.value
  * @param {string} position
  * @param {boolean} isChild
  * @returns {undefined}
  */
  function handleChange(formId, { value }, position, isChild=false) {
    setAttributes((prevAttributes) => {
      var newAttributes = { ...prevAttributes };
      var path = position.split('_');
      var target = isChild
        ? deepFind(newAttributes[formId], path)
        : newAttributes[formId][path[0]];

      target.name = value;
      return newAttributes;
    });
  }

  /**
  * @param {string} replaceTo
  * @param {string} replaceWith
  * @returns {undefined}
  */
  function findAndReplace(replaceTo="", replaceWith="") {
    var newAttributes = { ...attributes };

    Object.values(newAttributes).forEach((items) => {
      traverseWithReplace(items, "name", replaceTo, replaceWith, false);
    });

    setAttributes(newAttributes);
  }

  /**
  * @param {number} formId
  * @param {string} position
  * @param {number} index
  * @returns {undefined}
  */
  function moveUp(formId, position, index)  {
    if (index <= 0) return;

    var newAttributes = { ...attributes };
    var target = newAttributes[formId];
    var path = position.split('_');

    var targetNode = path.length > 1
      ? deepFind(target, path.slice(0, path.length - 1)).children
      : target;

    var temp = targetNode[index - 1];
    targetNode[index - 1] = targetNode[index];
    targetNode[index] = temp;

    refreshPath(targetNode, null, index - 1);

    setAttributes(newAttributes);
  }

  /**
  * @param {number} formId
  * @param {string} position
  * @param {number} index
  * @returns {undefined}
  */
  function moveDown(formId, position, index)  {
    var newAttributes = { ...attributes };
    var target = newAttributes[formId];
    var path = position.split('_');

    var targetNode = path.length > 1
      ? deepFind(target, path.slice(0, path.length - 1)).children
      : target;

    if (index >= targetNode.length - 1) return;

    var temp = targetNode[index + 1];
    targetNode[index + 1] = targetNode[index];
    targetNode[index] = temp;

    refreshPath(targetNode, null, index);

    setAttributes(newAttributes);
  }

  /**
  * @param {number} formID
  * @returns {object}
  */
  function gather(formID) {
    var target = attributes[formID];
    drawPaths(target);
    return target;
  }

  return {
    attributes,
    addAttribute,
    delAttribute,
    handleChange,
    initAttribute,
    destroyAttribute,
    handleLevelRemove,
    deletedOriginAttributes,
    setDeletedOriginAttributes,
    findAndReplace,
    moveUp,
    moveDown,
    gather
  };
}

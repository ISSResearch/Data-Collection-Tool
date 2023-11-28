import { useState } from 'react';
import {
  deepFind,
  refreshPath,
  formUID,
  spreadChildren,
  traverseWithReplace,
  drawPaths
} from '../utils/';

export default function useAttributes() {
  const [attributes, setAttributes] = useState({});
  const [deletedOriginAttributes, setDeletedOriginAttributes] = useState([]);

  function initAttribute(formId, initData = []) {
    setAttributes((prev) => {
      return { ...prev, [formId]: initData }
    });
  }

  function destroyAttribute(formId) {
    const newAttributes = { ...attributes };
    delete newAttributes[formId];
    setAttributes(newAttributes);
  }

  function addAttribute(formId, position = null) {
    let path;
    const id = formUID();
    const newAttributes = { ...attributes };
    const target = newAttributes[formId];
    if (position) {
      const atrPath = position.split('_');
      const targetChild = deepFind(target, atrPath);
      path = `${position}_${targetChild.children.length}`;
      targetChild.children.push({ id, path, name: '', children: [] });
    }
    else {
      path = String(target.length);
      target.push({ id, path, name: '', children: [] });
    }
    setAttributes(newAttributes);
  }

  function delAttribute(formId, position, isChild) {
    const newAttributes = { ...attributes };
    const target = newAttributes[formId];
    const path = position.split('_');
    const targetNode = isChild
      ? deepFind(target, path.slice(0, path.length - 1)).children
      : target;
    targetNode.splice(path[path.length - 1], 1);
    refreshPath(targetNode, null, path[path.length - 1]);
    setAttributes(newAttributes);
  }

  function handleLevelRemove(formId, levelIndex) {
    const newAttributes = { ...attributes };
    const target = newAttributes[formId];
    spreadChildren(target).forEach(el => {
      if (el.path.split('_').length === levelIndex) el.children.splice(0);
    });
    setAttributes(newAttributes);
  }

  function handleChange(formId, { value }, position, isChild) {
    setAttributes((prevAttributes) => {
      const newAttributes = { ...prevAttributes };
      const path = position.split('_');
      const target = isChild
        ? deepFind(newAttributes[formId], path)
        : newAttributes[formId][path[0]];
      target.name = value;
      return newAttributes;
    });
  }

  function findAndReplace(replaceTo="", replaceWith="") {
    const newAttributes = { ...attributes };

    Object.values(newAttributes).forEach(items => {
      traverseWithReplace(items, "name", replaceTo, replaceWith, false);
    });

    setAttributes(newAttributes);
  }

  function moveUp(formId, path, index)  {
    if (index <= 0) return;

    var newAttributes = { ...attributes };
    var target = newAttributes[formId];
    var path = path.split('_');

    var targetNode = path.length > 1
      ? deepFind(target, path.slice(0, path.length - 1)).children
      : target;

    var temp = targetNode[index - 1];
    targetNode[index - 1] = targetNode[index];
    targetNode[index] = temp;

    refreshPath(targetNode, null, index - 1);

    setAttributes(newAttributes);
  }

  function moveDown(formId, path, index)  {
    var newAttributes = { ...attributes };
    var target = newAttributes[formId];
    var path = path.split('_');

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
  }
}

import { useState, useCallback } from 'react';
import { deepFind, refreshPath, formUID, spreadChildren } from '../utils/';

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

  const handleChange = useCallback((formId, { value }, position, isChild) => {
    setAttributes((prevAttributes) => {
      const newAttributes = { ...prevAttributes };
      const path = position.split('_');
      const target = isChild
        ? deepFind(newAttributes[formId], path)
        : newAttributes[formId][path[0]];
      target.name = value;
      return newAttributes;
    });
  }, []);

  return {
    attributes,
    addAttribute,
    delAttribute,
    handleChange,
    initAttribute,
    destroyAttribute,
    handleLevelRemove,
    deletedOriginAttributes,
    setDeletedOriginAttributes
  }
}

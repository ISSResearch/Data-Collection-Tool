import { useState } from "react";
import { deepCopy, refreshPath, formUID } from "../utils/utils";
import useAttributes from "./attributes";
import useLevels from "./levels";

export default function useAttributeManager() {
  const [forms, setForms] = useState({});
  const levelHook = useLevels();
  const attributeHook = useAttributes();

  function addForm(data) {
    const formId = formUID();
    setForms((prev) => {
      return { ...prev, [formId]: { levels: null, attributes: null } }
    });
    levelHook.initLevel(formId, data?.levels || []);
    attributeHook.initAttribute(formId, data?.attributes || []);
  }

  function deleteForm(formId) {
    const newForms = {...forms};
    delete newForms[formId];
    levelHook.destroyLevel(formId);
    attributeHook.destroyAttribute(formId);
    setForms(newForms);
  }

  function clearForms() { setForms({}); }

  function gatherAttributes(initLen=0) {
    return Object.keys(forms).map((key, index) => {
      const preparedLevels = levelHook.levels[key].map(el => {
        el.order = index + initLen;
        return el;
      })
      return {
        levels: preparedLevels,
        attributes: attributeHook.attributes[key],
      }
    });
  }

  function boundAttributes(boundAttributes) {
    const preparedData = deepCopy(boundAttributes).reduce((acc, item) => {
      const boundForm = { levels: [], attributes: [] };
      const attributes = [];
      const levelStack = [item];

      while (levelStack.length) {
        const level = levelStack.pop();
        level.orig = true;
        boundForm.levels.push(level);
        if (level.children?.length) levelStack.push(level.children[0]);
        if (level.attributes) attributes.push(...level.attributes);
      }

      attributes.forEach(el => {
        el.orig = true;
        if (!el.children) el.children = [];
        const parent = attributes.find(({id}) => el.parent === id);
        if (parent) parent.children ? parent.children.push(el) : parent.children = [el];
      });

      boundForm.attributes = attributes.filter(({parent}) => !parent);
      boundForm.attributes.forEach((item, index) => item.path = String(index));
      refreshPath(boundForm.attributes);

      return [...acc, boundForm];
    }, []);

    preparedData.forEach(item => addForm(item));
  }

  return {
    formHook: {
      forms,
      addForm,
      deleteForm,
      gatherAttributes,
      clearForms,
      boundAttributes
    },
    levelHook,
    attributeHook,
  };
}

import { useState } from "react";
import { deepCopy, refreshPath, formUID } from "../utils/";
import useAttributes from "./attributes";
import useLevels from "./levels";

/**
* @returns {{ formHook: object, levelHook: object, attributeHook: object }}
*/
export default function useAttributeManager() {
  const [forms, setForms] = useState({});
  const levelHook = useLevels();
  const attributeHook = useAttributes();

  /**
  * @param {{levels?: object, attributes?: object}} data
  * @returns {void}
  */
  function addForm(data) {
    var formId = formUID();
    setForms((prev) => {
      return { ...prev, [formId]: { levels: null, attributes: null } };
    });
    levelHook.initLevel(formId, data?.levels || []);
    attributeHook.initAttribute(formId, data?.attributes || []);
  }

  /**
  * @param {number} formId
  * @returns {void}
  */
  function deleteForm(formId) {
    const newForms = { ...forms };
    delete newForms[formId];
    levelHook.destroyLevel(formId);
    attributeHook.destroyAttribute(formId);
    setForms(newForms);
  }

  /**
  * @returns {void}
  */
  function clearForms() { setForms({}); }

  /**
  * @param {number} initLen
  * @returns {{levels: object[], attributes: object[]}[]}
  */
  function gatherAttributes(initLen = 0) {
    return Object.keys(forms).map((key, index) => {
      const preparedLevels = levelHook.levels[key].map((el) => {
        el.order = index + initLen;
        return el;
      });
      return {
        levels: preparedLevels,
        attributes: attributeHook.gather(key),
      };
    });
  }

  /**
  * @param {object[]} boundAttributes
  * @returns {void}
  */
  function boundAttributes(boundAttributes) {
    const preparedData = deepCopy(boundAttributes).reduce((acc, item) => {
      const boundForm = { levels: [], attributes: [] };
      const attributes = [];
      const levelStack = [item];

      while (levelStack.length) {
        var level = levelStack.pop();
        level.orig = true;
        boundForm.levels.push(level);
        if (level.children?.length) levelStack.push(level.children[0]);
        if (level.attributes) attributes.push(...level.attributes);
      }

      attributes.forEach((el) => {
        el.orig = true;
        if (!el.children) el.children = [];
        var parent = attributes.find(({ id }) => el.parent === id);
        if (parent) parent.children ? parent.children.push(el) : parent.children = [el];
      });

      boundForm.attributes = attributes.filter(({ parent }) => !parent);
      boundForm.attributes.forEach((item, index) => item.path = String(index));
      refreshPath(boundForm.attributes);

      return [...acc, boundForm];
    }, []);

    preparedData.forEach((item) => addForm(item));
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

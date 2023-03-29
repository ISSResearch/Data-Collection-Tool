import { useState } from "react";
import useAttributes from "./attributes";
import useLevels from "./levels";

export default function useAttributeManager() {
  const [forms, setForms] = useState({});
  const levelHook = useLevels();
  const attributeHook = useAttributes();

  function addForm() {
    const formId = Date.now();
    setForms({ ...forms, [formId]: { levels: null, attributes: null} });
    levelHook.initLevel(formId);
    attributeHook.initAttribute(formId);
  }

  function deleteForm(formId) {
    const newForms = {...forms};
    delete newForms[formId];
    levelHook.destroyLevel(formId);
    attributeHook.destroyAttribute(formId);
    setForms(newForms);
  }

  function gatherAttributes() {
    return Object.keys(forms).map( key => {
      return {
        levels: levelHook.levels[key],
        attributes: attributeHook.attributes[key],
      }
    })
  }

  return {
    formHook: { forms, addForm, deleteForm, gatherAttributes },
    levelHook,
    attributeHook
  };
}

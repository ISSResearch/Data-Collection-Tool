import { useState } from "react";
import Selector from "./Selector";
import AttributeCardSelector from "./AttributeCardSelector";
import '../../../styles/components/common/ui/selectgroup.css';

export default function SelectGroup({
  attributes,
  isFiles,
  handleApply,
  applyOptions,
  attributeFile,
  fileIndex,
  addAdditional,
}) {
  const [selectedOptions, setSelected] = useState({});

  function setOption(option, selectorIndex) {
    const newOptions = { ...selectedOptions };
    const [, , index] = option;
    const selectorSet = newOptions[selectorIndex]?.map(el => el) || [];
    if (index < selectorSet.length) selectorSet.splice(index, selectorSet.length);
    selectorSet.push(option);
    newOptions[selectorIndex] = selectorSet;
    setSelected(newOptions);
  }

  return (
    <fieldset
      className={
        `iss__filesUpload__attributes ${addAdditional ? 'style--min' : ''}`
      }
    >
      {attributes?.map((attribute, index) => (
        <div key={attribute.id} className='iss__filesUpload__selectWrapper'>
          <Selector
            selectorIndex={index}
            item={attribute}
            setOption={setOption}
            applyOptions={applyOptions && applyOptions[index]}
            attributeFile={attributeFile}
            fileIndex={fileIndex}
          />
        </div>
      ))}
      {fileIndex !== undefined &&
        <AttributeCardSelector
          attributes={attributes}
          fileIndex={fileIndex}
          addAdditional={addAdditional}
        />}
      {handleApply &&
        <button
          type="button"
          onClick={() => handleApply(selectedOptions) }
          className={
            `iss__filesUpload__button ${!isFiles ? 'button--disabled' : ''}`
          }
        >apply to all</button>}
    </fieldset>
  );
}
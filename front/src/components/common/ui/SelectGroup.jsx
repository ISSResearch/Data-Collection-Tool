import { useState } from "react";
import Selector from "./Selector";
import '../../../styles/components/common/ui/selectgroup.css';

export default function SelectGroup({
  attributes,
  handleApply,
  applyOptions,
  attributeFile,
  fileIndex,
  minStyle,
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
        `iss__filesUpload__attributes ${minStyle ? 'style--min' : ''}`
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
      {handleApply &&
        <button
          type="button"
          onClick={() => handleApply(selectedOptions) }
          className="iss__filesUpload__button"
        >apply to all</button>}
    </fieldset>
  );
}
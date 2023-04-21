import { useEffect, useState } from "react";
import Selector from "./Selector";
import { deepCopy } from "../../../utils/utils";
import '../../../styles/components/common/ui/selectgroup.css';

export default function SelectGroup({
  attributes,
  isFiles,
  handleApply,
  applyGroups,
  fileIndex,
  setAttributeGroups,
}) {
  const [groups, setGroups] = useState({});

  function addGroup() {
    const newGroups = {...groups}
    newGroups[Date.now()] = [];
    setGroups(newGroups);
  }

  function deleteGroup(key) {
    const newGroups = {...groups};
    delete newGroups[key]
    setGroups(newGroups);
    if (setAttributeGroups) setAttributeGroups({
      fileIndex, selectorKey: key, del: true
    });
  }

  function setOption({ selectorKey, id, index }, selInd) {
    const target = groups[selectorKey];
    if (!target[selInd]) target[selInd] = [];
    target[selInd].splice(index, target.length);
    if (id) target[selInd].push(id);
    if (setAttributeGroups) setAttributeGroups({
      fileIndex, ids: target[selInd], selectorKey, selInd
    });
  };

  useEffect(() => {
    if (Object.keys(applyGroups || {}).length) {
      setGroups(deepCopy(applyGroups));
      if (setAttributeGroups) setAttributeGroups({
        fileIndex, ids: applyGroups, set: true
      });
    }
    else setGroups({[Date.now()]: []});
  }, [applyGroups]);

  return (
    <fieldset
      className={
        `iss__selectGroup ${setAttributeGroups ? 'style--min' : ''}`
      }
    >
      <button
        onClick={addGroup}
        type='button'
        className='iss__selectGroup__button add--group'
      >+ add attribute group</button>
      {Object.entries(groups).map(([key, data]) => (
        <div key={key} className='iss__selectGroup__selectWrapper'>
          {attributes?.map((attribute, index) => (
            <Selector
              key={attribute.id}
              item={attribute}
              fileIndex={fileIndex}
              setOption={(data) => setOption(data, index)}
              applyGroups={applyGroups && data[index]}
              selectorKey={key}
            />
          ))}
          <button
            onClick={() => deleteGroup(key)}
            type='button'
            className='iss__selectGroup__button del--group'
          >- delete attributes</button>
        </div>
      ))}
      {handleApply &&
        <button
          type="button"
          onClick={() => handleApply(groups)}
          className={
            `iss__selectGroup__button ${!isFiles ? 'button--disabled' : ''}`
          }
        >apply to all</button>}
    </fieldset>
  );
}
import { useEffect, useState } from "react";
import { deepCopy, formUID } from "../../../utils/utils";
import Selector from "./Selector";
import '../../../styles/components/common/ui/selectgroup.css';

export default function SelectGroup({
  attributes,
  isFiles,
  handleApply,
  applyGroups,
  fileID,
  setAttributeGroups,
}) {
  const [groups, setGroups] = useState({});

  function addGroup() {
    const newGroups = {...groups}
    newGroups[formUID()] = [];
    setGroups(newGroups);
  }

  function deleteGroup(key) {
    const newGroups = {...groups};
    delete newGroups[key]
    setGroups(newGroups);
    if (setAttributeGroups) setAttributeGroups({
      fileID, selectorKey: key, del: true
    });
  }

  function setOption({ selectorKey, id, index }, selInd) {
    const target = groups[selectorKey];
    if (!target[selInd]) target[selInd] = [];
    target[selInd].splice(index);
    if (Array.isArray(id)) target[selInd].push(...id);
    else if (id) target[selInd].push(id);
    if (setAttributeGroups) setAttributeGroups({
      fileID, ids: target[selInd], selectorKey, selInd
    });
  };

  useEffect(() => {
    if (Object.keys(applyGroups || {}).length) {
      const newGroups = deepCopy(applyGroups);
      setGroups(newGroups);
      if (setAttributeGroups) setAttributeGroups({
        fileID, ids: newGroups, set: true
      });
    }
    else setGroups({[formUID()]: []});
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
      >add object</button>
      {
        Object.entries(groups).map(([key, data]) => (
          <div key={key} className='iss__selectGroup__selectWrapper'>
            {
              attributes?.map((attribute, index) => (
                <Selector
                  key={attribute.id}
                  item={attribute}
                  fileID={fileID}
                  setOption={(data) => setOption(data, index)}
                  applyGroups={applyGroups && data[index]}
                  selectorKey={key}
                />
              ))
            }
            <button
              onClick={() => deleteGroup(key)}
              type='button'
              className='iss__selectGroup__button del--group'
            >delete</button>
          </div>
        ))
      }
      {
        handleApply &&
        <button
          type="button"
          onClick={() => handleApply(groups)}
          className={
            `iss__selectGroup__button ${!isFiles ? 'button--disabled' : ''}`
          }
        >apply to all</button>
      }
    </fieldset>
  );
}
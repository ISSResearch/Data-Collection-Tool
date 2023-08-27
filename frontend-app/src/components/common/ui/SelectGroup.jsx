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
    const newGroups = { ...groups };
    newGroups[formUID()] = {};
    setGroups(newGroups);
  }

  function deleteGroup(selectorKey) {
    const newGroups = { ...groups };
    delete newGroups[selectorKey];
    setGroups(newGroups);
    if (setAttributeGroups) setAttributeGroups({ fileID, selectorKey, del: true });
  }

  function copyGroup(selectorKey) {
    const newGroups = { ...groups };
    const copyData = deepCopy(newGroups[selectorKey]);
    newGroups[formUID()] = copyData;
    setGroups(newGroups);
    if (setAttributeGroups) setAttributeGroups({
      fileID, ids: newGroups, set: true
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
    else setGroups({ [formUID()]: {} });
  }, [applyGroups]);

  return (
    <fieldset
      className={
        `iss__selectGroup${setAttributeGroups ? ' style--min' : ''}`
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
                  setOption={(data) => setOption(data, index)}
                  applyGroups={applyGroups && data[index]}
                  selectorKey={key}
                />
              ))
            }
            {
              !handleApply &&
              <button
                onClick={() => copyGroup(key)}
                type="button"
                className="iss__selectGroup__button cop--group"
              >copy group</button>
            }
            <button
              onClick={() => deleteGroup(key)}
              type='button'
              className='iss__selectGroup__button del--group'
            >delete group</button>
          </div>
        ))
      }
      {
        handleApply &&
        <button
          type="button"
          onClick={() => handleApply(groups)}
          className={
            `iss__selectGroup__button${!isFiles ? ' button--disabled' : ''}`
          }
        >apply to all</button>
      }
    </fieldset>
  );
}

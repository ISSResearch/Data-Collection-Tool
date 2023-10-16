import { useState } from "react";
import { SelectorWrap } from "../SelectorWrap";
import { deepCopy, formUID } from "../../../utils/";
import './styles.css';

export function SelectorGroup({ attributes, isFiles, handleApply, attributeGroups }) {
  const [groups, setGroups] = attributeGroups || useState({});

  function addGroup() {
    setGroups(prev => {
      return { ...prev, [formUID()]: {} }
    });
  }

  function deleteGroup(selectorKey) {
    setGroups(prev => {
      delete prev[selectorKey];
      return { ...prev };
    });
  }

  function copyGroup(selectorKey) {
    var newGroups = { ...groups };
    newGroups[formUID()] = deepCopy(newGroups[selectorKey]);
    setGroups(() => newGroups);
  }

  function setOption({ selectorKey, selected, index }, selInd) {
    setGroups(prev => {
      var newGroups = { ...prev };

      var target = newGroups[selectorKey];

      if (!target[selInd]) target[selInd] = [];

      target[selInd].splice(index);
      target[selInd].push(...selected);

      return newGroups
    });
  };

  return (
    <fieldset
      className={
        `iss__selectGroup${attributeGroups ? ' style--min' : ''}`
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
                <SelectorWrap
                  key={attribute.id}
                  item={attribute}
                  onChange={data => setOption(data, index)}
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

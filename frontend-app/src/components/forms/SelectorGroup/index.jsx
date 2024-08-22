import { useState, ReactElement } from "react";
import { deepCopy, formUID } from "../../../utils/";
import SelectorWrap from "../../common/SelectorWrap";
import './styles.css';

/**
* @param {object} props
* @param {object[]} props.attributes
* @param {number} props.fileID
* @param {boolean} props.isFiles
* @param {Function} props.handleApply
* @param {object} props.attributeGroups
* @param {Function} props.handleGroupChange
* @returns {ReactElement}
*/
export default function SelectorGroup({
  attributes,
  fileID,
  isFiles,
  handleApply,
  attributeGroups,
  handleGroupChange
}) {
  const [groups, setGroups] = useState({ [formUID()]: {} });

  const addGroup = () => {
    if (handleGroupChange) handleGroupChange({ fileID, type: "add" });
    else setGroups((prev) => {
      return { ...prev, [formUID()]: {} };
    });
  };

  const deleteGroup = (key) => {
    if (handleGroupChange) handleGroupChange({ fileID, key, type: "delete" });
    else setGroups((prev) => {
      delete prev[key];
      return { ...prev };
    });
  };

  const copyGroup = (key) => {
    if (handleGroupChange) handleGroupChange({ fileID, key, type: "copy" });
    else setGroups((prev) => {
      return { ...prev, [formUID()]: deepCopy(prev[key]) };
    });
  };

  const setOption = (key, payload, selInd) => {
    if (handleGroupChange) handleGroupChange({
      fileID,
      key,
      payload: { ...payload, selInd },
      type: "set"
    });
    else setGroups((prev) => {
      var { selected, index } = payload;

      var newGroups = { ...prev };
      var target = newGroups[key];

      if (!target[selInd]) target[selInd] = selected;
      else {
        target[selInd].splice(index);
        target[selInd].push(...selected);
      }

      return newGroups;
    });
  };

  return (
    <fieldset className={`iss__selectGroup${fileID ? ' style--min' : ''}`}>
      <button
        onClick={addGroup}
        type='button'
        className='iss__selectGroup__button add--group'
      >add object</button>
      {
        Object.entries(fileID ? attributeGroups : groups).map(([key, data]) => (
          <div key={key} className='iss__selectGroup__selectWrapper'>
            {
              attributes?.map((attribute, index) => (
                <SelectorWrap
                  key={attribute.id}
                  item={attribute}
                  onChange={(data) => setOption(key, data, index)}
                  applyGroups={fileID && data[index]}
                />
              ))
            }
            {
              fileID &&
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

import { useState } from 'react';
import Selector from './Selector';
import '../../../styles/components/common/ui/attributecardselector.css';

export default function AttributeCardSelector({
  attributes,
  fileIndex,
  addAdditional
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
    addAdditional({selectorIndex: key, del: true});
  }

  function setOption({ selectorIndex, id, index }, selInd) {
    const target = groups[selectorIndex];
    if (!target[selInd]) target[selInd] = [];
    target[selInd].splice(index, target.length);
    if (id) target[selInd].push(id);
    addAdditional({ fileIndex, ids: target[selInd], selectorIndex, selInd });
  };

  return (
    <div className='iss__cardSelector'>
      <button
        onClick={addGroup}
        type='button'
        className='iss__cardSelector__button add--group'
      >v add attributes</button>
      {Object.entries(groups).map(([key, _]) => (
        <div key={key} className='iss__cardSelector__layer'>
          {attributes?.map((attribute, index) => (
            <Selector
              key={attribute.id}
              item={attribute}
              fileIndex={fileIndex}
              attributeFile={(data) => setOption(data, index)}
              selectorIndex={key}
            />
          ))}
          <button
            onClick={() => deleteGroup(key)}
            type='button'
            className='iss__cardSelector__button del--group'
          >delete attributes ^</button>
        </div>
      ))}
    </div>
  );
}

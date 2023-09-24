import { useEffect, useState } from 'react';
import SelectorItem from './SelectorItem';
import '../../../styles/components/common/ui/selector.css';

export default function Selector({ selectorKey, item, setOption, applyGroups }) {
  const [options, setOptions] = useState([item]);
  const [valueIds, setValuesIds] = useState([]);

  function handleSelect(selected, children, index) {
    const newOptions = [...options];
    if (Array.isArray(selected)) return setOption({ selectorKey, id: selected, index });
    const id = typeof selected === 'number' ? selected : Number(selected.value);
    const clear = !Boolean(id);
    newOptions.splice(index + 1);
    valueIds.splice(index);
    setValuesIds(prev => {
      const newValues = [...prev];
      if (id) newValues.push(id);
      return newValues;
    });
    if (!clear && children) {
      const option = { ...children[0] };
      option.attributes = option.attributes.filter(({ parent }) => parent === id);
      newOptions.push(option);
    }
    setOptions(newOptions);
    setOption({ selectorKey, id, index });
  }

  function addSelected(group) {
    setValuesIds(group);
    const newOptions = group.reduce((acc, id) => {
      const { children } = acc[acc.length - 1];
      if (!children) return acc;
      const option = { ...children[0] };
      option.attributes = option.attributes.filter(({ parent }) => parent === id);
      return [...acc, option];
    }, [item]);
    setOptions(newOptions);
  }

  useEffect(() => {
    if (applyGroups) addSelected(applyGroups);
    else setOptions([item]);
  }, [applyGroups]);

  return (
    <div className='iss__selectorsWrap'>
      {
        options.map(({ id, name, children, attributes, multiple }, index) => (
          <label key={`${id}_${index}`}>
            <span className='iss__selector__name'>{name}</span>
            {
              multiple
                ? <SelectorItem
                  selectorId={id}
                  selectorName={name}
                  selectorOptions={attributes}
                  handleSelect={(ids) => handleSelect(ids, children, index)}
                  defaultSelected={applyGroups.splice(index)}
                />
                : <select
                  onChange={({ target }) => handleSelect(target, children, index)}
                  className="iss__selector"
                  value={valueIds[index] || ''}
                >
                  <option value="clear">-not set-</option>
                  {
                    attributes?.map(({ name, id }) =>
                      <option key={id} value={id}>{name}</option>
                    )
                  }
                </select>
            }
          </label>
        ))
      }
    </div>
  );
}

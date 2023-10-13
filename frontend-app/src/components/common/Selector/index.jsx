import { useEffect, useState } from 'react';
import { MultiSelector } from "../ui/MultiSelector";
import "./styles.css";

export function Selector({ selectorKey, item, setOption, applyGroups }) {
  const [options, setOptions] = useState([]);
  const [valueIds, setValuesIds] = useState([]);

  function handleSelect(selected, children, index) {
    selected = Number(selected);
    var clear = !Boolean(selected);

    var newOptions = [...options];

    newOptions.splice(index + 1);
    valueIds.splice(index);

    setValuesIds(prev => {
      var newValues = [...prev];
      if (selected) newValues.push(selected);
      return newValues;
    });

    if (!clear && children) {
      const option = { ...children[0] };
      option.attributes = option.attributes.filter(({ parent }) => parent === selected);
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
                ? <MultiSelector
                  selectorLabel={name}
                  selectorOptions={attributes}
                  onChange={ids => setOption({ selectorKey, id: ids, index })}
                  defaultSelected={applyGroups?.splice(index)}
                />
                : <select
                  onChange={({ target }) => handleSelect(target.value, children, index)}
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

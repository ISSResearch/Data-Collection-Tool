import { useEffect, useState } from 'react';
import MultiSelector from '../../ui/MultiSelector';
import "./styles.css";

export default function SelectorWrap({ item, onChange, applyGroups }) {
  const [options, setOptions] = useState([]);
  const [valueIds, setValuesIds] = useState([]);

  function handleSelect(selected, children, index) {
    selected = Number(selected);

    var clear = !selected;
    var newOptions = [...options];

    newOptions.splice(index + 1);

    setValuesIds((prev) => {
      var newValues = [...prev];
      newValues.splice(index);
      if (!clear) newValues.push(selected);
      return newValues;
    });

    if (!clear && children) {
      var option = { ...children[0] };
      option.attributes = option.attributes.filter(({ parent }) => parent === selected);
      newOptions.push(option);
    }

    setOptions(newOptions);
    onChange({ selected: !clear ? [selected] : [], index });
  }

  function addSelected(group) {
    setValuesIds(group);

    var newOptions = group.reduce((acc, id) => {
      var { children } = acc[acc.length - 1];
      if (!children) return acc;

      var option = { ...children[0] };
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
    <div className='iss__selectorWrap'>
      {
        options.map(({ id, name, children, attributes, multiple }, index) => (
          <label key={`${id}_${index}`}>
            <span className='iss__selector__name'>{name}</span>
            {
              multiple
                ? <MultiSelector
                  selectorLabel={name}
                  selectorOptions={attributes}
                  onChange={(selected) => onChange({ selected, index })}
                  defaultSelected={applyGroups?.slice(index)}
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

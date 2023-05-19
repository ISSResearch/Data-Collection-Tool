import { useEffect, useState } from 'react';
import SelectorItem from './SelectorItem';
import '../../../styles/components/common/ui/selector.css';

export default function Selector({
  selectorKey,
  item,
  setOption,
  applyGroups,
  fileIndex,
}) {
  const [options, setOptions] = useState([item]);

  function handleSelect(selected, children, index) {
    const newOptions = [...options];
    if (Array.isArray(selected)) return setOption({ selectorKey, id: selected, index });
    const id = typeof selected === 'number' ? selected : Number(selected.value);
    const clear = !Boolean(id);
    newOptions.splice(index+1, newOptions.length);
    if (!clear && children) {
      const [child] = children;
      const option = { ...child };
      option.attributes = option.attributes.filter(({parent}) => parent === id);
      newOptions.push(option);
    }
    setOptions(newOptions);
    setOption({ selectorKey, id, index });
  }

  function addSelected(group) {
     const newOptions = group.reduce((acc, id) => {
      const { children } = acc[acc.length-1];
      if (!children) return acc;
      const [child] = children;
      const option = {...child};
      option.attributes = option.attributes.filter(({parent}) => parent === id);
      return [...acc, option];
    }, [item]);
    setOptions(newOptions);
  }

  useEffect(() => {
    if (applyGroups) addSelected(applyGroups);
    else setOptions([item]);
  }, [applyGroups, fileIndex]);

  // <SelectorItem
  //           key={`${id}_${fileIndex}`}
  //           id={id}
  //           name={name}
  //           attributes={attributes}
  //           handleSelect={(ids) => handleSelect(ids, children, index)}
  //         />
  return (
    <div className='iss__selectorsWrap'>
      {
        options.map(({ id, name, children, attributes }, index) => (
          <select
            key={`${id}_${fileIndex}`}
            onChange={({target}) => handleSelect(target, children, index)}
            className="iss__selector"
            defaultValue={applyGroups && applyGroups[index]}
          >
            <option value="clear">--{name}--</option>
            {attributes?.map(({name, id}) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        ))
      }
    </div>
  );
}
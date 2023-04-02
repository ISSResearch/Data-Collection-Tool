import { useEffect, useState } from 'react';
import { deepCopy } from '../../../utils/utils';
import '../../../styles/components/common/ui/selector.css';

export default function Selector({
  selectorIndex,
  item,
  setOption,
  applyOptions,
  attributeFile,
  fileIndex,
}) {
  const [options, setOptions] = useState([item]);

  function handleSelect(selected, children, index) {
    const newOptions = deepCopy(options);
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
    attributeFile
      ? attributeFile({fileIndex, selectorIndex, value: clear ? index : id, clear})
      : setOption([id, children, index], selectorIndex);
  }

  const isSelected = (index, id) => {
    return applyOptions && applyOptions[index] && applyOptions[index][0] === id
  }

  function addSelected(options) {
    const newOptions = options.reduce((acc, [id, children]) => {
      // TODO: proper check
      // if (!children || id === item.id) return acc;
      if (!children) return acc;
      const [child] = children;
      const option = {...child};
      option.attributes = option.attributes.filter(({parent}) => parent === id);
      return [...acc, option];
    }, [item]);
    // const newLevelsIds = newOptions.map(({id}) => id);
    // const newIds = options.map(([id]) => id).filter(id => !newLevelsIds.includes(id));
    const newIds = options.reduce((acc, [id]) => id ? [...acc, id] : acc, []);
    if (attributeFile) attributeFile({fileIndex, selectorIndex, isNew: newIds});
    setOptions(newOptions);
  }

  useEffect(() => {
    if (applyOptions) addSelected(applyOptions);
  }, [applyOptions]);

  return (
    <>
      {
        options.map(({ id, name, children, attributes }, index) => (
          <select
            key={id}
            onChange={({target}) => handleSelect(target, children, index)}
            className="iss__selector"
          >
            <option value="clear">--{name}--</option>
            {/* TODO resolve selected problem */}
            {attributes?.map(({name, id}) => (
              <option
                key={id}
                value={id}
                selected={isSelected(index, id)}
              >{name}</option>
            ))}
          </select>
        ))
      }
    </>
  );
}

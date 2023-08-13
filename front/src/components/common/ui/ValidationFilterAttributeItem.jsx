import { useEffect, useState } from 'react';
import Selector from './Selector';
import '../../../styles/components/common/ui/selectoritem.css';
import { spreadChildren } from '../../../utils/utils';

export default function ValidationFilterSelectorItem({
  selectorName,
  data,
  handleChange,
  defaultSelected,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [selectors, setSelectors] = useState({});

  function resetSelector() {
    handleChange(selectorName, []);
    setIsOpen(false);
  }

  function setOption({ id, index }, selInd) {
    const target = selectors[selInd] || [];
    target.splice(index);
    if (Array.isArray(id)) target.push(...id);
    else if (id) target.push(id);
    setSelectors({...selectors, [selInd]: target});
  };


  function handleManualSelect(event) {
    event.preventDefault();
    const selectorData = Object.values(selectors).reduce((acc, item) => {
      return [...acc, ...item];
    }, [])
    handleChange(selectorName, selectorData);
    setIsOpen(false);
  }

  useEffect(() => {
    const attributes = spreadChildren(data, false).reduce((acc, { attributes }) => {
      return [...acc, ...attributes];
    }, []);
    const defaultNames = defaultSelected.reduce((acc, id) => {
      const attribute = attributes.find(({ id: attrId }) => attrId === Number(id));
      if (attribute) acc.push(attribute.name);
      return acc;
    }, []);
    setSelected(defaultNames);
  }, [defaultSelected]);

  return (
    <div className='iss__customSelector'>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className='iss__customSelector__selected'
      >
        {
          selected.length
            ? <>{ selected.map(name => <span key={name}>{name}</span>) }</>
            : <span className='off--title'>-not set-</span>
        }
        <svg width="12" height="6" viewBox="0 0 14 8">
          <path d="M12.9199 0.796875L12.3633 0.210938C12.2168 0.0644531 11.9824 0.0644531 11.8652 0.210938L6.5625 5.51367L1.23047 0.210938C1.11328 0.0644531 0.878906 0.0644531 0.732422 0.210938L0.175781 0.796875C0.0292969 0.914062 0.0292969 1.14844 0.175781 1.29492L6.29883 7.41797C6.44531 7.56445 6.65039 7.56445 6.79688 7.41797L12.9199 1.29492C13.0664 1.14844 13.0664 0.914062 12.9199 0.796875Z" />
        </svg>
      </div>
      <div
        className={
          `iss__customSelector__options${isOpen ? ' options--open' : ''}`
        }
      >
        <form onSubmit={event => handleManualSelect(event)} className='iss__validationFilter__form'>
          <label
            onClick={({target}) => resetSelector(target)}
            className='iss__customSelector__level'
          >clear {selectorName}</label>
          {
            data?.map((attribute, index) => (
              <Selector
                key={attribute.id}
                item={attribute}
                setOption={(data) => setOption(data, index)}
              />
            ))
          }
          <button className='iss__customSelector__submit'>ok</button>
        </form>
      </div>
    </div>
  );
}

// TODO: new component - test it
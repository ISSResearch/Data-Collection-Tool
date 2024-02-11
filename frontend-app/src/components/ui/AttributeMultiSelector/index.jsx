import { useEffect, useState } from 'react';
import { spreadChildren } from '../../../utils/';
import SelectorWrap from '../../common/SelectorWrap';
import "./styles.css";

export default function AttributeMultiSelector({ selectorName, data, onChange, defaultSelected, }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [selectors, setSelectors] = useState({});

  function resetSelector() {
    onChange(selectorName, []);
    setIsOpen(false);
  }

  function setOption({ selected, index }, selInd) {
    var target = selectors[selInd] || [];
    target.splice(index);
    target.push(...selected);
    setSelectors({ ...selectors, [selInd]: target });
  }

  function handleManualSelect(event) {
    event.preventDefault();
    var selectorData = Object.values(selectors)
      .reduce((acc, item) => [...acc, ...item], []);
    onChange(selectorName, selectorData);
    setIsOpen(false);
  }

  useEffect(() => {
    var attributes = spreadChildren(data, false)
      .reduce((acc, { attributes }) => [...acc, ...attributes], []);

    var defaultNames = defaultSelected.reduce((acc, id) => {
      var attribute = attributes
        .find(({ id: attrId }) => attrId === (Number(id) || id));
      if (attribute) acc.push(attribute.name);
      return acc;
    }, []);

    setSelected(defaultNames);
  }, [defaultSelected]);

  return (
    <div className='iss__filterSelector'>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className='iss__filterSelector__selected'
      >
        {
          selected.length
            ? <>
              {selected.map((name, index) => <span key={name + index}>{name}</span>)}
            </>
            : <span className='off--title'>-not set-</span>
        }
        <svg width="12" height="6" viewBox="0 0 14 8">
          <path d="M12.9199 0.796875L12.3633 0.210938C12.2168 0.0644531 11.9824 0.0644531 11.8652 0.210938L6.5625 5.51367L1.23047 0.210938C1.11328 0.0644531 0.878906 0.0644531 0.732422 0.210938L0.175781 0.796875C0.0292969 0.914062 0.0292969 1.14844 0.175781 1.29492L6.29883 7.41797C6.44531 7.56445 6.65039 7.56445 6.79688 7.41797L12.9199 1.29492C13.0664 1.14844 13.0664 0.914062 12.9199 0.796875Z" />
        </svg>
      </div>
      <div
        className={
          `iss__filterSelector__options${isOpen ? ' options--open' : ''}`
        }
      >
        <form onSubmit={(event) => handleManualSelect(event)} className='iss__validationFilter__form'>
          <label
            onClick={({ target }) => resetSelector(target)}
            className='iss__filterSelector__level'
          >clear {selectorName}</label>
          {
            data?.map((attribute, index) => (
              <SelectorWrap
                key={attribute.id}
                item={attribute}
                onChange={(data) => setOption(data, index)}
              />
            ))
          }
          <button className='iss__filterSelector__submit'>select</button>
        </form>
      </div>
    </div>
  );
}

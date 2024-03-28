import { useEffect, useState, ReactElement } from 'react';
import { spreadChildren } from '../../../utils/';
import SelectorWrap from '../../common/SelectorWrap';
import Arrow from "../Arrow";
import "./styles.css";

/**
* @param {object} props
* @param {string} props.selectorName
* @param {object[]} props.data
* @param {Function} props.onChange
* @param {number[]} [props.defaultSelected]
* @returns {ReactElement}
*/
export default function AttributeMultiSelector({ selectorName, data, onChange, defaultSelected }) {
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
    setSelected([1]);
    setIsOpen(false);
  }

  useEffect(() => {
    var attributes = spreadChildren(data, false)
      .reduce((acc, { attributes }) => [...acc, ...attributes], []);

    if (!defaultSelected) return;

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
              {
                defaultSelected
                ? <>{selected.map((name, index) => <span key={name + index}>{name}</span>)}</>
                : <span>some selected...</span>
              }
            </>
            : <span className='off--title'>-not set-</span>
        }
        <Arrow />
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

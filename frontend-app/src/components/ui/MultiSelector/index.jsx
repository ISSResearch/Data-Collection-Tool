import { ReactElement, useEffect, useState, useRef } from 'react';
import Arrow from "../Arrow";
import './styles.css';

/**
* @param {object} props
* @param {string} props.selectorLabel
* @param {object[]} props.selectorOptions
* @param {Function} props.onChange
* @param {number[]} props.defaultSelected
* @returns {ReactElement}
*/
export default function MultiSelector({
  selectorLabel,
  selectorOptions,
  onChange,
  defaultSelected,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const selector = useRef(null);

  function resetSelector() {
    Array.from(selector.current.selectedOptions)
      .forEach((opt) => opt.selected = false);

    setSelected([]);
    onChange([]);
  }

  function handleManualSelect(defaults = null) {
    setIsOpen(false);

    var selectedOptions = defaults
      ? defaults
      : Array
        .from(selector.current.selectedOptions)
        .map(({ value }) => Number(value) || value);

    setSelected(
      selectedOptions.reduce((acc, id) => {
        var attribute = selectorOptions
          .find(({ id: attrId }) => attrId === (Number(id) || id));
        if (attribute) acc.push(attribute.name);
        return acc;
      }, [])
    );

    if (!defaults) onChange([...selectedOptions]);
  }

  useEffect(() => {
    if (defaultSelected?.length) handleManualSelect(defaultSelected);
  }, [defaultSelected]);

  return (
    <div className='iss__manualSelector'>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className='iss__manualSelector__selected'
      >
        {
          selected.length
            ? <>
              {selected.map((name, index) => <span key={name + index}>{name}</span>)}
            </>
            : <span className='off--title'>-not set-</span>
        }
        <Arrow />
      </div>
      <div
        className={
          `iss__manualSelector__options${isOpen ? ' options--open' : ''}`
        }
      >
        <div>
          <label onClick={resetSelector} className='iss__manualSelector__level'>
            clear {selectorLabel}
          </label>
          <select multiple ref={selector} className='iss__manualSelector__selector'>
            {
              selectorOptions.map(({ name, id }) =>
                <option
                  key={id}
                  value={id}
                  className='iss__manualSelector__option'
                >{name}</option>
              )
            }
          </select>
          <button
            onClick={() => handleManualSelect()}
            type="button"
            className='iss__manualSelector__submit'
          >select</button>
        </div>
      </div>
    </div>
  );
}

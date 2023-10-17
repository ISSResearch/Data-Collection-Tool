import { useEffect, useState, useRef } from 'react';
import './styles.css';

export function MultiSelector({
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
      .forEach(opt => opt.selected = false);

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
    if (defaultSelected) handleManualSelect(defaultSelected);
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
        <svg width="12" height="6" viewBox="0 0 14 8">
          <path d="M12.9199 0.796875L12.3633 0.210938C12.2168 0.0644531 11.9824 0.0644531 11.8652 0.210938L6.5625 5.51367L1.23047 0.210938C1.11328 0.0644531 0.878906 0.0644531 0.732422 0.210938L0.175781 0.796875C0.0292969 0.914062 0.0292969 1.14844 0.175781 1.29492L6.29883 7.41797C6.44531 7.56445 6.65039 7.56445 6.79688 7.41797L12.9199 1.29492C13.0664 1.14844 13.0664 0.914062 12.9199 0.796875Z" />
        </svg>
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

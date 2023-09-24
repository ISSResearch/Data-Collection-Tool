import { useEffect, useState } from 'react';
import '../../../styles/components/common/ui/selectoritem.css';

export default function SelectorItem({
  selectorId,
  selectorName,
  selectorOptions,
  handleSelect,
  defaultSelected,
  isAlpha,
  manual
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState([]);

  function resetSelector({ htmlFor }) {
    const targetSelector = document.getElementById(htmlFor);
    Array.from(targetSelector.selectedOptions).forEach(opt => opt.selected = false);
    setSelected([]);
    handleSelect([]);
  }

  // TODO: move out
  function handleSelectChange(handleOptions, skipEmit = false) {
    // TODO: number is propably used due to income value - adapt them to strings to avoid different comparers
    const selectedIds = Array.isArray(handleOptions)
      ? handleOptions
      : Array.from(handleOptions.selectedOptions).map(({ value }) => {
        return isAlpha ? value : Number(value)
      });
    const chosenNames = selectedIds.map(selectedId => {
      return selectorOptions.find(({ id }) => {
        return id === (isAlpha ? selectedId : Number(selectedId));
      })?.name;
    });
    setSelected(chosenNames);
    if (!skipEmit) handleSelect(selectedIds);
  }

  function handleManualSelect() {
    const selector = document.getElementById(`selector--${selectorName}_${selectorId}`);
    handleSelectChange(selector);
    setIsOpen(false);
  }

  useEffect(() => {
    if (defaultSelected) handleSelectChange(defaultSelected, true);
  }, [defaultSelected]);

  return (
    <div className='iss__customSelector'>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className='iss__customSelector__selected'
      >
        {
          selected.length
            ? <>{selected.map(name => <span key={name}>{name}</span>)}</>
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
        <div>
          <label
            htmlFor={`selector--${selectorName}_${selectorId}`}
            onClick={({ target }) => resetSelector(target)}
            className='iss__customSelector__level'
          >clear {selectorName}</label>
          <select
            multiple
            id={`selector--${selectorName}_${selectorId}`}
            onChange={({ target }) => !manual && handleSelectChange(target)}
            className='iss__customSelector__selector'
          >
            {
              selectorOptions.map(({ name, id }) =>
                <option
                  key={id}
                  value={id}
                  className='iss__customSelector__option'
                >{name}</option>
              )
            }
          </select>
          {
            manual &&
            <button
              onClick={handleManualSelect}
              type="button"
              className='iss__customSelector__submit'
            >ok</button>
          }
        </div>
      </div>
    </div>
  );
}

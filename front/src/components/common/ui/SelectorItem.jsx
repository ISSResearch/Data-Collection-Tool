import { useState } from 'react';
import '../../../styles/components/common/ui/selectoritem.css';

export default function SelectorItem({
  id,
  name,
  attributes,
  handleSelect,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState([]);

  function resetSelector({ htmlFor }) {
    const targetSelector = document.getElementById(htmlFor);
    Array.from(targetSelector.selectedOptions).forEach(opt => opt.selected = false);
    setSelected([]);
    handleSelect([]);
    setSelected(false);
  }

  function handleSelectChange({ selectedOptions }) {
    const selectedIds = Array.from(selectedOptions).map(({ value }) => value);
    setSelected(selectedIds);
    handleSelect(selectedIds);
  }

  return (
    <div className='iss__customSelector'>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className='iss__customSelector__selected'
      >
        {selected.length
          ? <>{selected.map(name => <span key={name}>{name}</span>)}</>
          : <span className='off--title'>--{name}--</span>}
        <svg width="12" height="6" viewBox="0 0 14 8">
          <path d="M12.9199 0.796875L12.3633 0.210938C12.2168 0.0644531 11.9824 0.0644531 11.8652 0.210938L6.5625 5.51367L1.23047 0.210938C1.11328 0.0644531 0.878906 0.0644531 0.732422 0.210938L0.175781 0.796875C0.0292969 0.914062 0.0292969 1.14844 0.175781 1.29492L6.29883 7.41797C6.44531 7.56445 6.65039 7.56445 6.79688 7.41797L12.9199 1.29492C13.0664 1.14844 13.0664 0.914062 12.9199 0.796875Z" />
        </svg>
      </div>
      <div
        className={
          `iss__customSelector__options ${isOpen ? 'options--open' : ''}`
        }
      >
        <label
          htmlFor={`selector--${name}_${id}`}
          onClick={({target}) => resetSelector(target)}
          className='iss__customSelector__level'
        >clear --{name}--</label>
        <select
          multiple
          id={`selector--${name}_${id}`}
          onChange={({target}) => handleSelectChange(target)}
          className='iss__customSelector__selector'
        >
          {attributes.map(({ name, id }) =>
            <option
              key={id}
              value={id}
              className='iss__customSelector__option'
            >{name}</option>
          )}
        </select>
      </div>
    </div>
  );
}
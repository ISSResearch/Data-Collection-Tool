import { ReactElement, useEffect, useState } from 'react';
import './styles.css';

/**
* @param {object} props
* @param {Function} props.onChange
* @param {{ from: string, to: string }} [props.defaultSelected]
* @returns {ReactElement}
*/
export default function DateSelector({
  onChange,
  defaultSelected,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  function resetSelector() {
    setFrom("");
    setTo("");
    onChange({});
  }

  function handleManualSelect() {
    setIsOpen(false);
    onChange({ from, to });
  }

  function handleFrom({ target }) {
    var check = !to || new Date(target.value) < new Date(to);
    setFrom(check ? target.value : "");
  }

  function handleTo({ target }) {
    var check = !from ||  new Date(from) < new Date(target.value);
    setTo(check ? target.value : "");
  }

  useEffect(() => {
    if (defaultSelected) {
      var { from: _from, to: _to } = defaultSelected;
      _from && setFrom(_from);
      _to && setTo(_to);
    }
  }, [defaultSelected]);

  return (
    <div className='iss__dateSelector'>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className='iss__dateSelector__selected'
      >
        {
          (from || to)
          ? <span>{from || "..."} - {to || "..."}</span>
          : <span className='off--title'>-not set-</span>
        }
        <svg width="12" height="6" viewBox="0 0 14 8">
          <path d="M12.9199 0.796875L12.3633 0.210938C12.2168 0.0644531 11.9824 0.0644531 11.8652 0.210938L6.5625 5.51367L1.23047 0.210938C1.11328 0.0644531 0.878906 0.0644531 0.732422 0.210938L0.175781 0.796875C0.0292969 0.914062 0.0292969 1.14844 0.175781 1.29492L6.29883 7.41797C6.44531 7.56445 6.65039 7.56445 6.79688 7.41797L12.9199 1.29492C13.0664 1.14844 13.0664 0.914062 12.9199 0.796875Z" />
        </svg>
      </div>
      <div
        className={
          `iss__dateSelector__options${isOpen ? ' options--open' : ''}`
        }
      >
        <div>
          <label onClick={resetSelector} className='iss__dateSelector__level'>
            clear dates
          </label>
          <label className='iss__dateSelector__input'>
            <span>from</span>
            <input
              type="date"
              value={from}
              onChange={handleFrom}
              className="iss__dateSelector__selector"
            />
          </label>
          <label className='iss__dateSelector__input'>
            <span>to</span>
            <input
              type="date"
              value={to}
              onChange={handleTo}
              className="iss__dateSelector__selector"
            />
          </label>
          <button
            onClick={() => handleManualSelect()}
            type="button"
            className='iss__dateSelector__submit'
          >select</button>
        </div>
      </div>
    </div>
  );
}

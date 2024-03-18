import { ReactElement, useEffect, useState } from 'react';
import Arrow from "../Arrow";
import './styles.css';

/**
* @param {object} props
* @param {Function} props.onChange
* @param {{ from: string, to: string }} [props.defaultSelected]
* @returns {ReactElement}
*/
export default function DateSelector({ onChange, defaultSelected }) {
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
        <Arrow />
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

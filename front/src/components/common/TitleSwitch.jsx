import '../../styles/components/common/titleswitch.css';

export default function TitleSwitch({title, options, optionOne, handler}) {
  const [opt1, opt2] = options || [];
  function handleRadioChange({target}) { handler(target.value === 'opt1'); }

  return (
    <div className='iss__titleSwitch'>
      <h1 className="iss__titleSwitch__title">{title}</h1>
      <fieldset onChange={(handleRadioChange)} className='iss__titleSwitch__radio'>
        <label
          className={optionOne
            ? 'iss__titleSwitch__radioItem--active'
            : 'iss__titleSwitch__radioItem'
          }
        ><input type="radio" name="option" value="opt1"/>{opt1}</label>
        {opt2 &&
          <label
            className={!optionOne
              ? 'iss__titleSwitch__radioItem--active'
              : 'iss__titleSwitch__radioItem'
            }
          ><input type="radio" name="option" value="opt2"/>{opt2}</label>}
      </fieldset>
    </div>
  )
}

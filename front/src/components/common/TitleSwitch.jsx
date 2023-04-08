import '../../styles/components/common/titleswitch.css';

export default function TitleSwitch({title, options, currentOption, handler}) {

  return (
    <div className='iss__titleSwitch'>
      <h1 className="iss__titleSwitch__title">{title}</h1>
      <fieldset
        onChange={({target}) => handler(target.value)}
        className='iss__titleSwitch__radio'
      >
        {options.map(({name, value}) => (
          <label
            key={value}
            className={currentOption === value
              ? 'iss__titleSwitch__radioItem--active'
              : 'iss__titleSwitch__radioItem'
            }
          ><input type="radio" name="option" value={value}/>{name}</label>
        ))}
      </fieldset>
    </div>
  )
}

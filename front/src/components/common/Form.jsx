import { Link } from 'react-router-dom';
import '../../styles/components/common/form.css';

export default function Form({errors, callback, fields, buttonText, link}) {

  return (
    <div className='iss__formContainer'>
      {errors &&
        <p className='iss__formContainer__errors'>
          <b>Request failure:</b><br/>{errors}
        </p>}
      <form onSubmit={callback} methods="post" className="iss__form">
        {fields.map(({label, name, placeholder, type, required}) => (
          <label key={name} className='iss__input'>
            {label}
            <input
              type={type}
              name={name}
              required={required}
              placeholder={placeholder}
            />
          </label>
        ))}
        <button className='iss__formButton'>{buttonText}</button>
      </form>
      {link && <Link className="iss__regButton" to={link.to}>{link.text}</Link>}
    </div>
  );
}

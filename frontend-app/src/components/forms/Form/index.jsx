import { Link } from 'react-router-dom';
import Load from "../../ui/Load";
import './styles.css';

export default function Form({ errors, callback, fields, loading, link }) {
  return (
    <div className='iss__formContainer'>
      {
        errors &&
          <p className='iss__formContainer__errors'>
            <b>Request failure:</b><br/>{errors}
          </p>
      }
      <form onSubmit={callback} method="post" className="iss__form">
        {
          fields.map(({ label, name, placeholder, type, required }) => (
            <label key={name} className='iss__input'>
              {label}
              <input
                type={type}
                name={name}
                required={required}
                placeholder={placeholder}
              />
            </label>
          ))
        }
        {
          loading
            ? <Load isInline/>
            : <button className='iss__formButton'>submit</button>
        }
      </form>
      { link && <Link className="iss__regButton" to={link.to}>{link.text}</Link> }
    </div>
  );
}

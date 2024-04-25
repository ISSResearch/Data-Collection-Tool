import { ReactElement, useId } from "react";
import Load from "../../ui/Load";
import './styles.css';

/**
* @param {object} props
* @param {string} props.errors
* @param {Function} props.callback
* @param {object[]} props.fields
* @param {boolean} props.loading
* @returns {ReactElement}
*/
export default function Form({ errors, callback, fields, loading }) {
  const handleVisibility = ({ type, target }) => {
    var toggleClass = "eye--toggle";
    var { parentElement } = target;
    var [input] = parentElement.children;
    input.type = type === "mousedown" ? "text" : "password";
    target.classList.toggle(toggleClass);
  };

  return (
    <div key={useId()} className='iss__formContainer'>
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
              {
                type === "password" &&
                <span
                  onMouseDown={handleVisibility}
                  onMouseUp={handleVisibility}
                  className="eyeIcon"
                >&#128065;</span>
              }
            </label>
          ))
        }
        {
          loading
            ? <Load isInline/>
            : <button className='iss__formButton'>submit</button>
        }
      </form>
    </div>
  );
}

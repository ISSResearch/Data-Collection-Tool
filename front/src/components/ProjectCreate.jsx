import { useNavigate } from 'react-router-dom'
import { useAttributeManager } from '../hooks';
import AttributesForm from './common/AttributesForm';
import axios from 'axios';
import '../styles/components/projectcreate.css';

export default function ProjectCreate({ setOpt }) {
  const { formHook, levelHook, attributeHook } = useAttributeManager();
  const { forms, addForm, deleteForm, gatherAttributes } = formHook;
  const navigate = useNavigate();

  function getFormData({target}) {
    const name = target.querySelector('.iss__projectCreate__form__input input');
    const description = target.querySelector('.iss__projectCreate__form__input textarea');
    const attributes = gatherAttributes() ;
    return { name: name.value , description: description.value, attributes };
  }

  function sendForm(event) {
    event.preventDefault();
    const {name, description, attributes} = getFormData(event);
    axios.request('/api/projects/',
      {
        method: 'post',
        data: {name, description, attributes},
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
      .then(({status, data}) => {
				//if (data.ok) navigate('/');
				setOpt(true);
			})
      .catch(err => console.log(err));
  }

  return (
    <div className='iss__projectCreate'>
      <form onSubmit={sendForm} className='iss__projectCreate__form'>
        <fieldset className='iss__projectCreate__form__set'>
          <label className='iss__projectCreate__form__input'>
            Name of project:
            <input placeholder='Enter project name' required />
          </label>
          <label className='iss__projectCreate__form__input'>
            Project description:
            <textarea autoComplete='off' placeholder='Enter project description'/>
          </label>
          <button className='iss__projectCreate__form__createButton'>
            Create Project
          </button>
        </fieldset>
        <div className='iss__projectCreate__form__border'/>
        <fieldset className='iss__attributecreator'>
          <button
            onClick={addForm}
            type="button"
            className='iss__attributecreator__addButton'
          >
            <div className="addButton__cross"><span/><span/></div>
            <span>Add Attribute</span>
          </button>
          <div className='iss__attributecreator__attributesForm'>
          {Object.entries(forms).map(([formId]) => (
            <AttributesForm
              key={formId}
              formId={formId}
              deleteForm={deleteForm}
              levelHook={levelHook}
              attributeHook={attributeHook}
            />
          ))}
          </div>
        </fieldset>
      </form>
    </div>
  );
}

import { useState } from 'react';
import { useAttributeManager } from '../hooks';
import AttributeCreatorForm from './common/ui/AttributeCreatorForm';
import Load from './common/Load';
import axios from 'axios';
import '../styles/components/projectcreate.css';

export default function ProjectCreate() {
  const [loading, setLoading] = useState(false);
  const attributeManager = useAttributeManager();

  function getFormData({target}) {
    const name = target.querySelector('.iss__projectCreate__form__input input');
    const description = target.querySelector('.iss__projectCreate__form__input textarea');
    const attributes = attributeManager.formHook.gatherAttributes();
    return { name: name.value , description: description.value, attributes };
  }

  function sendForm(event) {
    event.preventDefault();
    setLoading(true);
    const formData = getFormData(event);
    axios.request('/api/projects/',
      {
        method: 'post',
        data: formData,
        headers: { 'Content-Type': 'application/json' }
      }
    )
      .then(({status, data}) => window.location.reload())
      .catch(err => {
        alert(err);
        setLoading(false);
      });
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
          {loading
            ? <Load isInline/>
            : <button className='iss__projectCreate__form__createButton'>
              Create Project
            </button>
          }
        </fieldset>
        <div className='iss__projectCreate__form__border'/>
        <AttributeCreatorForm attributeManager={attributeManager}/>
      </form>
    </div>
  );
}

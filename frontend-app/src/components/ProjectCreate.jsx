import { useState } from 'react';
import { useAttributeManager } from '../hooks';
import AttributeCreatorForm from './common/ui/AttributeCreatorForm';
import Load from './common/Load';
import api from '../config/api';
import '../styles/components/projectcreate.css';

export default function ProjectCreate() {
  const [loading, setLoading] = useState(false);
  const attributeManager = useAttributeManager();

  function getFormData({target}) {
    const name = target.querySelector('.iss__projectCreate__form__input input');
    let description = target.querySelector('.iss__projectCreate__form__input textarea');
    description = description.value.replaceAll(/\n/g, '<br>');
    const attributes = attributeManager.formHook.gatherAttributes();
    return { name: name.value , description, attributes };
  }

  function sendForm(event) {
    event.preventDefault();
    if (loading) return;
    const formData = getFormData(event);
    api.request('/api/projects/',
      {
        method: 'post',
        data: formData,
        headers: { 'Content-Type': 'application/json' }
      }
    )
      .then(() => window.location.reload())
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
        </fieldset>
        <div className='iss__projectCreate__form__border'/>
        <AttributeCreatorForm attributeManager={attributeManager}/>
        <button className='iss__projectCreate__form__createButton'>
          { loading ? <Load isInline/> : <span>Create Project</span> }
        </button>
      </form>
    </div>
  );
}

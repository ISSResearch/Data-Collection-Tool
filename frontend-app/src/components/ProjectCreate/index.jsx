import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../config/api';
import { useAttributeManager } from '../../hooks';
import AttributeCreatorForm from '../forms/AttributeCreatorForm';
import Load from '../ui/Load';
import './styles.css';

export default function() {
  const [loading, setLoading] = useState(false);
  const attributeManager = useAttributeManager();
  const [preview, setPreview] = useState('');
  const navigate = useNavigate();

  function getFormData({ target }) {
    const name = target.querySelector('.iss__projectCreate__form__input input');
    let description = target.querySelector('.iss__projectCreate__form__input textarea');
    description = description.value.replaceAll(/\n/g, '<br>');
    const attributes = attributeManager.formHook.gatherAttributes();
    return { name: name.value, description, attributes };
  }

  function sendForm(event) {
    event.preventDefault();

    if (loading) return;
    else setLoading(true);

    const formData = getFormData(event);
    api.request('/api/projects/',
      {
        method: 'post',
        data: formData,
        headers: {
          'Content-Type': 'application/json',
          "Authorization": "Bearer " + localStorage.getItem("dtcAccess")
        }
      }
    )
      .then(() => navigate("/projects/"))
      .catch(({ message, response }) => {
        const authFailed = response.status === 401 || response.status === 403;
        alert(authFailed ? "authentication failed" : message);
        if (authFailed) navigate("/login");
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
            Project description (raw):
            <textarea
              autoComplete='off'
              placeholder='Enter project description'
              onChange={({ target }) => setPreview(target.value)}
            />
          </label>
          {
            preview &&
            <p
              dangerouslySetInnerHTML={{ __html: preview }}
              className='iss__projectCreate__preview'
            />
          }
        </fieldset>
        <div className='iss__projectCreate__form__border' />
        <AttributeCreatorForm attributeManager={attributeManager} />
        <button className='iss__projectCreate__form__createButton'>
          {loading ? <Load isInline /> : <span>Create Project</span>}
        </button>
      </form>
    </div>
  );
}

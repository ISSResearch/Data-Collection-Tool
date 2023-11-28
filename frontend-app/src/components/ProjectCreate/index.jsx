import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../config/api';
import { useAttributeManager } from '../../hooks';
import { AlertContext } from "../../context/Alert";
import AttributeCreatorForm from '../forms/AttributeCreatorForm';
import Load from '../ui/Load';
import './styles.css';

export default function() {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState('');
  const { addAlert } = useContext(AlertContext);
  const attributeManager = useAttributeManager();
  const navigate = useNavigate();

  function getFormData({ target }) {
    var name = target.project_name.value;
    var description = target.project_description.value || "";

    description = description.replaceAll(/\n/g, '<br>');

    var attributes = attributeManager.formHook.gatherAttributes();

    return { name, description, attributes };
  }

  function sendForm(event) {
    event.preventDefault();
    if (loading) return;

   setLoading(true);

    var formData = getFormData(event);

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
      .then(() => {
        addAlert("Project created", "success");
        navigate("/projects/");
      })
      .catch(({ message, response }) => {
        var authFailed = response.status === 401 || response.status === 403;

        addAlert("Creating preoject error:" + message, "error", authFailed);

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
            <input name="project_name" placeholder='Enter project name' required />
          </label>
          <label className='iss__projectCreate__form__input'>
            Project description (raw):
            <textarea
              name="project_description"
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

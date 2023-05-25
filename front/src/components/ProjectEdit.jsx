import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAttributeManager } from '../hooks';
import AttributeCreatorForm from './common/ui/AttributeCreatorForm';
import Load from './common/Load';
import axios from 'axios';
import '../styles/components/projectedit.css';

export default function ProjectEdit({
  attributes,
  projectName,
  projectDescription,
  pathID
}) {
  const [loading, setLoading] = useState(false);
  const [deleteAccept, setDeleteAccept] = useState(false);
  const attributeManager = useAttributeManager();
  const attributeManagerNew = useAttributeManager();
  const navigate = useNavigate();

  function validateNewAttributes() {
    for (
      const attributes
      of Object.values(attributeManagerNew.attributeHook.attributes)
    ) if (!attributes.length) return false;
    return true;
  }

  function getFormData({target}) {
    const name = target.querySelector('.iss__projectEdit__form__input input');
    const description = target.querySelector('.iss__projectEdit__form__input textarea');
    const attributes = [
      ...attributeManager.formHook.gatherAttributes(),
      ...attributeManagerNew.formHook.gatherAttributes()
    ];
    return { name: name.value , description: description.value, attributes };
  }

  function sendForm(event) {
    event.preventDefault();
    setLoading(true);
    if (!validateNewAttributes()) return alert('Some attributes form are missed.')
    const formData = getFormData(event);
    axios.request(`/api/projects/${pathID}/`,
      {
        method: 'patch',
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

  function deleteProject() {
    axios.request(`/api/projects/${pathID}/`,
      {
        method: 'delete',
        headers: { 'Content-Type': 'application/json' }
      }
    )
      .then(() => navigate('/'))
      .catch(err => {
        alert(err);
        setLoading(false);
      });
  }

  return (
    <>
      <h2 className='iss__projectEdit__title'>Project Edit</h2>
      {
          deleteAccept
            ? <div className='iss__projectEdit__deleteProceed'>
              <span>Are you sure you want to delete this project?</span>
              <button
                onClick={deleteProject}
                className='iss__projectEdit__delete--yes'
               >yes, i'm sure</button>
              <button
                onClick={() => setDeleteAccept(false)}
                className='iss__projectEdit__delete--no'
              >no, return</button>
            </div>
            : <button
                onClick={() => setDeleteAccept(true)}
                className='iss__projectEdit__deleteButton'
              >DELETE PROJECT</button>
      }
      <form onSubmit={sendForm} className='iss__projectEdit__form'>
        <fieldset className='iss__projectEdit__form__set'>
          <label className='iss__projectEdit__form__input'>
            Name of project:
            <input
              placeholder='Enter project name'
              defaultValue={projectName}
              required
            />
          </label>
          <label className='iss__projectEdit__form__input'>
            Project description:
            <textarea
              autoComplete='off'
              placeholder='Enter project description'
              defaultValue={projectDescription}
            />
          </label>
          {
            loading
              ? <Load isInline/>
              : <button className='iss__projectEdit__form__createButton'>
                Submit edit
              </button>
          }
        </fieldset>
        <div className='iss__projectEdit__form__border'/>
        <div className='iss__projectEdit__attributes'>
          <AttributeCreatorForm
            attributeManager={attributeManager}
            withBoundAttributes={attributes}
          />
          <AttributeCreatorForm attributeManager={attributeManagerNew}/>
        </div>
      </form>
    </>
  );
}
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAttributeManager } from '../hooks';
import AttributeCreatorForm from './common/ui/AttributeCreatorForm';
import Load from './common/Load';
import { api } from '../config/api';
import '../styles/components/projectedit.css';

export default function ProjectEdit({
  attributes,
  projectName,
  projectDescription,
  pathID
}) {
  const [loading, setLoading] = useState(false);
  const [deleteAccept, setDeleteAccept] = useState(false);
  const [deleteNameForm, setDeleteNameForm] = useState('');
  const [preview, setPreview] = useState(projectDescription);

  const attributeManager = useAttributeManager();
  const attributeManagerNew = useAttributeManager();
  const navigate = useNavigate();

  function validateNewAttributes() {
    for (let attributes of Object.values(attributeManagerNew.attributeHook.attributes)) {
      if (!attributes.length) return false;
    }
    return true;
  }

  function getFormData({ target }) {
    const name = target.querySelector('.iss__projectEdit__form__input input');
    let description = target.querySelector('.iss__projectEdit__form__input textarea');
    description = description.value.replace(/\n/g, '<br>');
    const attributes = [
      ...attributeManager.formHook.gatherAttributes(),
      ...attributeManagerNew.formHook.gatherAttributes(
        Object.keys(attributeManager.formHook.forms).length
      )
    ];
    return { name: name.value, description, attributes };
  }

  async function performOriginalItemsDelete(idSet, endpoint) {
    return api.request(`/api/attributes/${endpoint}/`,
      {
        method: 'delete',
        data: { id_set: idSet },
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  async function sendForm(event) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    if (!validateNewAttributes()) return alert('Some attribute forms are missed.')
    const formData = getFormData(event);
    const deleteLevels = attributeManager.levelHook.deletedOriginLevels;
    const deleteAttributes = attributeManager.attributeHook.deletedOriginAttributes;
    if (deleteAttributes.length) await performOriginalItemsDelete(deleteAttributes, 'attributes');
    if (deleteLevels) await performOriginalItemsDelete(deleteLevels, 'levels');

    api.request(`/api/projects/${pathID}/`,
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
    if (deleteNameForm !== projectName) {
      alert('Entered name differs from the actual Project name.');
      setDeleteAccept(false);
      return;
    }
    api.request(`/api/projects/${pathID}/`,
      {
        method: 'delete',
        data: { approval: deleteNameForm },
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
      <fieldset className='iss__projectEdit__fieldset'>
        <Link to={`/projects/${pathID}/visibility`} className='iss__projectEdit__visibilityLink'>
          USER VISIBILITY
        </Link>
        {
          deleteAccept
            ? <div className='iss__projectEdit__deleteProceed'>
              <span>Are you sure you want to delete this project? Type Project name in the box below to confirm.</span>
              <input
                placeholder='Exact Project name'
                onChange={({ target }) => setDeleteNameForm(target.value)}
                className='iss__projectEdit__delete__input'
              />
              <button
                type='button'
                onClick={() => setDeleteAccept(false)}
                className='iss__projectEdit__delete--no'
              >cancel</button>
              <button
                type='button'
                onClick={deleteProject}
                className='iss__projectEdit__delete--yes'
              >submit</button>
            </div>
            : <button
              onClick={() => setDeleteAccept(true)}
              className='iss__projectEdit__deleteButton'
            >DELETE PROJECT</button>
        }
      </fieldset>
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
            Project description (raw):
            <textarea
              autoComplete='off'
              placeholder='Enter project description'
              defaultValue={projectDescription}
              onChange={({ target }) => setPreview(target.value)}
            />
          </label>
          {
            preview &&
            <p
              dangerouslySetInnerHTML={{ __html: preview }}
              className='iss__projectEdit__preview'
            />
          }
        </fieldset>
        <div className='iss__projectEdit__form__border' />
        <div className='iss__projectEdit__attributes'>
          <AttributeCreatorForm attributeManager={attributeManagerNew} />
          {
            Object.keys(attributeManagerNew.formHook.forms).length > 0 &&
            <div className='iss__projectEdit__attributeSeparator' />
          }
          <AttributeCreatorForm
            attributeManager={attributeManager}
            withBoundAttributes={attributes}
          />
        </div>
        <button type="submit" className='iss__projectEdit__form__submitButton'>
          {loading ? <Load isInline /> : <span>Submit edit</span>}
        </button>
      </form>
    </>
  );
}

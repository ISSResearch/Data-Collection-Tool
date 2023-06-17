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
  const [deleteNameForm, SetDeleteNameForm] = useState('');

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
      ...attributeManagerNew.formHook.gatherAttributes(
        Object.keys(attributeManager.formHook.forms).length
      )
    ];
    return { name: name.value , description: description.value, attributes };
  }

  async function performOriginalItemsDelete(idSet, endpoint) {
    return axios.request(`/api/attributes/${endpoint}/`,
        {
          method: 'delete',
          data: {id_set: idSet},
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
    if (deleteNameForm !== projectName) return alert('Entered name differs from the actual Project name.')
    axios.request(`/api/projects/${pathID}/`,
      {
        method: 'delete',
        data: {approval: deleteNameForm},
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
              <span>Are you sure you want to delete this project? Type Project name in the box below to confirm.</span>
              <input
                placeholder='Exact Project name'
                onChange={({target}) => SetDeleteNameForm(target.value)}
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
        </fieldset>
        <div className='iss__projectEdit__form__border'/>
        <div className='iss__projectEdit__attributes'>
          <AttributeCreatorForm attributeManager={attributeManagerNew}/>
          {
            Object.keys(attributeManagerNew.formHook.forms).length > 0 &&
              <div className='iss__projectEdit__attributeSeparator'/>
          }
          <AttributeCreatorForm
            attributeManager={attributeManager}
            withBoundAttributes={attributes}
          />
        </div>
        <button className='iss__projectEdit__form__createButton'>
          {
            loading
              ? <Load isInline/>
              : <span>Submit edit</span>
          }
        </button>
      </form>
    </>
  );
}
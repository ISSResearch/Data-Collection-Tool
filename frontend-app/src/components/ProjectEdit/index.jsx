import { useState, useRef, ReactElement } from 'react';
import { useNavigate, Link, useBlocker  } from 'react-router-dom';
import { useAttributeManager } from '../../hooks';
import { api } from '../../config/api';
import { addAlert } from '../../slices/alerts';
import { useDispatch } from "react-redux";
import Load from '../ui/Load';
import AttributeCreatorForm from '../forms/AttributeCreatorForm';
import './styles.css';

/**
* @param {object} props
* @param {object[]} props.attributes
* @param {string} props.projectName
* @param {string} props.projectDescription
* @param {number} props.pathID
* @returns {ReactElement}
*/
export default function ProjectEdit({
  attributes,
  projectName,
  projectDescription,
  pathID
}) {
  const [loading, setLoading] = useState(false);
  const [deleteAccept, setDeleteAccept] = useState(false);
  const [preview, setPreview] = useState(projectDescription);
  const attributeManager = useAttributeManager();
  const attributeManagerNew = useAttributeManager();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const deleteInput = useRef(null);

  useBlocker(() => {
    var msg = "Are you sure you wanna leave the editing? All unsaved data will be lost";
    return !window.confirm(msg);
  });

  function validateNewAttributes() {
    var newAttirbutes = Object.values(attributeManagerNew.attributeHook.attributes);
    for (let attributes of newAttirbutes) {
      if (!attributes.length) return false;
    }
    return true;
  }

  function getFormData({ target }) {
    var name = target.project_name.value;
    var description = target.project_description.value || "";

    description = description.replace(/\n/g, '<br>');

    var attributes = [
      ...attributeManager.formHook.gatherAttributes(),
      ...attributeManagerNew.formHook.gatherAttributes(
        Object.keys(attributeManager.formHook.forms).length
      )
    ];

    return { name, description, attributes };
  }

  async function performOriginalItemsDelete(idSet, endpoint) {
    return api.request(`/api/attributes/${endpoint}/`,
      {
        method: 'delete',
        data: { id_set: idSet },
        headers: {
          'Content-Type': 'application/json',
          "Authorization": "Bearer " + localStorage.getItem("dtcAccess")
        }
      }
    );
  }

  async function sendForm(event) {
    event.preventDefault();
    if (loading) return;

    if (!validateNewAttributes())
      return dispatch(addAlert({ message: 'Some attribute forms are missed.', type: "error" }));

    setLoading(true);

    var formData = getFormData(event);
    var deleteLevels = attributeManager.levelHook.deletedOriginLevels;
    var deleteAttributes = attributeManager.attributeHook.deletedOriginAttributes;

    try {
      if (deleteAttributes.length) await performOriginalItemsDelete(deleteAttributes, 'attributes');
      if (deleteLevels) await performOriginalItemsDelete(deleteLevels, 'levels');

      await api.request(`/api/projects/${pathID}/`,
        {
          method: 'patch',
          data: formData,
          headers: {
            'Content-Type': 'application/json',
            "Authorization": "Bearer " + localStorage.getItem("dtcAccess")
          }
        }
      );

      dispatch(addAlert({ message: `Project ${projectName} changed`, type: "success" }));

      window.location.reload();
    }
    catch ({ message, response }) {
      var authFailed = response.status === 401 || response.status === 403;

      dispatch(addAlert({
        message: "Updating project error: " + message,
        type: "error",
        noSession: authFailed
      }));

      if (authFailed) navigate("/login");

      setLoading(false);
    }
  }

  async function deleteProject() {
      if (deleteInput.current.value !== projectName) {
      dispatch(addAlert({
        message: "Entered name differs from the actual Project name.",
        type: "error"
      }));
      setDeleteAccept(false);
      return;
    }

    try {
      await api.request(`/api/projects/${pathID}/`,
        {
          method: 'delete',
          data: { approval: deleteInput.current.value },
          headers: {
            'Content-Type': 'application/json',
            "Authorization": "Bearer " + localStorage.getItem("dtcAccess")
          }
        }
      );
      dispatch(addAlert({
        message: `Project ${projectName} deleted`,
        type: "success"
      }));
      navigate('/');
    }
    catch({ message, response }) {
      var authFailed = response.status === 401 || response.status === 403;

      dispatch(addAlert({
        message: "Deleting project error: " + message,
        type: "error",
        noSession: authFailed
      }));

      if (authFailed) navigate("/login");

      setLoading(false);
    }
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
                ref={deleteInput}
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
              name="project_name"
              placeholder='Enter project name'
              defaultValue={projectName}
              required
            />
          </label>
          <label className='iss__projectEdit__form__input'>
            Project description (raw):
            <textarea
              name="project_description"
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

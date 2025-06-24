import { useState, ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../config/api";
import { useAttributeManager } from "../../hooks";
import { addAlert } from "../../slices/alerts";
import { useDispatch } from "react-redux";
import AttributeCreatorForm from "../forms/AttributeCreatorForm";
import Load from "../ui/Load";
import "./styles.css";

/** @returns {ReactElement} */
export default function ProjectCreate() {
  const [required, setRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState('');
  const dispatch = useDispatch();
  const attributeManager = useAttributeManager();
  const navigate = useNavigate();

  const getFormData = ({ target }) => {
    var name = target.project_name?.value;
    var description = target.project_description.value || "";
    var payload_required = required;

    if (!name) throw new Error("Name supposed to be set.");
    description = description.replaceAll(/\n/g, '<br>');

    var attributes = attributeManager.formHook.gatherAttributes();

    return { name, description, attributes, payload_required };
  };

  const sendForm = async (event) => {
    event.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      var formData = getFormData(event);
      await api.request('/api/projects/',
        {
          method: 'post',
          data: formData,
          headers: {
            'Content-Type': 'application/json',
            "Authorization": "Bearer " + localStorage.getItem("dtcAccess")
          }
        }
      );
      dispatch(addAlert({ message: "Project created", type: "success" }));
      navigate("/projects/");
    }
    catch ({ message, response }) {
      var authFailed = response && (response.status === 401 || response.status === 403);

      dispatch(addAlert({
        message: "Creating preoject error:" + message,
        type: "error",
        noSession: authFailed
      }));

      if (authFailed) navigate("/login");

      setLoading(false);
    }
  };

  return (
    <div className='iss__projectCreate'>
      <form onSubmit={sendForm} className='iss__projectCreate__form'>
        <fieldset className='iss__projectCreate__form__set'>
          <label className='iss__projectCreate__form__input'>
            Name of project:
            <input name="project_name" placeholder='Enter project name' required />
          </label>
          <label className="iss__projectEdit__form__input input--box">
            <input
              name="payload_required"
              type="checkbox"
              checked={required}
              onChange={() => setRequired(!required)}
            />
            Attribute payload is required
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
        <AttributeCreatorForm
          payloadRequired={required}
          attributeManager={attributeManager}
        />
        <button className='iss__projectCreate__form__createButton'>
          {loading ? <Load isInline /> : <span>Create Project</span>}
        </button>
      </form>
    </div>
  );
}

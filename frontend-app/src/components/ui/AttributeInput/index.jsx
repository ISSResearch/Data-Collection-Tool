import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../config/api';
import { AlertContext } from "../../../context/Alert";
import './styles.css';

function AttributeInput({
  formId,
  attributes,
  depth,
  isChild,
  delAttribute,
  addAttribute,
  handleChange,
  setDeletedOriginAttributes,
  moveUp,
  moveDown
}) {
  const [lastLevel, setLastLevel] = useState(false);
  const [acceptDelete, setAcceptDelete] = useState(null);
  const { addAlert } = useContext(AlertContext);
  const navigate = useNavigate();

  async function proceedOriginalAttributeDelete(path, id) {
    try {
      await api.request(`/api/attributes/attributes/${id}/`,
        {
          method: 'get',
          headers: {
            'Content-Type': 'application/json',
            "Authorization": "Bearer " + localStorage.getItem("dtcAccess")
          }
        }
      );
      setAcceptDelete(null);
      setDeletedOriginAttributes(prev => [...prev, id]);
      handleDeleteAttribute(path, false, id);
    }
    catch ({ message, response }) {
      var authFailed = response.status === 401;
      addAlert('Current or child Attributes are set for Files.', "error", authFailed);
      if (authFailed) navigate("/login");
      setAcceptDelete(null);
    };
  }

  function handleDeleteAttribute(path, orig, index) {
    if (orig) setAcceptDelete(index);
    else delAttribute(formId, path, isChild);
  }

  useEffect(() => {
    var currentDepth = attributes[0]?.path.split('_').length;
    setLastLevel(!currentDepth || currentDepth >= depth);
  }, [depth]);

  return (
    <div className='iss__form__attributes'>
      {
        attributes.map(({ id, name, path, children, orig }, index) => (
          <div
            key={id}
            className={`iss__attributeForm${isChild ? ' attribute--child' : ''}`}
          >
            {isChild && <div className='iss__attributeForm__tree'>------|</div>}
            <div className='iss__attributeForm__inputWrap'>
              <input
                placeholder="Attribute name"
                required
                onChange={({ target }) => handleChange(formId, target, path, isChild)}
                value={name}
              />
              <div className="iss__attributeForm__inputButton">
                <button
                  onClick={() => handleDeleteAttribute(path, orig, index)}
                  type="button"
                  className="inputButton--del"
                ><span /></button>
                {
                  !lastLevel &&
                  <button
                    onClick={() => addAttribute(formId, path)}
                    type="button"
                    className="inputButton--add"
                  ><span /><span /></button>
                }
              </div>
              {
                acceptDelete === index &&
                <div
                  className='iss__attributeForm__acceptance__curtain'
                >
                  <span>confirm</span>
                  <button
                    onClick={() => proceedOriginalAttributeDelete(path, id)}
                    type='button'
                    className='iss__attributesForm__acceptance__curtain__button--yes'
                  >yes</button>
                  <button
                    onClick={() => setAcceptDelete(null)}
                    type='button'
                    className='iss__attributesForm__acceptance__curtain__button--no'
                  >no</button>
                </div>
              }
              <div className="iss__attributeForm__inputAlign">
                <svg onClick={() => moveUp(formId, path, index)} viewBox="15 15 20 20">
                  <path d="M13 30L25 18L37 30" />
                </svg>
                <svg onClick={() => moveDown(formId, path, index)} viewBox="15 15 20 20">
                  <path d="M13 30L25 18L37 30" />
                </svg>
              </div>
            </div>
            {
              Boolean(children?.length) &&
              <AttributeInput
                formId={formId}
                attributes={children}
                depth={depth}
                isChild={true}
                delAttribute={delAttribute}
                addAttribute={addAttribute}
                handleChange={handleChange}
                setDeletedOriginAttributes={setDeletedOriginAttributes}
                moveUp={moveUp}
                moveDown={moveDown}
              />
            }
          </div>
        ))
      }
    </div>
  )
}

export default AttributeInput;

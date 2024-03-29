import { useEffect, useState, ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../config/api';
import { addAlert } from '../../../slices/alerts';
import { useDispatch } from "react-redux";
import AttributeInput from '../../ui/AttributeInput';
import './styles.css';

/**
* @param {object} props
* @param {number} props.formId
* @param {Function} props.deleteForm
* @param {object} props.levelHook
* @param {object} props.attributeHook
* @returns {ReactElement}
*/
export default function AttributesForm({
  formId,
  deleteForm,
  levelHook,
  attributeHook,
}) {
  const [acceptDelete, setAcceptDelete] = useState(null);
  const {
    attributes,
    addAttribute,
    delAttribute,
    handleChange,
    handleLevelRemove,
    setDeletedOriginAttributes,
    moveUp,
    moveDown
  } = attributeHook;
  const {
    levels,
    addLevel,
    changeLevel,
    delLevel,
    setMultiple,
    setRequired,
    setDeletedOriginLevels,
  } = levelHook;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function proceedOriginalLevelDelete(index, id) {
    try {
      await api.request(`/api/attributes/levels/${id}/`,
        {
          method: 'get',
          headers: {
            'Content-Type': 'application/json',
            "Authorization": "Bearer " + localStorage.getItem("dtcAccess")
          }
        }
      );
      setAcceptDelete(null);
      setDeletedOriginLevels((prev) => [...prev, id]);
      handleLevelDelete(index, false, id);
    }
    catch ({ message, response }) {
      var authFailed = response?.status === 401;
      dispatch(addAlert({
        message: 'Current or child Levels Attributes are set for Files.',
        type: "error",
        noSession: authFailed
      }));
      if (authFailed) navigate("/login");
      setAcceptDelete(null);
    }
  }

  function handleLevelDelete(index, orig) {
    if (orig) return setAcceptDelete(index);
    if (index === 0) deleteForm(formId);
    else {
      delLevel(formId, index);
      handleLevelRemove(formId, index);
    }
  }

  function handleSetMultiple(index, target) {
    try { setMultiple(formId, index, target); }
    catch ({ message }) { dispatch(addAlert({ message, type: "error" })); }
  }

  function handleAddLevel() {
    try { addLevel(formId); }
    catch ({ message }) { dispatch(addAlert({ message, type: "error" })); }
  }

  useEffect(() => {
    if (!levels[formId].length) {
      try { addLevel(formId); }
      catch ({ message }) { addAlert(message, "error"); }
    }
  }, []);

  return (
    <div className='iss__attributesForm'>
      <div className='iss__attributesForm__levels'>
        <div className='iss__attributeForm__titleWrap'>
          <h2>Levels:</h2>
          <button
            onClick={handleAddLevel}
            type="button"
            className='iss__attributesForm__button button-add'
          ><span /><span /></button>
        </div>
        {
          levels[formId]?.map(({ id, uid, name, orig, multiple, required }, index) => (
            <div key={id} className='iss__attributesForm__levelWrap'>
              <div className='iss__attributesForm__levelInput'>
                <input
                  placeholder="Level name"
                  required
                  onChange={({ target }) => changeLevel(formId, target, index)}
                  value={name}
                />
                <button
                  type="button"
                  onClick={() => handleLevelDelete(index, orig, id)}
                  className='iss__attributesForm__button button-del'
                ><span /></button>
                {
                  acceptDelete === index &&
                  <div
                    className='iss__attributesForm__acceptance__curtain'
                  >
                    <span>confirm</span>
                    <button
                      onClick={() => proceedOriginalLevelDelete(index, uid)}
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
              </div>
              <label className='iss__attributesForm__checkbox'>
                required
                <input
                  type="checkbox"
                  onChange={() => setRequired(formId, index)}
                  checked={required}
                />
              </label>
              <label className='iss__attributesForm__checkbox'>
                multiple choice
                <input
                  type="checkbox"
                  onChange={({ target }) => handleSetMultiple(index, target)}
                  checked={multiple}
                />
              </label>
            </div>
          ))
        }
      </div>
      <div className='iss__attributesWrapper'>
        <div className='iss__attributeForm__titleWrap'>
          <h3>Values:</h3>
          <button
            onClick={() => addAttribute(formId)}
            type="button"
            className='iss__attributesForm__button button-add'
          ><span /><span /></button>
        </div>
        {
          Boolean(attributes[formId]?.length) &&
          <AttributeInput
            formId={formId}
            attributes={attributes[formId]}
            depth={levels[formId].length}
            delAttribute={delAttribute}
            addAttribute={addAttribute}
            handleChange={handleChange}
            moveUp={moveUp}
            moveDown={moveDown}
            setDeletedOriginAttributes={setDeletedOriginAttributes}
          />
        }
      </div>
    </div>
  );
}

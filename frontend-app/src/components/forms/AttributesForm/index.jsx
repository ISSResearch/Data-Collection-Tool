import { useEffect, useState, ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../config/api";
import { addAlert } from "../../../slices/alerts";
import { useDispatch } from "react-redux";
import AttributeInput from "../../ui/AttributeInput";
import "./styles.css";

/**
* @param {object} props
* @param {number} props.formId
* @param {Function} props.deleteForm
* @param {object} props.levelHook
* @param {object} props.attributeHook
* @param {boolean} props.payloadRequired
* @returns {ReactElement}
*/
export default function AttributesForm({
  formId,
  deleteForm,
  levelHook,
  attributeHook,
  payloadRequired
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

  const proceedOriginalLevelDelete = async (index, id) => {
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
  };

  const handleLevelDelete = (index, orig) => {
    if (orig) return setAcceptDelete(index);
    if (index === 0) deleteForm(formId);
    else {
      delLevel(formId, index);
      handleLevelRemove(formId, index);
    }
  };

  const handleSetMultiple = (index, target) => {
    try { setMultiple(formId, index, target); }
    catch ({ message }) { dispatch(addAlert({ message, type: "error" })); }
  };

  const handleAddLevel = () => {
    try { addLevel(formId); }
    catch ({ message }) { dispatch(addAlert({ message, type: "error" })); }
  };

  // const handleImport = useCallback(() => {
  //   var input = document.createElement("input");
  //   input.type = "file";
  //   input.accept = ".csv,.xls,.xlsx"

  //   input.oninput = ({ target }) => parseImport(target);

  //   input.click();
  // }, []);

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
          {/* <button
            onClick={handleImport}
            type="button"
            className="iss__attributesForm__button button-import"
          >
            <svg viewBox="0 0 24 24" className="attributeFrom__button__file">
              <path d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.342a2 2 0 0 0-.602-1.43l-4.44-4.342A2 2 0 0 0 13.56 2H6a2 2 0 0 0-2 2m5 9h6m-6 4h3" strokeLinecap="round" />
              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            </svg>
            <span>Import from</span>
          </button> */}
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
            payloadRequired={payloadRequired}
          />
        }
      </div>
    </div>
  );
}

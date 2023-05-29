import { useEffect, useState } from 'react';
import AttributeInput from './AttributeInput';
import axios from 'axios';
import '../../styles/components/common/attributesform.css';

export default function AttributesForm({
  formId,
  deleteForm,
  levelHook,
  attributeHook,
}) {
  const [acceptDelete, setAcceptDelete] = useState(null);
  const { attributes, addAttribute, delAttribute, handleChange, handleLevelRemove } = attributeHook;
  const { levels, addLevel, changeLevel, delLevel, setMultiple, setRequired } = levelHook;

  async function proceedOriginalLevelDelete (index, id) {
    try {
      await axios.request(`/api/attributes/level/${id}/`,
        {
          method: 'delete',
          headers: { 'Content-Type': 'application/json' }
        }
      );
      setAcceptDelete(null);
      handleLevelDelete(index, false, id)
    }
    catch {
      alert('Current Level or child Levels Attributes are set for Files.');
    }
  }

  function handleLevelDelete(index, orig, id) {
    if (orig) return setAcceptDelete(index);
    if (index === 0) deleteForm(formId);
    else {
      delLevel(formId, index);
      handleLevelRemove(formId, index);
    }
  }

  useEffect(() => { if (!levels[formId].length) addLevel(formId); }, []);

  return (
    <div className='iss__attributesForm'>
      <div className='iss__attributesForm__levels'>
        <div className='iss__attributeForm__titleWrap'>
          <h2>Levels:</h2>
          <button
            onClick={() => addLevel(formId)}
            type="button"
            className='iss__attributesForm__button button-add'
          ><span/><span/></button>
        </div>
        {
          levels[formId].map(({id, name, orig, multiple, required}, index) => (
            <div key={id} className='iss__attributesForm__levelWrap'>
              <div className='iss__attributesForm__levelInput'>
                <input
                  placeholder="Level name"
                  required
                  onBlur={({target}) => changeLevel(formId, target, index)}
                  defaultValue={name}
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
                      onClick={() => proceedOriginalLevelDelete(index, id)}
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
                  defaultChecked={required}
                />
              </label>
              <label className='iss__attributesForm__checkbox'>
                multiple choice
                <input
                  type="checkbox"
                  onChange={({target}) => setMultiple(formId, index, target)}
                  defaultChecked={multiple}
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
          Boolean(attributes[formId].length) &&
          <AttributeInput
            formId={formId}
            attributes={attributes[formId]}
            depth={levels[formId].length}
            delAttribute={delAttribute}
            addAttribute={addAttribute}
            handleChange={handleChange}
          />
        }
      </div>
    </div>
  );
}

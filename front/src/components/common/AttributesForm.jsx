import { useEffect } from 'react';
import AttributeInput from './AttributeInput';
import '../../styles/components/common/attributesform.css';

export default function AttributesForm({
  formId,
  deleteForm,
  levelHook,
  attributeHook,
}) {
  const { levels, addLevel, changeLevel, delLevel, setMultiple, setRequired } = levelHook;
  const { attributes, addAttribute, delAttribute, handleChange } = attributeHook;

  function handleLevelDelete(index, orig) {
    if (orig) return alert('This is an original level. Delete is not supported right now')
    if (index === 0) deleteForm(formId);
    else delLevel(formId, index);
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
                  onClick={() => handleLevelDelete(index, orig)}
                  className='iss__attributesForm__button button-del'
                ><span /></button>
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

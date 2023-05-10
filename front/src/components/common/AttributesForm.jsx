import { useEffect } from 'react';
import AttributeInput from './AttributeInput';
import '../../styles/components/common/attributesform.css';

export default function AttributesForm({
  formId,
  deleteForm,
  levelHook,
  attributeHook,
}) {
  const { levels, addLevel, changeLevel, delLevel } = levelHook;
  const { attributes, addAttribute, delAttribute, handleChange } = attributeHook;

  function handleLevelDelete(index) {
    if (index === 0) deleteForm(formId);
    else delLevel(formId, index);
  }

  useEffect(() => { addLevel(formId) }, []);

  return (
    <div className='iss__attributesForm'>
      <div className='iss__attributesForm__levels'>
        <div className='iss__attributeForm__titleWrap'>
          <h2>Levels:</h2>
          <button
            onClick={() => addLevel(formId)}
            type="button"
            className='iss__attributesForm__button button-add'
          ><span /><span /></button>
        </div>
        {levels[formId].map(({id}, index) => (
          <div key={id} className='iss__attributesForm__levelWrap'>
            <input
              placeholder="Level name"
              required
              onBlur={({target}) => changeLevel(formId, target, index)}
            />
            <div className="iss__attributesForm__delButton">
              <button
                type="button"
                onClick={() => handleLevelDelete(index)}
                className='iss__attributesForm__button button-del'
              ><span /></button>
            </div>
          </div>
        ))}
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
        {attributes[formId].length > 0 &&
          <AttributeInput
            formId={formId}
            attributes={attributes[formId]}
            depth={levels[formId].length}
            delAttribute={delAttribute}
            addAttribute={addAttribute}
            handleChange={handleChange}
          />}
      </div>
    </div>
  );
}

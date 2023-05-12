import { useEffect, useState } from 'react';
import '../../styles/components/common/attributeinput.css';

export default function AttributeInput({
  formId,
  attributes,
  depth,
  isChild,
  delAttribute,
  addAttribute,
  handleChange
}) {
  const [lastLevel, setLastLevel] = useState(false);

  useEffect(() => {
    const currentDepth = attributes[0]?.path.split('_').length;
    setLastLevel(!currentDepth || currentDepth >= depth);
  }, [depth]);

  return (
    <div className='iss__form__attributes'>
      {attributes.map(({id, path, children}) => (
        <div key={id} className={`iss__attributeForm ${isChild ? 'attribute--child': ''}`}>
          {isChild ? <div className='iss__attributeForm__tree'>------|</div> : ''}
          <div className='iss__attributeForm__inputWrap'>
            <input
              placeholder="Attribute name"
              required
              onBlur={({target}) => handleChange(formId, target, path, isChild)}
            />
            <div className="iss__attributeForm__inputButton">
              <button
                onClick={() => delAttribute(formId, path, isChild)}
                type="button"
                className="inputButton--del"
              ><span /></button>
              {!lastLevel &&
                <button
                  onClick={() => addAttribute(formId, path)}
                  type="button"
                  className="inputButton--add"
                ><span /><span /></button>}
            </div>
          </div>
          {Boolean(children.length) &&
            <AttributeInput
              formId={formId}
              attributes={children}
              depth={depth}
              isChild={true}
              delAttribute={delAttribute}
              addAttribute={addAttribute}
              handleChange={handleChange}
            />}
        </div>
      ))}
    </div>
  )
}

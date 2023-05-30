import { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/components/common/attributeinput.css';

export default function AttributeInput({
  formId,
  attributes,
  depth,
  isChild,
  delAttribute,
  addAttribute,
  handleChange,
  setDeletedOriginAttributes
}) {
  const [lastLevel, setLastLevel] = useState(false);
  const [acceptDelete, setAcceptDelete] = useState(null);

  async function proceedOriginalAttributeDelete(path, id) {
    try {
      await axios.request(`/api/attributes/attributes/${id}/`,
        {
          method: 'get',
          headers: { 'Content-Type': 'application/json' }
        }
      );
      setAcceptDelete(null);
      setDeletedOriginAttributes(prev => [...prev, id]);
      handleDeleteAttribute(path, false, id);
    }
    catch {
      setAcceptDelete(null);
      alert('Current or child Attributes are set for Files.');
    }
  }

  function handleDeleteAttribute(path, orig, index) {
      if (orig) setAcceptDelete(index);
      else delAttribute(formId, path, isChild);
  }

  useEffect(() => {
    const currentDepth = attributes[0]?.path.split('_').length;
    setLastLevel(!currentDepth || currentDepth >= depth);
  }, [depth]);

  return (
    <div className='iss__form__attributes'>
      {
        attributes.map(({id, name, path, children, orig}, index) => (
          <div key={id} className={`iss__attributeForm ${isChild ? 'attribute--child': ''}`}>
            {isChild ? <div className='iss__attributeForm__tree'>------|</div> : ''}
            <div className='iss__attributeForm__inputWrap'>
              <input
                placeholder="Attribute name"
                required
                onBlur={({target}) => handleChange(formId, target, path, isChild)}
                defaultValue={name}
              />
              <div className="iss__attributeForm__inputButton">
                <button
                  onClick={() => handleDeleteAttribute(path, orig, index)}
                  type="button"
                  className="inputButton--del"
                ><span/></button>
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
                />
            }
          </div>
        ))
      }
    </div>
  )
}

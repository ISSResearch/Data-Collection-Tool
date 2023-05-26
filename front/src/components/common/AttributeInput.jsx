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
  handleChange
}) {
  const [lastLevel, setLastLevel] = useState(false);

  function handleDeleteAttribute(formId, path, isChild, orig, id) {
    if (orig) {
      axios.request(`/api/attributes/attribute/${id}/`,
        {
          method: 'delete',
          headers: { 'Content-Type': 'application/json' }
        }
      )
        .then((data) => console.log(data))
        .catch(err => alert(err));
      alert('Original attribute could not be deleted yet');
    }
    else delAttribute(formId, path, isChild);
  }

  useEffect(() => {
    const currentDepth = attributes[0]?.path.split('_').length;
    setLastLevel(!currentDepth || currentDepth >= depth);
  }, [depth]);

  return (
    <div className='iss__form__attributes'>
      {
        attributes.map(({id, name, path, children, orig}) => (
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
                  onClick={() => handleDeleteAttribute(formId, path, isChild, orig, id)}
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
                />
            }
          </div>
        ))
      }
    </div>
  )
}

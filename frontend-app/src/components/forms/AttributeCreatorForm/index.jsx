import { useEffect } from 'react';
import AttributesForm from '../AttributesForm';
import FindAndReplace from "../../ui/FindAndReplace";
import './styles.css';

export default function({ attributeManager, withBoundAttributes }) {
  const { formHook, levelHook, attributeHook } = attributeManager;
  const { forms, addForm, deleteForm, boundAttributes } = formHook;

  function handleReplace(replaceTo, replaceWith) {
    levelHook.findAndReplace(replaceTo, replaceWith);
    attributeHook.findAndReplace(replaceTo, replaceWith);
  }

  useEffect(() => {
    if (withBoundAttributes?.length) boundAttributes(withBoundAttributes);
  }, []);

  return (
    <fieldset className='iss__attributecreator'>
      <div className="iss__attributecreator__buttons">
        {
          !withBoundAttributes &&
          <button
            onClick={addForm}
            type="button"
            className='iss__attributecreator__addButton'
          >
            <div className="addButton__cross"><span /><span /></div>
            <span>Add Attribute</span>
          </button>
        }
        {
          Object.keys(forms).length > 0 &&
          <FindAndReplace onCommit={handleReplace} />
        }
      </div>
      <div className='iss__attributecreator__attributesForm'>
        {
          Object.keys(forms).map(formId => (
            <AttributesForm
              key={formId}
              formId={formId}
              deleteForm={deleteForm}
              levelHook={levelHook}
              attributeHook={attributeHook}
            />
          ))
        }
      </div>
    </fieldset>
  );
}

import { useEffect } from 'react';
import AttributesForm from '../AttributesForm';
import '../../../styles/components/common/ui/attributecreatorform.css';

export default function AttributeCreatorForm({
  attributeManager,
  withBoundAttributes
}) {
  const { formHook, levelHook, attributeHook } = attributeManager;
  const { forms, addForm, deleteForm, boundAttributes } = formHook;

  useEffect(() => {
    if (withBoundAttributes?.length) boundAttributes(withBoundAttributes);
  }, []);

  return (
    <fieldset className='iss__attributecreator'>
      {!withBoundAttributes && <button
        onClick={addForm}
        type="button"
        className='iss__attributecreator__addButton'
      >
        <div className="addButton__cross"><span/><span/></div>
        <span>Add Attribute</span>
      </button>}
      <div className='iss__attributecreator__attributesForm'>
        {Object.keys(forms).map(formId => (
          <AttributesForm
            key={formId}
            formId={formId}
            deleteForm={deleteForm}
            levelHook={levelHook}
            attributeHook={attributeHook}
          />
        ))}
      </div>
    </fieldset>
  );
}

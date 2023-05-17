import { useAttributeManager } from '../../hooks';
import AttributeCreatorForm from './ui/AttributeCreatorForm';
import axios from 'axios';
import '../../styles/components/common/changeattributes.css';

export default function ChangeAttributes ({ pathID, attributes }) {
  const attributeManager = useAttributeManager();
  const attributeManagerNew = useAttributeManager();

  function validateNewAttributes(newAttributes) {
    if (!newAttributes || !newAttributes.length) return;
    for (const { attributes } of newAttributes) if (!attributes.length) return;
    return true;
  }

  function gatherForm() {
    const edit = attributeManager.formHook.gatherAttributes();
    const newAttributes = attributeManager.formHook.gatherAttributes();
    return {};
  }

  function sendForm(event) {
    event.preventDefault();
    // setLoading(true);
    // validateNewAttributes(attributes)
    // axios.request('/api/projects/' + pathID,
    //   {
    //     method: 'post',
    //     data: { attributes },
    //     headers: { 'Content-Type': 'application/json' }
    // })
    //   .then(({status, data}) => {window.location.reload()})
    //   .catch(err => {
    //     alert(err);
    //     setLoading(false);
    //   });
  }

  return (
    <form onSubmit={sendForm} className='iss__changeAttributes'>
      <button>submit edit</button>
      <AttributeCreatorForm
        attributeManager={attributeManager}
        withBoundAttributes={attributes}
      />
      <div className='iss__changeAttributes__edit__new'>
        <AttributeCreatorForm attributeManager={attributeManagerNew}/>
      </div>
    </form>
  );
}
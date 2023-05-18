import { useAttributeManager } from '../../hooks';
import AttributeCreatorForm from './ui/AttributeCreatorForm';
import axios from 'axios';
import '../../styles/components/common/changeattributes.css';

export default function ChangeAttributes ({ pathID, attributes }) {
  const attributeManager = useAttributeManager();
  const attributeManagerNew = useAttributeManager();

  function validateNewAttributes() {
    for (
      const attributes
      of Object.values(attributeManagerNew.attributeHook.attributes)
    ) if (!attributes.length) return false;
    return true;
  }

  function gatherForm() {
    return [
      ...attributeManager.formHook.gatherAttributes(),
      ...attributeManagerNew.formHook.gatherAttributes()
    ];
  }

  function sendForm(event) {
    event.preventDefault();
    if (!validateNewAttributes()) return alert('Some attributes form are missed.')
    axios.request(`/api/projects/${pathID}/`,
      {
        method: 'patch',
        data: { attributes: gatherForm() },
        headers: { 'Content-Type': 'application/json' }
    })
      .then(({status, data}) => window.location.reload())
      .catch(err => alert(err));
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
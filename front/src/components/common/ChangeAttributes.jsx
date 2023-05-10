import { useState } from 'react';
import { useAttributeManager } from '../../hooks';
import AttributeCreatorForm from './ui/AttributeCreatorForm';
import axios from 'axios';
import '../../styles/components/common/changeattributes.css';

export default function ChangeAttributes ({ originalAtrs, pathID }) {
  const [choiceOpen, setChoiceOpen] = useState(null);
  const [loading, setLoading] = useState(false);
  const attributeManager = useAttributeManager();

  function handleOpen(choice) {
    setChoiceOpen(choice === choiceOpen ? null : choice);
  }

  function validateNewAttributes(newAttributes) {
    if (!newAttributes || !newAttributes.length) return;
    for (const { attributes } of newAttributes) if (!attributes.length) return;
    return true;
  }

  function handleEditAttributes() {
    return Promise.resolve({data: 'new back'})
    const attributes = attributeManager.formHook.gatherAttributes();
    return axios.request('/api/projects/',
      {
        method: 'post',
        data: { attributes },
        headers: { 'Content-Type': 'application/json' }
      })
  }

  function handleNewAttributes() {
    const attributes = attributeManager.formHook.gatherAttributes();
    return validateNewAttributes(attributes)
      ? axios.request('/api/projects/' + pathID,
        {
          method: 'patch',
          data: { attributes },
          headers: { 'Content-Type': 'application/json' }
        })
      : Promise.reject('No attributes specified');
  }

  function sendForm(event) {
    event.preventDefault();
    setLoading(true);
    (choiceOpen === 'edit' ? handleEditAttributes : handleNewAttributes)()
      .then(({status, data}) => {window.location.reload()})
      .catch(err => {
        alert(err);
        setLoading(false);
      });
  }

  return (
    <form onSubmit={sendForm} className='iss__changeAttributes'>
      <button
        type='button'
        onClick={() => handleOpen('edit')}
        className='iss__changeAttributes__button'
      >
        <span>edit current attributes</span>
        <svg className={`${choiceOpen === 'edit' ? 'point--up' : ''}`} viewBox="0 0 32 32">
          <polygon points="6.9,8 16,17.1 25.1,8 29,11.9 16,24.9 3,11.9"/>
        </svg>
      </button>
      <div
        className={`iss__changeAttributes__edit${choiceOpen === 'edit' ? ' edit--open' : ''}`}
      >
        <button>submit edit</button>
        <span>Change Attributes in development...</span>
      </div>
      <button
        type='button'
        onClick={() => handleOpen('new')}
        className='iss__changeAttributes__button'
      >
        <span>add new attributes</span>
        <svg className={`${choiceOpen === 'new' ? 'point--up' : ''}`} viewBox="0 0 32 32">
          <polygon points="6.9,8 16,17.1 25.1,8 29,11.9 16,24.9 3,11.9"/>
        </svg>
      </button>
      <div
        className={`iss__changeAttributes__edit${choiceOpen === 'new' ? ' edit--open' : ''}`}
      >
        <button>submit new</button>
        <div className='iss__changeAttributes__edit__new'>
          <AttributeCreatorForm
            attributeManager={attributeManager}
            withInitial={choiceOpen === 'new'}
          />
        </div>
      </div>
    </form>
  );
}
import { useEffect, useState } from 'react';
import ChangeAttributes from './common/ChangeAttributes';
import axios from 'axios';
import '../styles/components/projectedit.css';

export default function ProjectEdit({
  attributes,
  projectName,
  projectDescription,
  pathID
}) {
  const [action, setAction] = useState({});
  const [newText, setNewText] = useState('');

  const editActions = [
    { caption: 'Change name', value: 'name' },
    { caption: 'Change description', value: 'desc' },
    { caption: 'Change contributors', value: 'contr' },
    { caption: 'Change attributes', value: 'attrs' },
  ];

  useEffect(() => {
    setNewText('');
  }, [action]);

  return (
    <>
      <h2 className='iss__projectEdit__title'>Choose an action to perform...</h2>
      <div className='iss__projectEdit__content'>
        <aside className='iss__projectEdit__side'>
          {editActions.map(editAction => (
            <span
              key={editAction.value}
              onClick={() => setAction(editAction)}
              className={editAction.value === action.value ? 'iss__projectEdit__action--chosen' : ''}
            >{editAction.caption}</span>
          ))}
          <button
            onClick={() => alert('Tsss...')}
            className='iss__projectEdit__deleteButton'
          >delete project</button>
        </aside>
        <div className='iss__projectEdit__divider'/>
        {action.value !== 'attrs'
          ? <form className='iss__projectEdit__editor'>{action.caption ? action.caption + ' in development...' : ''}</form>
          : <ChangeAttributes attributes={attributes}/>}
      </div>

    </>
  );
}
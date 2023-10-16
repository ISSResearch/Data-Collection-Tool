import { useState } from 'react';
import { useFileInput } from '../hooks';
import { SelectorGroup } from './common/SelectorGroup';
import { FileInput } from './common/FileInput';
import UploadingView from './UploadingView';
import '../styles/components/filesupload.css';

export default function FilesUpload({ attributes, pathID }) {
  const [uploading, setUploading] = useState(false);
  const fileManager = useFileInput();

  function sendForm(event) {
    event.preventDefault();
    const { isValid, message } = fileManager.validate(attributes);
    if (!isValid) alert(message);
    else setUploading(true);
  }

  if (uploading) return <UploadingView fileManager={fileManager} pathID={pathID} />;

  return (
    <form className='iss__filesUpload'>
      <button
        onClick={sendForm}
        className={
          `iss__filesUpload__sendButton${Object.values(fileManager.files).length ? '' : ' send--disabled'
          }`
        }
      >SEND ALL</button>
      <SelectorGroup
        attributes={attributes}
        handleApply={fileManager.handleApplyGroups}
        isFiles={Boolean(Object.values(fileManager.files).length)}
      />
      <div className='iss__filesUpload__form__border' />
      <FileInput fileManager={fileManager} attributes={attributes} />
    </form>
  );
}

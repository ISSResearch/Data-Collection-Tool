import { useState } from 'react';
import { useFileInput } from '../hooks';
import { deepCopy } from '../utils/utils';
import SelectGroup from './common/ui/SelectGroup';
import FileInput from './common/ui/FileInput';
import UploadingView from './UploadingView';
import '../styles/components/filesupload.css';

export default function FilesUpload({ attributes, pathID }) {
  const [applyGroups, setApplyGroups] = useState({});
  const [uploading, setUploading] = useState(false);
  const fileManager = useFileInput();

  function handleApply(groups) { setApplyGroups(deepCopy(groups)); }

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
      <SelectGroup
        attributes={attributes}
        handleApply={handleApply}
        isFiles={Boolean(Object.values(fileManager.files).length)}
      />
      <div className='iss__filesUpload__form__border' />
      <FileInput
        fileManager={fileManager}
        attributes={attributes}
        applyGroups={applyGroups}
      />
    </form>
  );
}

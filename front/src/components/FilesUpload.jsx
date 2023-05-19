import { useState } from 'react';
import { useFileInput } from '../hooks';
import { deepCopy } from '../utils/utils';
import SelectGroup from './common/ui/SelectGroup';
import FileInput from './common/ui/FileInput';
import Load from './common/Load';
import axios from 'axios';
import '../styles/components/filesupload.css';

export default function FilesUpload({ attributes, pathID }) {
  const [applyGroups, setApplyGroups] = useState({});
  const [uploading, setUploading] = useState(false);
  const fileManager = useFileInput();

  function handleApply(groups) { setApplyGroups(deepCopy(groups)); }

  function sendForm(event) {
    event.preventDefault();
    setUploading(true);
    const { isValid, message } = fileManager.validate(attributes);
    if (!isValid) {
      alert(message);
      setUploading(false);
      return;
    }
    const files = fileManager.gatherFiles();
    const formData = new FormData();
    files.forEach(({file, name, extension, type, atrsGroups}) => {
      formData.append('files[]', file);
      formData.append('meta[]', JSON.stringify({name, extension, type, atrsGroups}));
    });
    axios.request(`/api/files/project/${pathID}/`,
      {
        method: 'post',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    )
      .then(({status, data}) => window.location.reload())
      .catch(err => {
        alert(err.message);
        window.location.reload();
      });
  }

  return (
    <form className='iss__filesUpload'>
      {
        !uploading &&
          <button
            onClick={sendForm}
            className={`iss__filesUpload__sendButton${fileManager.files?.length ? '': ' send--disabled'}`}
          >SEND ALL</button>
      }
      <SelectGroup
        attributes={attributes}
        handleApply={handleApply}
        isFiles={Boolean(fileManager.files?.length)}
      />
      <div className='iss__filesUpload__form__border'/>
      {
        uploading
          ? <div className='iss__filesUpload__loadingWrap'>
              <span>
                Uploading Data...<br/><b>Maximum of 100</b> files will be sent!
              </span>
              <Load/>
            </div>
          : <FileInput
            fileManager={fileManager}
            attributes={attributes}
            applyGroups={applyGroups}
          />
      }
    </form>
  );
}

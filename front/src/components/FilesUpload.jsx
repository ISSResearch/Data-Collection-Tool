import { useState } from 'react';
import { useFileInput } from '../hooks';
import SelectGroup from './common/ui/SelectGroup';
import FileInput from './common/ui/FileInput';
import Load from './common/Load';
import axios from 'axios';
import '../styles/components/filesupload.css';

// TODO: refactor
export default function FilesUpload({attributes, pathID}) {
  const [applyOptions, setApplyOptions] = useState({});
  const [uploading, setUploading] = useState(false);
  const fileManager = useFileInput();

  function handleApply(selected) { setApplyOptions(selected); }

  function gatherFiles() {
    const { files } = fileManager;
    const filesToSend = files.slice(0, 100);
    filesToSend.forEach(file => {
      const preparedAtrs = Object.values(file.atrsId)
        .reduce((acc, ids) => ids ? [...acc, ...ids] : acc, []);
      file.atrsId = preparedAtrs;
    })
    return filesToSend;
  }
  function sendForm(event) {
    event.preventDefault();
    setUploading(true);
    const files = gatherFiles();
    if (!files.length) return console.log('no values');
    const formData = new FormData();
    files.forEach(({file, name, extension, type, atrsId}) => {
      formData.append('files[]', file);
      formData.append('meta[]', JSON.stringify({name, extension, type, atrsId}));
    })
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
      {!uploading &&
        <button onClick={sendForm} className="iss__filesUpload__sendButton">
          SEND ALL
        </button>}
      <SelectGroup
        attributes={attributes}
        handleApply={handleApply}
        isFiles={Boolean(fileManager.files?.length)}
      />
      <div className='iss__filesUpload__form__border'/>
      {uploading
        ? <div className='iss__filesUpload__loadingWrap'>
            <span>
              Uploading Data...<br/><b>Maximum of 100</b> files will be sent!
            </span>
            <Load/>
          </div>
        : <FileInput
          fileManager={fileManager}
          attributes={attributes}
          applyOptions={applyOptions}
        />}
    </form>
  );
}

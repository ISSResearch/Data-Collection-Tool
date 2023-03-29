import { useNavigate } from 'react-router-dom'
import { useState } from 'react';
import { useFileInput } from '../hooks';
import SelectGroup from './common/ui/SelectGroup';
import FileInput from './common/ui/FileInput';
import axios from 'axios';
import '../styles/components/filesupload.css';

// TODO: refactor
export default function FilesUpload({attributes, pathID}) {
  const navigate = useNavigate();
  const fileManager = useFileInput();
  const [applyOptions, setApplyOptions] = useState({});

  function handleApply(selected) { setApplyOptions(selected); }

  function gatherFiles() {
    const {files} = fileManager;
    files.forEach(file => {
      const preparedAtrs = Object.values(file.atrsId)
        .reduce((acc, ids) => ids ? [...acc, ...ids] : acc, []);
      file.atrsId = preparedAtrs;
    })
    return files;
  }
  function sendForm(event) {
    event.preventDefault();
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
      .then(({status, data}) => navigate('/'))
      .catch(err => console.log(err.message));
  }

  return (
    <form className='iss__filesUpload'>
      <button onClick={sendForm} className="iss__filesUpload__sendButton">
        SEND ALL
      </button>
      <SelectGroup attributes={attributes} handleApply={handleApply} />
      <div className='iss__filesUpload__form__border'/>
      <FileInput
        fileManager={fileManager}
        attributes={attributes}
        applyOptions={applyOptions}
      />
    </form>
  );
}

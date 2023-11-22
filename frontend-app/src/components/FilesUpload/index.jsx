import { useBlocker } from "react-router-dom";
import { useState, useContext, useEffect } from 'react';
import { useFileInput } from '../../hooks';
import { AlertContext } from "../../context/Alert";
import SelectorGroup from '../forms/SelectorGroup';
import FileInput from '../forms/FileInput';
import UploadView from '../common/UploadView';
import './styles.css';

export default function({ attributes, pathID }) {
  const [uploading, setUploading] = useState(false);
  const { addAlert } = useContext(AlertContext);
  const fileManager = useFileInput();

  function sendForm(event) {
    event.preventDefault();

    var { isValid, message } = fileManager.validate(attributes);

    if (!isValid) addAlert("Uploading failed: " + message, "error");
    else setUploading(true);
  }

  useBlocker(() => {
    var filesCount = fileManager.count();
    return filesCount > 0
      ? !window.confirm(`Are you sure you wanna leave the page? ${filesCount} file(s) you added wont be saved!`)
      : false
  });

  useEffect(() => {
    var nativeBlocker = e => (fileManager.count() > 0) && e.preventDefault();
    window.addEventListener("beforeunload", nativeBlocker);
    return () => {
      window.removeEventListener("beforeunload", nativeBlocker);
    }
  }, [fileManager]);

  if (uploading) return <UploadView fileManager={fileManager} pathID={pathID} />;

  return (
    <form className='iss__filesUpload'>
      <button
        onClick={sendForm}
        className={
          `iss__filesUpload__sendButton${
            fileManager.count() ? '' : ' send--disabled'
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

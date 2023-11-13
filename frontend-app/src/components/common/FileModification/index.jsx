import { useEffect, useContext, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFile } from '../../../hooks'
import { api } from '../../../config/api';
import { AlertContext } from "../../../context/Alert";
import SelectorGroup from '../../forms/SelectorGroup';
import './styles.css';

export default function({ fileManager, sliderManager, attributes }) {
  const [keyListener, setKeyListener] = useState(false);
  const { files, setFiles } = fileManager;
  const { slide, slideInc } = sliderManager;
  const { file, initFile, handleGroupChange, validate } = useFile();
  const { addAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  const acceptRef = useRef(null);
  const declineRef = useRef(null);

  function handleKey({ key }) {
    var buttonMap = { 'a': acceptRef, 'd': declineRef };
    buttonMap[key]?.current.click();
  }

  async function fetchUpdateFile(status, newAttributes) {
    await api.request(`/api/files/${file.id}/`,
      {
        method: 'patch',
        data: { status, attribute: newAttributes },
        headers: {
          'Content-Type': 'application/json',
          "Authorization": "Bearer " + localStorage.getItem("dtcAccess")
        },
      }
    )
  }

  async function updateFile(status) {
    try {
      var { isValid, message } = validate(attributes);
      if (!isValid) throw new Error(message);

      var newFiles = [...files];
      var preparedAtrs = Object.entries(file.attributeGroups || {})
        .reduce((acc, [key, val]) => {
          return {
            ...acc,
            [key]: (Array.isArray(val) ? val : Object.values(val))
              .reduce((newacc, ids) => [...newacc, ...ids], [])
          }
        }, {});

      var updatedFile = { ...file, status, attributes: preparedAtrs };

      await fetchUpdateFile(status, preparedAtrs);

      newFiles[slide] = { ...updatedFile };

      setFiles(newFiles);
      slideInc();
    }
    catch({ message, response }) {
      var authFailed = response?.status === 401 || response?.status === 403;
      addAlert("Updating file failed: " + message, "error", authFailed);
      if (authFailed) navigate("/login");
    };
  }

  useEffect(() => {
    initFile(files[slide] || {});
    if (!keyListener) {
      window.addEventListener("keydown", handleKey);
      setKeyListener(true);
    }
    return () => {
      window.removeEventListener("keydown", handleKey);
    }
  }, [slide, files]);

  return (
    <div className='iss__fileInfo'>
      <h3 className='iss__fileInfo__title'>{file.file_name}</h3>
      <SelectorGroup
        fileID={file.id}
        attributes={attributes}
        attributeGroups={file.attributeGroups}
        fileIndex={slide}
        handleGroupChange={handleGroupChange}
      />
      {
        file?.id &&
        <div className='iss__fileInfo__buttonsWrap'>
          <button
            ref={declineRef}
            type='button'
            onClick={() => updateFile('d')}
            className='button--reject'
          >Decline<br />(D)</button>
          <button
            ref={acceptRef}
            type='button'
            onClick={() => updateFile('a')}
            className='button--accept'
          >Accept<br />(A)</button>
        </div>
      }
    </div>
  );
}

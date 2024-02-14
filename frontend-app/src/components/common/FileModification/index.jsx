import { useEffect, useContext, useRef, ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFile } from '../../../hooks';
import { api } from '../../../config/api';
import { AlertContext } from "../../../context/Alert";
import SelectorGroup from '../../forms/SelectorGroup';
import './styles.css';

/**
* @param {object} props
* @param {object} props.fileManager
* @param {object} props.sliderManager
* @param {object[]} props.attributes
* @returns {ReactElement}
*/
export default function FileModification({ fileManager, sliderManager, attributes }) {
  const { files, setFiles } = fileManager;
  const { slide, slideInc } = sliderManager;
  const { file, initFile, handleGroupChange, validate, prepareAttributes } = useFile();
  const { addAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  const acceptRef = useRef(null);
  const declineRef = useRef(null);

  function handleKey({ key }) {
    var buttonMap = {
      'a': acceptRef,
      'd': declineRef,
      'ф': acceptRef,
      'в': declineRef,
    };
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
    );
  }

  async function updateFile(status) {
    try {
      var { isValid, message } = validate(attributes);

      if (!isValid) throw new Error(message);

      var preparedAtrs = prepareAttributes();

      await fetchUpdateFile(status, preparedAtrs);

      setFiles((prev) => {
        var newFiles =  [ ...prev ];
        newFiles[slide] = { ...file, status, attributes: preparedAtrs };
        return newFiles;
      });
       slideInc();
    }
    catch({ message, response }) {
      var authFailed = response && (
        response.status === 401 || response.status === 403
      );
      addAlert("Updating file failed: " + message, "error", authFailed);
      if (authFailed) navigate("/login");
    }
  }

  useEffect(() => {
    initFile(files[slide] || {});
    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
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

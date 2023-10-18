import { useEffect, useState } from 'react';
import { useFile } from '../../hooks'
import { useNavigate } from 'react-router-dom';
import { SelectorGroup } from './SelectorGroup';
import { api } from '../../config/api';
import '../../styles/components/common/filemodification.css';

export default function FileModification({ fileManager, sliderManager, attributes }) {
  const [keyListener, setKeyListener] = useState(false);
  const { files, setFiles } = fileManager;
  const { slide, slideInc } = sliderManager;
  const { file, initFile, handleGroupChange, validate } = useFile();
  const navigate = useNavigate();

  function handleKeyPressed(key) {
    if (key === 'd' || key === 'a') {
      const target = document.getElementById('button-' + key);
      if (target) target.click();
    }
  }

  function fetchUpdateFile(status, newAttributes) {
    api.request(`/api/files/${file.id}/`,
      {
        method: 'patch',
        data: { status, attribute: newAttributes },
        headers: {
          'Content-Type': 'application/json',
          "Authorization": "Bearer " + localStorage.getItem("dtcAccess")
        },
      }
    ).catch(({ message, response }) => {
      const authFailed = response.status === 401 || response.status === 403;
      alert(authFailed ? "authentication failed" : message);
      if (authFailed) navigate("/login");
    });
  }

  function updateFile(status) {
    const { isValid, message } = validate(attributes);
    if (!isValid) return alert(message);
    const newFiles = [...files];
    const preparedAtrs = Object.entries(file.attributeGroups)
      .reduce((acc, [key, val]) => {
        return {
          ...acc,
          [key]: (Array.isArray(val) ? val : Object.values(val))
            .reduce((newacc, ids) => [...newacc, ...ids], [])
        }
      }, {});
    const updatedFile = { ...file, status, attributes: preparedAtrs };
    fetchUpdateFile(status, preparedAtrs);
    newFiles[slide] = { ...updatedFile };
    setFiles(newFiles);
    slideInc();
  }

  useEffect(() => {
    initFile(files[slide] || {});
    if (!keyListener) {
      window.addEventListener("keydown", ({ key }) => handleKeyPressed(key));
      setKeyListener(true);
    }
    return () => {
      window.removeEventListener("keydown", ({ key }) => handleKeyPressed(key));
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
            id='button-d'
            type='button'
            onClick={() => updateFile('d')}
            className='button--reject'
          >Decline<br />(D)</button>
          <button
            id='button-a'
            type='button'
            onClick={() => updateFile('a')}
            className='button--accept'
          >Accept<br />(A)</button>
        </div>
      }
    </div>
  );
}

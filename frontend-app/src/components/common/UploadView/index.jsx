import { useNavigate } from "react-router-dom"
import { useEffect, useState, useContext } from 'react';
import { useFileUploader } from '../../../hooks';
import { AlertContext } from '../../../context/Alert';
import Load from '../../ui/Load';
import './styles.css';

export default function({ fileManager, pathID }) {
  const { files, setFiles, proceedUpload } = useFileUploader(pathID);
  const [loading, setLoading] = useState(true);
  const [uploadProcess, setUploadProcess] = useState(false);
  const { addAlert } = useContext(AlertContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) {
      setFiles(() => fileManager.gatherFiles());
      setLoading(false);
    }
    if (files.length && !uploadProcess) {
      setUploadProcess(true);
      try {
        proceedUpload();
      }
      catch({ message, response }) {
        var authFailed = response?.status === 401 || response?.status === 403;

        addAlert("Uploading file error: " + message, "error", authFailed);

        if (authFailed) navigate("/login");
      }
    }
  }, [files]);

  if (loading) return <Load />;

  return (
    <>
      {
        files.map(({ name, progress, status, error }, index) => (
          <div key={index} className='iss__uploadProgress__item'>
            <div
              className={
                [
                  'iss__uploadProgress__completion',
                  status ? `complete-status-${status}` : ''
                ].join(' ')
              }
            />
            <span
              className={
                [
                  'iss__uploadProgress__fileName',
                  status ? `name-status-${status}` : ''
                ].join(' ')
              }
            >{name}</span>
            <div className='iss__uploadProgress__progressWrap'>
              <div
                style={{ width: `${progress || 0}%` }}
                className='iss__uploadProgress__progress'
              />
            </div>
            {error && <p className='iss__uploadProgress__error'>{error}</p>}
          </div>
        ))
      }
    </>
  );
}

import { useEffect, useState, ReactElemment } from 'react';
import { useAuthModal, useFileUploader } from '../../../hooks';
import { addAlert } from '../../../slices/alerts';
import { useDispatch } from "react-redux";
import Load from '../../ui/Load';
import Form from '../../forms/Form';
import './styles.css';

/**
* @param {object} props
* @param {object} props.fileManager
* @param {number} props.pathID
* @param {Function} props.setUploading
* @returns {ReactElemment}
*/
export default function UploadView({ fileManager, pathID, setUploading }) {
  const [loading, setLoading] = useState(true);
  const [uploadProcess, setUploadProcess] = useState(false);
  const { files, setFiles, proceedUpload } = useFileUploader(pathID);
  const {
    checkAuth,
    modalFields,
    handleAuth,
    modalLoading,
    modalErrors
  } = useAuthModal("authModal", runUpload);
  const dispatch = useDispatch();

  async function runModal() {
    try {
      await checkAuth();
      return true;
    }
    catch({ message, authFailed }) {
      dispatch(addAlert({
        message: "Uploading check error: " + message,
        type: "error",
        noSession: authFailed
      }));
      if (!authFailed) setUploading(false);
    }
  }

  async function runUpload() {
    setUploadProcess(true);

    if (!await runModal()) return;

    try { await proceedUpload(); }
    catch({ message, authFailed }) {
      dispatch(addAlert({
        message: "Uploading file error: " + message,
        type: "error",
        noSession: authFailed
      }));
      if (authFailed) await runModal();
      else setUploading(false);
    }
  }

  useEffect(() => {
    if (loading) {
      setFiles(() => fileManager.gatherFiles());
      setLoading(false);
    }
    if (files.length && !uploadProcess) runUpload();
  }, [files]);

  if (loading) return <Load />;

  return (
    <>
      {/* TODO: made modal, consider move to apps native */}
      <dialog id="authModal" className='iss__uploadProgress__modal'>
        <h2>Session expired, please login.</h2>
        <Form
          callback={handleAuth}
          loading={modalLoading}
          errors={modalErrors}
          fields={modalFields}
        />
      </dialog>
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

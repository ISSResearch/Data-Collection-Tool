import { useEffect, useState } from 'react';
import { useFileUploader } from '../hooks';
import Load from './common/Load';
import '../styles/components/uploadingviews.css';

export default function UploadingView({ fileManager, pathID }) {
  const { files, setFiles, proceedUpload } = useFileUploader(pathID);
  const [loading, setLoading] = useState(true);
  const [uploadProcess, setUploadProcess] = useState(false);

  useEffect(() => {
    if (loading) {
      setFiles(() => fileManager.gatherFiles());
      setLoading(false);
    }
    if (files.length && !uploadProcess) {
      setUploadProcess(true);
      proceedUpload();
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
            {/* TODO: made component - insert */}
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

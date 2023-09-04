import { useState, useRef } from 'react';
import { useFiles } from '../hooks';
import Load from './common/Load';
import FileDownloadSelector from './common/FileDowloadSelector';
import api from '../config/api';
import '../styles/components/filesdownload.css';

const OPTIONS = [
  { name: 'all', value: 'all', color: 'common' },
  { name: 'on validation', value: 'v', color: 'blue' },
  { name: 'accepted', value: 'a', color: 'green' },
  { name: 'declined', value: 'd', color: 'red' },
];

export default function FilesDownload({ pathID, projectName }) {
  const [isOpen, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [option, setOption] = useState(OPTIONS[0]);
  const [manual, setManual] = useState(false);
  const fileManager = useFiles();
  const boxNew = useRef();

  const handleSelect = (index) => {
    setOption(OPTIONS[index]);
    setOpen(!isOpen);
  };

  function downloadSelected(event) {
    event.preventDefault();
    setLoading(true);
    api.get(
      `/api/files/download/project/${pathID}/?files=${option.value}`,
      { responseType: 'blob' }
    )
      .then(({ status, data }) => {
        if (status === 204) throw new Error('no content');
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', projectName.toLowerCase() + '.zip');
        document.body.appendChild(link);
        link.click();
        setLoading(false);
      })
      .catch(({ message }) => {
        alert(message);
        setLoading(false);
      });
  }

  return (
    <div className='iss__filesDownload'>
      <h2 className='iss__filesDownload__caption'>Choose files to download</h2>
      <form onSubmit={(event) => downloadSelected(event)} className='iss__filesDownload__form'>
        <div className='iss__filesDownload__selector'>
          <div
            onClick={() => setOpen(!isOpen)}
            className={`iss__filesDownload__selected option--${option.color}`}
          >
            <span>{option.name}</span>
            <svg width="16" height="10" viewBox="0 0 14 8" className="arrow__pic">
              <path d="M12.9199 0.796875L12.3633 0.210938C12.2168 0.0644531 11.9824 0.0644531 11.8652 0.210938L6.5625 5.51367L1.23047 0.210938C1.11328 0.0644531 0.878906 0.0644531 0.732422 0.210938L0.175781 0.796875C0.0292969 0.914062 0.0292969 1.14844 0.175781 1.29492L6.29883 7.41797C6.44531 7.56445 6.65039 7.56445 6.79688 7.41797L12.9199 1.29492C13.0664 1.14844 13.0664 0.914062 12.9199 0.796875Z" />
            </svg>
          </div>
          <div className={`iss__filesDownload__options__wrap${isOpen ? ' options--open' : ''}`}>
            <div className='iss__filesDownload__options'>
              {
                OPTIONS.map(({ name, value, color }, index) => (
                  <span
                    key={value}
                    onClick={() => handleSelect(index)}
                    className={`option--${color}`}
                  >{name}</span>
                ))
              }
            </div>
          </div>
        </div>
        <label className='iss__filesDownload__inputBox__wrap'>
          <input ref={boxNew} type='checkbox' />
          <span>not downloaded before</span>
        </label>
        <label className='iss__filesDownload__inputBox__wrap'>
          <input type='checkbox' onChange={({ target }) => setManual(target.checked)} />
          <span>select manually from option</span>
        </label>
        <button className={`iss__filesDownload__button${loading ? ' block--button' : ''}`}>
          {loading ? <Load isInline /> : <span>request</span>}
        </button>
      </form>
      {
        manual &&
        <FileDownloadSelector
          pathID={pathID}
          newFiles={boxNew.current.checked}
          option={option}
          fileManager={fileManager}
        />
      }
    </div>
  );
}

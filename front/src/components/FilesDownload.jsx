import { useState } from 'react';
import Load from './common/Load';
import axios from 'axios';
import '../styles/components/filesdownload.css';

export default function FilesDownload({ pathID, projectName }) {
  const [isOpen, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [option, setOption] = useState({ name: 'all files', value: 'all' });

  const options = [
    { name: 'all files', value: 'all' },
    { name: 'on validation', value: 'validation' },
    { name: 'accepted files', value: 'accepted' },
    { name: 'declined files', value: 'declined' },
  ];

  const handleSelect = (index) => {
    setOption(options[index]);
    setOpen(!option);
  };

  function downloadSelected() {
    setLoading(true);
    axios.get(
      `/api/files/download/project/${pathID}/?files=${option.value}`,
      { responseType: 'blob', }
    )
      .then(({ status, data }) =>{
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
        console.log(message);
        setLoading(false);
      });
  }

  return (
    <div className='iss__filesDownload'>
        <h2 className='iss__filesDownload__caption'>Choose which files:</h2>
        <div className='iss__filesDownload__selector'>
          <div
            onClick={() => setOpen(!isOpen)}
            className={`iss__filesDownload__selected option--${option.value}`}
          >
            <span>{option.name}</span>
            <svg width="16" height="10" viewBox="0 0 14 8" className="arrow__pic">
            <path d="M12.9199 0.796875L12.3633 0.210938C12.2168 0.0644531 11.9824 0.0644531 11.8652 0.210938L6.5625 5.51367L1.23047 0.210938C1.11328 0.0644531 0.878906 0.0644531 0.732422 0.210938L0.175781 0.796875C0.0292969 0.914062 0.0292969 1.14844 0.175781 1.29492L6.29883 7.41797C6.44531 7.56445 6.65039 7.56445 6.79688 7.41797L12.9199 1.29492C13.0664 1.14844 13.0664 0.914062 12.9199 0.796875Z" />
            </svg>
          </div>
          <div className={`iss__filesDownload__options__wrap ${isOpen ? 'options--open' : ''}`}>
            <div className='iss__filesDownload__options'>
              {options.map(({ name, value }, index) => (
                <span
                  key={value}
                  onClick={() => handleSelect(index)}
                  className={`option--${value}`}
                >{name}</span>
              ))}
            </div>
          </div>
        </div>
      <button
        onClick={downloadSelected}
        type='button'
        className={`iss__filesDownload__button ${loading ? 'block--button' : ''}`}
      >{loading ? <Load isInline /> : <span>request</span>}</button>
    </div>
  );
}
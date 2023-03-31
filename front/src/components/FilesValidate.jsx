import { useEffect } from 'react';
import { useSwiper, useFiles } from '../hooks';
import FileSelector from './common/FileSelector';
import FileSwiper from './common/FileSwiper';
import FileInfo from './common/FIleInfo';
import axios from 'axios';
import '../styles/components/filesvalidate.css';

export default function FilesValidate({pathID, attributes}) {
  const fileManager = useFiles();
  const sliderManager = useSwiper();

  useEffect(() => {
    if (!pathID) return;
    axios.get(`/api/files/project/${pathID}/`)
      .then(({status, data}) => {
        fileManager.setFiles(data);
        sliderManager.setMax(data.length);
      })
      .catch(err => console.log('err', err.message));
  }, [pathID]);

  return (
    <div className='iss__validation'>
      <FileSelector fileManager={fileManager} sliderManager={sliderManager} />
      <FileSwiper fileManager={fileManager} sliderManager={sliderManager} />
      <FileInfo
        fileManager={fileManager}
        sliderManager={sliderManager}
        attributes={attributes}
      />
    </div>
  );
}
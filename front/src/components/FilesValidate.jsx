import { useEffect, useState } from 'react';
import { useSwiper, useFiles } from '../hooks';
import FileSelector from './common/FileSelector';
import FileSwiper from './common/FileSwiper';
import FileInfo from './common/FIleInfo';
import Load from './common/Load';
import axios from 'axios';
import '../styles/components/filesvalidate.css';

export default function FilesValidate({pathID, attributes}) {
  const [loading, setLoading] = useState(true);
  const fileManager = useFiles();
  const sliderManager = useSwiper();

  useEffect(() => {
    if (!pathID) return;
    axios.get(`/api/files/project/${pathID}/`)
      .then(({status, data}) => {
        fileManager.setFiles(data);
        sliderManager.setMax(data.length);
        setLoading(false);
      })
      .catch(err => console.log('err', err.message));
  }, [pathID]);

  if (loading) return <div className='iss__validation__load'><Load /></div>

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
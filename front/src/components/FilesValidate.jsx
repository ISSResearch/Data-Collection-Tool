import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom'
import { useSwiper, useFiles } from '../hooks';
import ValidationFilterGroup from './common/ui/ValidationFilterGroup';
import FileSelector from './common/FileSelector';
import FileSwiper from './common/FileSwiper';
import FileModification from './common/FileModification';
import Load from './common/Load';
import api from '../config/api';
import '../styles/components/filesvalidate.css';

const CARD_FILTERS = [
  { name: 'on validation', id: 'v' },
  { name: 'accepted', id: 'a' },
  { name: 'declined', id: 'd' },
]
const TYPE_FILTER = [
  { name: 'images', id: 'image' },
  { name: 'videos', id: 'video' },
]

export default function FilesValidate({ pathID, attributes, rawAttributes }) {
  const [loading, setLoading] = useState(true);
  const [pageQuery, setPageQuery] = useSearchParams();
  const [filterData, setFilterData] = useState({});
  const fileManager = useFiles();
  const sliderManager = useSwiper();

  function getPageQuery() {
    return {
      card: pageQuery.getAll('card[]'),
      attr: pageQuery.getAll('attr[]'),
      type: pageQuery.getAll('type[]'),
    };
  }

  function hadleFilterChange(filterType, query) {
    const { card, attr, type } = getPageQuery();
    setPageQuery({
      'card[]': filterType === 'card' ? query : card,
      'attr[]': filterType === 'attr' ? query : attr,
      'type[]': filterType === 'type' ? query : type,
    });
  }

  useEffect(() => {
    const { card, attr, type } = getPageQuery();
    api.get(`/api/files/project/${pathID}/`, { params:  { card, attr, type } })
      .then(({ data }) => {
        fileManager.initFiles(data);
        sliderManager.setMax(data.length);
        setFilterData([
          {
            prettyName: 'Card Filter:',
            name: 'card',
            data: CARD_FILTERS,
            selected: card,
            manual: true,
            isAlpha: true
          },
          {
            prettyName: 'Attribute Filter:',
            name: 'attr',
            data: rawAttributes.reduce((acc, { attributes }) => [...acc, ...attributes], []),
            selected: attr,
            manual: true,
          },
          {
            prettyName: 'Filetype Filter:',
            name: 'type',
            data: TYPE_FILTER,
            selected: type,
            manual: true,
            isAlpha: true
          },
        ]);
        setLoading(false);
      })
      .catch(err => alert('err', err.message));
  }, []);

  if (loading) return <div className='iss__validation__load'><Load/></div>

  return (
    <>
      <ValidationFilterGroup filterData={filterData} hadleChange={hadleFilterChange}/>
      {
        fileManager.files.length
          ? <div className='iss__validation'>
            <FileSelector fileManager={fileManager} sliderManager={sliderManager} />
            <FileSwiper fileManager={fileManager} sliderManager={sliderManager} />
            <FileModification
              fileManager={fileManager}
              sliderManager={sliderManager}
              attributes={attributes}
            />
          </div>
          : <p>No files just yet or no query matches selected params.</p>
      }
    </>
  );
}
// TODO: changed - revise tests
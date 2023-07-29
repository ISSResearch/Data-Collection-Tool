import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom'
import { useSwiper, useFiles } from '../hooks';
import FileSelector from './common/FileSelector';
import FileSwiper from './common/FileSwiper';
import FileModification from './common/FileModification';
import Load from './common/Load';
import api from '../config/api';
import '../styles/components/filesvalidate.css';


const FILTERS = [
  { name: 'all', colors: 'blue', value: 'all' },
  { name: 'on validation', colors: 'blue', value: 'v' },
  { name: 'accepted', colors: 'green', value: 'a' },
  { name: 'declined', colors: 'red', value: 'd' },
]

export default function FilesValidate({pathID, attributes}) {
  const [loading, setLoading] = useState(true);
  const [cardFilter, setCardFilter] = useState('all');
  const [pageQuery, setPageQuery] = useSearchParams();
  const fileManager = useFiles();
  const sliderManager = useSwiper();

  const handleFilterChange = ({value}) => {
    setCardFilter(value);
    setPageQuery({ card: value });
  }

  useEffect(() => {
    if (!pathID) return;

    function getPageQuery() {
      return {
        card: pageQuery.get('card'),
        attribute: pageQuery.get('attribute')
      }
    }
    const { card, attribute } = getPageQuery();
    setCardFilter(card || 'all');

    api.get(`/api/files/project/${pathID}/`, { params:  { card, attribute } })
      .then(({ data }) => {
        fileManager.initFiles(data);
        sliderManager.setMax(data.length);
        setLoading(false);
      })
      .catch(err => alert('err', err.message));
  }, [pathID]);

  if (loading) return <div className='iss__validation__load'><Load /></div>

  return (
    <>
      <fieldset
        onChange={({target}) => handleFilterChange(target)}
        className='iss__validation__filters'
      >
        {
          FILTERS.map(({name, colors, value}) => (
            <label
              key={value}
              className={
                [
                  'iss__filters__option',
                  'option--' + colors,
                  (value === cardFilter) ? 'checked--' + colors : ''
                ].join(' ')
              }
            >
              <input type="radio" name="cardFilter" value={value} />
              {name}
            </label>
          ))
        }
      </fieldset>
      <div className='iss__validation'>
        <FileSelector fileManager={fileManager} sliderManager={sliderManager} />
        <FileSwiper fileManager={fileManager} sliderManager={sliderManager} />
        <FileModification
          fileManager={fileManager}
          sliderManager={sliderManager}
          attributes={attributes}
        />
      </div>
    </>
  );
}
// TODO: changed - revise tests
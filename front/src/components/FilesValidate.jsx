import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom'
import { useSwiper, useFiles } from '../hooks';
import SelectorItem from './common/ui/SelectorItem';
import FileSelector from './common/FileSelector';
import FileSwiper from './common/FileSwiper';
import FileModification from './common/FileModification';
import Load from './common/Load';
import api from '../config/api';
import '../styles/components/filesvalidate.css';

const CARD_FILTERS = [
  { name: 'all', id: 'all' },
  { name: 'on validation', id: 'v' },
  { name: 'accepted', id: 'a' },
  { name: 'declined', id: 'd' },
]

export default function FilesValidate({pathID, attributes}) {
  const [loading, setLoading] = useState(true);
  const [cardFilter, setCardFilter] = useState(['all']);
  const [pageQuery, setPageQuery] = useSearchParams();
  const fileManager = useFiles();
  const sliderManager = useSwiper();

  function handleFilterChange(type, ids) {
    console.log(type, ids);
    // setCardFilter(value);
    // setPageQuery({ cards: value });
  }

  useEffect(() => {
    if (!pathID) return;

    function getPageQuery() {
      return {
        cards: pageQuery.getAll('cards[]'),
        attribute: pageQuery.get('attribute')
      }
    }
    const { cards, attribute } = getPageQuery();
    setCardFilter(cards.length ? cards : ['all']);

    api.get(`/api/files/project/${pathID}/`, { params:  { cards, attribute } })
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
      <fieldset className='iss__validation__filters'>
        <SelectorItem
          selectorId={1}
          selectorName={'cards'}
          selectorOptions={CARD_FILTERS}
          handleSelect={(ids) => handleFilterChange('cards', ids)}
          defaultSelected={cardFilter}
          isAlpha
          manual
        />
        <SelectorItem
          selectorId={2}
          selectorName={'attributes'}
          selectorOptions={attributes}
          handleSelect={(ids) => handleFilterChange('atrs', ids)}
          // defaultSelected={cardFilter}
          manual
        />
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
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom'
import { useSwiper, useFiles, useValidateFilter } from '../hooks';
import SelectorItem from './common/ui/SelectorItem';
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
  const fileManager = useFiles();
  const sliderManager = useSwiper();
  const { filterData, selected, initFilters, changeFilters } = useValidateFilter();

  function getPageQuery() {
    return {
      card: pageQuery.getAll('card[]'),
      attr: pageQuery.getAll('attr[]'),
      type: pageQuery.getAll('type[]'),
    };
  }

  function handleFilterChange(filterType, query) {
    changeFilters(filterType, query);
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
        initFilters(CARD_FILTERS, rawAttributes, TYPE_FILTER, card, attr, type);
        setLoading(false);
      })
      .catch(err => alert('err', err.message));
  }, []);

  if (loading) return <div className='iss__validation__load'><Load /></div>

  return (
    <>
      <fieldset className='iss__validation__filters'>
        <SelectorItem
          selectorId={1}
          selectorName={'cards'}
          selectorOptions={filterData.card}
          handleSelect={(ids) => handleFilterChange('card', ids)}
          defaultSelected={selected.card}
          isAlpha
          manual
        />
        <SelectorItem
          selectorId={2}
          selectorName={'attributes'}
          selectorOptions={filterData.attr}
          handleSelect={(ids) => handleFilterChange('attr', ids)}
          defaultSelected={selected.attr}
          manual
        />
        <SelectorItem
          selectorId={3}
          selectorName={'type'}
          selectorOptions={filterData.type}
          handleSelect={(ids) => handleFilterChange('type', ids)}
          defaultSelected={selected.type}
          isAlpha
          manual
        />
      </fieldset>
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
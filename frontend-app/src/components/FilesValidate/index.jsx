import { useEffect, useContext, useState, ReactElement } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSwiper, useFiles } from '../../hooks';
import { api } from '../../config/api';
import { AlertContext } from "../../context/Alert";
import ValidationFilterGroup from '../forms/ValidationFilterGroup';
import FileSelector from '../common/FileSelector';
import FileSwiper from '../common/FileSwiper';
import FileModification from '../common/FileModification';
import Load from '../ui/Load';
import './styles.css';

/** @type {{name: string, id: string}[]} */
const CARD_FILTERS = [
  { name: 'on validation', id: 'v' },
  { name: 'accepted', id: 'a' },
  { name: 'declined', id: 'd' },
];
/** @type {{name: string, id: string}[]} */
const TYPE_FILTER = [
  { name: 'images', id: 'image' },
  { name: 'videos', id: 'video' },
];

/**
* @param {object} props
* @param {number} props.pathID
* @param {object[]} props.attributes
* @param {boolean} props.canValidate
* @returns {ReactElement}
*/
export default function FilesValidation({ pathID, attributes, canValidate }) {
  const [loading, setLoading] = useState(true);
  const [pageQuery, setPageQuery] = useSearchParams();
  const [filterData, setFilterData] = useState({});
  const { addAlert } = useContext(AlertContext);
  const fileManager = useFiles();
  const sliderManager = useSwiper();
  const navigate = useNavigate();

  function getPageQuery() {
    return {
      card: pageQuery.getAll('card[]'),
      attr: pageQuery.getAll('attr[]'),
      type: pageQuery.getAll('type[]'),
      author: pageQuery.getAll('author[]'),
    };
  }

  function handleChange(filterType, query) {
    var { card, attr, type, author } = getPageQuery();

    setPageQuery({
      'card[]': filterType === 'card' ? query : card,
      'attr[]': filterType === 'attr' ? query : attr,
      'type[]': filterType === 'type' ? query : type,
      'author[]': filterType === 'author' ? query : author,
    });
  }

  useEffect(() => {
    var { card, attr, type, author } = getPageQuery();

    if (!card.length) handleChange("card", ['v']);

    // TODO: query collectors depend on uploads to project by users
    Promise.allSettled([
      api.get(`/api/files/project/${pathID}/`, {
        params: { card, attr, type, author },
        headers: { "Authorization": "Bearer " + localStorage.getItem("dtcAccess") }
      }),
     canValidate && api.get(`api/users/collectors/${pathID}/`, {
       headers: { "Authorization": "Bearer " + localStorage.getItem("dtcAccess") }
     })
    ])
      .then(([fileFetch, authorFetch]) => {
        var { value: { data } } = fileFetch;
        fileManager.initFiles(data);
        sliderManager.setMax(data.length);

        var _filterData = [
          {
            prettyName: 'Card Filter:',
            name: 'card',
            data: CARD_FILTERS,
            selected: card,
          },
          {
            prettyName: 'Attribute Filter:',
            name: 'attr',
            data: attributes,
            selected: attr,
            attributes: true
          },
          {
            prettyName: 'Filetype Filter:',
            name: 'type',
            data: TYPE_FILTER,
            selected: type,
          },
        ];

        if (canValidate) _filterData.push({
          prettyName: 'Author Filter:',
          name: 'author',
          data: authorFetch.value.data.map(({id, username}) => ({ name: username, id })),
          selected: author,
        });

        setFilterData(_filterData);

        setLoading(false);
      })
      .catch(({ message, response }) => {
        var authFailed = response && (response.status === 401 || response.status === 403);

        addAlert("Getting project files error: " + message, "error", authFailed);

        if (authFailed) navigate("/login");
      });
  }, [pageQuery]);

  if (loading) return <div className='iss__validation__load'><Load /></div>;

  return (
    <>
      <ValidationFilterGroup filterData={filterData} onChange={handleChange} />
      {
        fileManager.files.length
          ? <div className='iss__validation'>
            <FileSelector fileManager={fileManager} sliderManager={sliderManager} />
            <FileSwiper pathID={pathID} fileManager={fileManager} sliderManager={sliderManager} />
            {
              canValidate &&
              <FileModification
                fileManager={fileManager}
                sliderManager={sliderManager}
                attributes={attributes}
              />
            }
          </div>
          : <p>No files just yet or no query matches selected params.</p>
      }
    </>
  );
}

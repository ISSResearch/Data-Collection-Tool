import { useEffect, useState, ReactElement } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSwiper, useFiles } from '../../hooks';
import { api } from '../../config/api';
import { addAlert } from '../../slices/alerts';
import { useDispatch } from "react-redux";
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
  const [filterData, setFilterData] = useState([]);
  // todo: temp solution: in case current filtered cards updated i have to fetch same page
  const [updated, setUpdated] = useState(false);
  const dispatch = useDispatch();
  const fileManager = useFiles();
  const sliderManager = useSwiper();
  const navigate = useNavigate();

  const slideDec = () => {
    var { slide, slideDec, pagination } = sliderManager;
    var { page } = pagination || {};

    if (slide === 0 && page !== 1)
      handleChange("page", page - Number(!updated));
    else slideDec();
  };

  const slideInc = (update=false) => {
    if (update) setUpdated(true);

    var { slide, slideInc, pagination } = sliderManager;
    var { per_page, page, totalPages } = pagination || {};

    if (slide === (per_page - 1) && page < totalPages)
      handleChange("page", page + Number(!updated));
    else slideInc();
  };

  const getPageQuery = () => {
    var from = pageQuery.get("date_from");
    var to =  pageQuery.get("date_to");

    return {
      card: pageQuery.getAll('card[]'),
      attr: pageQuery.getAll('attr[]'),
      type: pageQuery.getAll('type[]'),
      author: pageQuery.getAll('author[]'),
      date: (from || to) && { from, to },
      page: pageQuery.get("page")
    };
  };

  // TODO: refactor
  const handleChange = (filterType, query) => {
    var { card, attr, type, author, date, page } = getPageQuery();
    var preparedQuery = {
      'card[]': filterType === 'card' ? query : card,
      'attr[]': filterType === 'attr' ? query : attr,
      'type[]': filterType === 'type' ? query : type,
      'author[]': filterType === 'author' ? query : author,
    };

    if (filterType === "date" || date?.from) {
      let value = filterType === "date" ? query?.from : date?.from;
      if (value) preparedQuery.date_from = value;
    }
    if (filterType === "date" || date?.to) {
      let value = filterType === "date" ? query?.to : date?.to;
      if (value) preparedQuery.date_to = value;
    }
    if (filterType === "page" || page) {
      let value = filterType === "page" ? query : page;
      if (value) preparedQuery.page = value;
    }

    setPageQuery(preparedQuery);
  };

  useEffect(() => {
    setUpdated(false);

    var { card, attr, type, author, date, page } = getPageQuery();

    if (!card.length) handleChange("card", ['v']);

    // TODO: query collectors depend on uploads to project by users
    Promise.allSettled([
      api.get(`/api/files/project/${pathID}/`, {
        params: { card, attr, type, author, from: date?.from, to: date?.to, page },
        headers: { "Authorization": "Bearer " + localStorage.getItem("dtcAccess") }
      }),
      canValidate && api.get(`api/users/collectors/${pathID}/`, {
        headers: { "Authorization": "Bearer " + localStorage.getItem("dtcAccess") }
      })
    ])
      .then(([fileFetch, authorFetch]) => {
        var { value: { data } } = fileFetch;
        var { data: files, page, total_pages: totalPages, per_page } = data;

        fileManager.initFiles(files);
        sliderManager.setMax(files.length);
        sliderManager.setPagination({ page, totalPages, per_page });

        /**
        * @type {{
        * prettyName: string,
        * name: string,
        * data?: Array,
        * selected: Array | object,
        * type?: string
        * }[]}
        */
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
            type: "attr"
          },
          {
            prettyName: 'Filetype Filter:',
            name: 'type',
            data: TYPE_FILTER,
            selected: type,
          },
        ];

        if (canValidate) _filterData.push(...[
          {
            prettyName: "Author Filter:",
            name: "author",
            data: authorFetch.value.data.map(({id, username}) => ({ name: username, id })),
            selected: author,
          },
          {
            prettyName: "Date Filter:",
            name: "date",
            selected: date,
            type: "date",
          }
        ]);

        setFilterData(_filterData);
        setLoading(false);
      })
      .catch(({ message, response }) => {
        var authFailed = response && (response.status === 401 || response.status === 403);

        dispatch(addAlert({
          message: "Getting project files error: " + message,
          type: "error",
          noSession: authFailed
        }));

        if (authFailed) navigate("/login");
      });
  }, [pageQuery]);

  if (loading) return <div className='iss__validation__load'><Load /></div>;

  return (
    <>
      <ValidationFilterGroup filterData={filterData} onChange={handleChange}/>
      {
        fileManager.files.length
          ? <div className='iss__validation'>
            <FileSelector
              fileManager={fileManager}
              sliderManager={sliderManager}
              onChange={handleChange}
            />
            <FileSwiper
              pathID={pathID}
              fileManager={fileManager}
              slide={sliderManager.slide}
              slideInc={slideInc}
              slideDec={slideDec}
            />
            {
              canValidate &&
              <FileModification
                fileManager={fileManager}
                attributes={attributes}
                slide={sliderManager.slide}
                slideInc={slideInc}
              />
            }
          </div>
          : <p>No files just yet or no query matches selected params.</p>
      }
    </>
  );
}

import { useState, ReactElement, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../config/api";
import { useDispatch } from "react-redux";
import { addAlert } from "../../slices/alerts";
import Load from "../ui/Load";
import ValidationFilterGroup from '../forms/ValidationFilterGroup';
import "./styles.css";

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
* @param {object} props.attributes
* @returns {ReactElement}
*/
export default function FilesDownload({ pathID, attributes }) {
  const [filterData, setFilterData] = useState({});
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const filterFields = useMemo(() => [
    {
      prettyName: 'Card Filter:',
      name: 'card',
      data: CARD_FILTERS,
    },
    {
      prettyName: 'Attribute Filter:',
      name: 'attr',
      data: attributes,
      type: "attr"
    },
    {
      prettyName: 'Filetype Filter:',
      name: 'type',
      data: TYPE_FILTER,
    },
  ], [attributes]);

  const handleChange = (type, data) =>
    setFilterData((prev) => ({ ...prev, [type]: data }));

  const createTask = async (event) => {
    event.preventDefault();
    var isNew = event.target.newFiles.checked;

    setLoading(true);

    try {
      var payload = { ...filterData };
      if (isNew) payload.downloaded = false;

      await api.post(`/api/projects/archive/${pathID}/`, payload, {
        headers: { Authorization: "Bearer " + localStorage.getItem("dtcAccess") },
      });
    }
    catch ({ message, response }) {
      var authFailed = response && (
        response.status === 401 || response.status === 403
      );

      dispatch(addAlert({
        message: "Getting files data error:" + message,
        type: "error",
        noSession: authFailed
      }));

      if (authFailed) navigate("/login");
    }

    setLoading(false);
  };

  return (
    <div className="iss__filesDownload">
      <h2 className="iss__filesDownload__caption">
        Choose files to download or enter existing taskID
      </h2>
      <ValidationFilterGroup
        disabled={false}
        filterData={filterFields}
        onChange={handleChange}
      />
      <form onSubmit={createTask} className="iss__filesDownload__form">
        <fieldset className="iss__filesDownload__mainSet">
          <label className="iss__filesDownload__inputBox__wrap">
            <input name="newFiles" type="checkbox" />
            <span>not downloaded before</span>
          </label>
        </fieldset>
        <button
          className={
            `iss__filesDownload__button${ loading ? " block--button" : "" }`
          }
        >{loading ? <Load isInline /> : <span>request</span>}</button>
      </form>
    </div>
  );
}

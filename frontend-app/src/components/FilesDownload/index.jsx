import { useState, ReactElement, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, fileApi } from "../../config/api";
import { useDispatch } from "react-redux";
import { addAlert } from "../../slices/alerts";
import { getOriginDomain } from "../../utils";
import Load from "../ui/Load";
import ValidationFilterGroup from '../forms/ValidationFilterGroup';
import DownloadTable from "./DownloadTable";
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
  const [downloads, setDownloads] = useState([]);
  const newCheckBox = useRef(null);
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

  const createTask = async () => {
    setLoading(true);

    try {
      var payload = { ...filterData };
      if (newCheckBox.current.checked) payload.only_new = true;

      await api.post(`/api/projects/archive/${pathID}/`, payload, {
        headers: { Authorization: "Bearer " + localStorage.getItem("dtcAccess") },
      });

      getDownloads();
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

  const getDownloads = async () => {
    try {
      const { data } = await api.get(`/api/projects/archive/${pathID}/`, {
        headers: { Authorization: "Bearer " + localStorage.getItem("dtcAccess") },
      });

      setDownloads(data);
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
  };

  const getDataset = async (archiveId) => {
    try {
      if (!archiveId) throw new Error("Error! No data found");

      var { data: token } = await fileApi.get("/api/temp_token/", {
        headers: { "Authorization": "Bearer " + localStorage.getItem("dtcAccess") }
      });

      if (!token) throw new Error("No token returned");

      var baseUrl = getOriginDomain() + ":9000/api/storage/temp_storage/";
      var accessQuery = `/?access=${token}&archive=1`;

      var link = document.createElement("a");
      link.href = baseUrl + archiveId + accessQuery;
      link.setAttribute("download", "dataset.zip");

      link.click();
      link.remove();
    }
    catch({ message, response }) {
      var authFailed = response && (
        response.status === 401 || response.status === 403
      );

      dispatch(addAlert({
        message: "Process request error: " + message,
        type: "error",
        noSession: authFailed
      }));
    }
  };

  useEffect(() => {
    getDownloads();
  }, []);

  return <>
    {/* todo: supposed to be a form element but val filter group has it inside */}
    <div className="downloads">
      <ValidationFilterGroup
        disabled={false}
        filterData={filterFields}
        onChange={handleChange}
      />
      <fieldset className="downloads__mainSet">
        <label className="downloads__inputBox__wrap">
          <input ref={newCheckBox} name="newFiles" type="checkbox" />
          <span>not downloaded before</span>
        </label>
      </fieldset>
      <button
        type="button"
        onClick={createTask}
        className={
          `downloads__button${ loading ? " block--button" : "" }`
        }
      >{loading ? <Load isInline /> : <span>request</span>}</button>
    </div>
    {
      !!downloads.length &&
      <DownloadTable data={downloads} onDownload={getDataset}/>
    }
  </>;
}

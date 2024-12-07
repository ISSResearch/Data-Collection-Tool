import { useState, ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { api, fileApi } from "../../config/api";
import { useFiles } from "../../hooks";
import { useDispatch } from "react-redux";
import { addAlert } from "../../slices/alerts";
import Load from "../ui/Load";
import FileDownloadSelector from "../forms/FileDownloadSelector";
import ValidationFilterGroup from '../forms/ValidationFilterGroup';
import DownloadView from "../common/DownloadView";
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
  const [manual, setManual] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [task, setTask] = useState("");
  const dispatch = useDispatch();
  const fileManager = useFiles();
  const navigate = useNavigate();

  const FILTER_FIELDS = [
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
  ];

  const handleChange = (type, data) => {
    setFilterData((prev) => ({ ...prev, [type]: data }));
  };

  const handleTaskInput = ({ value }) => {
    var className = "set--hidden";
    var hideElement = document.querySelector(".iss__filesDownload__mainSet");

    if (!value) return hideElement.classList.remove(className);
    if (!hideElement.classList.contains(className)) hideElement.classList.add(className);
  };

  const getFiles = async () => {
    var file_ids;

    if (manual) file_ids = fileManager.files
      .filter(({ is_downloaded }) => !is_downloaded)
      .map(({ id }) => id);

    else {
      var params = { ...filterData, per_page: "max" };
      if (isNew) params.downloaded = false;

      var { data } = await api.get(`/api/files/project/${pathID}/`, {
        params,
        headers: { Authorization: "Bearer " + localStorage.getItem("dtcAccess") },
      });
      file_ids = (
        isNew
          ? data.data.filter(({ is_downloaded }) => !is_downloaded)
          : data.data
      ).map(({ id }) => id);
    }

    if (!file_ids.length) throw new Error("No content");

    return file_ids;
  };

  const downloadSelected = async (event) => {
    event.preventDefault();

    var taskInput = event.target.taskID;

    if (taskInput?.value) return setTask(taskInput.value);

    setLoading(true);

    try {
      var file_ids = await getFiles();

      var { data } = await fileApi.post(`/api/task/archive/`,
        { bucket_name: `project_${pathID}`, file_ids },
        { headers: { Authorization: "Bearer " + localStorage.getItem("dtcAccess") } },
      );

      if (data?.task_id) {
        dispatch(addAlert({
          message: `Download task ${data.task_id} created`,
          type: "success"
        }));
        setTask(data.task_id);
      }
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

  if (task) return <DownloadView taskID={task} />;

  return (
    <div className="iss__filesDownload">
      <h2 className="iss__filesDownload__caption">
        Choose files to download or enter existing taskID
      </h2>
      <ValidationFilterGroup filterData={FILTER_FIELDS} onChange={handleChange} />
      <form
        onSubmit={(event) => downloadSelected(event)}
        className="iss__filesDownload__form"
      >
        <fieldset className="iss__filesDownload__mainSet">
          <label className="iss__filesDownload__inputBox__wrap">
            <input type="checkbox" onChange={() => setIsNew(!isNew)} />
            <span>not downloaded before</span>
          </label>
          <label className="iss__filesDownload__inputBox__wrap">
            <input
              type="checkbox"
              onChange={({ target }) => setManual(target.checked)}
            />
            <span>select manually from option</span>
          </label>
        </fieldset>
        <input
          onChange={({ target }) => handleTaskInput(target)}
          type="text"
          placeholder="taskID"
          autoComplete="off"
          name="taskID"
        />
        <button
          className={
            `iss__filesDownload__button${ loading ? " block--button" : "" }`
          }
        >{loading ? <Load isInline /> : <span>request</span>}</button>
      </form>
      {
        manual &&
        <FileDownloadSelector
          pathID={pathID}
          params={filterData}
          isNew={isNew}
          fileManager={fileManager}
        />
      }
    </div>
  );
}

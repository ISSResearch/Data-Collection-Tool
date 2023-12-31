import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { api, fileApi } from "../../config/api";
import { useFiles } from "../../hooks";
import { AlertContext } from "../../context/Alert";
import Load from "../ui/Load";
import FileDownloadSelector from "../forms/FileDownloadSelector";
import DownloadView from "../common/DownloadView";
import "./styles.css";

const OPTIONS = [
  { name: "all", value: "all", color: "common" },
  { name: "on validation", value: "v", color: "blue" },
  { name: "accepted", value: "a", color: "green" },
  { name: "declined", value: "d", color: "red" },
];

export default function({ pathID }) {
  const [isOpen, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [option, setOption] = useState(OPTIONS[0]);
  const [manual, setManual] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [task, setTask] = useState("");
  const { addAlert } = useContext(AlertContext);
  const fileManager = useFiles();
  const navigate = useNavigate();

  const handleSelect = (index) => {
    setOption(OPTIONS[index]);
    setOpen(!isOpen);
  };

  async function getFiles() {
    var file_ids;

    if (manual) file_ids = fileManager.files
      .filter(({ is_downloaded }) => !is_downloaded)
      .map(({ id }) => id);

    else {
      var params = {};

      if (isNew) params.downloaded = false;
      if (option.value !== "all") params.status = option.value;

      var { data } = await api.get(`/api/files/project/${pathID}/`, {
        params,
        headers: { Authorization: "Bearer " + localStorage.getItem("dtcAccess") },
      });
      file_ids = (
        isNew ? data.filter(({ is_downloaded }) => !is_downloaded) : data
      ).map(({ id }) => id);
    }

    if (!file_ids.length) throw new Error("No content");

    return file_ids;
  }

  function handleTaskInput({ value }) {
    var className = "set--hidden";
    var hideElement = document.querySelector(".iss__filesDownload__mainSet");

    if (!value) return hideElement.classList.remove(className);
    if (!hideElement.classList.contains(className)) hideElement.classList.add(className);
  }

  async function downloadSelected(event) {
    event.preventDefault();

    var taskInput = event.target.taskID;

    if (taskInput.value) return setTask(taskInput.value);

    setLoading(true);

    try {
      var file_ids = await getFiles();

      var { data } = await fileApi.post(`/api/task/archive/`,
        { bucket_name: `project_${pathID}`, file_ids },
        { headers: { Authorization: "Bearer " + localStorage.getItem("dtcAccess") } },
      );

      if (data?.task_id) {
        addAlert(`Download task ${data.task_id} created`, "success");
        setTask(data.task_id);
      }
    }
    catch ({ message, response }) {
      var authFailed = response && (
        response.status === 401 || response.status === 403
      );

      addAlert("Getting files data error:" + message, "error", authFailed);

      if (authFailed) navigate("/login");
    }

    setLoading(false);
  }

  if (task) return <DownloadView taskID={task} />;

  return (
    <div className="iss__filesDownload">
      <h2 className="iss__filesDownload__caption">
        Choose files to download or enter existing taskID
      </h2>
      <form
        onSubmit={(event) => downloadSelected(event)}
        className="iss__filesDownload__form"
      >
        <fieldset className="iss__filesDownload__mainSet">
          <div className="iss__filesDownload__selector">
            <div
              onClick={() => setOpen(!isOpen)}
              className={`iss__filesDownload__selected option--${option.color}`}
            >
              <span>{option.name}</span>
              <svg
                width="16"
                height="10"
                viewBox="0 0 14 8"
                className="arrow__pic"
              >
                <path d="M12.9199 0.796875L12.3633 0.210938C12.2168 0.0644531 11.9824 0.0644531 11.8652 0.210938L6.5625 5.51367L1.23047 0.210938C1.11328 0.0644531 0.878906 0.0644531 0.732422 0.210938L0.175781 0.796875C0.0292969 0.914062 0.0292969 1.14844 0.175781 1.29492L6.29883 7.41797C6.44531 7.56445 6.65039 7.56445 6.79688 7.41797L12.9199 1.29492C13.0664 1.14844 13.0664 0.914062 12.9199 0.796875Z" />
              </svg>
            </div>
            <div
              className={
                `iss__filesDownload__options__wrap${isOpen ? " options--open" : ""}`
              }
            >
              <div className="iss__filesDownload__options">
                {
                  OPTIONS.map(({ name, value, color }, index) => (
                    <span
                      key={value}
                      onClick={() => handleSelect(index)}
                      className={`option--${color}`}
                    >{name}</span>
                  ))
                }
              </div>
            </div>
          </div>
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
        >
          {loading ? <Load isInline /> : <span>request</span>}
        </button>
      </form>
      {
        manual &&
        <FileDownloadSelector
          pathID={pathID}
          newFiles={isNew}
          option={option}
          fileManager={fileManager}
        />
      }
    </div>
  );
}

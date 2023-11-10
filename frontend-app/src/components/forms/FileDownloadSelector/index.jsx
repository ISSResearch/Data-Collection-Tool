import { useEffect, useState, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import {api} from "../../../config/api";
import { AlertContext } from "../../../context/Alert";
import Load from "../../ui/Load";
import './styles.css';

export default function({
  pathID,
  newFiles,
  option,
  fileManager
}) {
  const { files, setFiles } = fileManager;
  const [loading, setLoading] = useState(false);
  const { addAlert } = useContext(AlertContext);
  const navigate = useNavigate();

  function selectFile(index, { checked }) {
    var newFiles = [...files];
    newFiles[index].is_downloaded = !checked;
    setFiles(newFiles);
  }

  useEffect(() => {
    setLoading(true);

    var params = {};

    if (newFiles) params.downloaded = false;
    if (option.value !== 'all') params.status = option.value;

    api.get(`/api/files/project/${pathID}/`, {
      params,
      headers: { "Authorization": "Bearer " + localStorage.getItem("dtcAccess") }
    })
      .then(({ data }) => {
        setFiles(data);
        setLoading(false)
      })
      .catch(({ message, response }) => {
        var authFailed = response.status === 401 || response.status === 403;
        addAlert("Getting files error: " + message, "error", authFailed);
        if (authFailed) navigate("/login");
      });
  }, [newFiles, option]);

  if (loading) return (<div className='iss__filesDownload__loadWrap'><Load /></div>);

  return (
    <fieldset className='iss__filesDownload__fileSelector'>
      {
        files.map(({ id, file_name, status, is_downloaded }, index) => (
          <label
            key={id}
            className={`iss__filesDownload__fileSelector__item file--${status}`}
          >
            <span>{index + 1 < 10 && 0}{index + 1}.</span>
            <input
              onChange={({ target }) => selectFile(index, target)}
              type='checkbox'
              defaultChecked={!is_downloaded}
            />
            <span>{file_name}</span>
          </label>
        ))
      }
    </fieldset>
  )
}

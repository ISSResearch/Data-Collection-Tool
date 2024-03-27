import { useEffect, useState, ReactElement } from "react";
import { useNavigate } from 'react-router-dom';
import { api } from "../../../config/api";
import { useDispatch } from "react-redux";
import { addAlert } from "../../../slices/alerts";
import Load from "../../ui/Load";
import './styles.css';

/**
* @param {object} props
* @param {number} props.pathID
* @param {boolean} props.newFiles
* @param {object} props.option
* @param {object} props.fileManager
* @returns {ReactElement}
*/
export default function FileDownloadSelector({
  pathID,
  newFiles,
  option,
  fileManager
}) {
  const { files, setFiles } = fileManager;
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function selectFile(index, { checked }) {
    setFiles((prev) => {
      var files = [...prev];
      files[index].is_downloaded = !checked;
      return files;
    });
  }

  useEffect(() => {
    setLoading(true);

    var params = { per_page: 100 };

    if (newFiles) params.downloaded = false;
    if (option.value !== 'all') params.status = option.value;

    api.get(`/api/files/project/${pathID}/`, {
      params,
      headers: { "Authorization": "Bearer " + localStorage.getItem("dtcAccess") }
    })
      .then(({ data }) => {
        setFiles(data.data);
        setLoading(false);
      })
      .catch(({ message, response }) => {
        var authFailed = response && (
          response.status === 401 || response.status === 403
        );

        dispatch(addAlert({
          message: "Getting files error: " + message,
          type: "error",
          noSession: authFailed
        }));

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
            <span>{ (index + 1).toString().padStart(2, "0") }.</span>
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
  );
}

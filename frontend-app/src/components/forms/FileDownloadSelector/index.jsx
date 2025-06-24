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
* @param {object} props.params
* @param {boolean} props.isNew
* @param {object} props.fileManager
* @returns {ReactElement}
*/
export default function FileDownloadSelector({
  pathID,
  params,
  isNew,
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

    var _params = { ...params, per_page: "max" };
    if (isNew) _params.downloaded = false;

    api.get(`/api/files/project/${pathID}/`, {
      params: _params,
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
  }, [params]);

  if (loading) return (<div className='iss__filesDownload__loadWrap'><Load /></div>);

  return (
    <fieldset className='iss__filesDownload__fileSelector'>
      First 250:
      {
        files.length
        ? files.map(({ id, file_name, status, is_downloaded }, index) => (
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
        : <><br/><br/>No Data</>
      }
    </fieldset>
  );
}

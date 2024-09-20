import { useEffect, useState, ReactElement } from "react";
import { api, fileApi } from "../../config/api";
import { useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { addAlert } from "../../slices/alerts";
import { getOriginDomain } from "../../utils/";
import CloseCross from "../ui/CloseCross";
import "./styles.css";

/**
* @param {object} props
* @param {number} props.pathID
* @param {string} props.fileID
* @param {Function} props.onUpdate
* @param {Function} props.onClose
* @returns {ReactElement}
*/
export default function DuplicateModal({ pathID, fileID, onUpdate, onClose }) {
  const [duplicates, setDuplicates] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleKey = ({ key }) => {
    if (key === "Escape") onClose();
  };

  const handleClick = ({ target, currentTarget }) => {
    if (target.nodeName === currentTarget.nodeName) onClose();
  };

  const getDuplicates = async () => {
    try {
      const baseUrl = `${getOriginDomain()}:9000/api/storage`;

      const { data: files } = await api.get(`/api/files/duplicates/${fileID}/`, {
        headers: { "Authorization": "Bearer " + localStorage.getItem("dtcAccess") }
      });
      const { data: token } = await fileApi.get("/api/temp_token/", {
        headers: { "Authorization": "Bearer " + localStorage.getItem("dtcAccess") }
      });

      files.forEach((file) => {
        var queryUrl = `project_${pathID}/${file.rebound || file.id}/`;
        file.url = `${baseUrl}/${queryUrl}?access=${token}`;
      });

      return files;
    }
    catch ({ message, response }) {
      var authFailed = response?.status === 401 || response?.status === 403;
      dispatch(addAlert({
        message: "Getting temp token error" + message,
        type: "error",
        noSession: authFailed
      }));
      if (authFailed) navigate("/login");
    }
  };

  useEffect(() => {
    getDuplicates().then((data) => setDuplicates(data));
    window.addEventListener("keydown", handleKey);

    return () => {
      duplicates.forEach(({ url }) => URL.revokeObjectURL(url));
      window.removeEventListener("keydown", handleKey);
    };
  }, []);

  return <dialog onClick={handleClick} className="duplicateDialog" open>
    <section className="duplicateDialog__inner">
      <CloseCross action={onClose} />
      {
        duplicates.map(({ id, url, file_name, file_type, rebound, status }) => (
          <div key={id} className={"duplicatedialog__innerCard" + (" inncerCard--" + status)}>
            <span>{file_name} { !rebound && <mark><b>original</b> (top size)</mark> }</span>
            { file_type === "image" ? <img src={url} /> : <video src={url} muted controls /> }
            <div className="iss__fileInfo__buttonsWrap">
              <button
                type="button"
                onClick={() => onUpdate("d")}
                className="button--reject"
              >Decline</button>
              <button
                type="button"
                onClick={() => onUpdate("a")}
                className="button--accept"
              >Accept</button>
            </div>
          </div>
        ))
      }
    </section>
  </dialog>;
}

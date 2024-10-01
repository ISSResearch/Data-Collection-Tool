import { useEffect, useState, ReactElement } from "react";
import { api, fileApi } from "../../config/api";
import { useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { addAlert } from "../../slices/alerts";
import { getOriginDomain } from "../../utils/";
import CloseCross from "../ui/CloseCross";
import "./styles.css";

/** @type {Record<string, string>} */
const STATUS_MAP = { v: "on validatin", a: "accepted", d: "declined", };

/**
* @param {object} file
* @param {object} file.attributes
* @returns {string[]}
*/
const formAttrs = ({ attributes }) => attributes
  .reduce((acc, attr) => {
    var group = acc[attr[1]];
    if (group) group.push(attr[2]);
    else acc[attr[1]] = [attr[2]];
    return acc;
  }, [])
  .reduce((acc, group) => {
    if (group?.length) acc.push(group.join(" > "));
    return acc;
  }, []);

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
        var queryUrl = `project_${pathID}/${file.id}/`;
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

  const hanleUpdate = async (file_id, status) => {
    await onUpdate(file_id, status);

    var data = await getDuplicates();
    setDuplicates(data);
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
        duplicates.map(({ id, attributes, url, file_name, file_type, rebound, status }) => (
          <div key={id} className={"duplicatedialog__innerCard" + (" inncerCard--" + status)}>
            <span>{file_name} { !rebound && <mark><b>best quality</b></mark> }</span>
            { file_type === "image" ? <img src={url} /> : <video src={url} muted controls /> }
            <div className="duplicatedialog__cardAttributes">
              Attributes:
              <ul>
                {
                  attributes
                    .reduce((a, b) => { a.push(...formAttrs(b)); return a; }, [])
                    .map((item, index) => <li key={"i" + index}>{item}</li>)
                }
              </ul>
            </div>
            <span>Status: {STATUS_MAP[status]}</span>
            <div className="iss__fileInfo__buttonsWrap">
              <button
                type="button"
                onClick={() => hanleUpdate(id, "d")}
                className="button--reject"
              >Decline</button>
              <button
                type="button"
                onClick={() => hanleUpdate(id, "a")}
                className="button--accept"
              >Accept</button>
            </div>
          </div>
        ))
      }
    </section>
  </dialog>;
}

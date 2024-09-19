import { useEffect, useState, ReactElement } from "react";
import { api, fileApi } from "../../config/api";
import { useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { addAlert } from "../../slices/alerts";
import { getOriginDomain } from "../../utils/";
import "./styles.css";

/**
* @param {object} props
* @param {number} props.pathID
* @param {string} props.fileID
* @returns {ReactElement}
*/
export default function DuplicateModel({ pathID, fileID }) {
  const [duplicates, setDuplicates] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const getDuplicates = async () => {
    try {
      const baseUrl = `${getOriginDomain()}:9000/api/storage`;

      const { data: files } = await api.get(`/api/files/duplicates/${fileID}/`, {
        headers: { "Authorization": "Bearer " + localStorage.getItem("dtcAccess") }
      });
      const { data: token } = await fileApi.get("/api/temp_token/", {
        headers: { "Authorization": "Bearer " + localStorage.getItem("dtcAccess") }
      });

      return files.forEach((file) => {
        var queryUrl = `project_${pathID}/${file.rebound || file.id}/`;
        file.url = `${baseUrl}/${queryUrl}?access=${token}`
      });
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

    return () => {
      duplicates.forEach(({ url }) => URL.revokeObjectURL(url));
    };
  }, []);

  return <dialog id="duplicateDialog">
  </dialog>;
}

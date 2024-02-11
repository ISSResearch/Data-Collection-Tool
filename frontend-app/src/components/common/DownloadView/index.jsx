import { useEffect, useContext, useRef, useState } from "react";
import { useBlocker } from "react-router-dom";
import { fileApi } from "../../../config/api";
import { getOriginDomain } from "../../../utils";
import { AlertContext } from "../../../context/Alert";
import "./styles.css";

export default function DownloadView({ taskID }) {
  const [intervalCheck, setIntervalCheck] = useState(false);
  const [message, setMessage] = useState("");
  const [download, setDownload] = useState(false);
  const [pageBlock] = useState(true);
  const { addAlert } = useContext(AlertContext);
  const componentRef = useRef(null);

  // TODO: couldnt clear interval the normal way.
  const Helper = () => {
    useEffect(() => {
      var interval = setInterval(checkTaskStatus, 5000);
      return () => {
        clearInterval(interval);
      };
    }, []);
  };

  async function copyID({ clientX: X, clientY: Y }) {
    var clipboardTip = document.createElement("div");

    clipboardTip.className = "iss__downloadingView__clipboardTip";
    clipboardTip.style.left = X + "px";
    clipboardTip.style.top = Y + "px";

    try {
      await navigator.clipboard.writeText(taskID);
      clipboardTip.innerHTML = "copied to clipboard";
    }
    catch ({ message }) {
      clipboardTip.innerHTML = "cant copy";
      clipboardTip.classList.add("clipboardTip--error");

      addAlert("Clipboard error: " + message, "error");
    }

    componentRef.current.appendChild(clipboardTip);

    setTimeout(() => clipboardTip.parentNode.removeChild(clipboardTip), 500);
  }

  const statusHandlers = {
    SUCCESS: (archiveID) => {
      addAlert("Got dataset", "success");
      setMessage("DataSet is ready. Downloading...");
      getDataset(archiveID);
    },
    FAILURE: () => {
      addAlert("Preparing dataset error", "error");
      setMessage(
        "Error occured while gathering the DataSet. Please request a new one.",
      );
    }
  };

  async function getDataset(archiveId) {
    setDownload(true);

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

      addAlert("Process request error: " + message, "error", authFailed);
    }
  }

  async function checkTaskStatus() {
    try {
      var { data } = await fileApi.get(`/api/task/${taskID}/`, {
        headers: { Authorization: "Bearer " + localStorage.getItem("dtcAccess") },
      });
      var { status, archive_id } = data;
      var handler = statusHandlers[status];

      if (handler) {
        setIntervalCheck(false);
        handler(archive_id);
      }
    }
    catch({ message, response }) {
      var authFailed = response && (
        response.status === 401 || response.status === 403
      );

      addAlert("Proccess status respons error: " + message, "error", authFailed);
    }
  }

  useBlocker(() => {
    return pageBlock
      ? !window.confirm(`Are you sure you wanna leave the page? Don't forget to write task id (${taskID}) down`)
      : false;
  });

  useEffect(() => {
    var nativeBlocker = (e) => pageBlock && e.preventDefault();
    window.addEventListener("beforeunload", nativeBlocker);
    return () => {
      window.removeEventListener("beforeunload", nativeBlocker);
    };
  }, [pageBlock]);

  useEffect(() => {
    setIntervalCheck(true);
    checkTaskStatus();
  }, []);

  return (
    <>
      {intervalCheck && <Helper />}
      <div ref={componentRef} className="iss__downloadingView__title">
        <h2>Task id: </h2>
        <span
          onClick={(ev) => copyID(ev)}
          className="iss__downloadingView__title__id"
        >
          {taskID}
          <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none">
            <path d="M2 4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-4H4a2 2 0 0 1-2-2V4zm8 12v4h10V10h-4v4a2 2 0 0 1-2 2h-4zm4-2V4H4v10h10z" />
          </svg>
        </span>
      </div>
      {
        message
        ? <p>{message}</p>
        : <p>
          The DataSet is preparing. The download will start soon...
          <br />
          You can close the window and download it later using {" "}
          <b onClick={(ev) => copyID(ev)} className="id--anchor">task ID</b> given.
          <br />
          Your DataSet will be available at any time whithin a week.
          <br />
          <span className="iss__downloadingView__explanation">
            Dont forget to write the {" "}
            <b onClick={(ev) => copyID(ev)} className="id--anchor">task ID</b> down.
          </span>
        </p>
      }
      <b className="iss__downloadingView__download">
        { download ? "Download started..." : "getting data..." }
      </b>
    </>
  );
}

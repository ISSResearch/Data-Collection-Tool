import { useEffect, useState } from 'react';
import { fileApi } from '../config/api';
import StatusLoad from "./common/StatusLoad";
import '../styles/components/downloadingview.css';

export default function DownloadView({ taskID }) {
  const [intervalCheck, setIntervalCheck] = useState(false);
  const [message, setMessage] = useState("");
  const [download, setDownload] = useState(null);

  // TODO: couldnt clear interval the normal way.
  const Helper = () => {
    useEffect(() => {
      let interval = setInterval(checkTaskStatus, 5000);
      return () => { clearInterval(interval); }
    }, []);
  }

  async function copyID({ clientX: X, clientY: Y }) {
    const clipboardTip = document.createElement("div");
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
      console.log("clipboard error: " + message);
    }
    document.querySelector(".iss__downloadingView__title").appendChild(clipboardTip);
    setTimeout(() => clipboardTip.parentNode.removeChild(clipboardTip), 500);
  }

  const statusHandlers = {
    SUCCESS: archiveID => {
      setMessage("DataSet is ready. Downloading...");
      getDataset(archiveID);
    },
    FAILURE: () => setMessage(
      "Error occured while gathering the DataSet. Please request a new one."
    )
  };

  function downloadDataset(data) {
    if (!data) return alert("Error! No data found");
    let url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', "dataset.zip");
    document.body.appendChild(link);
    link.click();
  }

  async function getDataset(taskID) {
    if (!taskID) return alert("corrupted task id");
    setDownload({ ready: false, progress: 0 });
    const { data } = await fileApi.get(
      `/api/storage/temp_storage/${taskID}/`,
      {
        headers: { "Authorization": "Bearer " + localStorage.getItem("dtcAccess") },
        responseType: 'blob', onDownloadProgress: ({ total, loaded, progress }) => {
          const calculated = progress
            ? Math.ceil(progress * 100)
            : Math.ceil(loaded * 100 / total);
          setDownload(prev => ({ ...prev, progress: calculated }));
        }
      }
    );
    setDownload({ ready: true, progress: 100 });
    downloadDataset(data);
  }

  async function checkTaskStatus() {
    const { data } = await fileApi.get(`/api/task/${taskID}/`, {
      headers: { "Authorization": "Bearer " + localStorage.getItem("dtcAccess") }
    });
    const { status, archive_id } = data;
    const handler = statusHandlers[status];
    if (handler) {
      setIntervalCheck(false);
      handler(archive_id);
    }
  }

  useEffect(() => {
    setIntervalCheck(true);
    checkTaskStatus();
  }, []);

  return (
    <>
      {intervalCheck && <Helper />}
      <div className='iss__downloadingView__title'>
        <h2>Task id: </h2>
        <span onClick={ev => copyID(ev)} className='iss__downloadingView__title__id'>
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
            You can close the window and download it later using
            <b onClick={ev => copyID(ev)} className='id--anchor'> task ID</b> given.
            <br />
            Your DataSet will be available at any time whithin a week.
            <br />
            <span className='iss__downloadingView__explanation'>
              Dont forget to write the
              <b onClick={ev => copyID(ev)} className='id--anchor'> task ID</b> down.
            </span>
          </p>
      }
      {
        download &&
        <div className='iss__downloadingView__downloadWrap'>
          <StatusLoad progress={download.progress} />
          {
            download.ready
              ? <span>downloading...</span>
              : <span>getting from server...</span>
          }
        </div>
      }
    </>
  );
}

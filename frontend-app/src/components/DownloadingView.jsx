import { useEffect, useState } from 'react';
import { fileApi } from '../config/api';
import '../styles/components/downloadingview.css';

export default function DownloadView({ taskID }) {
  const [intervalCheck, setIntervalCheck] = useState(setInterval(checkTaskStatus, 3000));

  async function copyID({ clientX: X, clientY: Y }) {
    try { await navigator.clipboard.writeText(taskID); }
    catch ({ message }) { console.log("clipboard error: " + message); }
    const clipboardTip = document.createElement("div");
    clipboardTip.innerHTML = "copied to clipboard";
    clipboardTip.className = "iss__downloadingView__clipboardTip";
    clipboardTip.style.left = X + "px";
    clipboardTip.style.top = Y + "px";
    document.querySelector(".iss__downloadingView__title").appendChild(clipboardTip);
    setTimeout(() => clipboardTip.parentNode.removeChild(clipboardTip), 500);
  }

  async function checkTaskStatus() {
    // console.log(intervalCheck)
    // const { data } = await fileApi.get(`/api/task/${taskID}/`);
  }

  return (
    <>
      <div className='iss__downloadingView__title'>
        <h2>Task id: </h2>
        <span onClick={ev => copyID(ev)} className='iss__downloadingView__title__id'>
          {taskID}
          <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none">
            <path d="M2 4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-4H4a2 2 0 0 1-2-2V4zm8 12v4h10V10h-4v4a2 2 0 0 1-2 2h-4zm4-2V4H4v10h10z" />
          </svg>
        </span>
      </div>
      <p>
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
    </>
  );
}

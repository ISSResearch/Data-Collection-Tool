import {
  useCallback,
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
  useRef,
  useContext,
  ReactElement
} from "react";
import { useNavigate } from 'react-router-dom';
import { fileApi } from "../../../config/api";
import { getOriginDomain } from "../../../utils/";
import { AlertContext } from "../../../context/Alert";
import "./styles.css";

/**
* @type {Function}
* @param {object} event
* @param {object} event.target
* @returns {undefined}
*/
var handleMediaFallback = ({ target }) => {
  var fallbackSrc = "/images/fallback-media.svg";

  if (target.tagName === "VIDEO") {
    target.controls = false;
    target.poster = fallbackSrc;
  }
  else target.src = fallbackSrc;
};

/**
* @param {object} props
* @param {object[]} props.files
* @param {number} props.slide
* @param {number} props.pathID
* @param {object} ref
* @returns {ReactElement}
*/
function FileMedia({ files, slide, pathID }, ref) {
  const [fileUrl, setFileUrl] = useState(null);
  const [typeVideo, setTypeVideo] = useState(false);
  const [tempFileToken, setTempFileToken] = useState("");
  const { addAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  const mediaRef = useRef(null);

  var MediaItem = useCallback((props) => {
    return typeVideo
      ? <video
        autoPlay
        muted
        controls
        playsInline
        { ...props }
        onError={(e) => handleMediaFallback(e)}
      />
      : <img alt="validation_item" {...props} onError={(e) => handleMediaFallback(e)} />;
  }, [typeVideo]);

  let scale = 1,
    panning = false,
    pointX = 0,
    pointY = 0,
    start = { x: 0, y: 0 };

  function resetZoom() {
    scale = 1;
    panning = false;
    pointX = 0;
    pointY = 0;
    start = { x: 0, y: 0 };
    setTransform();
  }

  useImperativeHandle(ref, () => resetZoom);

  function setTransform() {
    mediaRef.current.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
  }

  function handleMouseDown(ev) {
    ev.preventDefault();
    start = { x: ev.clientX - pointX, y: ev.clientY - pointY };
    panning = true;
  }

  function handleMouseUp() { panning = false; }

  function handleMouseMove(ev) {
    ev.preventDefault();
    if (!panning) return;
    pointX = ev.clientX - start.x;
    pointY = ev.clientY - start.y;
    setTransform();
  }

  function handleWheel(ev) {
    let xs = (ev.clientX - pointX) / scale,
      ys = (ev.clientY - pointY) / scale,
      delta = (ev.wheelDelta ? ev.wheelDelta : -ev.deltaY);
    (delta > 0) ? (scale *= 1.05) : (scale /= 1.05);
    pointX = ev.clientX - xs * scale;
    pointY = ev.clientY - ys * scale;
    setTransform();
  }

  useEffect(() => {
    var media = mediaRef.current;
    media.addEventListener('wheel', (event) => event.preventDefault());
    return () => {
      media.removeEventListener('wheel', (event) => event.preventDefault());
    };
  }, []);

  useEffect(() => {
    var setFile = (token) => {
      resetZoom();
      if (!files[slide]) return;
      var { id, file_type } = files[slide];
      setTypeVideo(file_type === 'video');
      setFileUrl(
        `${getOriginDomain()}:9000/api/storage/project_${pathID}/${id}/?access=${token || tempFileToken}`
      );
    };

    if (!tempFileToken) {
      fileApi.get("/api/temp_token/", {
        headers: { "Authorization": "Bearer " + localStorage.getItem("dtcAccess") }
      })
        .then(({ data }) => {
          setTempFileToken(() => data);
          setTimeout(() => setTempFileToken(""), 1000 * 60 * 5);
          setFile(data);
        })
        .catch(({ message, response }) => {
          var authFailed = response?.status === 401 || response?.status === 403;
          addAlert("Getting temp token error" + message, "error", authFailed);
          if (authFailed) navigate("/login");
        });
    }
    else setFile();

    return () => {
      URL.revokeObjectURL(fileUrl);
    };
  }, [files, slide]);

  return (
    <div className="zoomWrap">
      <div
        ref={mediaRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
        className="mediaItem"
      >{fileUrl && <MediaItem src={fileUrl} className='mediaFile' />}</div>
    </div>
  );
}

export default forwardRef(FileMedia);

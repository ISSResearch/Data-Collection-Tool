import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import "../../styles/components/common/filemedia.css";


export const FileMedia = forwardRef(({ files, slide }, ref) => {
  const [fileUrl, setFileUrl] = useState(null);
  const [typeVideo, setTypeVideo] = useState(false);

  function setUrl() {
    if (!files[slide]) return setFileUrl(null);
    const { id, file_type } = files[slide];
    setFileUrl(id ? `/api/files/${id}/` : null);
    setTypeVideo(file_type === 'video');
  }

  function MediaItem() {
    return typeVideo
      ? <video src={fileUrl} muted controls playsInline loop className="mediaFile" />
      : <img src={fileUrl} alt="media_image" loading='lazy' decoding="async" className='mediaFile' />
  }

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
    const media = document.getElementById("mediaItem");
    media.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
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
    pointX = (ev.clientX - start.x);
    pointY = (ev.clientY - start.y);
    setTransform();
  }

  function handleWheel (ev) {
    // TODO: precise translate
    let xs = (ev.clientX - pointX) / scale,
      ys = (ev.clientY - pointY) / scale,
      delta = (ev.wheelDelta ? ev.wheelDelta : -ev.deltaY);
    (delta > 0) ? (scale *= 1.05) : (scale /= 1.05);
    pointX = ev.clientX - xs * scale;
    pointY = ev.clientY - ys * scale;
    setTransform();
  }
  useEffect(() => {
    const media = document.getElementById("mediaItem");
    media.addEventListener('wheel', e => e.preventDefault());
  }, []);

  useEffect(() => {
    setUrl();
    resetZoom();
  }, [files, slide]);

  return (
    <div className="zoomWrap">
      <div
        id="mediaItem"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
      >{fileUrl && <MediaItem />}</div>
    </div>
  );
});
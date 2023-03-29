import { useEffect } from 'react';
import '../styles/pages/test.css';

export default function Test() {
  useEffect(() => {
    let scale = 1,
      panning = false,
      pointX = 0,
      pointY = 0,
      start = { x: 0, y: 0 };
    const layout = document.getElementById("zoomContainer"),
      media = document.getElementById("mediaItem");

    if (!layout && !media) return;

    function setTransform() {
      media.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
    }

    media.onmousedown = (ev) => {
      ev.preventDefault();
      start = { x: ev.clientX - pointX, y: ev.clientY - pointY };
      panning = true;
    }

    media.onmouseup = () => { panning = false; }

    media.onmousemove = (ev) => {
      ev.preventDefault();
      if (!panning) return;
      pointX = (ev.clientX - start.x);
      pointY = (ev.clientY - start.y);
      setTransform();
    }

    layout.onwheel = function (ev) {
      ev.preventDefault();
      let xs = (ev.clientX - pointX) / scale,
        ys = (ev.clientY - pointY) / scale,
        delta = (ev.wheelDelta ? ev.wheelDelta : -ev.deltaY);
      (delta > 0) ? (scale *= 1.05) : (scale /= 1.05);
      pointX = ev.clientX - xs * scale;
      pointY = ev.clientY - ys * scale;
      setTransform();
    }
  }, [])
  return (
    <div id="zoomContainer" className="zoomWrap">
      {/* <img id="mediaItem" src="api/files/1/" alt="validate_image" /> */}
      <video id="mediaItem" src="api/files/4/" muted controls className="iss__fileMediaItem" />
    </div>
  );
}
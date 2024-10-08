import { useEffect, useRef, ReactElement } from "react";
import FileMedia from "../../ui/FileMedia";
import "./styles.css";

/**
* @param {object} props
* @param {object} props.fileManager
* @param {number} props.slide
* @param {number} props.pathID
* @param {Function} props.slideDec
* @param {Function} props.slideInc
* @returns {ReactElement}
*/
export default function FileSwiper({ slideDec, slideInc, fileManager, slide, pathID }) {
  const { files } = fileManager;
  const parent = useRef(null);
  const childRef = useRef(null);
  const incRef = useRef(null);
  const decRef = useRef(null);

  const handleKeyPressed = ({ key }) => {
    if (key === 'x') handleReset();
    var buttonMap = {
      ArrowRight: incRef,
      ArrowLeft: decRef
    };
    buttonMap[key]?.current.click();
  };

  const handleReset = () => childRef.current();

  useEffect(() => {
    parent.current.style.maxHeight = `calc(100vh - ${parent.current.offsetTop + 20}px)`;

    window.addEventListener("keydown", handleKeyPressed);
    return () => {
      window.removeEventListener("keydown", handleKeyPressed);
    };
  }, []);

  return (
    <div ref={parent} className='iss__fileswiper'>
      <FileMedia pathID={pathID} files={files} slide={slide} ref={childRef} />
      <div className='iss__fileswiper__controls'>
        <button
          ref={decRef}
          onClick={() => slideDec()}
          type="button"
          className="slider-button slide-dec"
        >
          <svg viewBox="0 0 15 15">
            <path d="M8.29289 2.29289C8.68342 1.90237 9.31658 1.90237 9.70711 2.29289L14.2071 6.79289C14.5976 7.18342 14.5976 7.81658 14.2071 8.20711L9.70711 12.7071C9.31658 13.0976 8.68342 13.0976 8.29289 12.7071C7.90237 12.3166 7.90237 11.6834 8.29289 11.2929L11 8.5H1.5C0.947715 8.5 0.5 8.05228 0.5 7.5C0.5 6.94772 0.947715 6.5 1.5 6.5H11L8.29289 3.70711C7.90237 3.31658 7.90237 2.68342 8.29289 2.29289Z" />
          </svg>
        </button>
        <button onClick={handleReset} className="slider-button slide-res">
          reset zoom (X)
        </button>
        <button
          ref={incRef}
          onClick={() => slideInc()}
          type="button"
          className="slider-button slide-inc"
        >
          <svg viewBox="0 0 15 15">
            <path d="M8.29289 2.29289C8.68342 1.90237 9.31658 1.90237 9.70711 2.29289L14.2071 6.79289C14.5976 7.18342 14.5976 7.81658 14.2071 8.20711L9.70711 12.7071C9.31658 13.0976 8.68342 13.0976 8.29289 12.7071C7.90237 12.3166 7.90237 11.6834 8.29289 11.2929L11 8.5H1.5C0.947715 8.5 0.5 8.05228 0.5 7.5C0.5 6.94772 0.947715 6.5 1.5 6.5H11L8.29289 3.70711C7.90237 3.31658 7.90237 2.68342 8.29289 2.29289Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

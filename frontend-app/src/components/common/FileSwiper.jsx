import { useEffect, useRef } from 'react';
import { FileMedia } from './FileMedia';
import '../../styles/components/common/fileswiper.css';

export default function FileSwiper({fileManager, sliderManager}) {
  const { files } = fileManager;
  const { slide, slideDec, slideInc } = sliderManager;

  function handleKeyPressed(key) {
    if (key === 'x') handleRest();
    if (key === 'ArrowRight' || key === 'ArrowLeft') {
      const target = document.getElementById('button--' + key);
      if (target) target.click();
    }
  }

  const childRef = useRef();
  function handleRest() { childRef.current() }

  useEffect(() => {
    window.addEventListener("keydown", ({key}) => handleKeyPressed(key));
    return () => {
      window.removeEventListener("keydown", ({key}) => handleKeyPressed(key));
    }
  }, []);

  return (
    <div className='iss__fileswiper'>
      <FileMedia files={files} slide={slide} ref={childRef} />
      <div className='iss__fileswiper__controls'>
        <button
          id='button--ArrowLeft'
          onClick={slideDec}
          type="button"
          className="slider-button slide-dec"
        >
          <svg viewBox="0 0 15 15">
            <path d="M8.29289 2.29289C8.68342 1.90237 9.31658 1.90237 9.70711 2.29289L14.2071 6.79289C14.5976 7.18342 14.5976 7.81658 14.2071 8.20711L9.70711 12.7071C9.31658 13.0976 8.68342 13.0976 8.29289 12.7071C7.90237 12.3166 7.90237 11.6834 8.29289 11.2929L11 8.5H1.5C0.947715 8.5 0.5 8.05228 0.5 7.5C0.5 6.94772 0.947715 6.5 1.5 6.5H11L8.29289 3.70711C7.90237 3.31658 7.90237 2.68342 8.29289 2.29289Z"/>
          </svg>
        </button>
        <button onClick={handleRest} className="slider-button slide-res">
          ZoomReset<br/>(X)
        </button>
        <button
          id='button--ArrowRight'
          onClick={slideInc}
          type="button"
          className="slider-button slide-inc"
        >
          <svg viewBox="0 0 15 15">
            <path d="M8.29289 2.29289C8.68342 1.90237 9.31658 1.90237 9.70711 2.29289L14.2071 6.79289C14.5976 7.18342 14.5976 7.81658 14.2071 8.20711L9.70711 12.7071C9.31658 13.0976 8.68342 13.0976 8.29289 12.7071C7.90237 12.3166 7.90237 11.6834 8.29289 11.2929L11 8.5H1.5C0.947715 8.5 0.5 8.05228 0.5 7.5C0.5 6.94772 0.947715 6.5 1.5 6.5H11L8.29289 3.70711C7.90237 3.31658 7.90237 2.68342 8.29289 2.29289Z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
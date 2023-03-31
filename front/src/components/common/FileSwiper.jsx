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
        ><span/></button>
        <button onClick={handleRest} className="slider-button slide-res">
          ZoomReset<br/>(X)
        </button>
        <button
          id='button--ArrowRight'
          onClick={slideInc}
          type="button"
          className="slider-button slide-inc"
        ><span/><span/></button>
      </div>
    </div>
  );
}

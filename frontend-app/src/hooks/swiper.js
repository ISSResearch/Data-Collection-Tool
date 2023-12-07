import { useState } from "react";

export default function useSwiper(slides=5) {
  const [slide, setSlide] = useState(0);
  const [maxSlides, setMax] = useState(slides);

  function slideDec() {
    slide > 0 &&  setSlide(prev => prev - 1);
  }

  function slideInc() {
    slide < (maxSlides - 1) &&  setSlide(prev => prev + 1);
  }

  return { slide, setSlide, slideDec, slideInc, setMax }
}

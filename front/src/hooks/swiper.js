import { useState } from "react";

export default function useSwiper(slides=5) {
  const [slide, setSlide] = useState(0);
  const [maxSlides, setMax] = useState(slides);

  function slideDec() {
    const newSlide = slide - 1;
    setSlide(newSlide < 0 ? maxSlides-1 : newSlide);
  }

  function slideInc() {
    const newSlide = slide + 1;
    setSlide(newSlide >= maxSlides ? 0 : newSlide);
  }

  return { slide, setSlide, slideDec, slideInc, setMax }
}
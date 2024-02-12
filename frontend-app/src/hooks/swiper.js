import { useState } from "react";

/**
* @param {number} slides
* @returns {{
* slide: number,
* setSlide: Function,
* slideDec: Function,
* slideInc: Function,
* setMax: Function
* }}
*/
export default function useSwiper(slides=5) {
  const [slide, setSlide] = useState(0);
  const [maxSlides, setMax] = useState(slides);

  /**
  * @returns {undefined}
  */
  function slideDec() {
    slide > 0 && setSlide((prev) => prev - 1);
  }

  /**
  * @returns {undefined}
  */
  function slideInc() {
    slide < (maxSlides - 1) && setSlide((prev) => prev + 1);
  }

  return { slide, setSlide, slideDec, slideInc, setMax };
}

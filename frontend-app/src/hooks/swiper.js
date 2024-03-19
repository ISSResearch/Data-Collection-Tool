import { useState } from "react";

/**
* @param {number} slides
* @returns {{
* slide: number,
* setSlide: Function,
* slideDec: Function,
* slideInc: Function,
* setMax: Function,
* pagination: object,
* setPagination: Function
* }}
*/
export default function useSwiper(slides=5) {
  const [slide, setSlide] = useState(0);
  const [maxSlides, setMax] = useState(slides);
  const [pagination, setPagination] = useState(null);

  /**
  * @returns {void}
  */
  function slideDec() {
    slide > 0 && setSlide((prev) => prev - 1);
  }

  /**
  * @returns {void}
  */
  function slideInc() {
    slide < (maxSlides - 1) && setSlide((prev) => prev + 1);
  }

  return {
    slide,
    setSlide,
    slideDec,
    slideInc,
    setMax,
    pagination,
    setPagination
  };
}

import { ReactElement } from "react";
import "./styles.css";

const POINT = { "right": "0deg", "left": "180deg", "top": "270deg", "bot": "90deg", };

/**
* @param {object} props
* @param {number} [props.size]
* @param {string} [props.point]
* @param {string} [props.color]
* @param {boolean} [props.double]
* @param {Array} [props.classes]
* @returns {ReactElement}
*/
export default function DateSelector({
  size,
  point,
  color,
  classes,
  double,
  ...props
}) {
  return (
    <svg
      width={size || 12}
      height={size || 12}
      viewBox="0 0 240 240"
      style={{
        rotate: POINT[point || "bot"],
        fill: color || "#62abff"
      }}
      className={["iss__arrowIcon", ...(classes || [])].join(" ")}
      {...props}
    >
      <path d="M45.136,3.597c-4.704-4.74-12.319-4.74-17.011,0c-4.704,4.74-4.704,12.415,0,17.155l98.564,99.515l-98.564,99.515 c-4.704,4.74-4.704,12.415,0,17.155c4.704,4.74,12.319,4.74,17.011,0l107.058-108.092c2.587-2.587,3.621-5.919,3.356-9.468 c-0.205-2.755-1.383-5.714-3.356-7.699L45.136,3.597z"/>
      {
        double &&
        <path d="M203.864,0c-6.641,0-12.03,5.39-12.03,12.03v216.173c0,6.641,5.39,12.03,12.03,12.03c6.641,0,12.03-5.39,12.03-12.03 V12.03C215.894,5.39,210.505,0,203.864,0z"/>
      }
    </svg>
  );
}

import { ReactElement } from "react";
import "./styles.css";

const POINT = { "right": "270deg", "left": "90deg", "top": "180deg", "bot": "0deg", };

/**
* @param {object} props
* @param {number} [props.size]
* @param {string} [props.point]
* @param {string} [props.color]
* @param {Array} [props.classes]
* @returns {ReactElement}
*/
export default function DateSelector({ size, point, color, classes, ...props }) {
  return (
    <svg
      width={size || 12}
      height={size || 12}
      viewBox="0 0 14 8"
      style={{
        rotate: POINT[point || "bot"],
        fill: color || "#62abff"
      }}
      className={["iss__arrowIcon", ...(classes || [])].join(" ")}
      {...props}
    >
      <path d="M12.9199 0.796875L12.3633 0.210938C12.2168 0.0644531 11.9824 0.0644531 11.8652 0.210938L6.5625 5.51367L1.23047 0.210938C1.11328 0.0644531 0.878906 0.0644531 0.732422 0.210938L0.175781 0.796875C0.0292969 0.914062 0.0292969 1.14844 0.175781 1.29492L6.29883 7.41797C6.44531 7.56445 6.65039 7.56445 6.79688 7.41797L12.9199 1.29492C13.0664 1.14844 13.0664 0.914062 12.9199 0.796875Z" />
    </svg>
  );
}

import { ReactElement } from "react";
import "./styles.css";

/**
* @param {object} props
* @param {Function} props.action
* @returns {ReactElement}
*/
export default function CloseCross({ action }) {
  return (
    <button onClick={action} className="closeCross" type="button">
      <span /><span />
    </button>
  );
}

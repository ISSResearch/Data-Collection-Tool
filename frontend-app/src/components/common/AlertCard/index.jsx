import { useEffect, useRef, ReactElement } from "react";
import CloseCross from "../../ui/CloseCross";
import "./styles.css";

/** @type {{[color: string]: string}} */
const COLORS_MAP = {
  red: " alert--red",
  green: " alert--green"
};

/**
* @param {object} props
* @param {string} props.message
* @param {string} props.color
* @param {Function} props.closeAction
* @returns {ReactElement}
*/
export default function AlertCard({ message, color, closeAction }) {
  const alertRef = useRef(null);

  useEffect(() => {
   alertRef.current.style.opacity = 1;

   var timer = setInterval(() => {
     alertRef.current.style.opacity -= 0.1;
     if (alertRef.current.style.opacity == 0) closeAction();
   }, 1000);

   return () => clearInterval(timer);
  }, []);

  return (
    <div ref={alertRef} className={"alertCard" + (COLORS_MAP[color] || "")}>
      <CloseCross action={closeAction}/>
      {message}
    </div>
  );
}

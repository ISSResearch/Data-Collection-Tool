import { useEffect, useRef } from "react";
import CloseCross from "../../ui/CloseCross";
import "./styles.css";

const COLORS_MAP = {
  red: " alert--red",
  green: " alert--green"
}

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

import { ReactElement } from "react";
import './styles.css';

/** @returns {ReactElement} */
export default function Fallback() {
  return (
    <article className="iss__fallback">
      <h1>Unexpected Application Error</h1>
      <p>
        Appliaction crashed by some reason.<br/>
        Return to the main page and try again.<br/>
        If the Error persists, please come back later.
      </p>
      <a href="/">home</a>
    </article>
  );
}

import { ReactElement } from "react";

/**
* @returns {ReactElement}
*/
export default function GoalFilters() {
  return <fieldset>
    <input type="range" className="asd" onMouseUp={(e) => console.log(e.target.value)} />
  </fieldset>;
}

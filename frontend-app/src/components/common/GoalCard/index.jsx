import { ReactElement } from "react";
import "./styles.css";

/**
* @param {object} props
* @param {object} props.goalItem
* @param {Function?} props.onDelete
* @returns {ReactElement}
*/
export default function GoalCard({ goalItem, onDelete }) {
  const { attribute, amount, complete, id } = goalItem;
  const progress = Math.min(Math.ceil(complete / amount * 100));

  return <article className="goal__card">
    <h3>{attribute}</h3>
    <div className={"goal__progressWrap" + (progress === 100 ? " goal--complete" : "")}>
      <mark>{complete}/{amount}</mark>
      <div
        style={{ width: `${progress}%` }}
        className="goal__progressBar"
      />
    </div>
    {
      onDelete &&
      <button
        type="button"
        onClick={() => onDelete(id)}
        className="goal__delete"
      >delete</button>
    }
  </article>;
}

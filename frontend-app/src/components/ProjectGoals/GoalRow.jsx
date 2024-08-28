import { ReactElement } from "react";
import "./styles.css";

/**
* @param {object} props
* @param {object} props.goalItem
* @param {Function?} props.onDelete
* @returns {ReactElement}
*/
export default function GoalRow({ goalItem, onDelete }) {
  const { name, amount, complete, id } = goalItem;
  const progress = Math.min(100, Math.ceil(complete / amount * 100));

  return <tr>
    <td>{id}</td>
    <td>{name}</td>
    <td>{complete}</td>
    <td>{amount}</td>
    <td className="goal__row__progress">
      <mark>{progress}%</mark>
      <div
        style={{ width: `${progress}%` }}
        className={"goal__progressBar" + (progress === 100 ? " goal--complete" : "")}
      />
    </td>
    <td>
      {
        onDelete &&
        <button
          type="button"
          onClick={() => onDelete(id)}
          className="goal__delete"
        >delete</button>
      }
    </td>
  </tr>;
}

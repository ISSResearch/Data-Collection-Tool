import { ReactElement } from "react";
import "./styles.css";

/**
* @param {object} props
* @param {object} props.goalItem
* @param {Function?} props.onDelete
* @returns {ReactElement}
*/
export default function GoalRow({ goalItem, onDelete }) {
  const { name, amount, on_validation, complete, id, image_mod, video_mod } = goalItem;
  const progress = Math.min(100, Math.ceil(complete / amount * 100));

  return <tr>
    <td>{id}</td>
    <td>
      <div className="goal__row__nameCell">
        {name}
        <mark>{image_mod} per img | {video_mod} per vid</mark>
      </div>
    </td>
    <td>{on_validation}</td>
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

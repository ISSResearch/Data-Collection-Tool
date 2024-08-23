import { ReactElement } from "react";
import GoalRow from "./GoalRow";

/**
* @param {object} props
* @param {object[]} props.goals
* @param {Function?} props.onDelete
* @returns {ReactElement}
*/
export default function GoalTable({ goals, onDelete }) {
  return <table className="goal__table">
    <thead>
      <tr>
        <th>Attribute name</th>
        <th>completed</th>
        <th>amount</th>
        <th className="goal__table__progress">progress</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {
        goals.length
          ? <>
            {
              goals.map((item) => (
                <GoalRow key={item.id} onDelete={onDelete} goalItem={item} />
              ))
            }
          </>
          : <tr><td colSpan={5}>No project goals yet. Create one!</td></tr>
      }
    </tbody>
  </table>;
}

import { ReactElement } from "react";
import GoalRow from "./GoalRow";
import Arrow from "../ui/Arrow";

/**
* @param {object} props
* @param {{ data: object[], page: number, total_pages: number }} props.goals
* @param {Function?} props.onDelete
* @param {Function} props.onPagination
* @returns {ReactElement}
*/
export default function GoalTable({ goals, onDelete, onPagination }) {
  const { data, page, total_pages } = goals;

  const handlePage = (newPage) => {
    if (newPage <= 1 || page >= total_pages) return;
    onPagination("page", newPage);
  };

  return <table className="goal__table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Attribute name</th>
        <th>on validation</th>
        <th>completed</th>
        <th>amount</th>
        <th className="goal__table__progress">progress</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      { data.map((row) => <GoalRow key={row.id} onDelete={onDelete} goalItem={row} />) }
    </tbody>
    <tfoot>
      <tr>
        <td colSpan={7}>
          {
            data.length
            ? <div className="goal__table__pagination">
              <Arrow
                size={14}
                point="left"
                onClick={() => handlePage(page - 1)}
                classes={[page <= 1 ? "pag--block" : ""]}
              />
              <span>{page} / {total_pages}</span>
              <Arrow
                size={14}
                point="right"
                onClick={() => handlePage(page + 1)}
                classes={[page >= total_pages ? "pag--block" : ""]}
              />
            </div>
            : "No project goals yet. Create one!"
          }
        </td>
      </tr>
    </tfoot>
  </table>;
}

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
    if (
      newPage != page
      && newPage >= 1
      && newPage <= total_pages
    ) onPagination("page", newPage);
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
                double={true}
                onClick={() => handlePage(1)}
                classes={[page <= 1 ? "pag--block" : ""]}
              />
              <Arrow
                size={14}
                point="left"
                onClick={() => handlePage(page - 1)}
                classes={[page <= 1 ? "pag--block" : ""]}
              />
              <label>
                <input
                  type="number"
                  defaultValue={page}
                  min={1}
                  max={total_pages}
                  disabled={total_pages <= 0}
                  onBlur={({ target }) => handlePage(target.value)}
                  onKeyDown={({ target, key }) => key === "Enter" && handlePage(target.value)}
                />
                / {total_pages}
              </label>
              <Arrow
                size={14}
                point="right"
                onClick={() => handlePage(page + 1)}
                classes={[page >= total_pages ? "pag--block" : ""]}
              />
              <Arrow
                size={14}
                point="right"
                double={true}
                onClick={() => handlePage(total_pages)}
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

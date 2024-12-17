import { ReactElement } from "react";
import { formatFilterJSON } from "../../adapters";

/**
* @param {object} props
* @param {object[]} props.data
* @param {Function?} props.onDownload
* @returns {ReactElement}
*/
export default function DownloadTable({ data, onDownload }) {
  return <table className="downloads__table">
    <thead>
      <tr>
        <th>ID</th>
        <th>author</th>
        <th>status</th>
        <th>create date</th>
        <th>file count</th>
        <th>result size</th>
        <th>result message</th>
        <th>requested</th>
        <th />
      </tr>
    </thead>
    <tbody>
      {
        data.map((item) => (
          <tr key={item.id} className={"downloads__row__" + item.status.toLowerCase()}>
            <td>{item.id}</td>
            <td>{item.author}</td>
            <td>{item.status.toLowerCase()}</td>
            <td>{item.create_date}</td>
            <td>{item.file_count}</td>
            <td>{item.result_size}</td>
            <td>{item.result_message}</td>
            <td>{formatFilterJSON(item.filters)}</td>
            <td className="downloads__table__button">
              {
                item.status === "SUCCESS" &&
                <button type="button" onClick={() => onDownload(item.result_id)}>
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path d="M14.14 13H13V3a1 1 0 0 0-2 0v10H9.86a1 1 0 0 0-.69 1.5l2.14 3.12a.82.82 0 0 0 1.38 0l2.14-3.12a1 1 0 0 0-.69-1.5" />
                    <path d="M19 22H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3a1 1 0 0 1 0 2H5v11h14V9h-3a1 1 0 0 1 0-2h3a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2" />
                  </svg>
                </button>
              }
            </td>
          </tr>
        ))
      }
    </tbody>
  </table>;
}

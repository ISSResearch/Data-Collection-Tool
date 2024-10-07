import { ReactElement } from "react";
import "./styles.css";

/**
* @param {object} props
* @param {number} props.cardIndex
* @param {boolean} props.active
* @param {Function} props.handleCLick
* @param {object} props.file
* @returns {ReactElement}
*/
export default function FileCard({ cardIndex, active, handleCLick, file }) {
  const { id, related_duplicates, upload_date, status, author_name, rebound } = file;

  const cardId = id.slice(0, 6) + " ... " + id.slice(id.length - 4);

  return <div
    onClick={() => handleCLick(cardIndex)}
    className={[
      "iss__fileCard",
      "card--" + (rebound ? "u" : status),
      active ? "card--active" : ""
      ].join(" ")
    }
  >
    <h3>{cardId}</h3>
    <p>uploaded by <i>{author_name}</i></p>
    <time>{upload_date}</time>
    { !!rebound && <mark><b>DUPLICATE</b></mark> }
    { !!related_duplicates && <mark> related duplicates: { related_duplicates }</mark> }
  </div>;
}

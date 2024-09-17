import { useEffect, useState, ReactElement } from "react";
import "./styles.css";

/** @type {string} */
const DEFAULT_STYLE = "iss__fileCard";

/**
* @param {object} props
* @param {number} props.cardIndex
* @param {string} props.name
* @param {string} props.author_name
* @param {string} props.date
* @param {boolean} props.active
* @param {string} props.status
* @param {Function} props.handleCLick
* @returns {ReactElement}
*/
export default function FileCard({
  cardIndex,
  name,
  author_name,
  date,
  active,
  status,
  handleCLick
}) {
  const [styles, setStyles] = useState([DEFAULT_STYLE]);

  useEffect(() => {
    var newStyles = [DEFAULT_STYLE];

    if (active) newStyles.push("card--active");
    newStyles.push("card--" + status);

    setStyles(newStyles);
  }, [active, status]);

  return (
    <div onClick={() => handleCLick(cardIndex)} className={styles.join(" ")}>
      <h3>{name}</h3>
      <p>uploaded by <i>{author_name}</i></p>
      <time>{date}</time>
    </div>
  );
}

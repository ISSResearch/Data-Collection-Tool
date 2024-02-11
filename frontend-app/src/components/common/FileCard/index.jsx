import { useEffect, useState } from 'react';
import './styles.css';

const DEFAULT_STYLE = 'iss__fileCard';

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

    if (active) newStyles.push('card--active');
    if (status && status !== 'v') newStyles.push(
      `card--${status === 'a' ? 'accepted' : 'rejected'}`
    );

    setStyles(newStyles);
  }, [active, status]);

  return (
    <div onClick={() => handleCLick(cardIndex)} className={styles.join(' ')}>
      <h3>{name}</h3>
      <p>uploaded by <i>{author_name}</i></p>
      <time>{date}</time>
    </div>
  );
}

import { useEffect, useState } from 'react';
import '../../styles/components/common/filecard.css';

export default function FileCard({
  cardIndex,
  name,
  author_name,
  date,
  active,
  status,
  handleCLick
}) {
  const defauleStyle = 'iss__fileCard'
  const [styles, setStyles] = useState([defauleStyle]);

  useEffect(() => {
    const newStyles = [defauleStyle];
    if (active) newStyles.push('card--active');
    if (status) newStyles.push(`card--${status === 'a' ? 'accepted' : 'rejected'}`)
    setStyles(newStyles);
  }, [active, status]);

  return (
    <div onClick={() => handleCLick(cardIndex)} className={styles.join(' ')}>
      <h3>{name}</h3>
      <p>uploaded by <i>{author_name}</i></p>
      <time>{date}</time>
    </div>
  )
}
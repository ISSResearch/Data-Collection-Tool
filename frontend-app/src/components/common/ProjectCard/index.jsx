import { Link } from 'react-router-dom';
import './styles.css';

export default function({ item }) {
  const prepareDescription = () => {
    let { description } = item;
    description = description.replaceAll('<br>', ' ');
    if (description.length > 81) {
      description = description.slice(0, 80) + '...';
    }
    return description;
  }

  return (
    <Link to={`/projects/${item.id}`} className='iss__projectCard'>
      <h3 className='iss__projectCard__name'>{item.name}</h3>
      <p className='iss__projectCard__text'>{prepareDescription()}</p>
      <time className='iss__projectCard__date'>{item.created_at}</time>
    </Link>
  )
}

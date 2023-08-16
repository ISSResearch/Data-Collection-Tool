import { Link } from 'react-router-dom';
import '../../styles/components/common/projectcard.css';

export default function ProjectCard({item}) {
  return (
    <Link to={`/projects/${item.id}`} className='iss__projectCard'>
      <h3 className='iss__projectCard__name'>{item.name}</h3>
      <p className='iss__projectCard__text'>{item.description}</p>
      <time className='iss__projectCard__date'>{item.created_at}</time>
    </Link>
  )
}
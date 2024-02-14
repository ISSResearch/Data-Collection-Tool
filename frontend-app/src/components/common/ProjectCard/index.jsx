import { Link } from 'react-router-dom';
import { ReactElement } from "react";
import './styles.css';

/**
* @param {object} props
* @param {object} props.item
* @returns {ReactElement}
*/
export default function ProjectCard({ item }) {
  var prepareDescription = () => {
    var { description } = item;
    description = description.replaceAll('<br>', ' ');

    if (description.length > 81) description = description.slice(0, 80) + '...';

    return description;
  };

  return (
    <Link to={`/projects/${item.id}`} className='iss__projectCard'>
      <h3 className='iss__projectCard__name'>{item.name}</h3>
      <p className='iss__projectCard__text'>{prepareDescription()}</p>
      <time className='iss__projectCard__date'>{item.created_at}</time>
    </Link>
  );
}

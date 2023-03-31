import ProjectCard from './common/ProjectCard';
import '../styles/components/projects.css';

export default function Projects({ items }) {

  return (
    <div className='iss__projects'>
      {items.map(item => (
        <div key={item.id} className='iss__projects__card'>
          <ProjectCard item={item} />
        </div>
      ))}
    </div>
  )
}

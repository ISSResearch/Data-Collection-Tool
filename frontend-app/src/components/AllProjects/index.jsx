import ProjectCard from "../common/ProjectCard";
import Load from "../ui/Load";
import './styles.css';

export default function({ items }) {

  if (!items) return <div className='iss__projects__loading'><Load/></div>

  return (
    <>
    {
      items.length
        ? <div className='iss__allProjects'>
          {
            items.map(item => (
              <div key={item.id} className='iss__projects__card'>
                <ProjectCard item={item} />
              </div>
            ))
          }
        </div>
        : <span>No projects.</span>
    }
    </>
  )
}

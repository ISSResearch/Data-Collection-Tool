import { Link } from 'react-router-dom';
import '../../styles/components/common/titleswitch.css';

export default function TitleSwitch({title, titleLink, links, currentRoute, parent }) {
  const createLink = (link) => '/' + [parent, link].join('/');

  return (
    <div className='iss__titleSwitch'>
      <h1 className="iss__titleSwitch__title">
        {
          titleLink ? <Link to={'/' + parent}>{title}</Link> : <span>{title}</span>
        }
      </h1>
      <nav className='iss__titleSwitch__navWrap'>
        <ul className='iss__titleSwitch__nav'>
          {
            links?.map(({name, link}) => (
              <li key={link}>
                <Link
                  to={createLink(link)}
                  className={
                    currentRoute === (link || parent)
                      ? 'iss__titleSwitch__navItem--active'
                      : 'iss__titleSwitch__navItem'
                  }
                >{name}</Link>
              </li>
            ))
          }
        </ul>
      </nav>
    </div>
  )
}
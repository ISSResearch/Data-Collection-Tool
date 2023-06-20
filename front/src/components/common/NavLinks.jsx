import { Link } from "react-router-dom";
import '../../styles/components/common/navlinks.css';

export default function NavLinks({links}) {
  return (
    <nav>
      <ul className='iss__navLinks'>
        {
          links.map(
            ({link, text}) => <li key={text}><Link to={link}>{text}</Link></li>
          )
        }
      </ul>
    </nav>
  );
}

import { Link } from "react-router-dom";
import './styles.css';

export default function({links}) {
  return (
    <nav>
      <ul className='iss__navLinks'>
        {
          links.map(
            ({ link, text }) => (
              <li key={text}>
                <Link to={link} className='iss__navLinks__link'>{text}</Link>
              </li>)
          )
        }
      </ul>
    </nav>
  );
}

import { Link } from "react-router-dom";
import { ReactElement } from "react";
import './styles.css';

/**
* @param {object} props
* @param {object[]} props.links
* @returns {ReactElement}
*/
export default function NavLinks({links}) {
  return (
    <nav>
      <ul className='iss__navLinks'>
        {
          links.map(({ link, text }) =>
            <li key={text}>
              <Link to={link} className='iss__navLinks__link'>{text}</Link>
            </li>
          )
        }
      </ul>
    </nav>
  );
}

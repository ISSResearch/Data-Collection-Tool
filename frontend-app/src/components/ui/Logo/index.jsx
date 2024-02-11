import { Link } from "react-router-dom";
import './styles.css';

export default function Logo() {
  return (
    <Link to="/" className='iss__brand'>
      <img src='/images/iss_logo.svg' alt='iss_logo' className="iss__brand__logo"/>
      <span className='iss__brand__name'>DataCollection Tool</span>
    </Link>
  );
}

import { Link } from "react-router-dom";
import '../../styles/components/common/logo.css'

export default function Logo() {
  return (
    <Link to="/" className='iss__brand'>
     <img src='/images/iss_logo.svg' className="iss__brand__logo"/>
      <span className='iss__brand__name'>ISS DataCollection Tool</span>
    </Link>
  );
}

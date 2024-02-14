import { useNavigate } from "react-router-dom";
import { useContext, ReactElement } from 'react';
import { UserContext } from '../../context/User';
import { AlertContext } from "../../context/Alert";
import NavLinks from '../common/NavLinks';
import Logo from '../ui/Logo';
import './styles.css';

/** @type {{text: string, link: string}[]} */
const LINK_SET = [
  { text: 'Login', link: '/login' },
  { text: 'Registration', link: '/registration' },
];

/** @returns {ReactElement} */
export default function Header() {
  const { user, initUser } = useContext(UserContext);
  const { addAlert } = useContext(AlertContext);
  const navigate = useNavigate();

  async function logOutUser() {
    localStorage.removeItem("dtcAccess");
    initUser(null);
    addAlert("User logged out", "success");
    navigate("/login");
  }

  return (
    <header className='iss__header'>
      <Logo />
      <div className="iss__header__user">
        {
          user
          ? <>
            <span className='iss__header__username'>{user.username}</span>
            <button
              onClick={logOutUser}
              className='iss__header__logoutButton'
            >Logout</button>
          </>
          : <NavLinks links={LINK_SET} />
        }
      </div>
    </header>
  );
}

import { useNavigate } from "react-router-dom";
import { ReactElement } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { addAlert } from "../../slices/alerts";
import { setUser } from "../../slices/users";
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
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function logOutUser() {
    localStorage.removeItem("dtcAccess");
    dispatch(setUser(null));
    dispatch(addAlert({ message: "User logged out", type: "success" }));
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

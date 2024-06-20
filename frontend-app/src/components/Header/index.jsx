import { useNavigate } from "react-router-dom";
import { ReactElement } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { addAlert } from "../../slices/alerts";
import { setUser } from "../../slices/users";
import { api } from '../../config/api';
import TitleSwitch from "../common/TitleSwitch";
import Logo from '../ui/Logo';
import './styles.css';

/** @returns {ReactElement} */
export default function Header() {
  const user = useSelector((state) => state.user.user);
  const head = useSelector((state) => state.head);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function logOutUser() {
    api.request('/api/users/logout/', {
      method: 'post',
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("dtcAccess")
      }
    });
    localStorage.removeItem("dtcAccess");
    dispatch(setUser(null));
    dispatch(addAlert({ message: "User logged out", type: "success" }));
    navigate("/login");
  }

  return (
    <header className='iss__header'>
      <Logo />
      <TitleSwitch
        title={head.title}
        links={head.nav}
        currentRoute={head.current}
        parent={head.parent}
        titleLink={head.link}
      />
      {
        user &&
        <div className="iss__header__user">
          <span className='iss__header__username'>{user.username}</span>
          <button
            onClick={logOutUser}
            className='iss__header__logoutButton'
          >Logout</button>
        </div>
      }
    </header>
  );
}

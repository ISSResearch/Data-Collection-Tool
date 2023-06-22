import { useContext } from 'react';
import { UserContext } from '../context/User';
import Logo from './common/Logo';
import NavLinks from './common/NavLinks';
import axios from 'axios';
import '../styles/components/header.css'

export default function Header() {
  const { user, setUser } = useContext(UserContext);

  function logOutUser() {
    axios.get('/api/users/logout/')
      .then(({ data }) => {if (data.ok) setUser(null);})
      .catch(err => console.log('err', err.message));
  }

  const linkSet = [
    { text: 'Login', link: '/login' },
    { text: 'Registration', link: '/registration' },
  ]

  return (
    <header className='iss__header'>
      <Logo />
      <div className="iss__header__user">
        {
          user
            ? <>
              <span>{user.username}</span>
              <button
                onClick={logOutUser}
                className='iss__header__logoutButton'
              >Logout</button>
            </>
            : <NavLinks links={linkSet} />
        }
      </div>
    </header>
  );
}

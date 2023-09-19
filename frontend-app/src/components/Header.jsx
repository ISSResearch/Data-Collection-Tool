import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/User';
import Logo from './common/Logo';
import NavLinks from './common/NavLinks';
import { api } from '../config/api';
import '../styles/components/header.css'

export default function Header() {
  const { user, initUser } = useContext(UserContext);
  const navigate = useNavigate();
  function logOutUser() {
    api.get('/api/users/logout/')
      .then(({ data }) => {
        if (data.ok) {
          initUser(null);
          navigate('/login');
        }
      })
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
              <span className='iss__header__username'>{user.username}</span>
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

import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/User';
import Form from '../components/common/Form';
import axios from 'axios';
import '../styles/pages/login.css';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  function sendForm(event) {
    event.preventDefault();
    setLoading(true);
    const [name, pass] = event.target;
    axios.request('/api/users/login/',
      {
        method: 'post',
        data: { username: name.value, password: pass.value },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }
    )
      .then(({status, data}) => {
        if (!data.isAuth) throw data.message;
        setUser(data.user);
        if (window.location.pathname  === '/login') navigate('/');
      })
      .catch(err => {
        setErrors(err);
        setLoading(false);
        setTimeout(() => setErrors(null), 5000);
      });
  }

  const fieldSet = [
    {label: 'Enter username:', type: 'text', name: 'username', placeholder: 'username', required: true},
    {label: 'Enter password:', type: 'password', name: 'password', placeholder: 'password', required: true},
  ]

  return (
    <div className="iss__loginPage">
      <h1>Login Page</h1>
      <Form
        callback={sendForm}
        loading={loading}
        errors={errors}
        fields={fieldSet}
        link={{ to: '/registration', text: 'Or Registry' }}
      />
    </div>
  );
}
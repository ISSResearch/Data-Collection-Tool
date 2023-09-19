import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/User';
import Form from '../components/common/Form';
import { api } from '../config/api';
import '../styles/pages/registration.css';

export default function Registration() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const { initUser } = useContext(UserContext);
  const navigate = useNavigate();

  function sendForm(event) {
    event.preventDefault();
    setLoading(true);
    const [name, pass1, pass2] = event.target;
    api.request('/api/users/create/',
      {
        method: 'post',
        data: { username: name.value, password1: pass1.value, password2: pass2.value },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )
      .then(({ status, data }) => {
        if (!data.isAuth) {
          const errorMessage = Object.entries(data.errors)
            .reduce((acc, [key, val]) => [...acc, `${key}: `, ...val], [])
          throw new Error(errorMessage);
        }
        initUser(data.user);
        navigate('/');
      })
      .catch(({ message }) => {
        setErrors(message);
        setLoading(false);
        setTimeout(() => setErrors(null), 5000);
      });
  }

  const fieldSet = [
    { label: 'Enter username:', type: 'text', name: 'username', placeholder: 'username', required: true },
    { label: 'Enter password:', type: 'password', name: 'password1', placeholder: 'password', required: true },
    { label: 'Confirm password:', type: 'password', name: 'password2', placeholder: 'confirm password', required: true },
  ]

  return (
    <div className="iss__registrationPage">
      <h1>Registration Page</h1>
      <Form
        loading={loading}
        errors={errors}
        callback={sendForm}
        fields={fieldSet}
        link={{ to: '/login', text: 'Or Login' }}
      />
    </div>
  );
}

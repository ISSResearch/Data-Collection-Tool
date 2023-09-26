import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/User';
import { api } from '../config/api';
import Form from '../components/common/Form';
import '../styles/pages/registration.css';
import jwt_decode from "jwt-decode";

const FIELD_SET = [
  { label: 'Enter username:', type: 'text', name: 'username', placeholder: 'username', required: true },
  { label: 'Enter password:', type: 'password', name: 'password1', placeholder: 'password', required: true },
  { label: 'Confirm password:', type: 'password', name: 'password2', placeholder: 'confirm password', required: true },
]

export default function Registration() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const { initUser } = useContext(UserContext);
  const navigate = useNavigate();

  async function sendForm(event) {
    event.preventDefault();
    setLoading(true);
    const [name, pass1, pass2] = event.target;
    try {
      const { data, status } = await api.request('/api/users/create/', {
        method: 'post',
        data: { username: name.value, password1: pass1.value, password2: pass2.value },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      if (!data.isAuth || status !== 200) {
        const errorMessage = Object.entries(data.errors)
          .reduce((acc, [key, val]) => [...acc, `${key}: `, ...val], [])
        throw new Error(errorMessage);
      }
      const { accessToken } = data;
      localStorage.setItem("dtcAccess", accessToken);
      initUser(jwt_decode(accessToken));
      navigate('/');
    }
    catch ({ message }) {
      setErrors(message);
      setLoading(false);
      setTimeout(() => setErrors(null), 5000);
    }
  }

  return (
    <div className="iss__registrationPage">
      <h1>Registration Page</h1>
      <Form
        loading={loading}
        errors={errors}
        callback={sendForm}
        fields={FIELD_SET}
        link={{ to: '/login', text: 'Or Login' }}
      />
    </div>
  );
}

import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/User';
import { api } from '../../config/api';
import Form from '../../components/forms/Form';
import './styles.css';

const FIELD_SET = [
  { label: 'Enter username:', type: 'text', name: 'username', placeholder: 'username', required: true },
  { label: 'Enter password:', type: 'password', name: 'password', placeholder: 'password', required: true },
];

export default function() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const { initUser } = useContext(UserContext);
  const navigate = useNavigate();

  async function sendForm(event) {
    event.preventDefault();
    setLoading(true);
    const [name, pass] = event.target;
    try {
      const { data, status } = await api.request('/api/users/login/', {
        method: 'post',
        data: { username: name.value, password: pass.value },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      if (!data.isAuth || status !== 200) throw new Error(data.message);
      const { accessToken } = data;
      localStorage.setItem("dtcAccess", accessToken);
      initUser(data.user);
      if (window.location.pathname === '/login') navigate('/');
    }
    catch ({ message }) {
      setErrors(message);
      setLoading(false);
      setTimeout(() => setErrors(null), 5000);
    }
  }

  useEffect(() => {
    localStorage.removeItem("dtcAccess");
    initUser(null);
  }, []);

  return (
    <div className="iss__loginPage">
      <h1>Login Page</h1>
      <Form
        callback={sendForm}
        loading={loading}
        errors={errors}
        fields={FIELD_SET}
        link={{ to: '/registration', text: 'Or Registry' }}
      />
    </div>
  );
}

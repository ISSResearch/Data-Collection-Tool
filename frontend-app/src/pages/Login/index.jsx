import { useContext, useEffect, useState, ReactElement } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../../context/User';
import { AlertContext } from "../../context/Alert";
import { api } from '../../config/api';
import Form from '../../components/forms/Form';
import './styles.css';

/**
* @type {{
* label: string,
* type: string,
* name: string,
* placeholder: string
* }[]}
*/
const FIELD_SET = [
  { label: 'Enter username:', type: 'text', name: 'username', placeholder: 'username', required: true },
  { label: 'Enter password:', type: 'password', name: 'password', placeholder: 'password', required: true },
];

/** @returns {ReactElement} */
export default function Login() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const { initUser } = useContext(UserContext);
  const { addAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  const location = useLocation();

  async function sendForm(event) {
    event.preventDefault();
    setLoading(true);
    var [name, pass] = event.target;

    try {
      var { data, status } = await api.request('/api/users/login/', {
        method: 'post',
        data: { username: name.value, password: pass.value },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (!data.isAuth || status !== 200) throw new Error(data.message);

      var { accessToken } = data;
      localStorage.setItem("dtcAccess", accessToken);

      initUser(data.user);
      addAlert("User logged", "success");

      if (location.pathname === '/login') navigate('/');
    }
    catch ({ message }) {
      addAlert("User login failed: " + message, "error");
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

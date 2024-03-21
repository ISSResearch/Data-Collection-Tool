import { useEffect, useState, ReactElement } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { setUser } from '../../slices/users';
import { addAlert } from '../../slices/alerts';
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
  const dispatch = useDispatch();
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

      dispatch(setUser(data.user));
      dispatch(addAlert({ message: "User logged", type: "success" }));

      if (location.pathname === '/login') navigate('/');
    }
    catch ({ message }) {
      dispatch(addAlert({ message: "User login failed: " + message, type: "error" }));
      setErrors(message);
      setLoading(false);
      setTimeout(() => setErrors(null), 5000);
    }
  }

  useEffect(() => {
    localStorage.removeItem("dtcAccess");
    dispatch(setUser(null));
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

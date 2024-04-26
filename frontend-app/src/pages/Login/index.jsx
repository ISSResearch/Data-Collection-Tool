import { useEffect, useState, ReactElement } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { setUser } from '../../slices/users';
import { addAlert } from '../../slices/alerts';
import { setLink, setNav, setTitle, setParent, setCurrent } from '../../slices/heads';
import { api } from '../../config/api';
import Form from '../../components/forms/Form';
import './styles.css';

/**
* @type {{
* label: string,
* type: string,
* name: string,
* placeholder: string
* required: boolean
* }[]}
*/
const FIELD_SET = [
  { label: 'Username:', type: 'text', name: 'username', placeholder: 'username', required: true },
  { label: 'Password:', type: 'password', name: 'password', placeholder: 'password', required: true },
];

/** @type {{name: string, link: string }[]} */
const ROUTE_LINKS = [
  { name: "login", link: "login" },
  { name: "registration", link: "registration" },
];

/** @returns {ReactElement} */
export default function Login() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const dispatch = useDispatch();
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

      if (location.pathname === '/login') window.open('/', "_self");
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
    dispatch(setTitle("Login"));
    dispatch(setNav(ROUTE_LINKS));
    dispatch(setParent());
    dispatch(setLink());
    dispatch(setCurrent("login"));
  }, []);

  return (
    <div className="iss__loginPage">
      <Form
        callback={sendForm}
        loading={loading}
        errors={errors}
        fields={FIELD_SET}
      />
    </div>
  );
}

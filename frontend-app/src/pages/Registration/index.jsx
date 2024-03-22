import { useState, ReactElement, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { addAlert } from '../../slices/alerts';
import { setUser } from '../../slices/users';
import { api } from '../../config/api';
import { setLink, setNav, setTitle, setParent, setCurrent } from '../../slices/heads';
import Form from '../../components/forms/Form';
import './styles.css';

/**
* @type {{
* label: string,
* type: string,
* name: string,
* placeholder: string,
* required: boolean
* }[]}
*/
const FIELD_SET = [
  { label: 'Enter username:', type: 'text', name: 'username', placeholder: 'username', required: true },
  { label: 'Enter password:', type: 'password', name: 'password1', placeholder: 'password', required: true },
  { label: 'Confirm password:', type: 'password', name: 'password2', placeholder: 'confirm password', required: true },
];

/** @type {{name: string, link: string }[]} */
const ROUTE_LINKS = [
  { name: "login", link: "login" },
  { name: "registration", link: "registration" },
];

/** @returns {ReactElement} */
export default function Registration() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function sendForm(event) {
    event.preventDefault();
    setLoading(true);

    var [name, pass1, pass2] = event.target;

    try {
      const { data, status } = await api.request('/api/users/create/', {
        method: 'post',
        data: { username: name.value, password1: pass1.value, password2: pass2.value },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (!data.isAuth || status !== 201) {
        var errorMessage = Object.entries(data.errors)
          .reduce((acc, [key, val]) => [...acc, `${key}: `, ...val], []);
        throw new Error(errorMessage);
      }

      var { accessToken, user } = data;
      localStorage.setItem("dtcAccess", accessToken);

      dispatch(setUser(user));
      dispatch(addAlert({ message: `User ${user.namename} created`, type: "success" }));
      navigate('/');
    }
    catch ({ message }) {
      dispatch(addAlert({ message: "User registration failed" + message, type: "error" }));
      setErrors(message);
      setLoading(false);
      setTimeout(() => setErrors(null), 5000);
    }
  }

  useEffect(() => {
    dispatch(setTitle("Registration"));
    dispatch(setNav(ROUTE_LINKS));
    dispatch(setParent());
    dispatch(setCurrent("registration"));
    dispatch(setLink());
  }, []);

  return (
    <div className="iss__registrationPage">
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

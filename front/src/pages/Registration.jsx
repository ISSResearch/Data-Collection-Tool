import { UserContext } from '../context/User';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from '../components/common/Form';
import axios from 'axios';
import '../styles/pages/registration.css';

export default function Registration() {
  const {setUser} = useContext(UserContext);
  const navigate = useNavigate();

  function sendForm(event) {
    event.preventDefault();
    const [name, pass1, pass2] = event.target;
    axios.request('/api/users/create/',
      {
        method: 'post',
        data: {username: name.value, password1: pass1.value, password2: pass2.value},
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )
      .then(({status, data}) => {
        if (!data.isAuth) return console.log(data.errors);
        setUser(data.user);
        navigate('/');
      })
      .catch(err => console.log(err.message));
  }

  const fieldSet = [
    {label: 'Enter username:', type: 'text', name: 'username', placeholder: 'username', required: true},
    {label: 'Enter password:', type: 'password', name: 'password1', placeholder: 'password', required: true},
    {label: 'Confirm password:', type: 'password', name: 'password2', placeholder: 'confirm password', required: true},
  ]

  const bottomLink = { to: '/login', text: 'Or Login' }

  return (
    <div className="iss__registrationPage">
      <h1>Registration Page</h1>
      <Form
        callback={sendForm}
        fields={fieldSet}
        link={bottomLink}
        buttonText="Register"
      />
    </div>
  );
}
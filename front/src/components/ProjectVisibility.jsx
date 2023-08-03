import { useEffect, useState } from "react";
import { useCollectors } from '../hooks';
import { Fragment } from "react";
import Load from './common/Load';
import api from "../config/api";
import '../styles/components/projectvisibility.css';


export default function ProjectVisibility({ projectID }) {
  const [loading, setLoading] = useState(true);
  const { collectors, changeCollector, initData } = useCollectors();

  function sendForm(event) {
    event.preventDefault();
  }

  useEffect(() => {
    api.get('api/users/collectors/')
      .then(({ data }) => {
        initData(data);
        setLoading(false);
      })
      .catch(error => alert(error.message));
  }, []);

  if (loading) return <div className='iss__visibility__load'><Load/></div>

  return (
    <form onSubmit={event => sendForm(event)} className="iss__visibility__form">
      <table className="iss__visibility__table">
        <thead className='iss__visibility__table-header'>
          <tr className='iss__visibility__table-row'>
            <th>Username</th>
            <th>Can view project</th>
            <th>Can upload</th>
            <th>Can validate</th>
            <th>Can view stats</th>
            <th>Can edit</th>
          </tr>
        </thead>
        <tbody className='iss__visibility__table-body'>
          {
            Object.values(collectors).map(({ id, username }) => (
              <Fragment key={id}>
                <tr>
                  <td>{username}</td>
                  <td><input type="checkbox"/></td>
                  <td><input type="checkbox"/></td>
                  <td><input type="checkbox"/></td>
                  <td><input type="checkbox"/></td>
                  <td><input type="checkbox"/></td>
                </tr>
              </Fragment>
            ))
          }
        </tbody>
      </table>
      <button type='submit' className="iss__visibility__submitButton">SUBMIT VISIBILITY</button>
    </form>
  );
}
// TODO: new component - write tests
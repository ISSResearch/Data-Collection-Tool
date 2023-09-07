import { useEffect, useState } from "react";
import { useCollectors } from '../hooks';
import { Fragment } from "react";
import Load from './common/Load';
import api from "../config/api";
import '../styles/components/projectvisibility.css';

const PERMISSIONS = [
  { name: 'Can view project', value: 'visible' },
  { name: 'Can upload', value: 'upload' },
  { name: 'Can view files', value: 'view' },
  { name: 'Can validate', value: 'validate' },
  { name: 'Can view stats', value: 'stats' },
  { name: 'Can download', value: 'download' },
  { name: 'Can edit', value: 'edit' },
]

export default function ProjectVisibility({ pathID }) {
  const [loading, setLoading] = useState({ page: true, submit: false });
  const { collectors, changeCollector, initData, gatherData } = useCollectors();

  function sendForm(event) {
    event.preventDefault();
    setLoading({ ...loading, submit: true });
    const formData = { project: pathID, users: gatherData() };
    api.request(`/api/users/collectors/${pathID}/`, {
      method: 'patch',
      data: formData,
      headers: { 'Content-Type': 'application/json' }
    })
      .then(({ data }) => {
        initData(data);
        setLoading({ ...loading, submit: false });
      })
      .catch(error => alert(error.message));
  }

  useEffect(() => {
    api.get(`api/users/collectors/${pathID}/`)
      .then(({ data }) => {
        initData(data);
        setLoading({ ...loading, page: false });
      })
      .catch(error => alert(error.message));
  }, []);

  if (loading.page) return <div className='iss__visibility__load'><Load /></div>

  return (
    <form onSubmit={event => sendForm(event)} className="iss__visibility__form">
      <table className="iss__visibility__table">
        <thead className='iss__visibility__table-header'>
          <tr className='iss__visibility__table-row'>
            <th>Username</th>
            {PERMISSIONS.map(({ name }) => <th key={name}>{name}</th>)}
          </tr>
        </thead>
        <tbody className='iss__visibility__table-body'>
          {
            Object.values(collectors).map(({ user_id, username, permissions }) => (
              <Fragment key={user_id}>
                <tr className="iss__visibility__table-row">
                  <td className="iss__visibility__table-cell">{username}</td>
                  {
                    PERMISSIONS.map(({ value }) => (
                      <td key={value} className="iss__visibility__table-cell">
                        <input
                          onChange={({ target }) => changeCollector(user_id, value, target)}
                          defaultChecked={permissions[value]}
                          type="checkbox"
                        />
                      </td>
                    ))
                  }
                </tr>
              </Fragment>
            ))
          }
        </tbody>
      </table>
      <button className='iss__visibility__submitButton'>
        {loading.submit ? <Load isInline /> : <span>SUBMIT VISIBILITY</span>}
      </button>
    </form>
  );
}

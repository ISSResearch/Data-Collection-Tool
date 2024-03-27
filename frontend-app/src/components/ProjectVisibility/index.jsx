import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Fragment, ReactElement } from "react";
import { useCollectors } from '../../hooks';
import { api } from "../../config/api";
import { addAlert } from "../../slices/alerts";
import { useDispatch } from "react-redux";
import Load from "../ui/Load";
import './styles.css';

/** @type {{name: string, value: string}[]} */
const PERMISSIONS = [
  { name: 'Can view project', value: 'visible' },
  { name: 'Can upload', value: 'upload' },
  { name: 'Can view files', value: 'view' },
  { name: 'Can validate', value: 'validate' },
  { name: 'Can view stats', value: 'stats' },
  { name: 'Can download', value: 'download' },
  { name: 'Can edit', value: 'edit' },
];

/**
* @param {object} props
* @param {number} props.pathID
* @returns {ReactElement}
*/
export default function ProjectVisibility({ pathID }) {
  const [loading, setLoading] = useState({ page: true, submit: false });
  const { collectors, changeCollector, initData, gatherData } = useCollectors();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function sendForm(event) {
    event.preventDefault();

    setLoading({ ...loading, submit: true });

    try {
      var formData = { project: pathID, users: gatherData() };

      var { data }  = await api.request(`/api/users/collectors/${pathID}/`, {
        method: 'patch',
        data: formData,
        headers: {
          'Content-Type': 'application/json',
          "Authorization": "Bearer " + localStorage.getItem("dtcAccess")
        }
      });

      initData(data);
      dispatch(addAlert({ message: "Visibility for project changed", type: "success" }));
      setLoading({ ...loading, submit: false });
    }
    catch({ message, response }) {
      var authFailed = response?.status === 401 || response?.status === 403;

      dispatch(addAlert({
        message: "Updating collectors error" + message,
        type: "error",
        noSession: authFailed
      }));

      if (authFailed) navigate("/login");
    }
  }

  useEffect(() => {
    api.get(`api/users/collectors/${pathID}/`, {
      headers: { "Authorization": "Bearer " + localStorage.getItem("dtcAccess") }
    })
      .then(({ data }) => {
        initData(data);
        setLoading({ ...loading, page: false });
      })
      .catch(({ message, response }) => {
        var authFailed = response.status === 401 || response.status === 403;

        dispatch(addAlert({
          message: "Getting collectors error: " + message,
          type: "error",
          noSession: authFailed
        }));

        if (authFailed) navigate("/login");
      });
  }, []);

  if (loading.page) return <div className='iss__visibility__load'><Load /></div>;

  return (
    <form onSubmit={(event) => sendForm(event)} className="iss__visibility__form">
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

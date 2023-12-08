import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { attributeStatsAdapter, userStatsAdapter } from '../../../adapters';
import { api } from '../../../config/api';
import { AlertContext } from "../../../context/Alert";
import TableBodySet from '../TableBodySet';
import Load from "../../ui/Load";
import './styles.css';

const ADAPTER_MAP = {
  attribute: attributeStatsAdapter,
  user: userStatsAdapter
};

export default function({ pathID }) {
  const [stats, setStats] = useState([]);
  const [choice, setChoice] = useState("");
  const { addAlert } = useContext(AlertContext);
  const navigate = useNavigate();

  const countItem = (a, b, c) => {
    var acc = (a?.image || 0) + (a?.video || 0);
    var dec = (b?.image || 0) + (b?.video || 0);
    var val = (c?.image || 0) + (c?.video || 0);

    return acc + dec + val;
  };

  const countStatus = (status) => {
    return Object.values(stats)
      .reduce((sum, item) => sum + countItem(item[status]), 0);
  };

  const countTotal = () => {
    return Object.values(stats)
      .reduce((sum, { a, d, v }) => sum + countItem(a, d, v), 0);
  };

  useEffect(() => {
    if (!choice) return;

    api.get(`/api/files/stats/${choice}/${pathID}/`, {
      headers: { "Authorization": "Bearer " + localStorage.getItem("dtcAccess") }
    })
      .then(({ data }) => setStats(ADAPTER_MAP[choice](data)))
      .catch(({ message, response }) => {
        var authFailed = response && (
          response.status === 401 || response.status === 403
        );

        addAlert("Getting stats error: " + message, "error", authFailed);

        if (authFailed) navigate("/login");
      });
  }, [choice]);


  return (
    <>
    <fieldset
      onChange={({ target }) => setChoice(target.value)}
      className="iss__stats__radio"
    >
      stats by:
      {
        Object.keys(ADAPTER_MAP).map(key => (
          <label key={key}>
            <input type="radio" name="choice" value={key} />
            {key}
          </label>
        ))
      }
    </fieldset>
    {
      choice && <>
      {
        stats.length
        ? <section className="iss__stats__tableWrap">
          <table className='iss__stats__table'>
            <thead className='iss__stats__table-header'>
              <tr className='iss__stats__table-row-outer'>
                <th>{choice.at().toUpperCase() + choice.slice(1)}</th>
                <th className='row-v'>On validation</th>
                <th className='row-a'>Accepted</th>
                <th className='row-d'>Declined</th>
                <th>total</th>
              </tr>
            </thead>
            <tbody className='iss__stats__table-body'>
              <TableBodySet bodySet={stats} countCallback={countItem} parent />
            </tbody>
            <tfoot className='iss__stats__table-footer'>
              <tr className='iss__stats__table-row-outer'>
                <td><b>total</b></td>
                <td>{countStatus('v')}</td>
                <td>{countStatus('a')}</td>
                <td>{countStatus('d')}</td>
                <td>{countTotal()}</td>
              </tr>
            </tfoot>
          </table>
        </section>
        : <div className='iss__stats__load'><Load /></div>
      }
      </>
    }
    </>
  )
}

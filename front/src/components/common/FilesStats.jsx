import { useEffect, useState } from 'react';
import { statsAdapter } from '../../utils/adapters';
import TableBodySet from './TableBodySet';
import Load from './Load';
import axios from 'axios';
import '../../styles/components/filesstats.css';

export default function FilesStatistics({pathID}) {
  const [stats, setStats] = useState(null);

  const countItem = (a, b, c) => {
    const acc = (a?.image || 0) + (a?.video || 0);
    const dec = (b?.image || 0) + (b?.video || 0);
    const val = (c?.image || 0) + (c?.video || 0);
    return acc + dec + val;
  };

  const countStatus = (status) => {
    return Object.values(stats).reduce((sum, item) => sum + countItem(item[status]), 0);
  };

  const countTotal = () => {
    return Object.values(stats).reduce((sum, {a, d, v}) => sum + countItem(a, d, v), 0);
  };

  useEffect(() => {
    axios.get(`/api/files/stats/project/${pathID}/`)
      .then(({ data }) => setStats(statsAdapter(data)) )
      .catch(err => {
        alert(err.message);
        setStats([]);
      });
  }, [pathID]);

  if (!stats) return <div className='iss__stats__load'><Load /></div>

  return (
    <table className='iss__stats__table'>
      <thead className='iss__stats__table-header'>
        <tr className='iss__stats__table-row-outer'>
          <th>Attribute</th>
          <th className='row-v'>On validation</th>
          <th className='row-a'>Accepted</th>
          <th className='row-d'>Declined</th>
          <th>total</th>
        </tr>
      </thead>
      <tbody className='iss__stats__table-body'>
        <TableBodySet bodySet={stats} countCallback={countItem} parent/>
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
  )
}
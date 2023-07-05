import { Fragment, useEffect, useState } from 'react';
import { fullStatsAdapter, statsAdapter } from '../../utils/adapters';
import TableBodySet from './TableBodySet';
import Load from './Load';
import axios from 'axios';
import '../../styles/components/filesstats.css';

export default function FilesStatistics({pathID}) {
  const [stats, setStats] = useState(null);

  const [rawData, setRawData] = useState(false);

  const countItem = (a, b, c) => {
    const acc = (a?.image || 0) + (a?.video || 0);
    const dec = (b?.image || 0) + (b?.video || 0);
    const val = (c?.image || 0) + (c?.video || 0);
    return acc + dec + val;
  };

  const countStatus = (status) => {
    return Object.values(stats.stats).reduce((sum, item) => sum + countItem(item[status]), 0);
  };

  const countTotal = () => {
    return Object.values(stats.stats).reduce((sum, {a, d, v}) => sum + countItem(a, d, v), 0);
  };

  useEffect(() => {
    axios.get(`/api/files/stats/project/${pathID}/`)
      .then(({ data }) => {
        const { stats, full_stats} = data;
        const prepared = {
          stats: statsAdapter(stats),
          fullStats: fullStatsAdapter(full_stats)
        }
        setStats(prepared);
      })
      .catch(err => {
        alert(err.message);
        setStats({});
      });
  }, [pathID]);

  if (!stats) return <div className='iss__stats__load'><Load /></div>

  const typeMap = {
    v: 'on validation',
    a: 'accepted',
    d: 'declined'
  }
  if (rawData) return (
    <>
    <button className='iss_button_temp' onClick={() => setRawData(!rawData)}>{rawData ? 'get pretty data' : 'get raw data'}</button>
    {
      stats.fullStats.map(({name, data}, index) => (
        <div className='iss_table_temp' key={name + index}>
          <span>{name}:</span>
          {
            data.map(({attr_name, type, status, count}, index) => (
              <ul key={attr_name + index}>
                <li>{attr_name}: {type} <span>|</span> {typeMap[status]} <span>|</span> {count}</li>
              </ul>
            ))
          }
        </div>
      ))
    }
    </>
  );

  return (
    <>
    <button className='iss_button_temp' onClick={() => setRawData(!rawData)}>{rawData ? 'get pretty data' : 'get raw data'}</button>
    <table className='iss__stats__table'>
      <thead className='iss__stats__table-header'>
        <tr className='iss__stats__table-row'>
          <th>Attribute</th>
          <th className='row-v'>On validation</th>
          <th className='row-a'>Accepted</th>
          <th className='row-d'>Declined</th>
          <th>total</th>
        </tr>
      </thead>
      <tbody className='iss__stats__table-body'>
        <TableBodySet bodySet={stats.stats} countCallback={countItem} parent/>
      </tbody>
      <tfoot className='iss__stats__table-footer'>
        <tr className='iss__stats__table-row'>
          <td><b>total</b></td>
          <td>{countStatus('v')}</td>
          <td>{countStatus('a')}</td>
          <td>{countStatus('d')}</td>
          <td>{countTotal()}</td>
        </tr>
      </tfoot>
    </table>
  </>
  )
}
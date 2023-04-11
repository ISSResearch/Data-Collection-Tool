import { useEffect, useState } from 'react';
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
  }

  useEffect(() => {
    axios.get(`/api/files/stats/project/${pathID}/`)
      .then(({status, data}) => {
        const prepareData = data.reduce((acc, item) => {
          const target = acc[item.attribute__name || 'atr not set'];
          if (!target) {
            acc[item.attribute__name || 'atr not set'] = {
              [item.status || 'v']: { [item.file_type]: item.count }
            };
          }
          else if ((target[item.status || 'v'])) {
            target[item.status || 'v'][item.file_type] = item.count
          }
          else target[item.status] = { [item.file_type]: item.count };
          return acc;
        }, {});

        setStats(prepareData);
      })
      .catch(err => {
        console.log('err', err.message);
        setStats([]);
      });
  }, [pathID]);

  if (!stats) return <div className='iss__stats__load'><Load /></div>

  return (
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
      {Object.entries(stats).map(([name, { a, d, v}]) => (
        <tbody key={name} className='iss__stats__table-body'>
          <tr className='iss__stats__table-row'>
            <td>{name}</td>
            <td className='row-v'>
              <div>
                <span>images: { v?.image || 0 }</span>
                <span>videos: { v?.video || 0 }</span>
              </div>
            </td>
            <td className='row-a'>
              <div>
                <span>images: { a?.image || 0 }</span>
                <span>videos: { a?.video || 0 }</span>
              </div>
            </td>
            <td className='row-d'>
              <div>
                <span>images: { d?.image || 0}</span>
                <span>videos: { d?.video || 0 }</span>
              </div>
            </td>
            <td className='row-cnt'>{countItem(a, d, v)}</td>
          </tr>
        </tbody>
      ))}
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
  )
}
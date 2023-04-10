import { useEffect, useState } from 'react';
import Load from './Load';
import axios from 'axios';
import '../../styles/components/filesstats.css';

export default function FilesStatistics({pathID}) {
  const [stats, setStats] = useState(null);

  const countItem = (a, b, c) => (a || 0) + (b || 0) + (c || 0);

  useEffect(() => {
    axios.get(`/api/files/stats/project/${pathID}/`)
      .then(({status, data}) => {
        // const preparedData = deepCopy(data)
        // preparedData.forEach(el => {
        //   const parent = preparedData.find(({ attribute__id }) => {
        //     if (!attribute__id) return ''
        //     return el.attribute__parent === attribute__id
        //   });
        //   if (parent) parent.children ? parent.children.push(el) : parent.children = [el];
        // })
        // attribute__id :  4
        // attribute__name :  "g"
        // attribute__parent :  null
        // count :  2
        // status :  ""
        const preparedata = data.reduce((acc, item) => {
          const target = acc[item.attribute__name || 'atr not set'];
          target
            ? target[item.status || 'v'] = item.count
            : acc[item.attribute__name || 'atr not set'] = { [item.status || 'v']: item.count };
          return acc;
        }, {});
        console.log(Object.entries(preparedata));
        setStats(preparedata);
      })
      .catch(err => {
        console.log('err', err.message);
        setStats([]);
      });
  }, [pathID]);

  if (!stats) return <div className='iss__stats__load'><Load /></div>

  return (
    <div className='iss__stats__content'>
      {Object.entries(stats).map(([name, { a, d, v }]) => (
        <div className='iss__stats__item'>
          <span><b>{ name }:</b></span>
          <span>all: {countItem(a, d, v)},</span>
          <span>on validation: { v || 0 },</span>
          <span>accepted: { a || 0},</span>
          <span>declined: { d || 0}</span>
        </div>
      ))}
    </div>
  )
}
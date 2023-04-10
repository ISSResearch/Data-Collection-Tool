import { useEffect, useState } from 'react';
import Load from './Load';
import axios from 'axios';
import '../../styles/components/filesstats.css';

export default function FilesStatistics({pathID}) {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/files/stats/project/${pathID}/`)
      .then(({status, data}) => {

        // const preparedData = deepCopy(data);
        // preparedData.forEach(el => {
        //   const parent = preparedData.find(({ id }) => el.attribute__parent === id);
        //   if (parent) parent.children ? parent.children.push(el) : parent.children = [el];
        // })
        // return attributes.filter(({parent}) => !parent);


        setStats({});
        setLoading(false);
      })
      .catch(err => console.log('err', err.message));
  }, [pathID]);

  if (loading) return <div className='iss__stats__load'><Load /></div>

}
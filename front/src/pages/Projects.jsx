import { useEffect, useState, useContext } from 'react';
import { UserContext } from '../context/User';
import Projects from '../components/AllProjects';
import Load from '../components/common/Load';
import ProjectCreate from '../components/ProjectCreate';
import TitleSwitch from "../components/common/TitleSwitch";
import axios from 'axios';
import '../styles/pages/projects.css';

export default function Home() {
  const [projects, setProjects] = useState(null);
  const [pageOption, setOption] = useState('all');
  const { user } = useContext(UserContext);

  const commonOptions = [{ name: 'all projects', value: 'all' }];
  const adminOptions = [
    ...commonOptions,
    { name: 'create project', value: 'create' },
  ];

  useEffect(() => {
    axios.get('/api/projects/')
      .then(({ status, data }) => { setProjects(data); })
      .catch(err => console.log('err', err.message));
  }, [])

  return (
    <div className="iss__projects">
      <TitleSwitch
        title='Projects Page'
        options={user.user_role === 'a' ? adminOptions : commonOptions}
        currentOption={pageOption}
        handler={setOption}
      />
      {!projects
        ? <div className="iss__projects__load"><Load/></div>
        : <>
          {pageOption !== 'create' && <Projects items={projects}/>}
          {pageOption === 'create' && <ProjectCreate />}
        </>}
    </div>
  );
}

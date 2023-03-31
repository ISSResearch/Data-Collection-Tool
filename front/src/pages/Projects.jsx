import { useEffect, useState } from 'react';
import Projects from '../components/AllProjects';
import ProjectCreate from '../components/ProjectCreate';
import TitleSwitch from "../components/common/TitleSwitch";
import axios from 'axios';
import '../styles/pages/projects.css';

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [optionOne, setRadio] = useState(true);

  useEffect(() => {
    axios.get('/api/projects/')
      .then(({ status, data }) => { setProjects(data); })
      .catch(err => console.log('err', err.message));
			// TODO: remove opt dependecy after proper routing
  }, [optionOne])

  return (
    <div className="iss__homePage">
      <TitleSwitch
        title='Projects Page'
        options={['all projects', 'create project']}
        optionOne={optionOne}
        handler={setRadio}
      />
			{/*TODO: remove setoption prop after routing*/}
      {optionOne ? <Projects items={projects}/> : <ProjectCreate setOpt={setRadio}/>}
    </div>
  );
}

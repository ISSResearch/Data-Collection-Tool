import { useEffect, useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { UserContext } from '../context/User';
import AllProjects from '../components/AllProjects';
import Load from '../components/common/Load';
import ProjectCreate from '../components/ProjectCreate';
import TitleSwitch from "../components/common/TitleSwitch";
import api from '../config/api';
import '../styles/pages/projects.css';

const ROUTE_LINKS = [{ name: 'all projects', link: '' }];
const PROTECTED_ROUTE_LINKS = [
  { name: 'create project', link: 'create', permission: 'hidden' }
];

export default function Projects() {
  const [projects, setProjects] = useState(null);
  const [currentRoute, setCurrentRoute] = useState('projects');
  const { user } = useContext(UserContext);
  const location = useLocation();

  const userOptions = [...ROUTE_LINKS];
  if (user?.is_superuser) userOptions.push(...PROTECTED_ROUTE_LINKS);

  const PageVariant = (props) => {
    const variants = {
      create: ProjectCreate
    }
    const Component = variants[currentRoute] || AllProjects;
    return Component && <Component {...props} />;
  }

  useEffect(() => {
    api.get('/api/projects/')
      .then(({ data }) => { setProjects(data); })
      .catch(err => alert(err.message));
  }, []);

  useEffect(() => {
    const getLocation = () => {
      const [, mainPath, childPath] = location.pathname.split('/');
      return childPath || mainPath;
    };
    setCurrentRoute(getLocation());
  }, [location]);

  return (
    <div className="iss__projects">
      <TitleSwitch
        title='Projects'
        links={userOptions}
        currentRoute={currentRoute}
        parent={'projects'}
      />
      {
        !projects
          ? <div className="iss__projects__load"><Load/></div>
          : <PageVariant items={projects}/>
      }
    </div>
  );
}
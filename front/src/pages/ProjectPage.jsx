import { Link, useParams, useNavigate, useLocation } from "react-router-dom"
import { useEffect, useState, useContext } from "react";
import { attributeAdapter } from '../utils/adapters';
import { UserContext } from '../context/User';
import FilesValidate from "../components/FilesValidate";
import FilesUpload from "../components/FilesUpload";
import FilesDownload from "../components/FilesDownload";
import FilesStatistics from "../components/common/FilesStats";
import TitleSwitch from "../components/common/TitleSwitch";
import ProjectEdit from "../components/ProjectEdit";
import Load from '../components/common/Load';
import api from "../config/api";
import '../styles/pages/project.css';

const ROUTE_LINKS = [{ name: 'upload data', link: '' }];
const PROTECTED_ROUTE_LINKS = [
  { name: 'validate data', link: 'validate' },
  { name: 'download data', link: 'download' },
  { name: 'statistics', link: 'stats' },
];

export default function ProjectPage() {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState({});
  const [currentRoute, setCurrentRoute] = useState('projects');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(UserContext);
  const { projectID } = useParams();

  const userOptions = [...ROUTE_LINKS];
  if (user?.user_role === 'a') userOptions.push(...PROTECTED_ROUTE_LINKS);
  if (user?.is_superuser) userOptions.push({ name: 'editing', link: 'edit' });

  useEffect(() => {
    if (!projectID) return;
    api.get(`/api/projects/${projectID}/`)
      .then(({ data }) => {
        const preparedData = attributeAdapter(data);
        setProject(preparedData);
        setLoading(false);
      })
      .catch(() => navigate('/404'));
  }, [projectID]);

  useEffect(() => {
    const getLocation = () => {
      const [, mainPath, id, childPath] = location.pathname.split('/');
      return childPath || `${mainPath}/${id}`;
    };
    setCurrentRoute(getLocation());
    if (
      PROTECTED_ROUTE_LINKS.map(({link}) => link).includes(currentRoute)
      && !userOptions.map(({link}) => link).includes(currentRoute)
    ) navigate('/projects');
  }, [location]);

  const PageVariant = (props) => {
    const variants = {
      validate: FilesValidate,
      stats: FilesStatistics,
      download: FilesDownload,
      edit: ProjectEdit,
    }
    const Component = variants[currentRoute] || FilesUpload;
    return <Component {...props} />;
  }

  return (
    <div className='iss__projectPage'>
      <Link to="/projects" className="iss__projectPage__button">back to</Link>
      <TitleSwitch
        title={project.name}
        links={userOptions}
        currentRoute={currentRoute}
        parent={`projects/${projectID}`}

      />
      {
        loading
          ? <div className="iss_projectPage__load"><Load/></div>
          : <>
            {
              currentRoute !== 'edit' &&
                <p className="iss__projectPage__description">
                  Description: {project.description}
                </p>
            }
            <PageVariant
              attributes={project.preparedAttributes}
              projectName={project.name}
              projectDescription={project.description}
              pathID={projectID}
            />
          </>
      }
    </div>
  );
}
// TODO: changes - revise tests
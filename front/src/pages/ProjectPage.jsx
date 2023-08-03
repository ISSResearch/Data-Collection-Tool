import { Link, useParams, useNavigate, useLocation } from "react-router-dom"
import { useEffect, useState, useContext } from "react";
import { attributeAdapter } from '../utils/adapters';
import { UserContext } from '../context/User';
import ProjectVisibility from "../components/ProjectVisibility";
import FilesValidate from "../components/FilesValidate";
import FilesUpload from "../components/FilesUpload";
import FilesDownload from "../components/FilesDownload";
import FilesStatistics from "../components/common/FilesStats";
import TitleSwitch from "../components/common/TitleSwitch";
import ProjectEdit from "../components/ProjectEdit";
import Load from '../components/common/Load';
import api from "../config/api";
import '../styles/pages/project.css';

const ROUTE_LINKS = [];
const PROTECTED_ROUTE_LINKS = [
  { name: 'upload data', link: 'upload', permission: 'can_upload_project'  },
  { name: 'validate data', link: 'validate', permission: 'can_validate_project' },
  { name: 'statistics', link: 'stats', permission: 'can_view_stats_project' },
  { name: 'download data', link: 'download', permission: 'can_download_project' },
  { name: 'edit', link: 'edit', permission: 'change_project' }
];

export default function ProjectPage() {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState({});
  const [currentRoute, setCurrentRoute] = useState('projects');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(UserContext);
  const { projectID } = useParams();

  const userOptions = [...ROUTE_LINKS ];
  if (user?.is_superuser) userOptions.push(...PROTECTED_ROUTE_LINKS);
  else if (user) userOptions.push(
    ...PROTECTED_ROUTE_LINKS.filter(({permission}) => user.permissions.includes(permission))
  )

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
  }, [location]);

  const PageVariant = (props) => {
    const variants = {
      upload: FilesUpload,
      validate: FilesValidate,
      download: FilesDownload,
      stats: FilesStatistics,
      edit: ProjectEdit,
      visibility: ProjectVisibility
    }
    const Component = variants[currentRoute];
    return Component && <Component {...props} />;
  }

  if (loading) return (<div className="iss_projectPage__load"><Load/></div>)

  return (
    <div className='iss__projectPage'>
      <Link to="/projects" className="iss__projectPage__button">back to</Link>
      <TitleSwitch
        title={project.name}
        titleLink={true}
        links={userOptions}
        currentRoute={currentRoute}
        parent={`projects/${projectID}`}
      />
      {
        currentRoute === `projects/${projectID}` &&
          <p className="iss__projectPage__description">
            Description: {project.description}
          </p>
      }
      <PageVariant
        attributes={project.preparedAttributes}
        rawAttributes={project.attributes}
        projectName={project.name}
        projectDescription={project.description}
        pathID={projectID}
      />
    </div>
  );
}
// TODO: changes - revise tests
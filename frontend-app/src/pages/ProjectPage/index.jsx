import { Link, useParams, useNavigate, useLocation } from "react-router-dom"
import { useEffect, useState, useContext, useCallback } from "react";
import { attributeAdapter } from '../../adapters';
import { UserContext } from '../../context/User';
import { api } from "../../config/api";
import ProjectVisibility from "../../components/ProjectVisibility";
import FilesValidate from "../../components/FilesValidate";
import FilesUpload from "../../components/FilesUpload";
import FilesDownload from "../../components/FilesDownload";
import FileStats from "../../components/common/FileStats";
import TitleSwitch from "../../components/common/TitleSwitch";
import ProjectEdit from "../../components/ProjectEdit";
import Load from "../../components/ui/Load";
import './styles.css';

const PROTECTED_ROUTE_LINKS = [
  { name: 'upload data', link: 'upload', permission: 'upload' },
  { name: 'validate data', link: 'validate', permission: 'view' },
  { name: 'statistics', link: 'stats', permission: 'stats' },
  { name: 'download data', link: 'download', permission: 'download' },
  { name: 'edit', link: 'edit', permission: 'edit' }
];

export default function() {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [userOptions, setUserOptions] = useState([]);
  const [currentRoute, setCurrentRoute] = useState('projects');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(UserContext);
  const { projectID } = useParams();

  const PageVariant = useCallback((props) => {
    const [, , , variant] = location.pathname.split('/')
    const variants = {
      upload: FilesUpload,
      validate: FilesValidate,
      stats: FileStats,
      download: FilesDownload,
      edit: ProjectEdit,
      visibility: ProjectVisibility
    }
    const Component = variants[variant];
    return Component && <Component {...props} />;
  }, [location]);

  // TODO: refactor routes validation and permission
  useEffect(() => {
    const getLocation = () => {
      var [, mainPath, id, childPath] = location.pathname.split('/');
      return childPath || `${mainPath}/${id}`;
    };

    var pageLoc = getLocation();

    if (project && !user.is_superuser && pageLoc !== `projects/${projectID}`) {
      var check_path = { ...project.permissions };
      check_path.visibility = check_path.edit;
      var checkAgainst = pageLoc === "validate" ? "view" : pageLoc;
      if (!check_path[checkAgainst]) navigate('/404');
    }

    setCurrentRoute(pageLoc);

    if (!project) {
      api.get(`/api/projects/${projectID}/`, {
        headers: { "Authorization": "Bearer " + localStorage.getItem("dtcAccess") }
      })
        .then(({ data }) => {
          const preparedData = attributeAdapter(data);
          setProject(preparedData);

          var { permissions } = data;

          if (user.is_superuser) setUserOptions([...PROTECTED_ROUTE_LINKS]);
          else {
            setUserOptions([
              ...PROTECTED_ROUTE_LINKS.filter(({ permission }) => permissions[permission])
            ]);
          }

          setLoading(false);
        })
        .catch(({ message, response }) => {
          const authFailed = response.status === 401 || response.status === 403;
          alert(authFailed ? "authentication failed" : message);
          if (authFailed) navigate("/login");
          navigate('/404')
        });
    }
  }, [project, location]);

  if (loading) return (<div className="iss_projectPage__load"><Load /></div>);

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
        <p
          dangerouslySetInnerHTML={{ __html: "Description:<br>" + project.description }}
          className="iss__projectPage__description"
        />
      }
      <PageVariant
        attributes={project.preparedAttributes}
        projectName={project.name}
        projectDescription={project.description}
        canValidate={user.is_superuser || project.permissions.validate}
        pathID={projectID}
      />
    </div>
  );
}

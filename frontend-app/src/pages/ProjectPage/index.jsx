import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback, ReactElement } from "react";
import { attributeAdapter } from '../../adapters';
import { useSelector, useDispatch } from "react-redux";
import { addAlert } from "../../slices/alerts";
import { api } from "../../config/api";
import { setLink, setNav, setTitle, setParent, setCurrent } from "../../slices/heads";
import ProjectVisibility from "../../components/ProjectVisibility";
import FilesValidate from "../../components/FilesValidate";
import FilesUpload from "../../components/FilesUpload";
import FilesDownload from "../../components/FilesDownload";
import FileStats from "../../components/common/FileStats";
import ProjectEdit from "../../components/ProjectEdit";
import ProjectGoals from "../../components/ProjectGoals";
import Load from "../../components/ui/Load";
import Arrow from "../../components/ui/Arrow";
import './styles.css';

/** @type {{name: string, link: string, permission: string}[]} */
const PROTECTED_ROUTE_LINKS = [
  { name: 'upload data', link: 'upload', permission: 'upload' },
  { name: 'validate data', link: 'validate', permission: 'view' },
  { name: 'goals', link: 'goals', permission: 'stats' },
  { name: 'statistics', link: 'stats', permission: 'stats' },
  { name: 'download data', link: 'download', permission: 'download' },
  { name: 'edit', link: 'edit', permission: 'edit' }
];

/** @type {{[variant: string]: ReactElement}} */
const VARIANTS = {
  upload: FilesUpload,
  validate: FilesValidate,
  goals: ProjectGoals,
  stats: FileStats,
  download: FilesDownload,
  edit: ProjectEdit,
  visibility: ProjectVisibility
};

/** @returns {ReactElement} */
export default function ProjectPage() {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const { projectID } = useParams();
  const user = useSelector((state) => state.user.user);
  const currentRoute = useSelector((state) => state.head.current);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const PageVariant = useCallback((props) => {
    var [, , , variant] = location.pathname.split('/');
    var Component = VARIANTS[variant];
    return Component && <Component {...props} />;
  }, [location]);

  useEffect(() => {
    var getLocation = () => {
      var [, mainPath, id, childPath] = location.pathname.split('/');
      return childPath || `${mainPath}/${id}`;
    };

    var pageLoc = getLocation();

    if (project && !user.is_superuser && pageLoc !== `projects/${projectID}`) {
      var check_path = { ...project.permissions };
      check_path.visibility = check_path.edit;

      var checkAgainst = pageLoc === "validate" ? "view" : pageLoc;

      if (!check_path[checkAgainst]) {
        dispatch(addAlert({ message: "Project permission denied for current user", type: "error" }));
        navigate('/404');
      }
    }

    if (!project) {
      api.get(`/api/projects/${projectID}/`, {
        headers: { "Authorization": "Bearer " + localStorage.getItem("dtcAccess") }
      })
        .then(({ data }) => {
          var preparedData = attributeAdapter(data);
          setProject(preparedData);

          var { permissions } = data;

          dispatch(setNav(
            user.is_superuser
             ? PROTECTED_ROUTE_LINKS
             : PROTECTED_ROUTE_LINKS.filter(({ permission }) => permissions[permission])
          ));

          setLoading(false);
        })
        .catch(({ message, response }) => {
          var authFailed = response?.status === 401 || response?.status === 403;

          dispatch(addAlert({
            message: "Getting project data error: " + message,
            type: "error",
            noSession: authFailed
          }));

          navigate(authFailed ? "/login" : '/404');
        });
    }

    dispatch(setCurrent(pageLoc));
    dispatch(setParent(`projects/${projectID}`));
    dispatch(setTitle(project?.name));
    dispatch(setLink(true));

  }, [project, location]);

  if (loading) return (<div className="iss_projectPage__load"><Load /></div>);

  return (
    <div className='iss__projectPage'>
      <Link to="/projects" className="iss__projectPage__button">
        <Arrow color="white" point="left" />
        back
      </Link>
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

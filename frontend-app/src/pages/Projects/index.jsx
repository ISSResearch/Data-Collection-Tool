import { ReactElement, useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { addAlert } from '../../slices/alerts';
import { api } from '../../config/api';
import { setNav, setLink, setTitle, setParent, setCurrent } from '../../slices/heads';
import Load from "../../components/ui/Load";
import AllProjects from '../../components/AllProjects';
import ProjectCreate from '../../components/ProjectCreate';
import './styles.css';

/** @type {{name: string, link: string}[]} */
const ROUTE_LINKS = [{ name: 'all projects', link: '' }];

/** @type {{name: string, link: string, permission: string}[]} */
const PROTECTED_ROUTE_LINKS = [
  { name: 'create project', link: 'create', permission: 'hidden' }
];

/** @type {{[variant: string]: ReactElement}} */
const VARIANTS = { create: ProjectCreate };

/** @returns {ReactElement} */
export default function Projects() {
  const [projects, setProjects] = useState(null);
  const user = useSelector((state) => state.user.user);
  const currentRoute = useSelector((state) => state.head.current);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const userOptions = [...ROUTE_LINKS];
  if (user?.is_superuser) userOptions.push(...PROTECTED_ROUTE_LINKS);

  const PageVariant = useCallback((props) => {
    var Component = VARIANTS[currentRoute] || AllProjects;
    return Component && <Component {...props} />;
  }, [projects]);

  useEffect(() => {
    var getLocation = () => {
      const [, mainPath, childPath] = location.pathname.split('/');
      return childPath || mainPath;
    };
    var pageRoute = getLocation();

    dispatch(setCurrent(pageRoute));
    dispatch(setTitle("Projects"));
    dispatch(setParent("projects"));
    dispatch(setLink());
    dispatch(setNav(userOptions));

    if (pageRoute === "create") return setProjects([]);

    api.get('/api/projects/', {
      headers: "Authorization: Bearer " + localStorage.getItem("dtcAccess")
    })
      .then(({ data }) => setProjects(data))
      .catch(({ message, response }) => {
        var authFailed = response && (response.status === 401 || response.status === 403);

        dispatch(addAlert({
          message: "Project Page load failed: " + message,
          type: "error",
          noSession: authFailed
        }));

        if (authFailed) navigate("/login");
      });
  }, [location]);

  return (
    <div className="iss__projects">
      {
        !projects
          ? <div className="iss__projects__load"><Load /></div>
          : <PageVariant items={projects} />
      }
    </div>
  );
}

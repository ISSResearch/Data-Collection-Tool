import Projects from '../pages/Projects';
import Login from '../pages/Login';
import Registration from '../pages/Registration';
import Blank from '../pages/Blank';
import ProjectPage from '../pages/ProjectPage';
import Test from '../pages/Test';

export const routes = [
  { path: '/', element: <Projects />, exact: true },
  { path: '/login', element: <Login />, exact: true },
  { path: '/registration', element: <Registration />, exact: true },
  { path: '/project/:projectID/:action?', element: <ProjectPage />, exact: true },
  { path: '/test', element: <Test />, exact: true },
  { path: '*', element: <Blank /> },
]
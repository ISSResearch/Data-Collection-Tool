import Home from '../pages/Home';
import Projects from '../pages/Projects';
import Login from '../pages/Login';
import Registration from '../pages/Registration';
import Blank from '../pages/Blank';
import ProjectPage from '../pages/ProjectPage';

export const routes = [
  { path: '/', element: <Home />, exact: true },
  { path: '/login', element: <Login />, exact: true },
  { path: '/registration', element: <Registration />, exact: true },
  {
    path: '/projects',
    element: <Projects />,
    exact: true,
    children: [
      { path: 'create', element: <Projects />, exact: true },
    ]
  },
  {
    path: '/projects/:projectID',
    element: <ProjectPage />,
    exact: true,
    children: [
      { path: 'upload', element: <ProjectPage />, exact: true },
      { path: 'validate', element: <ProjectPage />, exact: true },
      { path: 'stats', element: <ProjectPage />, exact: true },
      { path: 'download', element: <ProjectPage />, exact: true },
      { path: 'edit', element: <ProjectPage />, exact: true },
      { path: 'visibility', element: <ProjectPage />, exact: true },
    ]
  },
  { path: '*', element: <Blank /> },
];

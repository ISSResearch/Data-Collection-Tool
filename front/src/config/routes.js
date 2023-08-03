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
      { path: 'create', element: <Projects />, exact: true, permission: 'hidden' },
    ]
  },
  {
    path: '/projects/:projectID',
    element: <ProjectPage />,
    exact: true,
    children: [
      { path: 'upload', element: <ProjectPage />, exact: true, permission: 'can_upload_project' },
      { path: 'validate', element: <ProjectPage />, exact: true, permission: 'can_validate_project' },
      { path: 'stats', element: <ProjectPage />, exact: true, permission: 'can_view_stats_project' },
      { path: 'download', element: <ProjectPage />, exact: true, permission: 'can_download_project' },
      { path: 'edit', element: <ProjectPage />, exact: true, permission: 'change_project' },
      { path: 'visibility', element: <ProjectPage />, exact: true, permission: 'change_project' },
    ]
  },
  { path: '*', element: <Blank /> },
]
// TODO: changes - revise tests

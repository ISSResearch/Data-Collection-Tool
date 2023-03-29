import Projects from '../pages/Projects';
import Login from '../pages/Login';
import Registration from '../pages/Registration';
import Blank from '../pages/Blank';
import ProjectPage from '../pages/ProjectPage';
import Test from '../pages/Test';

export const routes = [
  { path: '/', component: <Projects />, exact: true },
  { path: '/login', component: <Login />, exact: true },
  { path: '/test', component: <Test />, exact: true },
  { path: '/registration', component: <Registration />, exact: true },
  { path: '/projects/:projectID', component: <ProjectPage />} ,
  { path: '*', component: <Blank /> },
]
import { Link, useParams } from "react-router-dom"
import { useEffect, useState, useContext } from "react";
import { attributeAdapter } from '../utils/adapters';
import { UserContext } from '../context/User';
import FilesValidate from "../components/FilesValidate";
import FilesUpload from "../components/FilesUpload";
import FilesDownload from "../components/FilesDownload";
import FilesStatistics from "../components/common/FilesStats";
import TitleSwitch from "../components/common/TitleSwitch";
import Load from '../components/common/Load';
import axios from "axios";
import '../styles/pages/project.css';

export default function ProjectPage() {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState({});
  const [pageOption, setOption] = useState('upload');
  const { user } = useContext(UserContext);
  const { projectID, action } = useParams();

  const commonOptions = [{ name: 'upload data', value: 'upload' }];
  const adminOptions = [
    ...commonOptions,
    { name: 'validate data', value: 'validate' },
    { name: 'download data', value: 'download' },
    { name: 'statistics', value: 'stats' },
  ];

  useEffect(() => {
    if (!projectID) return;
    axios.get(`/api/projects/${projectID}/`)
      .then(({status, data}) => {
        const preparedData = attributeAdapter(data);
        setProject(preparedData);
        setLoading(false);
      })
      .catch(err => console.log('err', err.message));
  }, [projectID]);

  return (
    <div className='iss__projectPage'>
      <Link to="/" className="iss__projectPage__button">back to</Link>
      <TitleSwitch
        title={project.name}
        options={user.user_role === 'a' ? adminOptions : commonOptions}
        currentOption={pageOption}
        handler={setOption}
      />
      {loading
        ? <div className="iss_projectPage__load"><Load/></div>
        : <>
          <p className="iss__projectPage__description">{project.description}</p>
          {pageOption === 'validate' &&
            <FilesValidate pathID={projectID} attributes={project.attributes} />}
          {pageOption === 'download' &&
            <FilesDownload pathID={projectID} projectName={project.name} />}
          {pageOption === 'stats' &&
            <FilesStatistics pathID={projectID} />}
          {pageOption === 'upload' &&
            <FilesUpload attributes={project.attributes} pathID={projectID} />}
        </>}
    </div>
  );
}

import { Link, useParams } from "react-router-dom"
import { useEffect, useState, useContext } from "react";
import { attributeAdapter } from '../utils/adapters';
import { UserContext } from '../context/User';
import FilesValidate from "../components/FilesValidate";
import FilesUpload from "../components/FilesUpload";
import TitleSwitch from "../components/common/TitleSwitch";
import Load from '../components/common/Load';
import axios from "axios";
import '../styles/pages/project.css';

export default function ProjectPage() {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState({});
  const [optionOne, setRadio] = useState(true);
  const { user } = useContext(UserContext);
  const { projectID } = useParams();

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
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <Link to="/" className="iss__projectPage__button">back to</Link>
      <TitleSwitch
        title={project.name}
        options={['upload data', user.user_role === 'a' ? 'validate data' : '']}
        optionOne={optionOne}
        handler={setRadio}
      />
      {loading
        ? <div className="iss_projectPage__load"><Load/></div>
        : <>
          <p className="iss__projectPage__description">{project.description}</p>
          {optionOne
            ? <FilesUpload attributes={project.attributes} pathID={projectID} />
            : <FilesValidate pathID={projectID} attributes={project.attributes} />
          }
        </>}
    </div>
  );
}

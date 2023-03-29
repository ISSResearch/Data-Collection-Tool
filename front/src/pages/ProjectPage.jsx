import { Link, useParams } from "react-router-dom"
import { useEffect, useState, useContext } from "react";
import { attributeAdapter } from '../utils/adapters';
import { UserContext } from '../context/User';
import FilesValidate from "../components/FilesValidate";
import FilesUpload from "../components/FilesUpload";
import TitleSwitch from "../components/common/TitleSwitch";
import axios from "axios";
import '../styles/pages/project.css';

export default function ProjectPage() {
  const { user } = useContext(UserContext);
  const { projectID } = useParams();
  const [project, setProject] = useState({});
  const [optionOne, setRadio] = useState(true);

  useEffect(() => {
    if (projectID) {
      axios.get(`/api/projects/${projectID}/`)
        .then(({status, data}) => {
          const preparedData = attributeAdapter(data);
          setProject(preparedData);
        })
        .catch(err => console.log('err', err.message));
    }
  }, [projectID]);

  return (
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <Link to="/" className="iss__projectPage__button">back to</Link>
      <TitleSwitch
        title='Projects Page'
        options={['upload data', user.user_role === 'a' ? 'validate data' : '']}
        optionOne={optionOne}
        handler={setRadio}
      />
      <p className="iss__projectPage__description">{project.description}</p>
      {optionOne
        ? <FilesUpload attributes={project.attributes} pathID={projectID} />
        : <FilesValidate pathID={projectID} attributes={project.attributes} />
      }
    </div>
  );
}

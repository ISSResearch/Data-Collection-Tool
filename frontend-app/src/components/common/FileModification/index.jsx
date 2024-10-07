import { useEffect, useRef, ReactElement, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFile } from "../../../hooks";
import { api } from "../../../config/api";
import { addAlert } from "../../../slices/alerts";
import { useDispatch } from "react-redux";
import SelectorGroup from "../../forms/SelectorGroup";
import DuplicateModal from "../../DuplicateModal";
import "./styles.css";

/**
* @param {object} props
* @param {number} props.pathID
* @param {object} props.fileManager
* @param {number} props.slide
* @param {Function} props.slideInc
* @param {object[]} props.attributes
* @returns {ReactElement}
*/
export default function FileModification({ pathID, fileManager, slide, slideInc, attributes }) {
  const { files, setFiles } = fileManager;
  const { file, initFile, handleGroupChange, validate, prepareAttributes } = useFile();
  const [duplicates, setDuplicates] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const acceptRef = useRef(null);
  const declineRef = useRef(null);

  const handleKey = ({ key }) => {
    const buttonMap = {
      'a': acceptRef,
      'd': declineRef,
      'ф': acceptRef,
      'в': declineRef,
    };
    buttonMap[key]?.current.click();
  };

  const fetchUpdateFile = async (fileId, status, newAttributes) => {
    var data = { status };
    if (newAttributes) data.attribute = newAttributes;

    await api.request(`/api/files/${fileId}/`,
      {
        method: 'patch',
        data,
        headers: {
          'Content-Type': 'application/json',
          "Authorization": "Bearer " + localStorage.getItem("dtcAccess")
        },
      }
    );
  };

  const updateFile = async (status) => {
    try {
      var { isValid, message } = validate(attributes);

      if (!isValid) throw new Error(message);

      var preparedAtrs = prepareAttributes();

      await fetchUpdateFile(file.id, status, preparedAtrs);

      setFiles((prev) => {
        var newFiles = [...prev];
        newFiles[slide] = { ...file, status, attributes: preparedAtrs };
        return newFiles;
      });

      slideInc(true);
    }
    catch ({ message, response }) {
      var authFailed = response && (
        response.status === 401 || response.status === 403
      );
      dispatch(addAlert({
        message: "Updating file failed: " + message,
        type: "error",
        noSession: authFailed
      }));
      if (authFailed) navigate("/login");
    }
  };

  useEffect(() => {
    initFile(files[slide] || {});
    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [slide, files]);

  return <>
    {
      duplicates &&
      <DuplicateModal
        pathID={pathID}
        fileID={duplicates}
        onClose={() => setDuplicates(null)}
        onUpdate={fetchUpdateFile}
      />
    }
    <div className="iss__fileInfo">
      <h3 className="iss__fileInfo__title">{file.id}</h3>
      {
        file.status !== "v" &&
        <div className="iss__fileInfo__validator">
          <span>validated by: <b>{file.validator_name}</b></span>
          <span>{file.update_date}</span>
        </div>
      }
      {
        (file.rebound || !!file.related_duplicates) &&
        <button
          onClick={() => setDuplicates(file.rebound || file.id)}
          className="button--duplicates"
        >show duplicates</button>
      }
      <SelectorGroup
        fileID={file.id}
        attributes={attributes}
        attributeGroups={file.attributeGroups}
        handleGroupChange={handleGroupChange}
      />
      {
        file?.id &&
        <div className='iss__fileInfo__buttonsWrap'>
          <button
            ref={declineRef}
            type='button'
            onClick={() => updateFile('d')}
            className='button--reject'
          >Decline<br />(D)</button>
          <button
            ref={acceptRef}
            type='button'
            onClick={() => updateFile('a')}
            className='button--accept'
          >Accept<br />(A)</button>
        </div>
      }
    </div>
  </>;
}

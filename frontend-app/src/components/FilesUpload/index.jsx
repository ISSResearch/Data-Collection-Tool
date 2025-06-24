import { useBlocker } from "react-router-dom";
import { useState, useEffect, ReactElement } from "react";
import { useFileInput } from "../../hooks";
import SelectorGroup from "../forms/SelectorGroup";
import FileInput from "../forms/FileInput";
import UploadView from "../common/UploadView";
import "./styles.css";

/**
* @param {object} props
* @param {object[]} props.attributes
* @param {number} props.pathID
* @returns {ReactElement}
*/
export default function FilesUpload({ attributes, pathID }) {
  const [uploading, setUploading] = useState(false);
  const fileManager = useFileInput();

  useBlocker(() => {
    var filesCount = fileManager.count();
    return (filesCount > 0 && fileManager.uploadCount() > 0)
      ? !window.confirm(`Are you sure you wanna leave the page? ${filesCount} file(s) you added wont be saved!`)
      : false;
  });

  useEffect(() => {
    var nativeBlocker = (e) => {
      if (fileManager.count() > 0 && fileManager.uploadCount() > 0) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", nativeBlocker);
    return () => {
      window.removeEventListener("beforeunload", nativeBlocker);
    };
  }, [fileManager]);

  if (uploading) return (
    <UploadView fileManager={fileManager} pathID={pathID} setUploading={setUploading} />
  );

  return (
    <div className='iss__filesUpload'>
      <SelectorGroup
        attributes={attributes}
        handleApply={fileManager.handleApplyGroups}
        isFiles={Boolean(Object.values(fileManager.files).length)}
      />
      <FileInput
        fileManager={fileManager}
        attributes={attributes}
        emitUpload={() => setUploading(true)}
      />
    </div>
  );
}

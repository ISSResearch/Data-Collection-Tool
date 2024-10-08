import { useState, ReactElement } from "react";
import SelectorGroup from "../../forms/SelectorGroup";
import CloseCross from "../../ui/CloseCross";
import "./styles.css";

/**
* @param {object} props
* @param {string} props.fileID
* @param {object} props.file
* @param {object} props.fileManager
* @param {object[]} props.attributes
* @returns {ReactElement}
*/
export default function FileUploadCard({
  fileID,
  file,
  fileManager,
  attributes,
}) {
  const [zoom, setZoom] = useState(false);
  const { handleNameChange, handleDelete, handleGroupChange } = fileManager;
  const { blob, name, type, attributeGroups } = file;

  const handleZoom = async (target) => {
    if (!zoom) target.classList.add("file--zoom");
    else target.classList.remove("file--zoom");
    setZoom(!zoom);
  };

  return (
    <div className="iss__fileuploadCard">
      {
        type === "image"
          ? <div
            onClick={({ target }) => handleZoom(target)}
            style={{ backgroundImage: `url(${blob})` }}
            data-testid="media"
            className="iss__fileuploadCard__file"
          />
          : <video
            src={blob}
            muted
            controls
            data-testid="media"
            className="iss__fileuploadCard__file"
          />
      }
      <input value={name} onChange={({ target }) => handleNameChange(target, fileID)} />
      <CloseCross action={() => handleDelete(fileID)} />
      <div className="iss__fileuploadCard__selectWrap">
        <SelectorGroup
          attributes={attributes}
          fileID={fileID}
          attributeGroups={attributeGroups}
          handleGroupChange={handleGroupChange}
        />
      </div>
    </div>
  );
}

import { useState } from "react"
import { SelectorGroup } from "./SelectorGroup";
import '../../styles/components/common/fileuploadcard.css';

export const FileUploadCard = ({
  fileID,
  file,
  fileManager,
  attributes,
}) => {
  const [zoom, setZoom] = useState(false);
  const { handleNameChange, handleDelete, handleGroupChange } = fileManager;
  const { blob, name, type, attributeGroups } = file;

  function handleZoom(target) {
    if (!zoom) target.classList.add('file--zoom');
    else target.classList.remove('file--zoom');
    setZoom(!zoom);
  }

  return (
    <div className='iss__fileuploadCard'>
      {
        type === 'image'
          ? <div
            onClick={({ target }) => handleZoom(target)}
            style={{ backgroundImage: `url(${blob})` }}
            data-testid='media'
            className='iss__fileuploadCard__file'
          />
          : <video
            src={blob}
            muted
            controls
            data-testid='media'
            className="iss__fileuploadCard__file"
          />
      }
      <input value={name} onChange={({ target }) => handleNameChange(target, fileID)} />
      <button type="button" onClick={() => handleDelete(fileID)}>
        <span /><span />
      </button>
      <div className='iss__fileuploadCard__selectWrap'>
        <SelectorGroup
          attributes={attributes}
          fileID={fileID}
          attributeGroups={attributeGroups}
          handleGroupChange={handleGroupChange}
        />
      </div>
    </div>
  )
}

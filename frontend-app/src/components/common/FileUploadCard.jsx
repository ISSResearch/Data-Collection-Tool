import { memo, useState } from "react"
import { SelectGroup } from "./SelectGroup";
import '../../styles/components/common/fileuploadcard.css';

export const FileUploadCard = memo(({
  fileID,
  file,
  fileManager,
  attributes,
  applyGroups
}) => {
  const [zoom, setZoom] = useState(false);
  const { handleNameChange, handleDelete, setAttributeGroups } = fileManager;
  const { file: fileObject, name, type } = file;

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
            style={{ backgroundImage: `url(${URL.createObjectURL(fileObject)})` }}
            data-testid='media'
            className='iss__fileuploadCard__file'
          />
          : <video
            src={URL.createObjectURL(fileObject)}
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
        <SelectGroup
          attributes={attributes}
          applyGroups={applyGroups}
          fileID={fileID}
          setAttributeGroups={setAttributeGroups}
        />
      </div>
    </div>
  )
})

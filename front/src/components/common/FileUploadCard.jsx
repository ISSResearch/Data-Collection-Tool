import { memo } from "react"
import SelectGroup from "./ui/SelectGroup";
import '../../styles/components/common/fileuploadcard.css';

export const FileUploadCard = memo(({
  fileID,
  file,
  fileManager,
  attributes,
  applyGroups
}) => {
  const { handleNameChange, handleDelete, setAttributeGroups } = fileManager;
  const { file: fileObject, name, type } = file;

  return (
    <div className='iss__fileuploadCard'>
      {
        type === 'image'
          ? <div
            style={{backgroundImage: `url(${URL.createObjectURL(fileObject)})`}}
            className='iss__fileuploadCard__file'
          />
          : <video
            src={URL.createObjectURL(fileObject)}
            muted
            controls
            className="iss__fileuploadCard__file"
          />
      }
      <input value={name} onChange={({target}) => handleNameChange(target, fileID)}/>
      <button type="button" onClick={() => handleDelete(fileID)}>
        <span/><span/>
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
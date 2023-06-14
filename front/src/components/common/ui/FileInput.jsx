import { FileUploadCard } from '../FileUploadCard';
import '../../../styles/components/common/ui/fileinput.css';

export default function FileInput({ fileManager, attributes, applyGroups }) {
  const { files, handleUpload } = fileManager;

  const handleDrop = (ev) => {
    ev.preventDefault();
    handleUpload([...ev.dataTransfer.files]);
  }

  return (
    <fieldset
      onDrop={handleDrop}
      onDragOver={(ev) => ev.preventDefault()}
      className='iss__fileInput'
    >
      <label className='iss__fileInput__upload'>
        UPLOAD
        <input
          type="file"
          multiple
          onChange={({target}) => handleUpload(Object.values(target.files))}
        />
      </label>
      <div className='iss__fileInput__note'>
        Selected: {files.length} item{Boolean(files.length !== 1) && 's'}.<br/>
        Note that maximum of 20 files will be sent.
      </div>
      <div className='iss__fileInput__filesUploaded'>
        {
          Object.entries(files).map(([key, file]) => (
            <div key={key} className='iss__fileInput__fileCard'>
              <FileUploadCard
                file={file}
                fileID={key}
                attributes={attributes}
                applyGroups={applyGroups}
                fileManager={fileManager}
              />
            </div>
          ))
        }
      </div>
    </fieldset>
  );
}
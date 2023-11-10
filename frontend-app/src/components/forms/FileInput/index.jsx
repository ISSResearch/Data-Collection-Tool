import FileUploadCard from '../../common/FileUploadCard';
import './styles.css';

export default function({ fileManager, attributes }) {
  const { files, handleUpload } = fileManager;

  var handleDrop = (ev) => {
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
          onChange={({ target }) => handleUpload(Object.values(target.files))}
        />
      </label>
      <div className='iss__fileInput__note'>
        Selected: {Object.keys(files).length} item{Boolean(Object.keys(files).length !== 1) && 's'}.
      </div>
      <div className='iss__fileInput__filesUploaded'>
        {
          Object.entries(files).map(([key, file]) => (
            <div key={key} className='iss__fileInput__fileCard'>
              <FileUploadCard
                file={file}
                fileID={key}
                attributes={attributes}
                fileManager={fileManager}
              />
            </div>
          ))
        }
      </div>
    </fieldset>
  );
}

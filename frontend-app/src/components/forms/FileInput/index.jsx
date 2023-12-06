import { useContext} from 'react';
import { AlertContext } from "../../../context/Alert";
import FileUploadCard from '../../common/FileUploadCard';
import './styles.css';

export default function({ fileManager, attributes, emitUpload }) {
  const { files, handleUpload, count } = fileManager;
  const { addAlert } = useContext(AlertContext);

  function sendForm(event) {
    event.preventDefault();

    var { isValid, message } = fileManager.validate(attributes);

    if (!isValid) addAlert("Uploading failed: " + message, "error");
    else emitUpload();
  }

  var handleDrop = (ev) => {
    ev.preventDefault();
    handleUpload([...ev.dataTransfer.files]);
  }

  return (
    <form
      onSubmit={sendForm}
      onDrop={handleDrop}
      onDragOver={(ev) => ev.preventDefault()}
      className='iss__fileInput'
    >
      <button
        className={
          `iss__filesUpload__sendButton${
            fileManager.count() ? '' : ' send--disabled'
          }`
        }
      >SEND ALL</button>
      <label className='iss__fileInput__upload'>
        UPLOAD
        <input
          type="file"
          multiple
          onChange={({ target }) => handleUpload(Object.values(target.files))}
        />
      </label>
      <div className='iss__fileInput__note'>
        Selected: {count()} item{Boolean(count() !== 1) && 's'}.
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
    </form>
  );
}

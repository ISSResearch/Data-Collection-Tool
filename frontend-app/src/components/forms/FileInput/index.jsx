import { ReactElement } from 'react';
import { addAlert } from '../../../slices/alerts';
import { useDispatch } from "react-redux";
import FileUploadCard from '../../common/FileUploadCard';
import './styles.css';

/**
* @param {object} props
* @param {object} props.fileManager
* @param {object[]} props.attributes
* @param {Function} props.emitUpload
* @returns {ReactElement}
*/
export default function FileInput({ fileManager, attributes, emitUpload }) {
  const { files, handleUpload, count } = fileManager;
  const dispatch = useDispatch();

  function sendForm(event) {
    event.preventDefault();

    var { isValid, message } = fileManager.validate(attributes);

    if (!isValid)
      dispatch(addAlert({ message: "Uploading failed: " + message, type: "error" }));
    else emitUpload();
  }

  var handleDrop = (ev) => {
    ev.preventDefault();
    handleUpload([...ev.dataTransfer.files]);
  };

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
      >Upload</button>
      <label className='iss__fileInput__upload'>
        Add Media
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

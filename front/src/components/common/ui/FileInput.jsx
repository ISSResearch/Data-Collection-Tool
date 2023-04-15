import SelectGroup from './SelectGroup';
import '../../../styles/components/common/ui/fileinput.css';

export default function FileInput({ fileManager, attributes, applyOptions }) {
  const {
    files,
    handleUpload,
    handleNameChange,
    handleDelete,
    attributeFile
  } = fileManager;

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
        Note that maximum of 100 files will be sent.
      </div>
      <div className='iss__fileInput__filesUploaded'>
        {files.map(({file, name, type}, index) => (
          <div key={index + file.lastModified} className='iss__fileInput__fileCard'>
            <div className='iss__fileInput__fileWrap'>
              {type === 'image'
                ? <div
                  style={{backgroundImage: `url(${URL.createObjectURL(file)})`}}
                  className='iss__fileInput__file'
                />
                : <video
                  src={URL.createObjectURL(file)}
                  muted
                  controls
                  className="iss__fileInput__file"
                />
              }
              <input
                value={name}
                onChange={({target}) => handleNameChange(target, index)}
              />
              <button type="button" onClick={() => handleDelete(index)}>
                <span /><span />
              </button>
              <div className='iss__fileInput__selectorWrap'>
                <SelectGroup
                  attributes={attributes}
                  applyOptions={applyOptions}
                  attributeFile={attributeFile}
                  fileIndex={index}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
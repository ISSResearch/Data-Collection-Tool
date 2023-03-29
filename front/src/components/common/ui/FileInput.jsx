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

  return (
    <fieldset className='iss__fileInput'>
      <label className='iss__fileInput__upload'>
        UPLOAD
        <input type="file" multiple onChange={handleUpload} />
      </label>
      <div className='iss__fileInput__filesUploaded'>
        {files.map(({file, name, type}, index) => (
          <div key={file.lastModified} className='iss__fileInput__fileCard'>
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
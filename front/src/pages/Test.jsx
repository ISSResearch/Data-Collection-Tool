import axios from 'axios';
import { useCallback, useState, useMemo } from 'react';
import '../styles/pages/test.css';


export default function UploadProgress() {
  const [data, setData] = useState([
    { name: 'file1', prog: 0, w: 1},
    { name: 'file2', prog: 0, w: 2},
    { name: 'file3', prog: 0, w: 3},
    { name: 'file4', prog: 0, w: 4},
    { name: 'file5', prog: 0, w: 5},
    { name: 'file6', prog: 0, w: 11},
    { name: 'file7', prog: 0, w: 21},
    { name: 'file8', prog: 0, w: 31},
    { name: 'file9', prog: 0, w: 41},
  ])
  const run = () => {
    for (let file of data) {
      const size = file.w > 10 ? Math.ceil(file.w / 10) : 1;
      const q = (i=0) => {
        if (i >= size) {
          file.status = [21,31].includes(file.w) ? 'f': 'a';
          setData([...data])
          return;
        }
        new Promise(r => setTimeout(r, 1000)).then(e => {
          file.prog = (i+1) * 100 / size;
          setData([...data]);
          return i
        }).then(e => q(i + 1))
      }
      q()
    }
  }
  const clear = () => setData(data.map(el => {el.prog = 0; delete el.status; return el}));


  const [file, setFile] = useState(null);
  const [prog, setProg] = useState(0);
  const handle = (filesInput) => {setFile(filesInput[0]); setProg(0);};

  const sendChunk = async (id) => {
    const chunkSize = 1024 * 1024 * 10;
    const numOfChunks = Math.ceil(file.size / chunkSize);
    for (let i = 0; i < numOfChunks; i++) {
      const form = new FormData();
      const chunk = file.slice(i * chunkSize, chunkSize * (i + 1));
      form.append('chunk', chunk)
      const data = await axios.request(`/api/files/upload/${id}/`, {
        method: 'post',
        data: form,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Chunk': i + 1,
          'Total-Chunks': numOfChunks
        },
      })
      setProg((i + 1) * 100 / numOfChunks)
    }
  }

  const createFiles = async (uploadFile) => {
    const form = new FormData();
    const [name, extension] = uploadFile.name.split('.')
    form.append('meta[]', JSON.stringify({name, extension, type: uploadFile.type}))
    return await axios.request('/api/files/project/12/', {
      method: 'post',
      data: form,
      headers: {'Content-Type': 'multipart/form-data',}
    })
  }
  const procceedUpload = async (uploadFile) => {
    // const form = new FormData();
    // files.forEach(({file, name, extension, type, atrsGroups}) => {
    //   formData.append('files[]', file);
    //   formData.append('meta[]', JSON.stringify({name, extension, type, atrsGroups}));
    // });
    try {
      const data  = await createFiles(uploadFile);
      const [file_id] = data.data.created_files;
      await sendChunk(file_id.id);
    }
    catch (error) {
      console.log(error);
    }

  }
  return (
    <>
    <div>
      <button onClick={run}>run mock</button>
      <button onClick={clear}>clear</button>
      {data.map(({ name, prog, status }, index) => (
        <div key={index} className='iss__uploadProgress__item'>
          <div
            className={
              ['iss__uploadProgress__completion',
              status ? `complete-status-${status}` : ''].join(' ')
            }
          />
          <span>{name}</span>
          <div className='iss__uploadProgress__progressWrap'>
            <div
              style={{width: `${prog}%`}}
              className='iss__uploadProgress__progress'
            />
          </div>
        </div>
      ))}
    </div>
    <div style={{padding: '60px', border: '1px solid'}}>
      <input type="file" onChange={({target}) => handle(target.files)}/>
      <button onClick={() => procceedUpload(file)}>click</button>
      <div style={{border: '1px solid red', width: '200px', height: '40px', backgroundColor: 'yellow'}}>
        <div style={{height: '100%', width: `${prog}%`, backgroundColor: 'red', transitionDuration: '1s', transitionTimingFunction: 'ease-out',}}/>
      </div>
    </div>
    </>
  );
}
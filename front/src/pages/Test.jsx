import axios from 'axios';
import { useCallback, useState, useMemo } from 'react';
import '../styles/pages/test.css';
import SelectorItem from '../components/common/ui/SelectorItem';
// export default function Test() {
//   const [file, setFile] = useState(null);
//   const [prog, setProg] = useState(0);

//   const handle = (filesInput) => {
//     const [file] = filesInput;
//     setFile(file);
//   }

//   const send = async () => {
//     const cSize = 1024 * 1024 * 2;
//     const numOfChunks = Math.ceil(file.size / cSize);
//     try {
//       for (let i = 0; i < numOfChunks; i++) {
//         const form = new FormData();
//         const chunk = file.slice(i * cSize, cSize * (i + 1));
//         form.append('file', chunk)
//         form.append('name', file.name)
//         const data = await axios.request('/api/files/test/3/', {
//           method: 'post',
//           data: form,
//           headers: { 'Content-Type': 'multipart/form-data' },
//         })
//         console.log(data)
//         setProg((i + 1) * 100 / numOfChunks)
//       }
//     }
//     catch ({message}) {console. log(message);};
//   }

//   return (
//     <div style={{padding: '60px', border: '1px solid'}}>
//       <input type="file" onChange={({target}) => handle(target.files)}/>
//       <button onClick={send}>click</button>
//       <div style={{border: '1px solid red', width: '200px', height: '40px', backgroundColor: 'yellow'}}>
//         <div style={{height: '100%', width: `${prog}%`, backgroundColor: 'red', transitionDuration: '1s', transitionTimingFunction: 'ease-out',}}/>
//       </div>
//     </div>
//   );
// }


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
  return (
    <>
      {/* <SelectorItem /> */}
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
    </>
  );
}
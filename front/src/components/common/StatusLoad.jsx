import '../../styles/components/common/statusload.css';

export default function StatusLoad({ progress, info, error }) {
  return (
    <>
      <div className={'iss__statusLoad' + (error ? ' progress--fail' : '')}>
        <div
          style={{width: `${progress || 0}%`}}
          className='iss__statusLoad__progress'
        />
      </div>
      { info && <span>{info}</span> }
    </>
  )
}
// TODO: new component - write tests
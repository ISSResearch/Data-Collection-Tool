import './styles.css';

export default function({ progress, info, error }) {
  return (
    <div className='iss__statusLoad__wrap'>
      <div className={'iss__statusLoad' + (error ? ' progress--fail' : '')}>
        <div
          data-testid='statusload'
          style={{ width: `${progress || 0}%` }}
          className='iss__statusLoad__progress'
        />
      </div>
      {info && <span>{info}</span>}
    </div>
  )
}

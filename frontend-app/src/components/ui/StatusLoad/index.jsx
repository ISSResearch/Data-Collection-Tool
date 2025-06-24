import { ReactElement } from "react";
import './styles.css';

/**
* @param {object} props
* @param {number} props.progress
* @param {string} props.info
* @param {boolean} props.error
* @returns {ReactElement}
*/
export default function StatusLoad({ progress, info, error }) {
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
  );
}

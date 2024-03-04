import { ReactElement } from "react";
import './styles.css';

/**
* @param {object} props
* @param {boolean} [props.isInline]
* @returns {ReactElement}
*/
export default function Load({ isInline }) {
  return (
    <div
      data-testid={'load-c'}
      className={isInline ? 'iss__loadingMin' : 'iss__loading'}
    />
  );
}

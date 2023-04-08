import '../../styles/components/common/load.css';

export default function Load({ isInline }) {
  return <div className={isInline ? 'iss__loadingMin' : 'iss__loading'} />
}
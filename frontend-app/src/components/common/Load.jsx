import '../../styles/components/common/load.css';

export default function Load({ isInline }) {
  return (
    <div
      data-testid={'load-c'}
      className={isInline ? 'iss__loadingMin' : 'iss__loading'}
    />
  )
}
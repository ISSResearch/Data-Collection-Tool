import './styles.css';

export default function({ isInline }) {
  return (
    <div
      data-testid={'load-c'}
      className={isInline ? 'iss__loadingMin' : 'iss__loading'}
    />
  );
}

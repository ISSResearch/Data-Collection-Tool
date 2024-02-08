import "./styles.css";

export default function CloseCross({ action }) {
  return (
    <button onClick={action} className="closeCross" type="button">
      <span /><span />
    </button>
  );
}

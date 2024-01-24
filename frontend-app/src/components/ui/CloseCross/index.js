import "./styles.css";

export default function({ action }) {
  return (
    <button onClick={action} className="closeCross" type="button">
      <span /><span />
    </button>
  );
}

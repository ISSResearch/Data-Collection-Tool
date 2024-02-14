import { useContext, ReactElement } from "react";
import { AlertContext } from "../../context/Alert";
import AlertCard from "../common/AlertCard";
import "./styles.css";

/** @type {{[result: string]: string}} */
const COLOR_MAP = {
  "error": "red",
  "success": "green",
};

/**
 * @param {object} props
 * @param {number} props.maxOnScreen
 * @returns {ReactElement}
 */
export default function AlertManager({ maxOnScreen }) {
  const { alerts, removeAlert } = useContext(AlertContext);

  return (
    <aside className="alertManager">
      {
        Object.values(alerts)
          .filter((active) => active)
          .slice(0, maxOnScreen)
          .map(({ id, message, type }) => (
            <AlertCard
              key={id}
              message={message}
              color={COLOR_MAP[type]}
              closeAction={() => removeAlert(id)}
            />
          ))
      }
    </aside>
  );
}

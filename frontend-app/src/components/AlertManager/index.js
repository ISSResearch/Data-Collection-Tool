import { useContext } from "react";
import { AlertContext } from "../../context/Alert";
import AlertCard from "../common/AlertCard";
import "./styles.css";

const COLOR_MAP = {
  "error": "red",
  "success": "green",
}

export default function({ maxOnScreen }) {
  const { alerts, removeAlert } = useContext(AlertContext);

  return (
    <aside className="alertManager">
      {
        Object.entries(alerts)
          .filter(([_, { active }]) => active)
          .slice(0, maxOnScreen)
          .map(([id, { message, type }]) => (
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

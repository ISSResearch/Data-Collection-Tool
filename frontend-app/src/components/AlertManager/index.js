import { useContext } from "react";
import { AlertContext } from "../../context/Alert";
import AlertCard from "../common/AlertCard";
import "./styles.css";

const COLOR_MAP = {
  "error": "red",
  "success": "green",
}

export default function({ maxOnScreen }) {
  const { alerts, removeAlert, addAlert } = useContext(AlertContext);

  return (
    <aside className="alertManager">
      {/* <button onClick={() => addAlert("test error", "error")}>error</button>
      <button onClick={() => addAlert("test success", "success")}>success</button>
      <button onClick={() => addAlert("test common", )}>common</button> */}
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

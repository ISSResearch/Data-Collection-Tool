import { ReactElement } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeAlert } from "../../slices/alerts";
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
  const dispatch = useDispatch();
  const alerts = useSelector(state => state.activeAlerts);

  return (
    <aside className="alertManager">
      {
        Object.values(alerts)
          .slice(0, maxOnScreen)
          .map(({ id, message, type }) => (
            <AlertCard
              key={id}
              message={message}
              color={COLOR_MAP[type]}
              closeAction={() => dispatch(removeAlert(id))}
            />
          ))
      }
    </aside>
  );
}

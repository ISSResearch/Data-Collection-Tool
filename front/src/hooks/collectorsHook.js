import { useState } from "react";
import { deepCopy } from "../utils/utils";

export default function useCollectors() {
  const [collectors, setCollectors] = useState({});
  const [origin, setOrigin] = useState({});

  function initData(originCollectors) {
    const preparedCollectors = originCollectors.reduce((acc, collector) => {
      const { id, username, permissions } = collector;
      acc[id] = { user_id: id, username, permissions };
      return acc;
    }, {});
    setOrigin(preparedCollectors);
    setCollectors(deepCopy(preparedCollectors));
  }

  function changeCollector(id, name, { checked }) {
    const newCollectors = { ...collectors };
    newCollectors[id].permissions[name] = checked;
    setCollectors(newCollectors);
  }

  function gatherData() {
    return Object.values(collectors).reduce((acc, collector) => {
      const originCollector = origin[collector.user_id];
      if (originCollector) {
        const { permissions: originPermissions } = originCollector;
        const { permissions: newPermissions } = collector;
        const changedPermissions = Object.keys(newPermissions)
          .reduce((acc, permission) => {
            if (newPermissions[permission] !== originPermissions[permission]) {
              acc.push(permission);
            }
            return acc;
          }, []);
        if (changedPermissions.length) acc.push(collector);
      }
      return acc;
    }, []);
  }
  return { collectors, changeCollector, initData, gatherData };
}

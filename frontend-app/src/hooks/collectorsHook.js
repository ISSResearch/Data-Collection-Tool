import { useState } from "react";
import { deepCopy } from "../utils/";

export default function useCollectors() {
  const [collectors, setCollectors] = useState({});
  const [origin, setOrigin] = useState({});

  function initData(originCollectors) {
    var preparedCollectors = originCollectors.reduce((acc, collector) => {
      var { id, username, permissions } = collector;
      acc[id] = { user_id: id, username, permissions };
      return acc;
    }, {});

    setOrigin(preparedCollectors);
    setCollectors(deepCopy(preparedCollectors));
  }

  function changeCollector(id, name, { checked }) {
    var newCollectors = { ...collectors };
    newCollectors[id].permissions[name] = checked;

    setCollectors(newCollectors);
  }

  function gatherData() {
    return Object.values(collectors).reduce((acc, collector) => {
      var originCollector = origin[collector.user_id];

      if (originCollector) {
        var { permissions: originPermissions } = originCollector;
        var { permissions: newPermissions } = collector;

        var changedPermissions = Object.keys(newPermissions)
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

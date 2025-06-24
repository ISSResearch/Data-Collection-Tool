import { useState } from "react";
import { deepCopy } from "../utils/";

/**
* @returns {{
* collectors: object,
* changeCollector: Function,
* initData: Function,
* gatherData: Function
* }}
*/
export default function useCollectors() {
  const [collectors, setCollectors] = useState({});
  const [origin, setOrigin] = useState({});

  /**
  * @param {object[]} originCollectors
  * @returns {void}
  */
  const initData = (originCollectors) => {
    var preparedCollectors = originCollectors.reduce((acc, collector) => {
      var { id, username, permissions, is_superuser } = collector;
      if (!is_superuser) acc[id] = { user_id: id, username, permissions };
      return acc;
    }, {});

    setOrigin(preparedCollectors);
    setCollectors(deepCopy(preparedCollectors));
  };

  /**
  * @param {number} id
  * @param {string} name
  * @param {object} target
  * @param {boolean} target.checked
  * @returns {void}
  */
  const changeCollector = (id, name, { checked }) => {
    var newCollectors = { ...collectors };
    newCollectors[id].permissions[name] = checked;
    setCollectors(newCollectors);
  };

  /** @returns {object[]} */
  const gatherData = () => {
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
  };

  return { collectors, changeCollector, initData, gatherData };
}

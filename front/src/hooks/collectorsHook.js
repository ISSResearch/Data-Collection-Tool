import { useState } from "react";
import { deepCopy } from "../utils/utils";

export default function useCollectors() {
  const [collectors, setCollectors] = useState({});
  const [origin, setOrigin] = useState({});
  const [project, setProject] = useState(null);

  function initData(originCollectors, projectID) {
    setProject(projectID);
    const preparedCollectors = originCollectors.reduce((acc, collector) => {
      const { id, username, permissions, projects } = collector;
      acc[id] = {
        user_id: id,
        username,
        permissions,
        projects,
        preparedPermissions: {
          view: projects.includes(Number(projectID)),
          upload: permissions.includes('can_upload_project'),
          validate: permissions.includes('can_validate_project'),
          stats: permissions.includes('can_view_stats_project'),
          download: permissions.includes('can_download_project'),
          edit: permissions.includes('change_project'),
        }
      };
      return acc;
    }, {});
    setOrigin(preparedCollectors);
    setCollectors(deepCopy(preparedCollectors));
  }

  function changeCollector(id, name, { checked }) {
    const newCollectors = { ...collectors };
    newCollectors[id].preparedPermissions[name] = checked;
    setCollectors(newCollectors);
  }

  function gatherData() {
    const preparedData = Object.values(collectors).reduce((acc, collector) => {
      const originCollector = origin[collector.user_id];
      if (originCollector) {
        const { preparedPermissions: originPermissions } = originCollector;
        const { preparedPermissions: newPermissions } = collector;
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
    return { project, users: preparedData };
  }
  return { collectors, changeCollector, initData, gatherData };
}

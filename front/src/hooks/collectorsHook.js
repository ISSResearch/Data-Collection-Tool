import { useState } from "react";
import { deepCopy } from "../utils/utils";

export default function useCollectors() {
  const [collectors, setCollectors] = useState({});
  const [origin, setOrigin] = useState({});

  function initData(originCollectors) {
    const preparedCollectors = originCollectors.reduce((acc, collector) => {
      acc[collector.id] = collector;
      return acc;
    }, {});
    setOrigin(preparedCollectors);
    setCollectors(deepCopy(preparedCollectors));
  }

  function changeCollector(id) {
    console.log(id)
  }

  return { collectors, changeCollector, initData };
}

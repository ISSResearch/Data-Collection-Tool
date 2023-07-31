import { useState } from "react";

export default function useFilter() {
  const [filterData, setFilterData] = useState({});
  const [selected, setSelected] = useState({});

  const initFilters = (cardData, attributeData, typeData, cardParam, attrParam, typeParam) => {
    const preparedAttributes = attributeData
      .reduce((acc, { attributes }) => [...acc, ...attributes], [])
    setFilterData({
      card: cardData,
      attr: preparedAttributes,
      type: typeData,
    });
    changeFilters('card', cardParam);
    changeFilters('attr', attrParam);
    changeFilters('type', typeParam);
  }

  const changeFilters = (type, values) => {
    setSelected(prev => ({ ...prev, [type]: values }));
  }

  return { filterData, selected, initFilters, changeFilters };
}
// TODO: new hook - write tests
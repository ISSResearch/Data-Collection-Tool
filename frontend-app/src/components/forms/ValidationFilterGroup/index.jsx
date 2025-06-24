import { ReactElement } from "react";
import MultiSelector from "../../ui/MultiSelector";
import DateSelector from "../../ui/DateSelector";
import AttributeMultiSelector from "../../ui/AttributeMultiSelector";
import './styles.css';

/**
* @param {object} props
* @param {object} props.filter
* @param {Function} props.onChange
* @returns {ReactElement | void}
*/
function FilterSwitch ({ filter, onChange }) {
  var { name, data, selected, type } = filter;

  switch (type) {
    case "attr": return <AttributeMultiSelector
      selectorName={name}
      data={data}
      defaultSelected={selected}
      onChange={onChange}
    />;
    case "date": return <DateSelector
      defaultSelected={selected}
      onChange={(date) => onChange(name, date)}
    />;
    default: return <MultiSelector
      selectorLabel={name}
      selectorOptions={data}
      defaultSelected={selected}
      onChange={(ids) => onChange(name, ids)}
    />;
  }
}

/**
* @param {object} props
* @param {object[]} props.filterData
* @param {Function} props.onChange
* @param {boolean} props.disabled
* @returns {ReactElement}
*/
export default function ValidationFilterGroup({ filterData, onChange, disabled }) {
  return (
    <fieldset className='iss__validation__filters'>
      {
        filterData.map((filter) => (
          <div
            key={filter.name}
            className={"iss__validation__filters__item" + (disabled ? " item--disable" : "")}
          >
            <label>{filter.prettyName}</label>
            <FilterSwitch filter={filter} onChange={disabled ? () => { } : onChange}/>
          </div>
        ))
      }
    </fieldset>
  );
}

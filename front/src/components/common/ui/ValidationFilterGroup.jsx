import SelectorItem from "./SelectorItem";
import '../../../styles/components/common/ui/validationfiltergroup.css';

export default function ValidationFilterGroup({ filterData, hadleChange }) {
  return (
    <fieldset className='iss__validation__filters'>
      {
        filterData.map(({ prettyName, name, data, selected, manual, isAlpha }, index) => (
          <label key={`${name}${index}`} className="iss__validation__filters__item">
            {prettyName}
            <SelectorItem
              selectorId={index}
              selectorName={name}
              selectorOptions={data}
              handleSelect={(ids) => hadleChange(name, ids)}
              defaultSelected={selected}
              isAlpha={isAlpha}
              manual={manual}
            />
          </label>
        ))
      }
    </fieldset>
  )
}
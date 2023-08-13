import SelectorItem from "./SelectorItem";
import ValidationFilterSelectorItem from "./ValidationFilterAttributeItem";
import '../../../styles/components/common/ui/validationfiltergroup.css';

export default function ValidationFilterGroup({ filterData, handleChange }) {
  return (
    <fieldset className='iss__validation__filters'>
      {
        filterData.map(({
          prettyName,
          name,
          data,
          selected,
          manual,
          isAlpha,
          attributeSelector
        }, index) => (
          <div key={`${name}${index}`} className="iss__validation__filters__item">
            <label>{prettyName}</label>
            {
              attributeSelector
                ? <ValidationFilterSelectorItem
                  selectorName={name}
                  data={data}
                  defaultSelected={selected}
                  handleChange={handleChange}
                />
                : <SelectorItem
                  selectorId={index}
                  selectorName={name}
                  selectorOptions={data}
                  handleSelect={(ids) => handleChange(name, ids)}
                  defaultSelected={selected}
                  isAlpha={isAlpha}
                  manual={manual}
                />
            }
          </div>
        ))
      }
    </fieldset>
  )
}
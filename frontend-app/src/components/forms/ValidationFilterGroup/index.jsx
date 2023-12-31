import MultiSelector from "../../ui/MultiSelector";
import AttributeMultiSelector from "../../ui/AttributeMultiSelector";
import './styles.css';

export default function({ filterData, onChange }) {
  return (
    <fieldset className='iss__validation__filters'>
      {
        filterData.map(({
          prettyName,
          name,
          data,
          selected,
          attributes
        }) => (
          <div key={name} className="iss__validation__filters__item">
            <label>{prettyName}</label>
            {
              attributes
                ? <AttributeMultiSelector
                  selectorName={name}
                  data={data}
                  defaultSelected={selected}
                  onChange={onChange}
                />
                : <MultiSelector
                  selectorLabel={name}
                  selectorOptions={data}
                  onChange={(ids) => onChange(name, ids)}
                  defaultSelected={selected}
                />
            }
          </div>
        ))
      }
    </fieldset>
  )
}

import { ReactElement, useState, useRef, useEffect } from "react";
import { deepCopy } from "../../utils";
import SelectorWrap from "../common/SelectorWrap";
import Load from "../ui/Load";
import "./styles.css";

/**
* @param {object} props
* @param {object[]} props.attributes
* @param {Function?} props.onSubmit
* @returns {ReactElement}
*/
export default function GoalForm({ attributes, onSubmit }) {
  const [apply, setApply] = useState(null);
  const [errors, setErrors] = useState("");
  const [formLoad, setFormLoad] = useState(false);
  const options = useRef(null);
  const selected = useRef(null);

  const handleCreate = async (event) => {
    event.preventDefault();

    if (formLoad) return;

    try {
      if (!selected.current) throw new Error("Select attribute");

      setFormLoad(true);

      await onSubmit({
        attribute_id: selected.current,
        amount: event.target.amount.value,
        image_mod: event.target.image_mod.value,
        video_mod: event.target.video_mod.value,
        update: Number(event.target.update.checked),
      });
    }
    catch ({ message }) {
      setErrors(message);
      if (!errors) setTimeout(() => setErrors(""), 3000);
    }
    finally { setFormLoad(false); }
  };

  const handleSelect = (data) => {
    var { index, selected: selOpt } = data;

    if (index === 0) {
      const level = deepCopy(attributes.find((lev) => lev.id === selOpt[0]));
      level.multiple = false;
      level.attributes.forEach((attr) => attr.parent = level.id);
      options.current = { ...options.current, children: [level] };
      setApply(selOpt);
    }
    else selected.current = selOpt[0];
  };

  useEffect(() => {
    options.current = {
      attributes: attributes.map(({ name, id, }) => ({ name, id })),
      name: "attribute group",
    };
  }, []);

  return <form onSubmit={handleCreate} className="goal__createFrom">
    {
      options.current &&
      <SelectorWrap item={options.current} onChange={handleSelect} applyGroups={apply} />
    }
    <label className="goal__createReplace">
      <input name="update" type="checkbox" />
      update if exists
    </label>
    <label className="goal__createItem">
      <span>amount:</span>
    <input name="amount" type="number" required min={1} placeholder="enter amount" />
    </label>
    <label className="goal__createItem">
      <span>image weight:</span>
    <input name="image_mod" type="number" required min={1} defaultValue={1} />
    </label>
    <label className="goal__createItem">
      <span>video weight:</span>
      <input name="video_mod" type="number" required min={1} defaultValue={1}/>
    </label>
    <button className="goal__creteButton">
      {formLoad ? <Load isInline /> : "create"}
    </button>
    {errors && <p className="goal__errors">{errors}</p>}
  </form>;
}

import { useState, ReactElement, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch  } from "react-redux";
import { api } from "../../config/api";
import { addAlert } from "../../slices/alerts";
import { deepCopy } from "../../utils";
import Load from "../ui/Load";
import GoalRow from "../common/GoalRow";
import SelectorWrap from "../common/SelectorWrap";
import "./styles.css";

/**
* @param {object} props
* @param {number} props.pathID
* @param {object[]} props.attributes
* @returns {ReactElement}
*/
export default function ProjectEdit({ pathID, attributes }) {
  const [goals, setGoals] = useState(null);
  const [errors, setErrors] = useState("");
  const [apply, setApply] = useState(null);
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const options = useRef(null);
  const selected = useRef(null);

  const handleCreate = async (event) => {
    event.preventDefault();

    try {
      let attribute_id = selected.current;

      if (!attribute_id) throw new Error("Select attribute");

      console.log({ attribute_id, amount: event.target.amount.value });
      if (attribute_id) return;

      await api.request(`/api/projects/goals/${pathID}/`,
        {
          method: "post",
          data: { attribute_id, amount: event.target.amount.value },
          headers: {
            'Content-Type': 'application/json',
            "Authorization": "Bearer " + localStorage.getItem("dtcAccess")
          }
        }
      );
      await fetchGoals();

      selected.current = null;
      event.target.amount.value = "";
    }
    catch ({ message, response }) {
      if (response) {
        var authFailed = response.status === 401 || response.status === 403;

        dispatch(addAlert({
          message: "Creating project goal error: " + message,
          type: "error",
          noSession: authFailed
        }));

        if (authFailed) navigate("/login");
      }
      setErrors(message);
      if (!errors) setTimeout(() => setErrors(""), 3000);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.request(`/api/projects/goals/${id}/`,
        {
          method: "delete",
          headers: { "Authorization": "Bearer " + localStorage.getItem("dtcAccess") }
        }
      );
      await fetchGoals();
    }
    catch ({ message, response }) {
      var authFailed = response.status === 401 || response.status === 403;

      dispatch(addAlert({
        message: "Delete project goal error: " + message,
        type: "error",
        noSession: authFailed
      }));

      if (authFailed) navigate("/login");
    }
  };

  const fetchGoals = async () => {
    try {
      var { data } = await api.get(`/api/projects/goals/${pathID}/`, {
        headers: { "Authorization": "Bearer " + localStorage.getItem("dtcAccess") }
      });
      setGoals(data.sort((a, b) => Number(a.complete >= b.complete) || -1));
    }
    catch ({ message, response }) {
      var authFailed = response?.status === 401 || response?.status === 403;

      dispatch(addAlert({
        message: "Getting project goals error: " + message,
        type: "error",
        noSession: authFailed
      }));

      if (authFailed) navigate("/login");
      setGoals([]);
    }
  };

  const handleSelect = (data) => {
    if (!apply) {
      const level = deepCopy(attributes.find((lev) => lev.id === data.selected[0]));
      level.attributes.forEach((attr) => attr.parent = level.id);
      options.current = { ...options.current, children: [level] };
      setApply(data.selected);
    }
    else selected.current = data.selected[0];
  };

  useEffect(() => {
    fetchGoals();

    options.current = {
      attributes: attributes.map(({ name, id, }) => ({ name, id })),
      name: "attribute group",
    };
  }, []);

  return <>
    {
      user.is_superuser &&
      <>
        <form onSubmit={handleCreate} className="goal__createFrom">
          {
            options.current &&
            <SelectorWrap item={options.current} onChange={handleSelect} applyGroups={apply} />
          }
          <input name="amount" type="number" required min={0} placeholder="amount" />
          <button className="goal__creteButton">create</button>
          { errors && <p className="goal__errors">{errors}</p> }
        </form>
      </>
    }
    {
      goals
      ? <table className="goal__table">
        <thead>
          <tr>
            <th>Attribute name</th>
            <th>completed</th>
            <th>amount</th>
            <th className="goal__table__progress">progress</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
        </tbody>
        {
          goals.length
          ? <>
            {
              goals.map((item) => (
                <GoalRow
                  key={item.id}
                  onDelete={user.is_superuser ? handleDelete : null}
                  goalItem={item}
                />
              ))
            }
          </>
          : <tr><td colSpan={5}>No project goals yet. Create one!</td></tr>
        }
      </table>
      : <div className="goals__load"><Load /></div>
    }
  </>;
}

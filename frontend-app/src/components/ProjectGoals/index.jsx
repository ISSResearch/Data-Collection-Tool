import { useState, ReactElement, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch  } from "react-redux";
import { api } from "../../config/api";
import { addAlert } from "../../slices/alerts";
import { spreadChildren } from "../../utils";
import Load from "../ui/Load";
import GoalCard from "../common/GoalCard";
import "./styles.css";

// TODO: dont forget to refactor this
/**
* @param {object} props
* @param {number} props.pathID
* @param {object[]} props.attributes
* @returns {ReactElement}
*/
export default function ProjectEdit({ pathID, attributes }) {
  const user = useSelector((state) => state.user.user);
  const [goals, setGoals] = useState(null);
  const [options, setOptions] = useState([]);
  const [errors, setErrors] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleCreate = async (event) => {
    event.preventDefault();
    var { attribute, amount } = event.target;

    const data = { attribute_id: attribute.value, amount: amount.value };

    try {
      await api.request(`/api/projects/goals/${pathID}/`,
        {
          method: "post",
          data,
          headers: {
            'Content-Type': 'application/json',
            "Authorization": "Bearer " + localStorage.getItem("dtcAccess")
          }
        }
      );
      await fetchGoals();

      attribute.value = "";
      amount.value = "";
    }
    catch ({ message, response }) {
      var authFailed = response.status === 401 || response.status === 403;

      dispatch(addAlert({
        message: "Creating project goal error: " + message,
        type: "error",
        noSession: authFailed
      }));

      if (authFailed) navigate("/login");
      setErrors(message);
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

  useEffect(() => {
    fetchGoals();
    var preparedOptions = spreadChildren(attributes, false)
      .sort((a, b) => Number(a.order >= b.order) || -1)
      .reduce((acc, item) => {
        let { name, attributes } = item;
        acc.push(...attributes.map((a) => [`${name}: ${a.name}`, a.id]));
        return acc;
      }, []);
    setOptions(preparedOptions);
  }, []);

  return <>
    {
      user.is_superuser &&
      <>
        <form onSubmit={handleCreate} className="goal__createFrom">
          <select name="attribute" required>
            <option value="">Select attribute</option>
            {
              options.map(([name, value]) => (
                <option key={value} value={value}>{name}</option>
              ))
            }
          </select>
          <input name="amount" type="number" required min={0} placeholder="amount" />
          <button className="goal__creteButton">create</button>
          { errors && <p className="goal__errors">{errors}</p> }
        </form>
      </>
    }
    {
      goals
      ? <>
        {
          goals.length
          ? <section className="goals__cardWrap" >
            {
              goals.map((item) => (
                <GoalCard
                  key={item.id}
                  onDelete={user.is_superuser ? handleDelete : null}
                  goalItem={item}
                />
              ))
            }
          </section>
          : "No project goals yet. Create one!"
        }
      </>
      : <div className="goals__load"><Load /></div>
    }
  </>;
}

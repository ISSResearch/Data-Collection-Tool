import { useState, ReactElement, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch  } from "react-redux";
import { api } from "../../config/api";
import { addAlert } from "../../slices/alerts";
import { deepCopy } from "../../utils";
import Load from "../ui/Load";
import SelectorWrap from "../common/SelectorWrap";
import GoalTable from "./GoalTable";
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
  const [formLoad, setFormLoad] = useState(false);
  const [query, setQuery] = useSearchParams();
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const options = useRef(null);
  const selected = useRef(null);
  const completed = goals?.data.filter((g) => g.complete >= g.amount).length;

  const handleCreate = async (event) => {
    event.preventDefault();

    if (formLoad) return;

    try {
      let attribute_id = selected.current;

      if (!attribute_id) throw new Error("Select attribute");

      setFormLoad(true);

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

      setApply([]);
      selected.current = null;
      event.target.amount.value = "";
    }
    catch ({ message, response }) {
      if (response) {
        var authFailed = response.status === 401 || response.status === 403;

        var errMessage = response.data?.errors || message;

        dispatch(addAlert({
          message: "Creating project goal error: " + errMessage,
          type: "error",
          noSession: authFailed
        }));

        if (authFailed) navigate("/login");
      }
      setErrors(errMessage);
      if (!errors) setTimeout(() => setErrors(""), 3000);
    }
    finally { setFormLoad(false); }
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

  const getQuery = () => ({ page: query.get("page") || 1, all: query.get("all") });

  const handleQueryChange = (type, val) => setQuery({ ...getQuery(), [type]: val});

  const fetchGoals = async () => {
    try {
      var { data } = await api.get(`/api/projects/goals/${pathID}/`, {
        params: getQuery(),
        headers: { "Authorization": "Bearer " + localStorage.getItem("dtcAccess") }
      });
      setGoals(data);
    }
    catch ({ message, response }) {
      var authFailed = response?.status === 401 || response?.status === 403;

      dispatch(addAlert({
        message: "Getting project goals error: " + message,
        type: "error",
        noSession: authFailed
      }));

      if (authFailed) navigate("/login");
      setGoals(null);
    }
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
      <form onSubmit={handleCreate} className="goal__createFrom">
        {
          options.current &&
          <SelectorWrap item={options.current} onChange={handleSelect} applyGroups={apply} />
        }
        <input name="amount" type="number" required min={0} placeholder="amount" />
        <button className="goal__creteButton">
          { formLoad ? <Load isInline/ > : "create" }
        </button>
        { errors && <p className="goal__errors">{errors}</p> }
      </form>
    }
    {
      Number.isInteger(completed) &&
      <div className="goal__annotation">
        <span>Completed: {completed}/{goals.data.length}</span>
        <label>
          <input
            type="checkbox"
            defaultChecked={query.get("all") === "1"}
            onChange={({ target }) => handleQueryChange("all", Number(target.checked))}
          />
          show all
        </label>
      </div>
    }
    {
      goals
        ? <GoalTable
          goals={goals}
          onDelete={user.is_superuser ? handleDelete : null}
          onPagination={handleQueryChange}
        />
        : <div className="goals__load"><Load /></div>
    }
  </>;
}

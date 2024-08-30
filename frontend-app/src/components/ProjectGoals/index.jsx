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
  const queryByAll = query.get("all") === "1";

  const handleCreate = async (event) => {
    event.preventDefault();

    if (formLoad) return;

    try {
      let attribute_id = selected.current;

      if (!attribute_id) throw new Error("Select attribute");

      setFormLoad(true);
      var { amount, image_mod, video_mod } = event.target;

      await api.request(`/api/projects/goals/${pathID}/`,
        {
          method: "post",
          data: {
            attribute_id,
            amount: amount.value,
            image_mod: image_mod.value || 1,
            video_mod: video_mod.value || 1
          },
          headers: {
            'Content-Type': 'application/json',
            "Authorization": "Bearer " + localStorage.getItem("dtcAccess")
          }
        }
      );
      await fetchGoals();

      setApply([]);

      selected.current = null;
      amount.value = "";
      image_mod.value = "";
      video_mod.value = "";
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

  const rearrange = (data) => {
    const _data = data.data;
    const lookUp = ({ progress }) => progress === 100;

    let start = _data.findIndex(lookUp);
    let end = 1 + _data.findLastIndex(lookUp);

    if (start >= 0 && (end < _data.length))
      data.data = _data
        .slice(0, start)
        .concat(_data.slice(end))
        .concat(_data.slice(start, end));
  };

  const fetchGoals = async () => {
    try {
      var { data } = await api.get(`/api/projects/goals/${pathID}/`, {
        params: getQuery(),
        headers: { "Authorization": "Bearer " + localStorage.getItem("dtcAccess") }
      });

      if (query.get("all") === "1") rearrange(data);

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
      setGoals([]);
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
        <input name="amount" type="number" required min={0} placeholder="amount*" />
        <input name="image_mod" type="number" min={1} placeholder="image weight" />
        <input name="video_mod" type="number" min={1} placeholder="video weight" />
        <button className="goal__creteButton">
          { formLoad ? <Load isInline/ > : "create" }
        </button>
        { errors && <p className="goal__errors">{errors}</p> }
      </form>
    }
    <div className="goal__annotation">
      <label>
        <input
          type="checkbox"
          defaultChecked={queryByAll}
          onChange={({ target }) => handleQueryChange("all", Number(target.checked))}
        />
        show all
      </label>
      {
        (queryByAll && goals?.data) &&
        <span>
          Completed: {goals.data.filter((g) => g.complete >= g.amount).length}/{goals.data.length}
        </span>
      }
    </div>
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

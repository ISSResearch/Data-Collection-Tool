import { useState, ReactElement, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch  } from "react-redux";
import { api } from "../../config/api";
import { addAlert } from "../../slices/alerts";
import Load from "../ui/Load";
import GoalTable from "./GoalTable";
import GoalForm from "./GoalForm";
import "./styles.css";

/**
* @param {object} props
* @param {number} props.pathID
* @param {object[]} props.attributes
* @returns {ReactElement}
*/
export default function ProjectGoals({ pathID, attributes }) {
  const [goals, setGoals] = useState(null);
  const [query, setQuery] = useSearchParams();
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryByAll = query.get("all") === "1";

  const handleCreate = async (data) => {
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
        else throw new Error(errMessage);
      }
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
      setGoals([]);
    }
  };

  useEffect(() => { fetchGoals(); }, []);

  return <>
    { user.is_superuser && <GoalForm attributes={attributes} onSubmit={handleCreate} /> }
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

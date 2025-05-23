import { useEffect, useState, ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../config/api";
import { addAlert } from "../../../slices/alerts";
import { useDispatch } from "react-redux";
import TableBodySet from "../TableBodySet";
import Load from "../../ui/Load";
import "./styles.css";

/** @type {string[]} */
const STAT_TYPES = ["attribute", "user", "diff"];

/** @type {string[]} */
const EXPORT_VARIANTS = ["csv", "json", "xlsx"];

/**
* @param {{ image?: number, video?: number }} [a]
* @param {{ image?: number, video?: number }} [b]
* @param {{ image?: number, video?: number }} [c]
* @returns {number}
*/
const countItem = (a, b, c) => {
  var acc = (a?.image || 0) + (a?.video || 0);
  var dec = (b?.image || 0) + (b?.video || 0);
  var val = (c?.image || 0) + (c?.video || 0);

  return acc + dec + val;
};

/**
* @param {object} props
* @param {number} props.pathID
* @returns {ReactElement}
*/
export default function FileStats({ pathID }) {
  const [stats, setStats] = useState([]);
  const [attrDiff, setAttrDiff] = useState([]);
  const [choice, setChoice] = useState("attribute");
  const [loading, setLoading] = useState(true);
  const [diffFrom, setDiffFrom] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const countStatus = (status) => {
    return Object.values(stats)
      .reduce((sum, item) => sum + countItem(item[status]), 0);
  };

  const countTotal = () => {
    return Object.values(stats)
      .reduce((sum, { a, d, v }) => sum + countItem(a, d, v), 0);
  };

  const exportStats = async (type) => {
    try {
      var { data } = await api.get("/api/files/stats/export/", {
        params: { choice, project_id: pathID, type, diff_from: diffFrom },
        headers: { "Authorization": "Bearer " + localStorage.getItem("dtcAccess") },
        responseType: "blob"
      });

      var url = window.URL.createObjectURL(data);

      var link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "export." + type);
      link.click();
      link.remove();
    }
    catch({ message, response }) {
      var authFailed = response && (
        response.status === 401 || response.status === 403
      );

      dispatch(addAlert({
        message: "export stats error: " + message,
        type: "error",
        noSession: authFailed
      }));

      if (authFailed) navigate("/login");
    }
  };

  useEffect(() => {
    if (!choice) return;

    setLoading(true);

    Promise.allSettled([
      api.get(`/api/files/stats/${choice}/${pathID}/`, {
        params: { diff_from: diffFrom },
        headers: { "Authorization": "Bearer " + localStorage.getItem("dtcAccess") }
      }),
      api.get(`/api/attributes/attributes/diff/${pathID}/`, {
        params: { diff_from: diffFrom },
        headers: { "Authorization": "Bearer " + localStorage.getItem("dtcAccess") }
      })
    ]).then((result) => {
        if (result[0].status === "fulfilled") {
            setStats(result[0].value.data);
            setLoading(false);
        }
        else { throw result[0].reason; }

        if (result[1].status === "fulfilled") { setAttrDiff(result[1].value.data); }
        else { throw result[1].reason; }
      })
      .catch(({ message, response }) => {
        var authFailed = response && (
          response.status === 401 || response.status === 403
        );

        dispatch(addAlert({
          message: "Getting stats error: " + message,
          type: "error",
          noSession: authFailed
        }));

        if (authFailed) navigate("/login");
      });
  }, [choice, diffFrom]);

  return <>
    <fieldset
      onChange={({ target }) => { setChoice(target.value); setDiffFrom(""); }}
      className="iss__stats__radio"
    >
      Stats by:
      {
        STAT_TYPES.map((key) => (
          <label
            key={key}
            className={
              [
                'iss__stats__radioItem',
                key === choice ? " item--active" : "",
                (key !== choice) && loading ? " item--block" : ""
              ].join("")
            }
          >
            <input
              type="radio"
              name="choice"
              value={key}
              defaultChecked={key === "attribute"}
            />{key}</label>
        ))
      }
    </fieldset>
    {
      choice === "diff" &&
      <label>
        Diff from:
        <input
          type="date"
          onChange={({ target }) => setDiffFrom(target.value)}
          className="iss__stats__dateSelector"
        />
      </label>
    }
    <fieldset className="iss__stats__radio">
      Export as:
      {
        EXPORT_VARIANTS.map((type) => (
          <button
            type="button"
            key={type}
            className="iss__stats__exportButton"
            onClick={() => exportStats(type)}
          >{type}</button>
        ))
      }
    </fieldset>
    {
      loading
        ? <div className='iss__stats__load'><Load /></div>
        : <section className="iss__stats__tableWrap">
          <table className='iss__stats__table'>
            <thead className='iss__stats__table-header'>
              <tr className='iss__stats__table-row-outer'>
                <th>{choice.at(0).toUpperCase() + choice.slice(1)}</th>
                <th className='row-v'>On validation</th>
                <th className='row-a'>Accepted</th>
                <th className='row-d'>Declined</th>
                <th>total</th>
              </tr>
            </thead>
            <tbody className='iss__stats__table-body'>
              <TableBodySet bodySet={stats} countCallback={countItem} parent />
            </tbody>
            <tfoot style={{ display: "none" }} className='iss__stats__table-footer'>
              <tr className='iss__stats__table-row-outer'>
                <td><b>total</b></td>
                <td>{countStatus('v')}</td>
                <td>{countStatus('a')}</td>
                <td>{countStatus('d')}</td>
                <td>{countTotal()}</td>
              </tr>
            </tfoot>
          </table>
          {
            !!attrDiff.length &&
            <table className="iss__stats__table table-diff">
              <thead className="iss__stats__table-header">
                <tr className="iss__stats__table-row-outer">
                  <th>Attribute name</th>
                  <th>Level name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody className="iss__stats__table-body">
                {
                  attrDiff.map((row) => (
                    <tr
                      key={row[0]}
                      className={"iss__stats__table-row " + (row[3] ? "diff-row-cr" : "diff-row-del")}
                    >
                      <td>{row[1]}</td>
                      <td>{row[2]}</td>
                      <td>{row[3] ? "created" : " deleted"}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          }
        </section>
    }
  </>;
}

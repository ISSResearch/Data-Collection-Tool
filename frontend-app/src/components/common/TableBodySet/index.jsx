import { Fragment, useState, ReactElement } from 'react';
import Arrow from "../../ui/Arrow";
import "./styles.css";

/**
* @param {object} props
* @param {object[]} props.bodySet
* @param {Function} props.countCallback
* @param {boolean} [props.parent]
* @param {number} [props.depth]
* @returns {ReactElement}
*/
export default function TableBodySet({ bodySet, countCallback, parent, depth }) {
  const [childWrap, setWrap] = useState([]);

  const handleWrap = (index) => {
    var newWraps = [...childWrap];

    if (newWraps.includes(index)) {
      var pos = newWraps.findIndex((i) => i === index);
      newWraps.splice(pos, 1);
    }
    else newWraps.push(index);

    setWrap(newWraps);
  };

  const getColor = () => {
    var modifier = 10 * (depth || 0);
    return `rgb(${216 - modifier}, ${234 - modifier}, ${255 - modifier}, 0.${2 + depth || 0})`;
  };

  return (
    <>
    {
      bodySet && bodySet.map(({ levelName, name, v, a, d, children }, index) => (
        <Fragment key={name + index}>
          <tr
            style={{
              backgroundColor: depth && getColor(),
              pointerEvents: !children && 'none'
            }}
            onClick={() => handleWrap(index)}
            className={`iss__stats__table-row${!parent ? ' child-row' : ''}`}
          >
            <td style={{paddingLeft: `${24 + (12 * depth || 0)}px`}} className='iss__stats__table--name'>
              {
                children &&
                <Arrow
                  data-testid='table-row-icon'
                  point={childWrap.includes(index) ? "top" : "bot"}
                  color={!childWrap.includes(index) && "black"}
                  classes={["iss__stats__table--icon", childWrap.includes(index) ? "icon--flip" : ""]}
                />
              }
              <span className='iss__stats__table__name'>{name || 'no attribute'}</span>
              <span className='iss__stats__table__levelName'>{levelName}</span>
            </td>
            <td className='row-v'>
              <div>
                <span>images: { v?.image || 0 }</span>
                <span>videos: { v?.video || 0 }</span>
              </div>
            </td>
            <td className='row-a'>
              <div>
                <span>images: { a?.image || 0 }</span>
                <span>videos: { a?.video || 0 }</span>
              </div>
            </td>
            <td className='row-d'>
              <div>
                <span>images: { d?.image || 0 } </span>
                <span>videos: { d?.video || 0 }</span>
              </div>
            </td>
            <td className='row-cnt'>{countCallback(a, d, v)}</td>
          </tr>
          {
            childWrap.includes(index) &&
            <TableBodySet bodySet={children} countCallback={countCallback} depth={(depth || 0)+1}/>
          }
        </Fragment>
      ))
    }
    </>
  );
}

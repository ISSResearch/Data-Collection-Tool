import { Fragment, useState } from 'react';
import './styles.css';

export default function TableBodySet({ bodySet, countCallback, parent, depth }) {
  const [childWrap, setWrap] = useState([]);

  function handleWrap(index) {
    var newWraps = [...childWrap];

    if (newWraps.includes(index)) {
      var pos = newWraps.findIndex((i) => i === index);
      newWraps.splice(pos, 1);
    }
    else newWraps.push(index);

    setWrap(newWraps);
  }

  function getColor() {
    var modifier = 10 * (depth || 0);
    return `rgb(${216 - modifier}, ${234 - modifier}, ${255 - modifier}, 0.${2 + depth || 0})`;
  }

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
                <svg
                  data-testid='table-row-icon'
                  viewBox="0 0 14 8"
                  className={`iss__stats__table--icon${childWrap.includes(index) ? ' icon--flip' : ''}`}
                >
                  <path d="M12.9199 0.796875L12.3633 0.210938C12.2168 0.0644531 11.9824 0.0644531 11.8652 0.210938L6.5625 5.51367L1.23047 0.210938C1.11328 0.0644531 0.878906 0.0644531 0.732422 0.210938L0.175781 0.796875C0.0292969 0.914062 0.0292969 1.14844 0.175781 1.29492L6.29883 7.41797C6.44531 7.56445 6.65039 7.56445 6.79688 7.41797L12.9199 1.29492C13.0664 1.14844 13.0664 0.914062 12.9199 0.796875Z" />
                </svg>
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

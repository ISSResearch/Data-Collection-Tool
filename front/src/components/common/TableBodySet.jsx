import { Fragment } from 'react';
import '../../styles/components/common/tablebodyset.css';

export default function TableBodySet({ bodySet, countCallback, parent }) {

  return (
    <>
    {
      bodySet && bodySet.map(({ name, v, a, d, children }, index) => (
        <Fragment key={name + index}>
          <tr className={`iss__stats__table-row${!parent ? ' child-row' : ''}`}>
            <td>{name || 'no attribute'}</td>
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
          <TableBodySet bodySet={children} countCallback={countCallback}/>
        </Fragment>
      ))
    }
    </>
  );
}
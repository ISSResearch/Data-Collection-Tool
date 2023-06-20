import { render, screen } from '@testing-library/react';
import TableBodySet from '../../../components/common/TableBodySet';
import { mock_prepared_stats } from '../../_mock';

function formRowName({name, v, a, d}) {
  const val = `images: ${v?.image || 0} videos: ${v?.video || 0}`;
  const acc = `images: ${a?.image || 0} videos: ${a?.video || 0}`;
  const dec = `images: ${d?.image || 0} videos: ${d?.video || 0}`;
  return `${name} ${val} ${acc} ${dec}`;
}

test("tablebodyset component test", () => {
  const countItem = (a, b, c) => {
    const acc = (a?.image || 0) + (a?.video || 0);
    const dec = (b?.image || 0) + (b?.video || 0);
    const val = (c?.image || 0) + (c?.video || 0);
    return acc + dec + val;
  };

  render(
    <table>
      <tbody>
        <TableBodySet bodySet={mock_prepared_stats} countCallback={countItem} parent/>
      </tbody>
    </table>
  );

  const rows = [];
  const rowStack = [...mock_prepared_stats];
  while (rowStack.length) {
    const row = rowStack.pop();
    rows.push(row)
    if (row.children) rowStack.push(...row.children);
  }

  expect(screen.getAllByRole('row')).toHaveLength(rows.length);

  rows.forEach((el) => {
    const row = screen.getByRole('row', {name: new RegExp(formRowName(el))});

    const expectedClass = mock_prepared_stats.map(({id}) => id).includes(el.id)
      ? 'iss__stats__table-row'
      : 'iss__stats__table-row child-row';

    expect(row.className).toBe(expectedClass);
  });
})
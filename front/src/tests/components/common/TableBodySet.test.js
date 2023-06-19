import { render, screen } from '@testing-library/react';
import TableBodySet from '../../../components/common/TableBodySet';
import { mock_prepared_stats } from '../../_mock';

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

  const parentRows = Array.from(screen.getAllByRole('row'))
    .filter(({ className }) => className === 'iss__stats__table-row');
  expect(parentRows).toHaveLength(mock_prepared_stats.length);

  rows.forEach(({ name, v, a, d }) => {
    const row = screen.getByRole('row', {name: new RegExp(name)});
  });
})
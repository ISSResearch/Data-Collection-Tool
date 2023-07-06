import { render, screen, fireEvent, getByTestId } from '@testing-library/react';
import TableBodySet from '../../../components/common/TableBodySet';
import { mock_prepared_stats } from '../../_mock';

function formRowName({name, levelName, v, a, d}) {
  const val = `images: ${v?.image || 0} videos: ${v?.video || 0}`;
  const acc = `images: ${a?.image || 0} videos: ${a?.video || 0}`;
  const dec = `images: ${d?.image || 0} videos: ${d?.video || 0}`;
  return `${name} ${levelName} ${val} ${acc} ${dec} ${countItem(v, a, d)}`;
}

const countItem = (a, b, c) => {
  const acc = (a?.image || 0) + (a?.video || 0);
  const dec = (b?.image || 0) + (b?.video || 0);
  const val = (c?.image || 0) + (c?.video || 0);
  return acc + dec + val;
};

function tester() {
  let counter = 0;

  function testRows(rows) {
    counter += rows.length;

    expect(screen.getAllByRole('row')).toHaveLength(counter);

    rows.forEach((el) => {
      const row = screen.getByRole('row', {name: formRowName(el)});
      const expectedClass = mock_prepared_stats.map(({id}) => id).includes(el.id)
        ? 'iss__stats__table-row'
        : 'iss__stats__table-row child-row';

      expect(row.className).toBe(expectedClass);
      if (el.children) {
        const arrow = getByTestId(row, 'table-row-icon');
        expect(arrow[Object.keys(arrow)[1]].className).toBe('iss__stats__table--icon');
        fireEvent.click(row);

        expect(arrow[Object.keys(arrow)[1]].className).toBe('iss__stats__table--icon icon--flip');

        testRows(el.children);
      }
    });
  }

  return testRows;
}

test("tablebodyset component test", () => {
  render(
    <table>
      <tbody>
        <TableBodySet bodySet={mock_prepared_stats} countCallback={countItem} parent/>
      </tbody>
    </table>
  );

  tester()(mock_prepared_stats);
})

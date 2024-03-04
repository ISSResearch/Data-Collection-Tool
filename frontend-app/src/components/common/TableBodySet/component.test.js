import { render, screen, fireEvent, getByTestId } from '@testing-library/react';
import TableBodySet from '.';
import { prepared_attribute_stats } from '../../../config/mock_data';

function formRowName({name, levelName, v, a, d}) {
  var val = `images: ${v?.image || 0} videos: ${v?.video || 0}`;
  var acc = `images: ${a?.image || 0} videos: ${a?.video || 0}`;
  var dec = `images: ${d?.image || 0} videos: ${d?.video || 0}`;
  return `${name} ${levelName} ${val} ${acc} ${dec} ${countItem(v, a, d)}`;
}

const countItem = (a, b, c) => {
  var acc = (a?.image || 0) + (a?.video || 0);
  var dec = (b?.image || 0) + (b?.video || 0);
  var val = (c?.image || 0) + (c?.video || 0);
  return acc + dec + val;
};

function tester() {
  var counter = 0;

  function testRows(rows, depth=0) {
    counter += rows.length;

    expect(screen.getAllByRole('row')).toHaveLength(counter);

    rows.forEach((el) => {
      var row = screen.getByRole('row', {name: formRowName(el)});
      var expectedClass = prepared_attribute_stats.map(({id}) => id).includes(el.id)
        ? 'iss__stats__table-row'
        : 'iss__stats__table-row child-row';

      expect(row.className).toBe(expectedClass);
      if (el.children) {
        var arrow = getByTestId(row, 'table-row-icon');
        expect(arrow.parentNode.style._values["padding-left"])
          .toBe(`${24 + 12 * depth}px`);
        expect(arrow[Object.keys(arrow)[1]].className).toBe('iss__stats__table--icon');
        fireEvent.click(row);

        expect(arrow[Object.keys(arrow)[1]].className).toBe('iss__stats__table--icon icon--flip');

        testRows(el.children, depth+1);
      }
    });
  }

  return testRows;
}

test("tablebodyset component test", () => {
  render(
    <table>
      <tbody>
        <TableBodySet bodySet={prepared_attribute_stats} countCallback={countItem} parent/>
      </tbody>
    </table>
  );

  tester()(prepared_attribute_stats);
});

import { fireEvent, render } from '@testing-library/react';
import ValidationFilterGroup from '.';

test("validation filter group form component test", () => {
  const filterData = [
    { prettryName: "sel1", name: "sel1name", selected: [], type: "attr", data: [] },
    { prettryName: "sel2", name: "sel2name", selected: [], type: "date", data: [] },
    { prettryName: "sel3", name: "sek3name", selected: [],  data: [] },
  ];
  var changed = false;
  const { container } = render(
    <ValidationFilterGroup
      filterData={filterData}
      onChange={() => changed = true}
    />
  );

  expect(container.querySelectorAll(".iss__filterSelector")).toHaveLength(1);
  expect(container.querySelectorAll(".iss__manualSelector")).toHaveLength(1);
  expect(container.querySelectorAll(".iss__dateSelector")).toHaveLength(1);
  expect(changed).toBeFalsy();
  fireEvent.click(
    container.querySelector(".iss__filterSelector")
      .querySelector(".iss__filterSelector__level")
  );
  expect(changed).toBeTruthy();
});

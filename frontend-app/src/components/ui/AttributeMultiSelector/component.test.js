import { fireEvent, render, screen } from '@testing-library/react';
import AttributeMultiSelector from '.';
import { prepared_attributes } from  "../../../config/mock_data";

jest.mock('../../../config/api');

afterEach(() => {
  jest.restoreAllMocks();
});

test("attribute multi selector ui component base test", () => {
  var selected = [];

  const component = (wd) => (
    <AttributeMultiSelector
      selectorName={"attribute_selector"}
      data={prepared_attributes.slice(0,2)}
      defaultSelected={wd ? [...selected] : null}
      onChange={() => selected=[]}
    />
  );

  const { unmount } = render(component());

  expect(screen.getAllByText("-not set-")).toHaveLength(3);
  var wrapper = screen
    .getByText(/clear attribute_selector/)
    .parentNode
    .parentNode;
  expect(wrapper.className).toBe("iss__filterSelector__options");
  fireEvent.click(wrapper.parentNode.querySelector(".iss__filterSelector__selected"));
  fireEvent.change(wrapper.parentNode.querySelector(".iss__selector"), {target: {value: [246]}});
  expect(wrapper.className).toBe("iss__filterSelector__options options--open");
  fireEvent.submit(wrapper.parentNode.querySelector(".iss__validationFilter__form"));

  wrapper = screen
    .getByText(/clear attribute_selector/)
    .parentNode
    .parentNode;
  screen.getByText(/some selected../);

  unmount();
  selected = [246, 249];
  render(component(true));
  expect(screen.getAllByText("-not set-")).toHaveLength(2);
  wrapper = screen
    .getByText(/clear attribute_selector/)
    .parentNode
    .parentNode;
  expect(
    wrapper.parentNode
    .querySelectorAll(".iss__filterSelector__selected span")
  ).toHaveLength(2);
  expect(
    Array.from(
      wrapper.parentNode
      .querySelectorAll(".iss__filterSelector__selected span")
    ).map((e) => e.innerHTML)
  ).toEqual(["ford", "honda"]);

  fireEvent.click(screen.getByText(/clear attribute_selector/));
  expect(selected).toHaveLength(0);
  expect(screen.getAllByText("-not set-")).toHaveLength(2);
});

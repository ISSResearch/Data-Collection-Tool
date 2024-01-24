import { fireEvent, render, screen } from '@testing-library/react';
import AttributeMultiSelector from '.';
import { prepared_attributes } from  "../../../config/mock_data";

jest.mock('../../../config/api');

afterEach(() => {
  jest.restoreAllMocks();
});

test("attribute multi selector ui component base test", () => {
  var selected = [];

  const component = () => (
    <AttributeMultiSelector
      selectorName={"attribute_selector"}
      data={prepared_attributes.slice(0,2)}
      defaultSelected={[...selected]}
      onChange={() => selected=[]}
    />
  );

  const { rerender } = render(component());

  expect(screen.getAllByText("-not set-")).toHaveLength(3);
  var wrapper = screen
    .getByText(/clear attribute_selector/)
    .parentNode
    .parentNode;
  expect(wrapper.className).toBe("iss__filterSelector__options");
  fireEvent.click(wrapper.parentNode.querySelector(".iss__filterSelector__selected"))

  rerender(component());
  wrapper = screen
    .getByText(/clear attribute_selector/)
    .parentNode
    .parentNode;
  expect(wrapper.className).toBe("iss__filterSelector__options options--open");

  selected = [246, 249];
  rerender(component())
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
    ).map(e => e.innerHTML)
  ).toEqual(["ford", "honda"]);

  fireEvent.click(screen.getByText(/clear attribute_selector/));
  rerender(component());
  expect(selected).toHaveLength(0);
  expect(screen.getAllByText("-not set-")).toHaveLength(3);
});

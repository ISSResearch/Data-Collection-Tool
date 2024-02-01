import { render, fireEvent, screen } from '@testing-library/react';
import MultiSelector from '.';
import { prepared_attributes } from '../../../config/mock_data';

test("selectoritem component test, case initial", () => {
  const attribute = prepared_attributes.find(({ multiple }) => multiple);
  const { attributes } = attribute;
  const containerClass = ".iss__manualSelector__options";
  const parentClass = ".iss__manualSelector__selected";
  var change = [];
  const component = () => (
    <MultiSelector
      selectorLabel={"test_selector"}
      selectorOptions={attributes}
      onChange={e => change = e}
      defaultSelected={[]}
    />
  );

  const toggler = () => {
    var opened = false;
    return (set) => {
      if (set) return opened = !opened;
      var className = containerClass.slice(1);
      fireEvent.click(container.querySelector(parentClass));
      opened = !opened;
      if (opened) className += " options--open";
      expect(container.querySelector(containerClass).className).toBe(className);
      return opened;
    }
  };

  const { rerender, container } = render(component());
  var toggle = toggler();

  screen.getByText("clear test_selector")
  expect(toggle()).toBeTruthy();
  expect(toggle()).toBeFalsy();
  expect(toggle()).toBeTruthy();
  expect(container.querySelector(".off--title")).not.toBeNull();
  expect(
    Array.from(screen.getAllByRole('option')).map(({ text, value }) => {
      return { [value]: text };
    })
  ).toEqual(
    attributes.map(({ name, id }) => {
      return { [id]: name };
    })
  );

  fireEvent.change(screen.getByRole("listbox"), { target: { value: [attributes[0].id] } });
  fireEvent.click(screen.getByRole("button"))
  toggle(true)

  expect(container.querySelector(containerClass).className).toBe(containerClass.slice(1));
  expect(change).toEqual([attributes[0].id]);

  toggle();
  expect(container.querySelector(".off--title")).toBeNull();
  fireEvent.click(screen.getByText(/clear*/));

  expect(change).toEqual([]);
  expect(container.querySelector(containerClass).className)
    .toBe(containerClass.slice(1) + " options--open");
});

test("selectoritem component test, case with defaults", () => {
  const attribute = prepared_attributes.find(({ multiple }) => multiple);
  const { attributes } = attribute;
  const containerClass = ".iss__manualSelector__options";
  const parentClass = ".iss__manualSelector__selected";
  var change = [];
  const component = () => (
    <MultiSelector
      selectorLabel={"test_selector"}
      selectorOptions={attributes}
      onChange={e => change = e}
      defaultSelected={attributes.map(e => e.id)}
    />
  );

  const { rerender, container } = render(component());

  expect(screen.queryByText('-not set-', { ignore: 'option' })).toBeNull();
  attributes.slice(1).forEach(({ name }) => {
    expect(screen.queryByText(name, { ignore: 'option' })).not.toBeNull();
  });
});

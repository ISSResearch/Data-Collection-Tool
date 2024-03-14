import { fireEvent, render, screen } from '@testing-library/react';
import DateSelector from '.';

test("date selector test", () => {
  const containerClass = ".iss__dateSelector__options";
  const parentClass = ".iss__dateSelector__selected";

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
    };
  };

  const { container } = render(
    <DateSelector onChange={(e) => e} defaultSelected={{}} />
  );

  var toggle = toggler();

  screen.getByText("clear dates");
  expect(toggle()).toBeTruthy();
  expect(toggle()).toBeFalsy();
  expect(toggle()).toBeTruthy();
  expect(container.querySelector(".off--title")).not.toBeNull();

  fireEvent.click(screen.getByRole("button"));
  toggle(true);

  expect(container.querySelector(containerClass).className).toBe(containerClass.slice(1));
});

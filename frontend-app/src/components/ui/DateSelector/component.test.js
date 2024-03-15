import { fireEvent, render, screen } from '@testing-library/react';
import DateSelector from '.';

test("date selector test", () => {
  const containerClass = ".iss__dateSelector__options";
  const parentClass = ".iss__dateSelector__selected";

  var change = null;

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
    <DateSelector onChange={(e) => change = e} defaultSelected={{}} />
  );

  var toggle = toggler();

  expect(toggle()).toBeTruthy();
  expect(toggle()).toBeFalsy();
  expect(toggle()).toBeTruthy();
  expect(container.querySelector(".off--title")).not.toBeNull();

  fireEvent.change(container.querySelectorAll("input")[0], { target: {value: "2000-01-01"}});
  fireEvent.click(screen.getByRole("button"));
  toggle(true);

  expect(container.querySelector(containerClass).className).toBe(containerClass.slice(1));
  expect(container.querySelector(".off--title")).toBeNull();
  screen.getByText("2000-01-01 - ...");

  fireEvent.change(container.querySelectorAll("input")[1], { target: {value: "2000-01-01"}});
  fireEvent.click(screen.getByRole("button"));
  toggle(true);
  screen.getByText("2000-01-01 - ...");

  fireEvent.change(container.querySelectorAll("input")[1], { target: { value: "2001-01-01"}});
  fireEvent.click(screen.getByRole("button"));
  toggle(true);
  screen.getByText("2000-01-01 - 2001-01-01");

  expect(change).toEqual({ from: "2000-01-01", to: "2001-01-01" });
});

test("date selector with default", () => {
  render(
    <DateSelector onChange={(e) =>  e} defaultSelected={{ from: "2000-01-01", to: "2001-01-01" }} />
  );

  screen.getByText("2000-01-01 - 2001-01-01");
});

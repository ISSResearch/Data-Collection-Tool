import { screen, fireEvent, render } from '@testing-library/react';
import FindAndReplace from ".";

test("find and replace ui component test", () => {
  var replaceTo, replaceWith;
  const parentClass = ".iss__findandreplace__form";

  const toggler = () => {
    var opened = false;
    return (set) => {
      if (set) return opened = !opened;
      var className = parentClass.slice(1);
      fireEvent.click(screen.getByRole("button", { name: opened ? "cancel" : "replace word" }));
      opened = !opened;
      rerender(component());
      if (opened) className += " form--open";
      expect(container.querySelector(parentClass).className).toBe(className);
      return opened;
    }
  };
  const component = () => <FindAndReplace onCommit={(t,w) => {replaceTo=t;replaceWith=w}}/>;

  const { rerender, container } = render(component());
  expect(container.querySelector(parentClass).className).toBe(parentClass.slice(1));

  var toggle = toggler();

  expect(toggle()).toBeTruthy();
  expect(toggle()).toBeFalsy();
  expect(toggle()).toBeTruthy();

  fireEvent.input(screen.getByPlaceholderText("replace to"), "");
  fireEvent.input(screen.getByPlaceholderText("replace to"), "");
  fireEvent.click(screen.getByRole("button", { name: "proceed" }));

  toggle(true);

  expect(container.querySelector(parentClass).className).toBe(parentClass.slice(1));
  expect(toggle()).toBeTruthy();

  fireEvent.input(screen.getByPlaceholderText("replace to"), {target: {value: "asd"}});
  fireEvent.input(screen.getByPlaceholderText("replace to"));
  fireEvent.click(screen.getByRole("button", { name: "proceed" }));

  expect(screen.getByPlaceholderText("replace with").className).toBe("input--error");
  fireEvent.input(screen.getByPlaceholderText("replace with"), {target: {value: " asd "}});
  fireEvent.click(screen.getByRole("button", { name: "proceed" }));

  toggle(true);
  expect(container.querySelector(parentClass).className).toBe(parentClass.slice(1));
  expect(replaceTo).toBe("asd");
  expect(replaceWith).toBe("asd");
});

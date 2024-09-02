import { render, fireEvent } from '@testing-library/react';
import Arrow from ".";

test("arrow component test", () => {
  var triggered;

  const { rerender, container } = render(<Arrow />);
  const arrow = () => container.querySelector("svg");
  expect(arrow().style.rotate).toBe("90deg");
  expect(arrow().style.fill).toBe("#62abff");
  expect(container.querySelector(".iss__arrowIcon.a.b")).toBeNull();

  rerender(
    <Arrow
      color="red"
      point="top"
      classes={["a", "b"]}
      onClick={() => triggered = true}
    />
  );
  expect(arrow().style.rotate).toBe("270deg");
  expect(arrow().style.fill).toBe("red");
  expect(container.querySelector(".iss__arrowIcon.a.b")).not.toBeNull();
  expect(triggered).toBeFalsy();

  fireEvent.click(arrow());
  expect(triggered).toBeTruthy();
});

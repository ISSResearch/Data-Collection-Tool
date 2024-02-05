import { render, fireEvent, screen } from '@testing-library/react';
import AlertCard from '.';

test("alert card component test", () => {
  var { unmount } = render(<AlertCard message={"red card"} color={"red"} />);
  expect(screen.getByText("red card").className).toBe("alertCard alert--red");
  unmount();

  var { unmount } = render(<AlertCard message={"green card"} color={"green"} />);
  expect(screen.getByText("green card").className).toBe("alertCard alert--green");
  unmount();

  var closed = false;
  render(<AlertCard message={"common card"} closeAction={() => closed=true}/>);
  expect(screen.getByText("common card").className).toBe("alertCard");
  fireEvent.click(screen.getByRole("button"));
  expect(closed).toBeTruthy();
});

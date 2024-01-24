import { fireEvent, render, screen } from '@testing-library/react';
import CloseCross from '.';

test("close cross ui component test", () => {
  var counter = 0;
  render(<CloseCross action={() => counter++}/>);
  expect(counter).toBe(0);

  for (var i=1; i <= 5; i++) {
    fireEvent.click(screen.getByRole("button"));
    expect(counter).toBe(i);
  }
});

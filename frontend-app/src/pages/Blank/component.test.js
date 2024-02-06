import { screen, render, } from '@testing-library/react';
import Blank from '.';

test("blank page test", () => {
  render(<Blank />);
  screen.getByText("Not Found");
});

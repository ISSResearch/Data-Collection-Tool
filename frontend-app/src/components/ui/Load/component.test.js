import { render, screen } from '@testing-library/react';
import Load from '.';

test("load component test", () => {
  render(<Load/>);
  expect(screen.getByTestId("load-c").className).toBe('iss__loading');
});

test("load component inline test", () => {
  render(<Load isInline />);
  expect(screen.getByTestId("load-c").className).toBe('iss__loadingMin');
});

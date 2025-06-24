import { render, screen } from '@testing-library/react';
import StatusLoad from '.';

test("status load component test", () => {
  const { rerender } = render(<StatusLoad />);

  expect(screen.getByTestId('statusload').parentElement.className).toBe('iss__statusLoad');
  expect(screen.getByTestId('statusload').style.width).toBe("0%");

  rerender(<StatusLoad progress={0} info='info1' error={false}/>);
  expect(screen.getByTestId('statusload').parentElement.className).toBe('iss__statusLoad');
  expect(screen.getByTestId('statusload').style.width).toBe("0%");
  screen.getByText('info1');

  rerender(<StatusLoad progress={50} info='info2' error={false}/>);
  expect(screen.getByTestId('statusload').parentElement.className).toBe('iss__statusLoad');
  expect(screen.getByTestId('statusload').style.width).toBe("50%");
  screen.getByText('info2');

  rerender(<StatusLoad progress={50} info='info2' error={true}/>);
  expect(screen.getByTestId('statusload').parentElement.className).toBe('iss__statusLoad progress--fail');
});

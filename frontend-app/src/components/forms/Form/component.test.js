import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Form from '.';

const fieldSet = [
  {label: 'Enter username:', type: 'text', name: 'username', placeholder: 'username', required: true},
  {label: 'Enter password:', type: 'password', name: 'password', placeholder: 'password', required: true},
];

test("form component test", () => {
  render(
    <MemoryRouter>
      <Form fields={fieldSet} />
    </MemoryRouter>
  );

  expect(screen.queryByText(/Request failure:/)).toBeNull();
  screen.getByText('submit');

  fieldSet.forEach(({ label, placeholder, type, required }) => {
    var input = screen.getByPlaceholderText(placeholder);
    screen.getByLabelText(label);
    expect(input.value).toBe('');
    expect(input.required).toBe(required);
    expect(input.type).toBe(type);
  });
});

test("form component test fail test", () => {
  render(
    <MemoryRouter>
      <Form loading errors={'error message'} fields={fieldSet} />
    </MemoryRouter>
  );

  expect(screen.queryByText('submit')).toBeNull();
  expect(screen.queryByText(/Request failure:/)).not.toBeNull();
  expect(screen.getByTestId("load-c").className).toBe('iss__loadingMin');
  screen.getByText('error message');
});

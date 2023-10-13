import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Form from '../../../components/common/Form';

const fieldSet = [
  {label: 'Enter username:', type: 'text', name: 'username', placeholder: 'username', required: true},
  {label: 'Enter password:', type: 'password', name: 'password', placeholder: 'password', required: true},
];
const bottomLink = { to: '/registration', text: 'Or Registry' };

test("form component test", () => {
  render(
    <MemoryRouter>
      <Form
        fields={fieldSet}
        link={bottomLink}
      />
    </MemoryRouter>
  );

  expect(screen.queryByText(/Request failure:/)).toBeNull();
  expect(screen.queryByText(bottomLink.text)).not.toBeNull();
  screen.getByText('submit');

  fieldSet.forEach(({ label, placeholder, type, required }) => {
    const input = screen.getByPlaceholderText(placeholder);
    screen.getByLabelText(label);
    expect(input.value).toBe('');
    expect(input.required).toBe(required);
    expect(input.type).toBe(type);
  });
});

test("form component test fail test", () => {
  render(
    <MemoryRouter>
      <Form
        loading
        errors={'error message'}
        fields={fieldSet}
        link={bottomLink}
      />
    </MemoryRouter>
  );

  expect(screen.queryByText('submit')).toBeNull();
  expect(screen.queryByText(/Request failure:/)).not.toBeNull();
  expect(screen.getByTestId("load-c").className).toBe('iss__loadingMin');
  screen.getByText('error message');
});

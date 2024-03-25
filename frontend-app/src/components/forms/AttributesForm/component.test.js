import { fireEvent, render, renderHook, act, screen } from '@testing-library/react';
import AttributesForm from '.';
import { Provider } from 'react-redux';
import createStore from "../../../store";
import { MemoryRouter } from "react-router-dom";
import { useAttributeManager } from '../../../hooks/';
import { api } from '../../../config/api';

jest.mock('../../../config/api');

afterEach(() => {
  jest.restoreAllMocks();
});

// TODO: resolve controlled input warning
test("attributes form component test", async () => {
  const { result: managerHook } = renderHook(() => useAttributeManager());
  act(() => managerHook.current.formHook.addForm());
  const [firstForm] = Object.keys(managerHook.current.formHook.forms);

  const component = () => (
    <Provider store={createStore()}>
      <MemoryRouter>
        <AttributesForm
          formId={firstForm}
          deleteForm={managerHook.current.formHook.deleteForm}
          levelHook={managerHook.current.levelHook}
          attributeHook={managerHook.current.attributeHook}
        />
      </MemoryRouter>
    </Provider>
  );

  const { rerender } = render(component());
  let item = managerHook.current.levelHook.levels[firstForm][0];
  item.orig = true;
  item.uid = item.id;

  rerender(component());

  screen.getByRole('heading', { name: 'Levels:'});
  screen.getByRole('heading', { name: 'Values:'});
  expect(screen.getAllByPlaceholderText('Level name')).toHaveLength(1);
  expect(screen.queryAllByPlaceholderText('Attribute name')).toHaveLength(0);
  expect(screen.queryByText('confirm')).toBeNull();

  fireEvent.click(screen.getByRole('checkbox', { name: 'required' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'multiple choice' }));
  expect(managerHook.current.levelHook.levels[firstForm][0].required).toBeTruthy();
  expect(managerHook.current.levelHook.levels[firstForm][0].multiple).toBeTruthy();

  fireEvent.click(screen.getByRole('checkbox', { name: 'multiple choice' }));
  expect(managerHook.current.levelHook.levels[firstForm][0].multiple).toBeFalsy();

  fireEvent.click(screen.getAllByRole('button')[0]);

  rerender(component());

  expect(screen.getAllByPlaceholderText('Level name')).toHaveLength(2);

  fireEvent.click(screen.getAllByRole('button')[2]);

  rerender(component());

  expect(screen.getAllByPlaceholderText('Level name')).toHaveLength(1);

  fireEvent.click(screen.getAllByRole('button')[1]);
  expect(screen.queryByText('confirm')).not.toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'no' }));
  fireEvent.click(screen.getAllByRole('button')[1]);

  api.request.mockRejectedValue({});
  await act(async() => {
    fireEvent.click(screen.getByRole('button', { name: 'yes' }));
  });
  expect(screen.queryByText('confirm')).toBeNull();

  rerender(component());

  expect(Object.keys(managerHook.current.formHook.forms)).toHaveLength(1);

  api.request.mockResolvedValue({});
  fireEvent.click(screen.getAllByRole('button')[1]);
  await act(async() => {
    await fireEvent.click(screen.getByRole('button', { name: 'yes' }));
  });

  rerender(component());
  expect(Object.keys(managerHook.current.formHook.forms)).toHaveLength(0);
  expect(screen.queryAllByPlaceholderText('Level name')).toHaveLength(0);
});

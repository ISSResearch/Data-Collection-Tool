import { fireEvent, render, renderHook, act, screen } from '@testing-library/react';
import AttributesForm from '../../../components/common/AttributesForm';
import { useAttributeManager } from '../../../hooks';

test("attributes form component test", () => {
  const { result: managerHook } = renderHook(() => useAttributeManager());
  act(() => managerHook.current.formHook.addForm());
  const [firstForm] = Object.keys(managerHook.current.formHook.forms);

  const { rerender } = render(
    <AttributesForm
      formId={firstForm}
      deleteForm={managerHook.current.formHook.deleteForm}
      levelHook={managerHook.current.levelHook}
      attributeHook={managerHook.current.attributeHook}
    />
  );

  managerHook.current.levelHook.levels[firstForm][0].orig = true;

  rerender(
    <AttributesForm
      formId={firstForm}
      deleteForm={managerHook.current.formHook.deleteForm}
      levelHook={managerHook.current.levelHook}
      attributeHook={managerHook.current.attributeHook}
    />
  );

  screen.getByRole('heading', { name: 'Levels:'});
  screen.getByRole('heading', { name: 'Values:'});
  expect(screen.getAllByPlaceholderText('Level name')).toHaveLength(1);
  expect(screen.queryByText('confirm')).toBeNull();
  expect(screen.queryAllByPlaceholderText('Attribute name')).toHaveLength(0);

  fireEvent.click(screen.getByRole('checkbox', { name: 'required' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'multiple choice' }));
  expect(managerHook.current.levelHook.levels[firstForm][0].required).toBeTruthy();
  expect(managerHook.current.levelHook.levels[firstForm][0].multiple).toBeTruthy();

  fireEvent.click(screen.getByRole('checkbox', { name: 'multiple choice' }));
  expect(managerHook.current.levelHook.levels[firstForm][0].multiple).toBeFalsy();

  fireEvent.click(screen.getAllByRole('button')[0]);

  rerender(
    <AttributesForm
      formId={firstForm}
      deleteForm={managerHook.current.formHook.deleteForm}
      levelHook={managerHook.current.levelHook}
      attributeHook={managerHook.current.attributeHook}
    />
  );

  expect(screen.getAllByPlaceholderText('Level name')).toHaveLength(2);

  fireEvent.click(screen.getAllByRole('button')[2]);
  fireEvent.click(screen.getAllByRole('button')[screen.getAllByRole('button').length-1])

  rerender(
    <AttributesForm
      formId={firstForm}
      deleteForm={managerHook.current.formHook.deleteForm}
      levelHook={managerHook.current.levelHook}
      attributeHook={managerHook.current.attributeHook}
    />
  );

  expect(screen.getAllByPlaceholderText('Level name')).toHaveLength(1);
  expect(screen.queryAllByPlaceholderText('Attribute name')).toHaveLength(1);

  fireEvent.click(screen.getAllByRole('button')[1]);
  expect(screen.queryByText('confirm')).not.toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'no' }));

  managerHook.current.levelHook.levels[firstForm][0].orig = false;

  rerender(
    <AttributesForm
      formId={firstForm}
      deleteForm={managerHook.current.formHook.deleteForm}
      levelHook={managerHook.current.levelHook}
      attributeHook={managerHook.current.attributeHook}
    />
  );

  fireEvent.click(screen.getAllByRole('button')[1]);

  expect(Object.keys(managerHook.current.formHook.forms)).toHaveLength(0);
});
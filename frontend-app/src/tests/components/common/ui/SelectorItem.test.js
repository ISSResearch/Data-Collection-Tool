import { render, fireEvent, screen } from '@testing-library/react';
import SelectorItem from '../../../../components/common/ui/SelectorItem';
import { mock_prepared_attributes } from '../../../_mock';


test("selectoritem component test, case initial", () => {
  const attribute = mock_prepared_attributes.find(({multiple}) => multiple);
  const {attributes} = attribute;

  render(
    <SelectorItem
      selectorId={1}
      selectorName={'sel_name'}
      selectorOptions={attributes}
      handleSelect={() => {}}
    />
  );
  const selector = screen.queryByRole('listbox');

  expect(selector).not.toBeNull();
  expect(selector.id).toBe('selector--sel_name_1');
  expect(
    Array.from(screen.getAllByRole('option')).map(({text, value}) => {
      return { [value]: text };
    })
  ).toEqual(
    attributes.map(({ name, id }) => {
      return { [id]: name };
    })
  );
  expect(selector.parentNode.parentNode.className).toBe('iss__customSelector__options');

  fireEvent.click(screen.getByText('-not set-').parentNode);
  expect(selector.parentNode.parentNode.className).toBe('iss__customSelector__options options--open');

  fireEvent.click(screen.getByText('-not set-').parentNode);
  expect(selector.parentNode.parentNode.className).toBe('iss__customSelector__options');

  attributes.forEach(({ name, id }) => {
    fireEvent.change(selector, {target: { value: id}});
    expect(screen.queryByText(name, { ignore: 'option'})).not.toBeNull();
  });

  expect(screen.queryByText('-not set-', { ignore: 'option'})).toBeNull();
  fireEvent.change(selector, {target: { value: []}});
  expect(screen.queryByText('-not set-', { ignore: 'option'})).not.toBeNull();

  fireEvent.change(selector, {target: { value: attributes[0].id}});
  expect(screen.queryByText(attributes[0].name, { ignore: 'option'})).not.toBeNull();
  expect(screen.queryByText('-not set-', { ignore: 'option'})).toBeNull();

  fireEvent.click(screen.getByText(/clear*/));
  expect(screen.queryByText('-not set-', { ignore: 'option'})).not.toBeNull();
});

test("selectoritem component test, case woth defaults", () => {
  const attribute = mock_prepared_attributes.find(({multiple}) => multiple);
  const {attributes} = attribute;

  render(
    <SelectorItem
      selectorId={1}
      selectorName={'sel_name'}
      selectorOptions={attributes}
      handleSelect={() => {}}
      defaultSelected={attributes.slice(1).map(({id}) => id)}
    />
  );
  const selector = screen.queryByRole('listbox');

  expect(selector).not.toBeNull();
  expect(screen.queryByText('-not set-', {ignore: 'option'})).toBeNull();
  attributes.slice(1).forEach(({name}) => {
    expect(screen.queryByText(name, { ignore: 'option'})).not.toBeNull();
  });

  fireEvent.click(screen.getByText(/clear*/));
  expect(screen.queryByText('-not set-', { ignore: 'option'})).not.toBeNull();

  attributes.forEach(({ name, id }) => {
    fireEvent.change(selector, {target: { value: id}});
    expect(screen.queryByText(name, { ignore: 'option'})).not.toBeNull();
  });

  expect(screen.queryByText('-not set-', { ignore: 'option'})).toBeNull();
  fireEvent.change(selector, {target: { value: []}});
  expect(screen.queryByText('-not set-', { ignore: 'option'})).not.toBeNull();
});
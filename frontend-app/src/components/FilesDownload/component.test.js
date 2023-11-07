import { render, screen, fireEvent } from '@testing-library/react';
import FilesDownload from '../../components/FilesDownload';

test("files download component test", () => {
  render(<FilesDownload />);

  expect(screen.getAllByText('all')).toHaveLength(2);
  expect(screen.getAllByText('on validation')).toHaveLength(1);
  expect(screen.getAllByText('accepted')).toHaveLength(1);
  expect(screen.getAllByText('declined')).toHaveLength(1);

  expect(screen.getAllByText('all')[0].parentNode.className)
    .toBe('iss__filesDownload__selected option--common');
  expect(screen.getAllByText('all')[1].parentNode.parentNode.className)
    .toBe('iss__filesDownload__options__wrap');

  fireEvent.click(screen.getAllByText('all')[0].parentNode);
  expect(screen.getAllByText('all')[1].parentNode.parentNode.className)
    .toBe('iss__filesDownload__options__wrap options--open');

  fireEvent.click(screen.getAllByText('all')[0].parentNode);
  expect(screen.getAllByText('all')[1].parentNode.parentNode.className)
    .toBe('iss__filesDownload__options__wrap');

  expect(screen.getAllByText('all')[1].className).toBe('option--common');
  expect(screen.getByText('on validation').className).toBe('option--blue');
  expect(screen.getByText('accepted').className).toBe('option--green');
  expect(screen.getByText('declined').className).toBe('option--red');

  fireEvent.click(screen.getByText('accepted'));
  expect(screen.getAllByText('accepted')).toHaveLength(2);
  expect(screen.getAllByText('all')).toHaveLength(1);

  expect(screen.getAllByText('accepted')[0].parentNode.className)
    .toBe('iss__filesDownload__selected option--green');

  expect(screen.queryByTestId('load-c')).toBeNull();
  screen.getByText('request');

  const button = screen.getByRole('button');

  expect(button.className).toBe('iss__filesDownload__button');
  fireEvent.click(button);

  // TODO: do the rest tests
  // expect(button.className).toBe('iss__filesDownload__button block--button');
  // expect(screen.queryByText('request')).toBeNull();
  // expect(screen.getByTestId('load-c').className).toBe('iss__loadingMin');
});

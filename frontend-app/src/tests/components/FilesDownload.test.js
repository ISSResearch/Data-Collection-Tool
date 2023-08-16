import { render, screen, fireEvent } from '@testing-library/react';
import FilesDownload from '../../components/FilesDownload';

test("files download component test", () => {
  render(<FilesDownload/>);

  expect(screen.getAllByText('all files')).toHaveLength(2);
  expect(screen.getAllByText('on validation')).toHaveLength(1);
  expect(screen.getAllByText('accepted files')).toHaveLength(1);
  expect(screen.getAllByText('declined files')).toHaveLength(1);

  expect(screen.getAllByText('all files')[0].parentNode.className).toBe('iss__filesDownload__selected option--all');
  expect(screen.getAllByText('all files')[1].parentNode.parentNode.className)
  .toBe('iss__filesDownload__options__wrap');

  fireEvent.click(screen.getAllByText('all files')[0].parentNode);
  expect(screen.getAllByText('all files')[1].parentNode.parentNode.className)
  .toBe('iss__filesDownload__options__wrap options--open');

  fireEvent.click(screen.getAllByText('all files')[0].parentNode);
  expect(screen.getAllByText('all files')[1].parentNode.parentNode.className)
  .toBe('iss__filesDownload__options__wrap');

  expect(screen.getAllByText('all files')[1].className).toBe('option--all');
  expect(screen.getByText('on validation').className).toBe('option--validation');
  expect(screen.getByText('accepted files').className).toBe('option--accepted');
  expect(screen.getByText('declined files').className).toBe('option--declined');

  fireEvent.click(screen.getByText('accepted files'));
  expect(screen.getAllByText('accepted files')).toHaveLength(2);
  expect(screen.getAllByText('all files')).toHaveLength(1);

  expect(screen.getAllByText('accepted files')[0].parentNode.className).toBe('iss__filesDownload__selected option--accepted');

  expect(screen.queryByTestId('load-c')).toBeNull();
  screen.getByText('request');

  const button = screen.getByRole('button');

  expect(button.className).toBe('iss__filesDownload__button');
  fireEvent.click(button);

  expect(button.className).toBe('iss__filesDownload__button block--button');
  expect(screen.queryByText('request')).toBeNull();
  expect(screen.getByTestId('load-c').className).toBe('iss__loadingMin');
});
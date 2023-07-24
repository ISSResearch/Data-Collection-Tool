import { act, render, screen } from '@testing-library/react';
import { mock_raw_stats } from '../../_mock';
import FilesStats from '../../../components/common/FilesStats';
import api from '../../../config/api';

jest.mock('../../../config/api');

afterEach(() => {
  jest.restoreAllMocks();
});

test("files stats component test", async () => {

  api.get.mockResolvedValue({ data: mock_raw_stats });

  await act(async () => await render(<FilesStats pathID={1}/>));
  screen.getByRole('table');
  expect(screen.queryByTestId('load-c')).toBeNull();
});
import { render, fireEvent, screen } from '@testing-library/react';
import FilesUpload from '../../components/FilesUpload';

test("files upload component test", () => {
  render(<FilesUpload/>);

  expect(screen.queryByTestId('load-c')).toBeNull();

  expect(screen.getByRole('button', { name: 'SEND ALL'}));
  expect(screen.getAllByRole('group')).toHaveLength(2);
});
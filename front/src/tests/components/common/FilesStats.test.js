import { render, screen } from '@testing-library/react';
import FilesStats from '../../../components/common/FilesStats';
import { mock_prepared_stats } from '../../_mock';

test("files stats component test", () => {
  render(<FilesStats pathID={1}/>);
  // TODO: force to have stats
});
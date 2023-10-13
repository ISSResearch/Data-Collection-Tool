import {
  attributeAdapter,
  attributeGroupsAdapter,
  statsAdapter
} from '../../utils/adapters';
import {
  mock_raw_project,
  mock_prepared_attributes,
  mock_raw_file_attributes,
  mock_raw_stats,
  mock_prepared_stats
} from '../_mock';

test("attribute adapter test", () => {
  const preparedAttributes = attributeAdapter(mock_raw_project);
  expect(preparedAttributes.preparedAttributes).toEqual(mock_prepared_attributes);
});

test("attribute groups adapter test", () => {
  const preparedGroups = attributeGroupsAdapter(mock_raw_file_attributes);
  expect(preparedGroups).toEqual({
    '5738e31f-c43a-4195-b1c2-ea513424a309': { 0: [249, 259, 260], 1: [271] }
  })
});

test("stats adapter test", () => {
  const preparedStats = statsAdapter(mock_raw_stats);
  expect(preparedStats).toEqual(mock_prepared_stats);
});

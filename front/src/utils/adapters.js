import { deepCopy } from "./utils";

export function attributeAdapter(data) {
  const preparedData = deepCopy(data);
  const attributes = preparedData.attributes;
  attributes.forEach(el => {
    const parent = attributes.find(({id}) => el.parent === id);
    if (parent) {
      parent.children
        ? parent.children[0].attributes.push(...el.attributes)
        : parent.children = [el];
    }
  })
  return { ...preparedData, preparedAttributes: attributes.filter(({parent}) => !parent) };
}

export function attributeGroupsAdapter(data) {
  const attributes = deepCopy(data);
  return attributes.reduce((acc, {uid, attributes}) => {
    return {
      ...acc,
      [uid]: attributes.reduce((newacc, [id, parent, level]) => {
        const isNew  = newacc.length && newacc[newacc.length-1][0].level === level
          ? level
          : parent;
        if (isNew === null || !newacc.length) newacc.push([{ id, level }]);
        else newacc[newacc.length-1].push({ id, level });
        return newacc;
      }, []).reduce((a, b) => [...a, b.map(({ id }) => id)], [])
    };
  }, {});
}

export function statsAdapter(data) {
  const preparedData = deepCopy(data).reduce((acc, item) => {
    const target = acc[item.attribute__name || 'atr not set'];
    if (!target) {
      acc[item.attribute__name || 'atr not set'] = {
        id: item.attribute__id || 'no_atr_id',
        name: item.attribute__name || 'atr not set',
        parent: item.attribute__parent,
        [item.file__status || 'v']: { [item.file__file_type]: item.count }
      };
    }
    else if ((target[item.file__status || 'v'])) {
      target[item.file__status || 'v'][item.file__file_type] = item.count
    }
    else target[item.file__status] = { [item.file__file_type]: item.count };
    return acc;
  }, {});

  Object.values(preparedData).forEach(el => {
    const parent = Object.values(preparedData).find(({ id }) => {
      return el.parent  === id;
    });
    if (parent) parent.children ? parent.children.push(el) : parent.children = [el];
  });

  return Object.values(preparedData).filter(({parent}) => !parent);
}
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
  return data.reduce((acc, {uid, attributes}) => {
    return {
      ...acc,
      [uid]: attributes.reduce((newacc, [id, levelIndex]) => {
        if (!newacc[levelIndex]) return {...newacc, [levelIndex]: [id]};
        newacc[levelIndex].push(id);
        return newacc;
      }, {})
    };
  }, {});
}

export function statsAdapter(data) {
  const preparedData = data.reduce((acc, item) => {
    let {
      name: levelName,
      attribute__id: id,
      attribute__name: name,
      attribute__parent: parent,
      attribute__attributegroup__file__file_type: type,
      attribute__attributegroup__file__status: status,
      count
    } = item;
    status = status || 'v';
    name = name || 'no name';
    type = type || 'no data';
    const target = acc[id];
    if (!target) acc[id] = { id, levelName, name, parent, [status]: { [type]: count } };
    else if (target[status]) target[status][type] = count;
    else target[status] = { [type]: count };
    return acc;
  }, {});

  Object.values(preparedData).forEach(el => {
    const parent = Object.values(preparedData).find(({ id }) => el.parent === id);
    if (parent) parent.children
      ? parent.children.push(el)
      : parent.children = [el];
  });

  return Object.values(preparedData).filter(({parent}) => !parent);
}
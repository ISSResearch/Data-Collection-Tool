import { deepCopy, extractFileMeta, formUID } from "../utils";

export function inputFilesAdapter(files, groups) {
  return files.reduce((acc, file) => {
    acc[formUID()] = {
      file,
      blob: URL.createObjectURL(file),
      attributeGroups: deepCopy(groups || {}),
      ...extractFileMeta(file)
    };
    return acc;
  }, {});
}

export function attributeAdapter(data) {
  const attributes = deepCopy(data.attributes);
  attributes.forEach(el => {
    const parent = attributes.find(({ id }) => el.parent === id);
    if (parent) {
      parent.children
        ? parent.children[0].attributes.push(...el.attributes)
        : parent.children = [el];
    }
  })
  return { ...data, preparedAttributes: attributes.filter(({ parent }) => !parent) };
}

export function attributeGroupsAdapter(data) {
  return data.reduce((acc, { uid, attributes }) => {
    return {
      ...acc,
      [uid]: attributes.reduce((newacc, [id, levelIndex]) => {
        if (!newacc[levelIndex]) return { ...newacc, [levelIndex]: [id] };
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
      order,
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
    if (!target) acc[id] = { id, levelName, name, parent, order, [status]: { [type]: count } };
    else if (target[status]) {
      const prevCount = target[status][type];
      target[status][type] = prevCount ? prevCount + count : count;
    }
    else target[status] = { [type]: count };
    return acc;
  }, {});

  Object.values(preparedData).forEach(el => {
    const parent = Object.values(preparedData).find(({ id }) => el.parent === id);
    if (parent) parent.children
      ? parent.children.push(el)
      : parent.children = [el];
  });

  return Object.values(preparedData)
    .filter(({ parent }) => !parent)
    .sort(({ order: orderA }, { order: orderB }) => orderA > orderB ? 1 : -1);
}

import { deepCopy, extractFileMeta, formUID } from "../utils";

/**
* @param {File[]} files
* @param {object} groups
* @returns {object}
*/
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

/**
* @param {object} data
* @returns {object}
*/
export function attributeAdapter(data) {
  var attributes = deepCopy(data.attributes);

  attributes.forEach((el) => {
    var parent = attributes.find(({ id }) => el.parent === id);
    if (parent) {
      parent.children
        ? parent.children[0].attributes.push(...el.attributes)
        : parent.children = [el];
    }
  });

  return {
    ...data,
    preparedAttributes: attributes.filter(({ parent }) => !parent)
  };
}

/**
* @param {{uid: string, attributes: object[] }[]} data
* @returns {object}
*/
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

/**
* @param {{
* author_id: number,
* author__username: string,
* file_type: string,
* status: string,
* count: number
* }[]} data
* @returns {{id: number, name: string, type: object}[]}
*/
export function userStatsAdapter(data) {
  var preparedData = data.reduce((acc, item) => {
    var {
      author_id: id,
      author__username: name,
      file_type: type,
      status,
      count
    } = item;

    status = status || 'v';
    type = type || "no data";

    var target = acc[id];

    if (!target) acc[id] = { id, name, [status]: { [type]: count } };
    else if (target[status]) {
      var prevCount = target[status][type];
      target[status][type] = prevCount ? prevCount + count : count;
    }
    else target[status] = { [type]: count };

    return acc;
  }, {});

  return Object.values(preparedData);
}

/**
* @param {{
* name: string,
* order: number,
* attribute__id: number,
* attribute__name: string,
* attribute__parent: number,
* attribute__attributegroup__file__file_type: string
* attribute__attributegroup__file__status: string
* count: number
* }[]} data
* @returns {{
* id: number,
* levelName: string,
* name: string,
* parent: number,
* order: number,
* status: object
* }[]}
*/
export function attributeStatsAdapter(data) {
  const preparedData = data.reduce((acc, item) => {
    var {
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

    var target = acc[id];

    if (!target) {
      acc[id] = { id, levelName, name, parent, order, [status]: { [type]: count } };
    }
    else if (target[status]) {
      var prevCount = target[status][type];
      target[status][type] = prevCount ? prevCount + count : count;
    }
    else target[status] = { [type]: count };

    return acc;
  }, {});

  Object.values(preparedData).forEach((el) => {
    var parent = Object.values(preparedData).find(({ id }) => el.parent === id);
    if (parent) parent.children
      ? parent.children.push(el)
      : parent.children = [el];
  });

  return Object.values(preparedData)
    .filter(({ parent }) => !parent)
    .sort(({ order: orderA }, { order: orderB }) => orderA > orderB ? 1 : -1);
}

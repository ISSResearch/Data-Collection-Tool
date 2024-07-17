import { deepCopy, extractFileMeta, formUID } from "../utils";

/**
* @param {File[]} files
* @param {object} groups
* @returns {object}
*/
export const inputFilesAdapter = (files, groups) => {
  return files.reduce((acc, file) => {
    acc[formUID()] = {
      file,
      blob: URL.createObjectURL(file),
      attributeGroups: deepCopy(groups || {}),
      ...extractFileMeta(file)
    };
    return acc;
  }, {});
};

/**
* @param {object} data
* @returns {object}
*/
export const attributeAdapter = (data) => {
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
};

/**
* @param {{uid: string, attributes: object[] }[]} data
* @returns {object}
*/
export const attributeGroupsAdapter = (data) => {
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
};

import { deepCopy, extractFileMeta, formUID } from "../utils";

/**
* @param {number | null} size
* @returns {string}
*/
export const formatSize = (size) => {
  if (isNaN(size) || size === null) return "";

  var formatNames = [" kb", " mb", " gb", " tb"];

  for (let i = formatNames.length; i > 0; i--) {
    var A = 1024 ** i;
    var R = (size / A);
    if (R >= 1.) return R.toFixed(2) + formatNames[i - 1];
  }

  return size + " b";
};

/**
* @param {object} data
* @returns {string}
*/
export const formatFilterJSON = (data) => {
  var res = "";

  for (let key in data) {
    var val = data[key];
    var skipKey = false;
    var addValue;

    switch (typeof val) {
      case "boolean": {
        skipKey = !val;
        break;
      }
      case "object": {
        if (Array.isArray(val)) {
          if (val.length) {
            addValue = "[";
            for (let v of val) { addValue += v; addValue += ", "; }
            addValue = addValue.slice(0, addValue.length - 2);
            addValue += "]";
          }
          else addValue = "all";
        }
        else addValue = formatFilterJSON(val);
        break;
      }
      default: addValue = val;
    }

    if (!skipKey) {
      res += key;
      res += ": ";
      if (addValue) {
        res += addValue;
        res += ", ";
      }
    }
  }

  return res.slice(0, res.length - 2);
};

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

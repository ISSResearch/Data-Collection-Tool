import { TYPES_MAP } from "../config/settings";

/**
* @param {object} File
* @param {string} File.type
* @param {string} File.name
* @returns {{name: string, extension: string, type: string}}
*/
export function extractFileMeta({ type: fileType, name: fileName }) {
  var [typeName, typeExt] = fileType.split('/');
  var nameSplit = fileName.split('.');

  var extension;
  if (nameSplit.length > 1) {
    var nameExt = nameSplit.pop();
    extension = typeExt || nameExt;
  }
  else extension = typeExt || '';

  var name = nameSplit.join('');
  var type = typeName || TYPES_MAP[extension] || "";

  return { name, extension, type };
}

/** @returns {string} */
export function getOriginDomain() {
  var { origin } = window.location;
  return origin.split(':', 2).join(':');
}

/**
* @param {any} obj
* @returns {any}
*/
export function deepCopy(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  var isArray = Array.isArray(obj);
  return (isArray ? obj : Object.entries(obj))
    .reduce((acc, item) => {
      isArray ? acc.push(deepCopy(item)) : acc[item[0]] = deepCopy(item[1]);
      return acc;
    }, isArray ? [] : {});
}

/**
* @param {object[]} arr
* @param {(string | number)[]} indexes
* @param {number} pointer
* @returns {object}
*/
export function deepFind(arr, indexes, pointer = 0) {
  return pointer < indexes.length - 1
    ? deepFind(arr[indexes[pointer]].children, indexes, pointer + 1)
    : arr[indexes[pointer]];
}

/**
* @param {object[]} node
* @param {string} parentPath
* @param {number} changeIndex
* @returns {void}
*/
export function refreshPath(node, parentPath = null, changeIndex = null) {
  node.forEach((item, index) => {
    if (changeIndex && index < changeIndex) return;

    var newPath = (parentPath || item.path).split('_');

    if (parentPath) newPath.push(String(index));
    else newPath[newPath.length - 1] = String(index);

    item.path = newPath.join('_');

    if (item.children?.length) refreshPath(item.children, item.path);
  });
}

/** @returns {number} */
export function formUID() {
  var uid = Math.random().toFixed(16).slice(2);
  if (uid[0] === "0") uid += "0";
  return Number(uid);
}

/**
* @param {object[]} items
* @returns {object[]}
*/
export function findRequired(items) {
  var requiredItems = [];
  var stack = [...items];
  while (stack.length) {
    var checkItem = stack.pop();
    if (checkItem.required) requiredItems.push(
      { ...checkItem, attributes: checkItem.attributes.map(({ id }) => id) }
    );
    if (checkItem.children?.length) stack.push(...checkItem.children);
  }
  return requiredItems;
}

/**
* @param {string} fileName
* @param {object[]} missedItems
* @returns {{ isValid: boolean, message?:string }}
*/
export function formError(fileName, missedItems) {
  if (!missedItems.length) return { isValid: true };

  var missedNames = missedItems.map(({ name }) => name).join(', ');
  return {
    isValid: false,
    message: `File "${fileName}" is missing required attributes: ${missedNames}.`
  };
}

/**
* @param {object} data
* @param {boolean} refresh
* @returns {object[]}
*/
export function spreadChildren(data, refresh = true) {
  if (refresh) refreshPath(data);

  var stack = [data];
  var result = [];

  while (stack.length) {
    var current = stack.pop();
    result.push(...current);
    stack.push(
      ...current
        .filter(({ children }) => children?.length)
        .map(({ children }) => children)
    );
  }
  return result;
}

/**
* @param {object[]} items
* @param {string} lookUpKey
* @param {string} lookUpVal
* @param {string} replaceWith
* @param {boolean} head
* @returns {void}
*/
export function traverseWithReplace(
  items,
  lookUpKey,
  lookUpVal,
  replaceWith,
  head=true
) {
  items.forEach((item) => {
    if (item[lookUpKey] === lookUpVal) item[lookUpKey] = replaceWith;
    if (item.children && !head) traverseWithReplace(
      item.children,
      lookUpKey,
      lookUpVal,
      replaceWith,
    );
  });
}

/**
* @param {object[]} items
* @param {number} parentOrder
* @returns {void}
*/
export function drawPaths(items, parentOrder=0) {
  items.forEach((item, index) => {
    var { children } = item;
    item.order = (parentOrder * 10) + (index + 1);
    if (children) drawPaths(item.children, item.order);
  });
}

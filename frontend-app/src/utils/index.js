import { TYPES_MAP } from "../config/settings";

export function extractFileMeta({ type: fileType, name: fileName }) {
  var [typeName, typeExt] = fileType.split('/');
  var nameSplit = fileName.split('.');

  var extension;
  if (nameSplit.length > 1) {
    var nameExt = nameSplit.pop()
    extension = typeExt || nameExt;
  }
  else extension = typeExt || '';

  var name = nameSplit.join('');
  var type = typeName || TYPES_MAP[extension] || "";

  return { name, extension, type };
}

export function getOriginDomain() {
  var { origin } = window.location;
  return origin.split(':', 2).join(':');
}

export function deepCopy(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  var isArray = Array.isArray(obj);
  return (isArray ? obj : Object.entries(obj))
    .reduce((acc, item) => {
      isArray ? acc.push(deepCopy(item)) : acc[item[0]] = deepCopy(item[1]);
      return acc;
    }, isArray ? [] : {});
}

export function deepFind(arr, indexes, pointer = 0) {
  return pointer < indexes.length - 1
    ? deepFind(arr[indexes[pointer]].children, indexes, pointer + 1)
    : arr[indexes[pointer]];
}

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

export function formUID() { return Number(Math.random().toFixed(16).slice(2)); }

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

export function formError(fileName, missedItems) {
  if (!missedItems.length) return { isValid: true };

  var missedNames = missedItems.map(({ name }) => name).join(', ');
  return {
    isValid: false,
    message: `File "${fileName}" is missing required attributes: ${missedNames}.`
  };
}

export function spreadChildren(data, refresh = true) {
  if (refresh) refreshPath(data);
  const stack = [data];
  const result = [];
  while (stack.length) {
    const current = stack.pop();
    result.push(...current);
    stack.push(
      ...current
        .filter(({ children }) => children?.length)
        .map(({ children }) => children)
    );
  }
  return result;
}

export function traverseWithReplace(
  items,
  lookUpKey,
  lookUpVal,
  replaceWith,
  head=true
) {
  items.forEach(item => {
    if (item[lookUpKey] === lookUpVal) item[lookUpKey] = replaceWith;
    if (item.children && !head) traverseWithReplace(
      item.children,
      lookUpKey,
      lookUpVal,
      replaceWith
    );
  });
}

export function drawPaths(items, parentOrder=0) {
  items.forEach((item, index) => {
    var { children } = item;
    item.order = (parentOrder * 10) + (index + 1);
    if (children) drawPaths(item.children, item.order);
  });
}

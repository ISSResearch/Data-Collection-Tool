export function deepCopy(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  const res = Array.isArray(obj) ? [] : {};
  if (Array.isArray(obj)) {
    for (let i=0; i < obj.length; i++) {
      res[i] = typeof obj[i] === 'object' ? deepCopy(obj[i]) : obj[i];
    }
  }
  else {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        res[key] = typeof obj[key] === 'object' ? deepCopy(obj[key]) : obj[key];
      }
    }
  }
  return res;
}

export function deepFind(arr, indexes, pointer=0) {
	return pointer < indexes.length - 1
    ? deepFind(arr[indexes[pointer]].children, indexes, pointer + 1)
    : arr[indexes[pointer]];
}

export function refreshPath(node, parentPath=null, changeIndex=null) {
  node.forEach((item, index) => {
    if (changeIndex && index < changeIndex) return;
    const newPath = (parentPath || item.path).split('_');
    if (parentPath) newPath.push(String(index));
    else newPath[newPath.length - 1] = String(index);
    item.path = newPath.join('_');
    if(item.children.length) refreshPath(item.children, item.path);
  });
}

// TODO: refactor
export function formApplyOption(attrs, fileAttrs) {
  if (!attrs?.length || !fileAttrs?.length) return [];
  const applyOptions = [];
  const lookUpAttrs = deepCopy(attrs);
  fileAttrs.forEach( lookUpdId => {
    for (const index in lookUpAttrs) {
      const {children, attributes, selectIndex} = lookUpAttrs[index];
      if (children) lookUpAttrs.push(
        ...children.map( child => {
          child.selectIndex = selectIndex || index;
          return child;
        })
      );
      const lookUpChild = attributes?.find(({id}) => id === lookUpdId);
      if (lookUpChild) {
        applyOptions[selectIndex || index]
          ? applyOptions[selectIndex || index].push([lookUpdId, children])
          : applyOptions[selectIndex || index] = [[lookUpdId, children]];
        break;
      }
    }
  });
  return applyOptions;
}

export function compareArrays(arr1, arr2) {
  return arr1.length === arr2.length
    && arr1.every((value, index) => value === arr2[index]);
}

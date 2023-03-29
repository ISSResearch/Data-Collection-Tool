export function deepCopy(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  let result = Array.isArray(obj) ? [] : {}
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (typeof obj[i] === 'object') result[i] = deepCopy(obj[i]);
      else result[i] = obj[i];
    }
  }
  else {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'object') result[key] = deepCopy(obj[key]);
        else result[key] = obj[key];
      }
    }
  }
  return result;
}

export function deepFind(arr, indexes, pointer=0) {
	return pointer < indexes.length - 1
    ? deepFind(arr[indexes[pointer]].children, indexes, pointer+1)
    : arr[indexes[pointer]];
}

export function createAttributesTree(data) {
  const attributes = deepCopy(data);
  attributes.forEach(el => {
    const parent = attributes.find(({id}) => el.parent === id);
    if (parent) parent.children ? parent.children.push(el) : parent.children = [el];
  })
  return attributes.filter(({parent}) => !parent);
}

export function refreshPath(node, parentPath=null, changeIndex=null) {
  node.forEach((item, index) => {
    if (changeIndex && index < changeIndex) return;
    const newPath = (parentPath || item.path).split('_');
    if (parentPath) newPath.push(String(index));
    else newPath[newPath.length - 1 ] = String(index);
    item.path = newPath.join('_');
    if(item.children.length) refreshPath(item.children, item.path);
  });
}

// TODO: refactor
export function formApplyOption(attrs, fileAttrs) {
  if (!attrs?.length || !fileAttrs?.length) return [];
  const attrsID = Array.isArray(fileAttrs[0])
    ? fileAttrs
    : fileAttrs.map(({id}) => id);
  const applyOptions = [];
  const lookUpAttrs = deepCopy(attrs);
  attrsID.forEach( lookUpdId => {
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
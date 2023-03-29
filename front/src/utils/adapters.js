import { createAttributesTree } from "./utils";

export function attributeAdapter(data) {
  const attributesTree = createAttributesTree(data.attributes);
  return { ...data, attributes: attributesTree };
}

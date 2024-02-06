import {
  extractFileMeta,
  getOriginDomain,
  deepCopy,
  deepFind,
  refreshPath,
  findRequired,
  formError,
  spreadChildren,
  formUID,
  traverseWithReplace,
  drawPaths,
} from ".";
import {
  object_with_inner_list,
  list_with_objects,
  deep_find,
  prepared_attributes,
} from "../config/mock_data";

test("extact file meta test", () => {
  const check = (name, type) => {
    var name_ = name.split(".");
    var ext = name_.length > 1 ? name_.pop() : "";
    var [type_, ext_] = type.split("/");
    var res = extractFileMeta(new File([], name, { type }));
    expect(res).toEqual({
      name: name_.join(""),
      extension: ext_ || ext || "",
      type: type_ || "",
    });
  };
  check("test.png", "image/png");
  check("test2", "image/png");
  check("", "image/png");
  check("test3.png", "image");
  check("test4.jpg", "image/png");
  check("", "");
  check("test5.png.jpg", "image/png/jpg");
});

test("get origin domain test", () => {
  var res = getOriginDomain();
  expect(res).toBe("http://localhost");
});

test("deep copy test", () => {
  var preparedObject = deepCopy(object_with_inner_list);
  var preparedList = deepCopy(list_with_objects);

  expect(preparedObject).toEqual(object_with_inner_list);
  expect(preparedList).toEqual(list_with_objects);

  preparedObject.newAttribute = "test_data";
  preparedObject.attributes.push({ id: 111, name: "new_test" });
  preparedList.push({ id: 111, name: "new_test" });
  preparedList[0].name = "check_test";

  expect(preparedObject).not.toEqual(object_with_inner_list);
  expect(preparedObject.attributes).not.toEqual(
    object_with_inner_list.attributes,
  );
  expect(preparedList).not.toEqual(list_with_objects);
});

test("deep find test", () => {
  var path = ["1", "0", "1"];
  var target = deepFind(deep_find, path);

  expect(target).toEqual({
    id: 261,
    name: "genc2",
    parent: 259,
    orig: true,
    children: [],
    path: "1_0_1",
  });
});

test("refresh path test", () => {
  refreshPath(list_with_objects, "0", 0);
  list_with_objects.forEach(({ path }, index) =>
    expect(path).toBe("0_" + index),
  );
});

test("form uid test", () => {
  var res = formUID();
  expect(typeof res).toBe("number");
  expect(res.toString().length).toBe(16);
});

test("find required  test", () => {
  const attrs = deepCopy(prepared_attributes);
  attrs[0].children[0].required = true;
  var required = findRequired(attrs);
  expect(required).toEqual([
    {
      attributes: [265, 268, 259, 262],
      children: [
        {
          attributes: [
            { id: 267, name: "gene2", parent: 265 },
            { id: 299, name: "gene3", parent: 265 },
            { id: 270, name: "genf2", parent: 268 },
            { id: 260, name: "genc1", parent: 259 },
            { id: 261, name: "genc2", parent: 259 },
            { id: 263, name: "gena1", parent: 262 },
            { id: 264, name: "gena2", parent: 262 },
          ],
          id: 124,
          multiple: false,
          name: "gen",
          order: 0,
          parent: 122,
          project: 23,
          required: false,
          uid: 9650426937781034,
        },
      ],
      id: 122,
      multiple: null,
      name: "model",
      order: 0,
      parent: 117,
      project: 23,
      required: true,
      uid: 270544594389903,
    },
  ]);
});

test("form error test", () => {
  const attrs = deepCopy(prepared_attributes);
  attrs[0].children[0].required = true;
  var required = findRequired(attrs);
  var error = formError("filename", required);
  expect(error).toEqual({
    isValid: false,
    message: 'File "filename" is missing required attributes: model.',
  });
  expect(formError("filename", [])).toEqual({ isValid: true });
});

test("spread children test", () => {
  const preparedData = spreadChildren(deep_find);

  expect(preparedData).toEqual([
    {
      id: 246,
      name: "ford",
      parent: null,
      orig: true,
      children: [
        {
          id: 265,
          name: "exp",
          parent: 246,
          orig: true,
          children: [
            {
              id: 267,
              name: "gene2",
              parent: 265,
              orig: true,
              children: [],
              path: "0_0_0",
            },
          ],
          path: "0_0",
        },
        {
          id: 268,
          name: "f150",
          parent: 246,
          orig: true,
          children: [
            {
              id: 270,
              name: "genf2",
              parent: 268,
              orig: true,
              children: [],
              path: "0_1_0",
            },
          ],
          path: "0_1",
        },
      ],
      path: "0",
    },
    {
      id: 249,
      name: "honda",
      parent: null,
      orig: true,
      children: [
        {
          id: 259,
          name: "civ",
          parent: 249,
          orig: true,
          children: [
            {
              id: 260,
              name: "genc1",
              parent: 259,
              orig: true,
              children: [],
              path: "1_0_0",
            },
            {
              id: 261,
              name: "genc2",
              parent: 259,
              orig: true,
              children: [],
              path: "1_0_1",
            },
          ],
          path: "1_0",
        },
        {
          id: 262,
          name: "acc",
          parent: 249,
          orig: true,
          children: [
            {
              id: 263,
              name: "gena1",
              parent: 262,
              orig: true,
              children: [],
              path: "1_1_0",
            },
            {
              id: 264,
              name: "gena2",
              parent: 262,
              orig: true,
              children: [],
              path: "1_1_1",
            },
          ],
          path: "1_1",
        },
      ],
      path: "1",
    },
    {
      id: 259,
      name: "civ",
      parent: 249,
      orig: true,
      children: [
        {
          id: 260,
          name: "genc1",
          parent: 259,
          orig: true,
          children: [],
          path: "1_0_0",
        },
        {
          id: 261,
          name: "genc2",
          parent: 259,
          orig: true,
          children: [],
          path: "1_0_1",
        },
      ],
      path: "1_0",
    },
    {
      id: 262,
      name: "acc",
      parent: 249,
      orig: true,
      children: [
        {
          id: 263,
          name: "gena1",
          parent: 262,
          orig: true,
          children: [],
          path: "1_1_0",
        },
        {
          id: 264,
          name: "gena2",
          parent: 262,
          orig: true,
          children: [],
          path: "1_1_1",
        },
      ],
      path: "1_1",
    },
    {
      id: 263,
      name: "gena1",
      parent: 262,
      orig: true,
      children: [],
      path: "1_1_0",
    },
    {
      id: 264,
      name: "gena2",
      parent: 262,
      orig: true,
      children: [],
      path: "1_1_1",
    },
    {
      id: 260,
      name: "genc1",
      parent: 259,
      orig: true,
      children: [],
      path: "1_0_0",
    },
    {
      id: 261,
      name: "genc2",
      parent: 259,
      orig: true,
      children: [],
      path: "1_0_1",
    },
    {
      id: 265,
      name: "exp",
      parent: 246,
      orig: true,
      children: [
        {
          id: 267,
          name: "gene2",
          parent: 265,
          orig: true,
          children: [],
          path: "0_0_0",
        },
      ],
      path: "0_0",
    },
    {
      id: 268,
      name: "f150",
      parent: 246,
      orig: true,
      children: [
        {
          id: 270,
          name: "genf2",
          parent: 268,
          orig: true,
          children: [],
          path: "0_1_0",
        },
      ],
      path: "0_1",
    },
    {
      id: 270,
      name: "genf2",
      parent: 268,
      orig: true,
      children: [],
      path: "0_1_0",
    },
    {
      id: 267,
      name: "gene2",
      parent: 265,
      orig: true,
      children: [],
      path: "0_0_0",
    },
  ]);
});

test("traverse with replace test", () => {
  var items = [
    {
      name: "make",
      children: [{ name: "model", children: [{ name: "gen" }] }],
    },
  ];

  traverseWithReplace(items, "name", "model", "model_replaced");
  expect(items).toEqual([
    {
      name: "make",
      children: [{ name: "model", children: [{ name: "gen" }] }],
    },
  ]);

  traverseWithReplace(items, "name", "model", "model_replaced", false);
  expect(items).toEqual([
    {
      name: "make",
      children: [{ name: "model_replaced", children: [{ name: "gen" }] }],
    },
  ]);
});

test("draw path test", () => {
  var items = [
    {
      name: "make",
      children: [{ name: "model", children: [{ name: "gen" }] }],
    },
  ];
  drawPaths(items);

  expect(items).toEqual([
    {
      children: [
        {
          children: [{ name: "gen", order: 111 }],
          name: "model",
          order: 11,
        },
      ],
      name: "make",
      order: 1,
    },
  ]);

  drawPaths(items, 2);
  expect(items).toEqual([
    {
      children: [
        {
          children: [{ name: "gen", order: 2111 }],
          name: "model",
          order: 211,
        },
      ],
      name: "make",
      order: 21,
    },
  ]);
});

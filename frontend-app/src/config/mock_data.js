export const object_with_inner_list = {
  id: 122,
  attributes: [
    { id: 259, name: "civ", parent: 249 },
    { id: 262, name: "acc", parent: 249 },
    { id: 265, name: "exp", parent: 246 },
    { id: 268, name: "f150", parent: 246 },
  ],
  uid: 270544594389903,
  name: "model",
  multiple: null,
  required: null,
  order: 0,
  parent: 117,
  project: 23,
};

export const list_with_objects = [
  { id: 260, name: "genc1", parent: 259 },
  { id: 261, name: "genc2", parent: 259 },
  { id: 263, name: "gena1", parent: 262 },
  { id: 264, name: "gena2", parent: 262 },
  { id: 267, name: "gene2", parent: 265 },
  { id: 270, name: "genf2", parent: 268 },
];

export const deep_find = [
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
];

export const prepared_attributes = [
  {
    id: 117,
    attributes: [
      { id: 246, name: "ford", parent: null },
      { id: 249, name: "honda", parent: null },
    ],
    uid: 8912704984600777,
    name: "make",
    multiple: null,
    required: null,
    order: 0,
    parent: null,
    project: 23,
    children: [
      {
        id: 122,
        attributes: [
          { id: 265, name: "exp", parent: 246 },
          { id: 268, name: "f150", parent: 246 },
          { id: 259, name: "civ", parent: 249 },
          { id: 262, name: "acc", parent: 249 },
        ],
        uid: 270544594389903,
        name: "model",
        multiple: null,
        required: false,
        order: 0,
        parent: 117,
        project: 23,
        children: [
          {
            id: 124,
            attributes: [
              { id: 267, name: "gene2", parent: 265 },
              { id: 299, name: "gene3", parent: 265 },
              { id: 270, name: "genf2", parent: 268 },
              { id: 260, name: "genc1", parent: 259 },
              { id: 261, name: "genc2", parent: 259 },
              { id: 263, name: "gena1", parent: 262 },
              { id: 264, name: "gena2", parent: 262 },
            ],
            uid: 9650426937781034,
            name: "gen",
            multiple: false,
            required: false,
            order: 0,
            parent: 122,
            project: 23,
          },
        ],
      },
    ],
  },
  {
    id: 125,
    attributes: [
      { id: 271, name: "front", parent: null },
      { id: 272, name: "back", parent: null },
      { id: 273, name: "side", parent: null },
    ],
    uid: 3450746049982607,
    name: "views",
    multiple: true,
    required: false,
    order: 1,
    parent: null,
    project: 23,
  },
  {
    id: 138,
    attributes: [
      { id: 286, name: "red", parent: null },
      { id: 287, name: "green2", parent: null },
      { id: 288, name: "blu", parent: null },
    ],
    uid: 2287956584533728,
    name: "Color",
    multiple: null,
    required: false,
    order: 2,
    parent: null,
    project: 23,
    children: [
      {
        id: 176,
        attributes: [],
        uid: 1955930766757758,
        name: "x",
        multiple: false,
        required: false,
        order: 2,
        parent: 138,
        project: 23,
      },
    ],
  },
];

export const raw_project = {
  id: 23,
  name: "normal nn",
  description: 'normal<br><b style="color: red;">description</b>',
  attributes: [
    {
      id: 117,
      attributes: [
        {
          id: 246,
          name: "ford",
          parent: null,
        },
        {
          id: 249,
          name: "honda",
          parent: null,
        },
      ],
      uid: 8912704984600777,
      name: "make",
      multiple: null,
      required: null,
      order: 0,
      parent: null,
      project: 23,
    },
    {
      id: 122,
      attributes: [
        {
          id: 265,
          name: "exp",
          parent: 246,
        },
        {
          id: 268,
          name: "f150",
          parent: 246,
        },
        {
          id: 259,
          name: "civ",
          parent: 249,
        },
        {
          id: 262,
          name: "acc",
          parent: 249,
        },
      ],
      uid: 270544594389903,
      name: "model",
      multiple: null,
      required: false,
      order: 0,
      parent: 117,
      project: 23,
    },
    {
      id: 124,
      attributes: [
        {
          id: 267,
          name: "gene2",
          parent: 265,
        },
        {
          id: 299,
          name: "gene3",
          parent: 265,
        },
        {
          id: 270,
          name: "genf2",
          parent: 268,
        },
        {
          id: 260,
          name: "genc1",
          parent: 259,
        },
        {
          id: 261,
          name: "genc2",
          parent: 259,
        },
        {
          id: 263,
          name: "gena1",
          parent: 262,
        },
        {
          id: 264,
          name: "gena2",
          parent: 262,
        },
      ],
      uid: 9650426937781034,
      name: "gen",
      multiple: false,
      required: false,
      order: 0,
      parent: 122,
      project: 23,
    },
    {
      id: 125,
      attributes: [
        {
          id: 271,
          name: "front",
          parent: null,
        },
        {
          id: 272,
          name: "back",
          parent: null,
        },
        {
          id: 273,
          name: "side",
          parent: null,
        },
      ],
      uid: 3450746049982607,
      name: "views",
      multiple: true,
      required: false,
      order: 1,
      parent: null,
      project: 23,
    },
    {
      id: 138,
      attributes: [
        {
          id: 286,
          name: "red",
          parent: null,
        },
        {
          id: 287,
          name: "green2",
          parent: null,
        },
        {
          id: 288,
          name: "blu",
          parent: null,
        },
      ],
      uid: 2287956584533728,
      name: "Color",
      multiple: null,
      required: false,
      order: 2,
      parent: null,
      project: 23,
    },
    {
      id: 176,
      attributes: [],
      uid: 1955930766757758,
      name: "x",
      multiple: false,
      required: false,
      order: 2,
      parent: 138,
      project: 23,
    },
  ],
  permissions: {
    upload: false,
    view: false,
    validate: false,
    stats: false,
    download: false,
    edit: false,
  },
};

export const raw_file_attributes = [
  {
    uid: "5738e31f-c43a-4195-b1c2-ea513424a309",
    attributes: [
      [249, 0, "honda"],
      [259, 0, "civ"],
      [260, 0, "genc1"],
      [271, 1, "front"],
    ],
  },
];

export const raw_attribute_stats = [
  {
    name: "make",
    order: 0,
    attribute__id: 246,
    attribute__name: "ford",
    attribute__parent: null,
    attribute__attributegroup__file__file_type: "image",
    attribute__attributegroup__file__status: "a",
    count: 2,
  },
  {
    name: "make",
    order: 0,
    attribute__id: 246,
    attribute__name: "ford",
    attribute__parent: null,
    attribute__attributegroup__file__file_type: "image",
    attribute__attributegroup__file__status: "",
    count: 10,
  },
  {
    name: "make",
    order: 0,
    attribute__id: 246,
    attribute__name: "ford",
    attribute__parent: null,
    attribute__attributegroup__file__file_type: "image",
    attribute__attributegroup__file__status: "d",
    count: 1,
  },
  {
    name: "make",
    order: 0,
    attribute__id: 246,
    attribute__name: "ford",
    attribute__parent: null,
    attribute__attributegroup__file__file_type: "video",
    attribute__attributegroup__file__status: "",
    count: 1,
  },
  {
    name: "make",
    order: 0,
    attribute__id: 246,
    attribute__name: "ford",
    attribute__parent: null,
    attribute__attributegroup__file__file_type: "video",
    attribute__attributegroup__file__status: "d",
    count: 1,
  },
  {
    name: "model",
    order: 0,
    attribute__id: 265,
    attribute__name: "exp",
    attribute__parent: 246,
    attribute__attributegroup__file__file_type: "image",
    attribute__attributegroup__file__status: "a",
    count: 1,
  },
  {
    name: "model",
    order: 0,
    attribute__id: 268,
    attribute__name: "f150",
    attribute__parent: 246,
    attribute__attributegroup__file__file_type: "image",
    attribute__attributegroup__file__status: "",
    count: 1,
  },
  {
    name: "model",
    order: 0,
    attribute__id: 268,
    attribute__name: "f150",
    attribute__parent: 246,
    attribute__attributegroup__file__file_type: "image",
    attribute__attributegroup__file__status: "a",
    count: 1,
  },
  {
    name: "gen",
    order: 0,
    attribute__id: 267,
    attribute__name: "gene2",
    attribute__parent: 265,
    attribute__attributegroup__file__file_type: "image",
    attribute__attributegroup__file__status: "a",
    count: 1,
  },
  {
    name: "gen",
    order: 0,
    attribute__id: 270,
    attribute__name: "genf2",
    attribute__parent: 268,
    attribute__attributegroup__file__file_type: "image",
    attribute__attributegroup__file__status: "",
    count: 1,
  },
  {
    name: "gen",
    order: 0,
    attribute__id: 270,
    attribute__name: "genf2",
    attribute__parent: 268,
    attribute__attributegroup__file__file_type: "image",
    attribute__attributegroup__file__status: "a",
    count: 1,
  },
  {
    name: "views",
    order: 1,
    attribute__id: 271,
    attribute__name: "front",
    attribute__parent: null,
    attribute__attributegroup__file__file_type: "image",
    attribute__attributegroup__file__status: "d",
    count: 1,
  },
  {
    name: "views",
    order: 1,
    attribute__id: 272,
    attribute__name: "back",
    attribute__parent: null,
    attribute__attributegroup__file__file_type: "image",
    attribute__attributegroup__file__status: "",
    count: 1,
  },
  {
    name: "views",
    order: 1,
    attribute__id: 271,
    attribute__name: "front",
    attribute__parent: null,
    attribute__attributegroup__file__file_type: "image",
    attribute__attributegroup__file__status: "",
    count: 1,
  },
  {
    name: "Color",
    order: 2,
    attribute__id: 287,
    attribute__name: "green",
    attribute__parent: null,
    attribute__attributegroup__file__file_type: "image",
    attribute__attributegroup__file__status: "a",
    count: 1,
  },
  {
    name: "Color",
    order: 2,
    attribute__id: 286,
    attribute__name: "red",
    attribute__parent: null,
    attribute__attributegroup__file__file_type: null,
    attribute__attributegroup__file__status: null,
    count: 0,
  },
];

export const prepared_attribute_stats = [
  {
    id: 246,
    levelName: "make",
    name: "ford",
    parent: null,
    order: 0,
    a: { image: 2 },
    v: { image: 10, video: 1 },
    d: { image: 1, video: 1 },
    children: [
      {
        id: 265,
        levelName: "model",
        name: "exp",
        parent: 246,
        order: 0,
        a: { image: 1 },
        children: [
          {
            id: 267,
            levelName: "gen",
            name: "gene2",
            parent: 265,
            order: 0,
            a: { image: 1 },
          },
        ],
      },
      {
        id: 268,
        levelName: "model",
        name: "f150",
        parent: 246,
        order: 0,
        v: { image: 1 },
        a: { image: 1 },
        children: [
          {
            id: 270,
            levelName: "gen",
            name: "genf2",
            parent: 268,
            order: 0,
            v: { image: 1 },
            a: { image: 1 },
          },
        ],
      },
    ],
  },
  {
    id: 272,
    levelName: "views",
    name: "back",
    parent: null,
    order: 1,
    v: { image: 1 },
  },
  {
    id: 271,
    levelName: "views",
    name: "front",
    parent: null,
    order: 1,
    d: { image: 1 },
    v: { image: 1 },
  },
  {
    id: 287,
    levelName: "Color",
    name: "green",
    parent: null,
    order: 2,
    a: { image: 1 },
  },
  {
    id: 286,
    levelName: "Color",
    name: "red",
    parent: null,
    order: 2,
    v: { "no data": 0 },
  },
];

export const raw_files = [
  {
    id: 748,
    attributes: [
      {
        uid: "99610f4b-724a-4175-a580-740b5f8559a5",
        attributes: [
          [246, 0, "ford"],
          [271, 1, "front"],
        ],
      },
    ],
    author_name: "admin",
    file_name: "file1.png",
    file_type: "video",
    path: "/app/file_store/23/file1.png",
    status: "a",
    upload_date: "2023-06-08T19:39:54.304997Z",
    is_downloaded: true,
  },
  {
    id: 745,
    attributes: [
      {
        uid: "6c541438-762e-4e7b-b89c-b6f58eae740b",
        attributes: [
          [246, 0, "ford"],
          [271, 1, "front"],
        ],
      },
    ],
    author_name: "admin",
    file_name: "file2.png",
    file_type: "image",
    path: "/app/file_store/23/file2.png",
    status: "",
    upload_date: "2023-06-08T19:39:53.905602Z",
    is_downloaded: false
  },
];

export const prepared_files = [
  {
    id: 748,
    attributes: [
      {
        uid: "99610f4b-724a-4175-a580-740b5f8559a5",
        attributes: [
          [246, 0, "ford"],
          [271, 1, "front"],
        ],
      },
    ],
    author_name: "admin",
    file_name: "file1.png",
    file_type: "video",
    path: "/app/file_store/23/file1.png",
    status: "a",
    upload_date: "2023-06-08T19:39:54.304997Z",
    is_downloaded: true,
    attributeGroups: {
      "99610f4b-724a-4175-a580-740b5f8559a5": {
        0: [246],
        1: [271],
      },
    },
  },
  {
    id: 745,
    attributes: [
      {
        uid: "6c541438-762e-4e7b-b89c-b6f58eae740b",
        attributes: [
          [246, 0, "ford"],
          [271, 1, "front"],
        ],
      },
    ],
    author_name: "admin",
    file_name: "file2.png",
    file_type: "image",
    path: "/app/file_store/23/file2.png",
    status: "",
    is_downloaded: false,
    upload_date: "2023-06-08T19:39:53.905602Z",
    attributeGroups: {
      "6c541438-762e-4e7b-b89c-b6f58eae740b": {
        0: [246],
        1: [271],
      },
    },
  },
];

export const raw_file = {
  id: 748,
  attributes: [
    {
      uid: "99610f4b-724a-4175-a580-740b5f8559a5",
      attributes: [[246, 0, "ford"]],
    },
  ],
  author_name: "admin",
  file_name: "blog2_copy.png",
  file_type: "image",
  path: "/app/file_store/23/blog2_copy.png",
  status: "",
  upload_date: "2023-06-08T19:39:54.304997Z",
  attributeGroups: { "99610f4b-724a-4175-a580-740b5f8559a5": { 0: [246] } },
};

export const apply_groups = {
  7607322651726802: { 0: [246, 265, 267], 1: [271] },
};

export const raw_collectors = [
  {
    id: 13,
    username: "some",
    permissions: {
      view: true,
      upload: true,
      validate: false,
      stats: false,
      download: true,
      edit: false,
    },
  },
  {
    id: 12,
    username: "test",
    permissions: {
      view: false,
      upload: false,
      validate: false,
      stats: false,
      download: false,
      edit: false,
    },
  },
];

export const raw_user_stats = [
  {
    author_id: 1,
    author__username: "admin",
    status: "a",
    file_type: "image",
    count: 6,
  },
  {
    author_id: 1,
    author__username: "admin",
    status: "d",
    file_type: "video",
    count: 1,
  },
  {
    author_id: 1,
    author__username: "admin",
    status: "",
    file_type: "image",
    count: 25,
  },
  {
    author_id: 1,
    author__username: "admin",
    file_type: "video",
    count: 2,
  },
  {
    author_id: 14,

    author__username: "some2",
    status: "a",
    file_type: "image",
    count: 1,
  },
];

export const prepared_user_stats = [
  {
    id: 1,
    name: "admin",
    a: { image: 6 },
    d: { video: 1 },
    v: { image: 25, video: 2 },
  },
  { id: 14, name: "some2", a: { image: 1 } },
];

export const upload_files = [
  {
    file: {size: 1024*1024*4, slice: () => [1]},
    blob: "blob:http://localhost:3000/330b8b6c-a932-451d-b92d-19d08cfbaa8f",
    attributeGroups: {
      7298125106168143: { 0: [246, 265, 267], 1: [271, 272, 273], 2: [286] },
    },
    name: "blog1",
    extension: "png",
    type: "image",
    atrsGroups: [[246, 265, 267, 271, 272, 273, 286]],
  },
  {
    file: {size: 1024*1024*4*4, slice: () => [2]},
    blob: "blob:http://localhost:3000/d2e2c9a1-39af-4d4f-9d24-9ee9e5c64b36",
    attributeGroups: {
      7298125106168143: { 0: [246, 268, 270], 1: [272], 2: [288] },
    },
    name: "blog2",
    extension: "png",
    type: "image",
    atrsGroups: [[246, 268, 270, 272, 288]],
  },
  {
    file: {size: 1024*1024*4*4, slice: () => [3]},
    blob: "blob:http://localhost:3000/376768c8-a039-4e61-a331-3f24123c27d2",
    attributeGroups: {
      7298125106168143: { 0: [249, 259, 261], 1: [271, 273], 2: [287] },
    },
    name: "blog3",
    extension: "png",
    type: "image",
    atrsGroups: [[249, 259, 261, 271, 273, 287]],
  },
  {
    file: {size: 1024*1024*4*4, slice: () => [4]},
    blob: "blob:http://localhost:3000/d2e2c9a1-39af-4d4f-9d24-9ee9e5c64b36",
    attributeGroups: {
      7298125106168143: { 0: [246, 268, 270], 1: [272], 2: [288] },
    },
    name: "blog4",
    extension: "png",
    type: "image",
    atrsGroups: [[246, 268, 270, 272, 288]],
  },
];

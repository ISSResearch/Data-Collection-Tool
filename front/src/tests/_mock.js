export const mock_object_with_inner_list = {
  "id":122,
  "attributes": [
    { "id":259, "name": "civ", "parent": 249 },
    { "id":262, "name": "acc", "parent": 249 },
    { "id":265, "name": "exp", "parent": 246 },
    { "id":268, "name": "f150", "parent": 246 }
  ],
  "uid": 270544594389903,
  "name": "model",
  "multiple": null,
  "required": null,
  "order": 0,
  "parent": 117,
  "project": 23
};

export const mock_list_with_objects = [
  { "id": 260, "name": "genc1", "parent": 259 },
  { "id": 261, "name": "genc2", "parent": 259 },
  { "id": 263, "name": "gena1", "parent": 262 },
  { "id": 264, "name": "gena2", "parent": 262 },
  { "id": 267, "name": "gene2", "parent": 265 },
  { "id": 270, "name": "genf2", "parent": 268 }
];

export const mock_deep_find = [
  {
    "id": 246,
    "name": "ford",
    "parent": null,
    "orig": true,
    "children": [
      {
        "id": 265,
        "name": "exp",
        "parent": 246,
        "orig": true,
        "children": [
          {"id": 267, "name": "gene2", "parent": 265, "orig": true, "children": [], "path": "0_0_0"}
        ],
        "path": "0_0"
      },
      {
        "id": 268,
        "name": "f150",
        "parent": 246,
        "orig": true,
        "children": [
          {"id": 270, "name": "genf2", "parent": 268, "orig": true, "children": [], "path": "0_1_0"}
        ],
        "path":"0_1"
      }
    ],
    "path": "0"
  },
  {
    "id": 249,
    "name": "honda",
    "parent": null,
    "orig": true,
    "children": [
      {
        "id": 259,
        "name": "civ",
        "parent": 249,
        "orig": true,
        "children": [
          {"id":260, "name": "genc1", "parent": 259, "orig": true, "children": [], "path": "1_0_0"},
          {"id": 261, "name": "genc2", "parent": 259, "orig": true, "children": [], "path": "1_0_1"}
        ],
        "path": "1_0"
      },
      {
        "id": 262,
        "name": "acc",
        "parent": 249,
        "orig": true,
        "children": [
          {"id": 263, "name": "gena1", "parent": 262, "orig": true, "children": [], "path": "1_1_0"},
          {"id": 264, "name": "gena2", "parent": 262, "orig": true, "children": [], "path": "1_1_1"}
        ],
        "path": "1_1"
      }
    ],
    "path":"1"
  }
];

export const mock_prepared_attributes = [
  {
    "id": 117,
    "attributes": [
      {"id": 246, "name": "ford", "parent":null},
      {"id": 249, "name": "honda", "parent":null}]
    ,
    "uid": 8912704984600777,
    "name": "make",
    "multiple": null,
    "required": null,
    "order": 0,
    "parent": null,
    "project": 23,
    "children": [
      {
        "id": 122,
        "attributes": [
          {"id":259,"name":"civ","parent":249},
          {"id":262,"name":"acc","parent":249},
          {"id":265,"name":"exp","parent":246},
          {"id":268,"name":"f150","parent":246}
        ],
        "uid": 270544594389903,
        "name": "model",
        "multiple": null,
        "required": true,
        "order": 0,
        "parent": 117,
        "project": 23,
        "children": [
          {
            "id": 124,
            "attributes": [
              {"id": 260, "name": "genc1", "parent": 259},
              {"id": 261, "name": "genc2", "parent": 259},
              {"id": 263, "name": "gena1", "parent": 262},
              {"id": 264, "name": "gena2", "parent": 262},
              {"id": 267, "name": "gene2", "parent": 265},
              {"id": 270, "name": "genf2", "parent": 268}
            ],
            "uid": 9650426937781034,
            "name": "gen",
            "multiple": false,
            "required": true,
            "order": 0,
            "parent": 122,
            "project": 23
          }
        ]
      }
    ]
  },
  {
    "id": 125,
    "attributes": [
      {"id": 271, "name": "front", "parent": null},
      {"id": 272, "name": "back", "parent": null},
      {"id": 273, "name": "side", "parent": null}
    ],
    "uid": 3450746049982607,
    "name": "views",
    "multiple": true,
    "required": false,
    "order": 0,
    "parent": null,
    "project": 23
  }
];

export const mock_raw_project = {
  "id": 23,
  permissions: {
    'upload': false,
    'validate': false,
    'stats': false,
    'download': false,
    'edit': false,
  },
  "attributes": [
    {
      "id": 117,
      "attributes": [
        {"id": 246, "name": "ford", "parent": null},
        {"id": 249, "name": "honda", "parent": null}
      ],
      "uid": 8912704984600777,
      "name": "make",
      "multiple": null,
      "required": null,
      "order": 0,
      "parent": null,
      "project": 23
    },
    {
      "id": 122,
      "attributes": [
        {"id": 259, "name": "civ", "parent": 249},
        {"id": 262, "name": "acc", "parent": 249},
        {"id": 265, "name": "exp", "parent": 246},
        {"id": 268, "name": "f150", "parent": 246}
      ],
      "uid": 270544594389903,
      "name": "model",
      "multiple": null,
      "required": true,
      "order": 0,
      "parent": 117,
      "project": 23
    },
    {
      "id": 124,
      "attributes": [
        {"id": 260, "name": "genc1", "parent": 259},
        {"id": 261, "name": "genc2", "parent": 259},
        {"id": 263, "name": "gena1", "parent": 262},
        {"id": 264, "name": "gena2", "parent": 262},
        {"id": 267, "name": "gene2", "parent": 265},
        {"id": 270, "name": "genf2", "parent": 268}
      ],
      "uid": 9650426937781034,
      "name": "gen",
      "multiple": false,
      "required": true,
      "order": 0,
      "parent": 122,
      "project":23
    },
    {
      "id": 125,
      "attributes": [
        {"id": 271, "name": "front", "parent": null},
        {"id": 272, "name": "back", "parent": null},
        {"id": 273, "name": "side", "parent": null}
      ],
      "uid": 3450746049982607,
      "name": "views",
      "multiple": true,
      "required": false,
      "order": 0,
      "parent": null,
      "project": 23
    }
  ],
  "name": "normal name",
  "description": "normal description",
  "created_at": "2023-05-24T22:46:52.120607Z",
  "visible": true,
  "reason_if_hidden": ""
}

export const mock_raw_file_attributes = [
  {
    "uid": "5738e31f-c43a-4195-b1c2-ea513424a309",
    "attributes": [
      [249, 0, "honda"],
      [259, 0, "civ"],
      [260, 0, "genc1"],
      [271, 1,"front"]
    ]
  }
]

export const mock_raw_stats = [
  {
    name: "make",
    'order': 0,
    attribute__id: 246,
    attribute__name: "ford",
    attribute__parent: null,
    attribute__attributegroup__file__file_type: "image",
    attribute__attributegroup__file__status: "a",
    count: 2,
  },
  {
    name: "make",
    'order': 0,
    attribute__id: 246,
    attribute__name: "ford",
    attribute__parent: null,
    attribute__attributegroup__file__file_type: "image",
    attribute__attributegroup__file__status: "",
    count: 10,
  },
  {
    name: "make",
    'order': 0,
    attribute__id: 246,
    attribute__name: "ford",
    attribute__parent: null,
    attribute__attributegroup__file__file_type: "image",
    attribute__attributegroup__file__status: "d",
    count: 1,
  },
  {
    name: "make",
    'order': 0,
    attribute__id: 246,
    attribute__name: "ford",
    attribute__parent: null,
    attribute__attributegroup__file__file_type: "video",
    attribute__attributegroup__file__status: "",
    count: 1,
  },
  {
    name: "make",
    'order': 0,
    attribute__id: 246,
    attribute__name: "ford",
    attribute__parent: null,
    attribute__attributegroup__file__file_type: "video",
    attribute__attributegroup__file__status: "d",
    count: 1,
  },
  {
    name: "model",
    'order': 0,
    attribute__id: 265,
    attribute__name: "exp",
    attribute__parent: 246,
    attribute__attributegroup__file__file_type: "image",
    attribute__attributegroup__file__status: "a",
    count: 1,
  },
  {
    name: "model",
    'order': 0,
    attribute__id: 268,
    attribute__name: "f150",
    attribute__parent: 246,
    attribute__attributegroup__file__file_type: "image",
    attribute__attributegroup__file__status: "",
    count: 1,
  },
  {
    name: "model",
    'order': 0,
    attribute__id: 268,
    attribute__name: "f150",
    attribute__parent: 246,
    attribute__attributegroup__file__file_type: "image",
    attribute__attributegroup__file__status: "a",
    count: 1,
  },
  {
    name: "gen",
    'order': 0,
    attribute__id: 267,
    attribute__name: "gene2",
    attribute__parent: 265,
    attribute__attributegroup__file__file_type: "image",
    attribute__attributegroup__file__status: "a",
    count: 1,
  },
  {
    name: "gen",
    'order': 0,
    attribute__id: 270,
    attribute__name: "genf2",
    attribute__parent: 268,
    attribute__attributegroup__file__file_type: "image",
    attribute__attributegroup__file__status: "",
    count: 1,
  },
  {
    name: "gen",
    'order': 0,
    attribute__id: 270,
    attribute__name: "genf2",
    attribute__parent: 268,
    attribute__attributegroup__file__file_type: "image",
    attribute__attributegroup__file__status: "a",
    count: 1,
  },
  {
    name: "views",
    'order': 1,
    attribute__id: 271,
    attribute__name: "front",
    attribute__parent: null,
    attribute__attributegroup__file__file_type: "image",
    attribute__attributegroup__file__status: "d",
    count: 1,
  },
  {
    name: "views",
    'order': 1,
    attribute__id: 272,
    attribute__name: "back",
    attribute__parent: null,
    attribute__attributegroup__file__file_type: "image",
    attribute__attributegroup__file__status: "",
    count: 1,
  },
  {
    name: "views",
    'order': 1,
    attribute__id: 271,
    attribute__name: "front",
    attribute__parent: null,
    attribute__attributegroup__file__file_type: "image",
    attribute__attributegroup__file__status: "",
    count: 1,
  },
  {
    name: "Color",
    'order': 2,
    attribute__id: 287,
    attribute__name: "green",
    attribute__parent: null,
    attribute__attributegroup__file__file_type: "image",
    attribute__attributegroup__file__status: "a",
    count: 1,
  },
  {
    name: "Color",
    'order': 2,
    attribute__id: 286,
    attribute__name: "red",
    attribute__parent: null,
    attribute__attributegroup__file__file_type: null,
    attribute__attributegroup__file__status: null,
    count: 0,
  },
];

export const mock_prepared_stats = [
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

export const mock_raw_files = [
  {
    "id": 748,
    "attributes": [
      {
        "uid": "99610f4b-724a-4175-a580-740b5f8559a5",
        "attributes": [
          [246, 0, "ford"],
          [271, 1,"front"]
        ]
      }
    ],
    "author_name": "admin",
    "file_name": "file1.png",
    "file_type": "image",
    "path": "/app/file_store/23/file1.png",
    "status":"",
    "upload_date": "2023-06-08T19:39:54.304997Z"
  },
  {
    "id": 745,
    "attributes": [
      {
        "uid": "6c541438-762e-4e7b-b89c-b6f58eae740b",
        "attributes": [
          [246, 0, "ford"],
          [271, 1,"front"]
        ]
      }
    ],
    "author_name": "admin",
    "file_name": "file2.png",
    "file_type": "image",
    "path": "/app/file_store/23/file2.png",
    "status": "",
    "upload_date": "2023-06-08T19:39:53.905602Z"
  }
];

export const mock_prepared_files = [
  {
    "id": 748,
    "attributes": [
      {
        "uid": "99610f4b-724a-4175-a580-740b5f8559a5",
        "attributes": [
          [246, 0, "ford"],
          [271, 1,"front"]
        ]
      }
    ],
    "author_name": "admin",
    "file_name": "file1.png",
    "file_type": "image",
    "path":"/app/file_store/23/file1.png",
    "status": "",
    "upload_date": "2023-06-08T19:39:54.304997Z",
    "attributeGroups": {
      "99610f4b-724a-4175-a580-740b5f8559a5": {
        0: [246],
        1: [271]
      }
    }
  },
  {
    "id": 745,
    "attributes": [
      {
        "uid": "6c541438-762e-4e7b-b89c-b6f58eae740b",
        "attributes": [
          [246, 0, "ford"],
          [271, 1,"front"]
        ]
      }
    ],
    "author_name": "admin",
    "file_name": "file2.png",
    "file_type": "image",
    "path": "/app/file_store/23/file2.png",
    "status": "",
    "upload_date": "2023-06-08T19:39:53.905602Z",
    "attributeGroups": {
      "6c541438-762e-4e7b-b89c-b6f58eae740b": {
        0: [246],
        1: [271]
      }
    }
  }
];

export const mock_raw_file = {
  "id": 748,
  "attributes": [
    {
      "uid": "99610f4b-724a-4175-a580-740b5f8559a5",
      "attributes": [[246, 0, "ford"]]
    }
  ],
  "author_name": "admin", "file_name": "blog2_copy.png",
  "file_type": "image",
  "path": "/app/file_store/23/blog2_copy.png",
  "status": "",
  "upload_date": "2023-06-08T19:39:54.304997Z",
  "attributeGroups": {"99610f4b-724a-4175-a580-740b5f8559a5": [[246]]}
}

export const mock_apply_groups = {7607322651726802: {0: [246, 265, 267], 1: [271]}};
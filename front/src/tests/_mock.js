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
      [249, null, 117, "honda"],
      [259, 249, 122, "civ"],
      [260, 259, 124, "genc1"],
      [271, null, 125,"front"]
    ]
  }
]

export const mock_raw_stats = [
  {
    "attribute__id": 246,
    "attribute__name": "ford",
    "attribute__parent": null,
    "file__status":"",
    "file__file_type": "image",
    "count": 10
  },
  {
    "attribute__id": 246,
    "attribute__name": "ford",
    "attribute__parent": null,
    "file__status": "",
    "file__file_type": "video",
    "count": 1
  },
  {
    "attribute__id": 246,
    "attribute__name": "ford",
    "attribute__parent": null,
    "file__status": "d",
    "file__file_type": "image",
    "count": 1
  },
  {
    "attribute__id": 246,
    "attribute__name": "ford",
    "attribute__parent": null,
    "file__status": "d",
    "file__file_type": "video",
    "count": 1
  },
  {
    "attribute__id": 249,
    "attribute__name": "honda",
    "attribute__parent": null,
    "file__status": "",
    "file__file_type": "image",
    "count": 1
  },
  {
    "attribute__id": 249,
    "attribute__name": "honda",
    "attribute__parent": null,
    "file__status": "d",
    "file__file_type": "image",
    "count": 1
  },
  {
    "attribute__id": 259,
    "attribute__name": "civ",
    "attribute__parent": 249,
    "file__status": "d",
    "file__file_type": "image",
    "count": 1
  },
  {
    "attribute__id": 260,
    "attribute__name": "genc1",
    "attribute__parent": 259,
    "file__status": "d",
    "file__file_type": "image",
    "count": 1
  },
  {
    "attribute__id": 271,
    "attribute__name": "front",
    "attribute__parent": null,
    "file__status": "d",
    "file__file_type": "image",
    "count": 1
  }
];
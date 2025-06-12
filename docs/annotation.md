# 🧾 Annotation
When exporting your dataset—or just annotations, a structured JSON file is generated.

It contains metadata for all files matching the current filters and their annotations—without media.

## 🧬 Example Structure

```json
[
    {
        "id": "6848a6709aeaf5eb62cf01a8",
        "related_duplicates": 0,
        "attributes": [
            {
                "uid": "f35846ca-0c7e-4120-8225-9204b054bb1a",
                "attributes": [
                    [16, 0, "type_1", ""],
                    [18, 0, "subtype_2", ""],
                    [20, 1, "r", ""]
                ]
            }
        ],
        "author_name": "Curator",
        "validator_name": "Curator",
        "file_name": "6788191feac1f1a81ab2fadd.webp",
        "file_type": "image",
        "status": "a",
        "upload_date": "2025-06-10 21:41",
        "update_date": "2025-06-10 21:41",
        "rebound_project": null,
        "rebound": null
    }
]
```

Where:
- **id** - is generated file id by which the file could be found in the system
- **related_duplicates** - number of duplicates associated to this file
- **attributes** - list of attribute (label) groups with annotated data
- **author_name** - the username of user who uploaded this file
- **validator_name** - the username of user who validated this file
- **file_name** - original file name
- **file_type** - media type (image/video)
- **status** - validation status, `a - accepted`, `d - declined`, `v - waits for validation`
- **upload_date** - file upload date
- **update_date** - file update date
- **rebound_project** - project / bucket where the file is located in case of file transfer
- **rebound** - file project / bucket (in terms of storage system)

## Accessing a file

Since the project in **wip** state there are some temprorary solutions.
We have a situation when we want to move some files to other project.
Since proper object movement is not implemented yet we could use a trick to just associate
file project to the new one but since file is stored in original bucket we have to specify it.

Using orm / db model you might encounter **rebound** field as well.
This one is proper and intentional and used for rebounding file lookup in cases when uploaded file marked as duplicated one.
Since we use best quality for all the duplicates this best one has related_duplicates count and all the duplicats have this rebound field set with id of "original" file.

So in order to access a file you must follow this: `project_<rebound_project_id | project_id>/<rebound_id | file_id>` object lookup.

When exporting datasets, rebound is resolved internally. Each exported entry is final, and you can access it directly via its id and extension (from file_name).

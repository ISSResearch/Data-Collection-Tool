# 🧩 Labels

Each project uses a label schema to annotate collected data. Labels help ensure even data collection and reduce future class imbalance. These can include:

- Flat or hierarchical
- Required or optional
- Single or multiple choice

## 🛠️ Defining a Schema

When creating a project or later in the Project → Edit tab:

<img src="/docs/assets/label_tree.gif" alt="labels_flags">

1. Add Tree-like Levels

2. Add Values per level, with optional nesting. Each value is an actual label used during annotation.

3. Set flags like:
  - `required`
  - `multiple choice`

4. Each label value could have a payload. This is a meta information in valid `json/string` format.
You can set restricted flag which sets if payload is required
Examples:
- `label payload`
- `{"field1": "value1", "type": 1, "list": ["metalist1", "metalist2"]}`
- `["meta1", "meta2"]`

<img src="/docs/assets/label_payload.gif" alt="labels_payload">

5. You can do a quick renaming with special form.

6. You can change alignment of values.

7. Deleting may be performed only when no media is assigned to such label or level of labels.
When you hit remove (`minus`) button - the popup will tell you if this item cannot be removed.
If you really want to remove it even when it's restricted you could change labeling at validation tab to remove association

<img src="/docs/assets/label_delete.gif" alt="labels_delete">

8. Grouping
Each block represents a separate attribute tree (e.g., color, shape, type).
In order to add another label with different meaning you press `Add attribute` at the top.
I.E. each feature has its own tree / block/

To remove a group completely you have to delete all the levels.

<img src="/docs/assets/label_group.gif" alt="labels_add">

## 📤 Applying Schema

When [uploading data](/docs/uploads.md), you assign the schema:
- With special form to apply tree o the whole set you uploaded
- Or manually, item by item

These methods can be used simultaneously

<img src="/docs/assets/upload_label.gif" alt="labels_apply">

The label hierarchy defined in the project could be set several times by clicking `add object` button.
This will create a new block with its own hierarchy.
This might be useful if your image for example has several annotated objects like cars or animals.

Each group can be easily deleted or copied.

<img src="/docs/assets/label_del_copy.gif" alt="labels_apply_del-cp">

## 📝 Validation Stage

During [validation](/docs/validation.md), labels can be you have same tree you assigned on Upload stage with the same management.

## 🔍 Filtering

At some pages there is an option to use Schema labels as filters.
The usage is almost the same as you apply labels to the media.
When you are done with tree click `select` button.

<img src="/docs/assets/label_filters.gif" alt="labels_filter">

---

### ✅ Next Step

[Users and Roles](/docs/users.md)

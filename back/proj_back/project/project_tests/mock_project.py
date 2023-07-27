class MOCK_PROJECT:
    endpoint = '/api/projects/'
    data = {
        'name': "name",
        'description': 'description',
        'attributes': [
            {
                'levels': [
                    {
                        'id': 6676033160686106,
                        'name': "level1",
                        'order': 0,
                        'required': True
                    },
                    {
                        'id': 6864216554170546,
                        'name': "level2",
                        'order': 0,
                        'required': True
                    },
                ],
                'attributes': [
                    {
                        'children': [
                            {
                                'children': [],
                                'id': 5502486269984042,
                                'name': "subattribute11",
                                'path': "0_0"
                            },
                            {
                                'children': [],
                                'id': 5502486269984043,
                                'name': "subattribute12",
                                'path': "0_1"
                            },
                        ],
                        'id': 6940887817155961,
                        'name': "attribute1",
                        'path': "0"
                    },
                    {
                        'children': [
                            {
                                'children': [],
                                'id': 5502446239924042,
                                'name': "subattribute21",
                                'path': "1_0"
                            },
                            {
                                'children': [],
                                'id': 5502286269954033,
                                'name': "subattribute22",
                                'path': "1_1"
                            },
                        ],
                        'id': 6250877817155261,
                        'name': "attribute2",
                        'path': "1"
                    },
                ]
            },
            {
                'levels': [
                    {
                        'id': 7377781592461263,
                        'multiple': True,
                        'name': "separatelevel",
                        'order': 1,
                        'required': True
                    }
                ],
                'attributes': [
                    {
                        'children': [],
                        'id': 1031636331470131,
                        'name': "separateattribute1",
                        'path': "0"
                    },
                    {
                        'children': [],
                        'id': 1041666371470231,
                        'name': "separateattribute2",
                        'path': "1"
                    },
                    {
                        'children': [],
                        'id': 1031676531430131,
                        'name': "separateattribute3",
                        'path': "2"
                    },
                ]
            }
        ]
    }

    @classmethod
    def count_levels(cls):
        return len([
            level for form in cls.data['attributes']
            for level in form['levels']
        ])

    @classmethod
    def count_attributes(cls):
        stack = [
            attribute for form in cls.data['attributes']
            for attribute in form['attributes']
        ]
        count = 0
        while stack:
            attribute = stack.pop()
            if attribute['children']: stack.extend(attribute['children'])
            count += 1

        return count

JS-Object-Converter
========

JS-Object-Converter can convert/create src object by given scheme

## Example

#### Simple transformations
```javascript
const src = {
  a: 'a',
};

convertObjects([['a', 'a']], src);

{a: "a"}

convertObjects([['a', 'b']], src);
{b: "a"}

convertObjects([['a', 'b.c.d']], src);
{
  b: {
    c: {
      d: "a"
    }
  }
}
```

#### Multiple transformations
```javascript
const src = {
  a: 'a',
  b: {
    c: 'd',
  },
};

convertObjects(
    [
      ['a', 'a'],
      ['b.c', 'b.e'],
    ],
    src,
  );

{
  "a": "a",
  "b": {
    "e": "d"
  }
}
```

#### With existed target object
```javascript
const src = {
  a: 'a',
  b: {
    c: 'd',
  },
};

convertObjects([['a', 'b']], src, { c: 'c' });

{
  "c": "c",
  "b": "a"
}
```

#### With object cycles
```javascript
const src = {
  cycle: {
    a: {
      1: '1_1',
      2: '2_1',
    },
    b: {
      1: '1_2',
      2: '2_2',
    },
    c: {
      1: '1_3',
      2: '2_3',
    },
  },
};

convertObjects([['cycle.{}', '{}']], src)
{
  "a": {
    "1": "1_1",
    "2": "2_1"
  },
  "b": {
    "1": "1_2",
    "2": "2_2"
  },
  "c": {
    "1": "1_3",
    "2": "2_3"
  }
}

convertObjects([['cycle.{}', 'any.prop.deep.{}']], src)
{
  "any": {
    "prop": {
      "deep": {
        "a": {
          "1": "1_1",
          "2": "2_1"
        },
        "b": {
          "1": "1_2",
          "2": "2_2"
        },
        "c": {
          "1": "1_3",
          "2": "2_3"
        }
      }
    }
  }
}

convertObjects([['cycle.{}.{}', '{}.{}.value']], src)
{
  "a": {
    "1": {
      "value": "1_1"
    },
    "2": {
      "value": "2_1"
    }
  },
  "b": {
    "1": {
      "value": "1_2"
    },
    "2": {
      "value": "2_2"
    }
  },
  "c": {
    "1": {
      "value": "1_3"
    },
    "2": {
      "value": "2_3"
    }
  }
}
```

#### With array cycles
```javascript
const src = {
  arr: [{ a: '1' }, { a: '2' }, { a: '3' }],
};

convertObjects([['arr.[].a', 'arr.[].b']], src)

{
  "arr": [
    {
      "b": "1"
    },
    {
      "b": "2"
    },
    {
      "b": "3"
    }
  ]
}
```

#### Cycle in cycle transformation
```javascript
const src = {
  arr: [
    { a: { 1: '1_1', 2: '2_1', 3: '3_1' } },
    { a: { 1: '1_2', 2: '2_2', 3: '3_2' } },
    { a: { 1: '1_3', 2: '2_3', 3: '3_3' } },
  ],
};

convertObjects([['arr.[].a.{}', 'arr.[].b.{}.1_b']], src)

{
  "arr": [
    {
      "b": {
        "1": {
          "1_b": "1_1"
        },
        "2": {
          "1_b": "2_1"
        },
        "3": {
          "1_b": "3_1"
        }
      }
    },
    {
      "b": {
        "1": {
          "1_b": "1_2"
        },
        "2": {
          "1_b": "2_2"
        },
        "3": {
          "1_b": "3_2"
        }
      }
    },
    {
      "b": {
        "1": {
          "1_b": "1_3"
        },
        "2": {
          "1_b": "2_3"
        },
        "3": {
          "1_b": "3_3"
        }
      }
    }
  ]
}
```

#### Cycle filters
```javascript
convertObjects([['arr.[0,1].a.{!1}', 'arr.[].b.{}']], src),

{
  "arr": [
    {
      "b": {
        "2": "2_1",
        "3": "3_1"
      }
    },
    {
      "b": {
        "2": "2_2",
        "3": "3_2"
      }
    }
  ]
}
```

#### Filter types

Exclude props
```javascript
{!a,b,c} 
[!0,1] //array won't be sorted, so 0 and 1 indexes will be empty

```
Include props
```javascript
{a,b,c} //only a,b,c will be included
[0]
[0,1] //only 0,1 will be included
```

### Similar projects
* Dot-Object: https://github.com/rhalff/dot-object *without cycles*
* object-mapper: https://github.com/wankdanker/node-object-mapper *object cycles?*

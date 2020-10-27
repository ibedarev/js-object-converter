export type ConvertMapper = (v: any, k?: string) => any;
export type ConvertSchema = [string, string, ConvertMapper?];
export type ConvertSchemas = [string, string, ConvertMapper?][];

export function convertObjects(
  schemas: ConvertSchemas,
  src: any,
  target?: any,
) {
  if (typeof src !== 'object' || src === null) return;
  if (!target) target = {};

  for (const schema of schemas) {
    const aPath = schema[0].split('.');
    const bPath = schema[1].split('.');
    const map = schema[2];
    convert(src, target, aPath, bPath, map);
  }

  return target;
}

export function convert(
  a: any,
  b: any,
  aPath: string[],
  bPath: string[],
  map?: ConvertMapper,
) {
  if (a == null || b == null) return;

  const { i: cAI, obj: aV } = goThroughPath(a, aPath, true);
  const { i: cBI, obj: bV } = goThroughPath(b, bPath, false);
  const cycleMatch = cycleRegex.exec(aPath[cAI]);

  if (cycleMatch) {
    if (cycleMatch) {
      let keys = ((isObject(aV) || isArray(aV)) && Object.keys(aV)) || [];

      if (cycleMatch[1]) {
        let cycleRule = cycleMatch[1];
        const except = cycleRule.startsWith('!');
        if (except) {
          cycleRule = cycleRule.replace('!', '');
        }

        const cycleRules = cycleRule.split(cycleRuleSplitter);

        if (except) {
          keys = keys.filter((k) => !cycleRules.includes(k));
        } else {
          keys = cycleRules;
        }
      }

      for (const key of keys) {
        convert(
          aV,
          bV,
          [key, ...aPath.slice(cAI + 1)],
          [key, ...bPath.slice(cBI + 1)],
          map,
        );
      }
    }
  } else {
    const res = (aV != null && aV[aPath[cAI]]) || undefined;
    const newVal = isObject(res) ? JSON.parse(JSON.stringify(res)) : res;
    bV[bPath[cBI]] = (map && map(newVal, aPath[cAI])) || newVal; //присваиваем значение
  }

  return b;
}

const cycleRegex = /[{\[](.*)[}\]]/;
const cycleRuleSplitter = /\s*,\s*/;

function goThroughPath(obj: any, path: string[], keyIsExist: boolean) {
  let i = 0;
  for (; i < path.length - 1; i++) {
    if (cycleRegex.test(path[i])) {
      break;
    } else {
      if (keyIsExist) {
        obj = obj && obj[path[i]];
      } else {
        obj = createKey(obj, path[i], path[i + 1]);
      }
    }
  }

  return { i, obj };
}

function createKey(obj: any, currentKey: string, nextKey: string) {
  if (nextKey.startsWith('{')) {
    obj[currentKey] = (isObject(obj[currentKey]) && obj[currentKey]) || {};
  } else if (nextKey.startsWith('[')) {
    obj[currentKey] = (isArray(obj[currentKey]) && obj[currentKey]) || [];
  } else if (nextKey) {
    obj[currentKey] = (isObject(obj[currentKey]) && obj[currentKey]) || {};
  } else {
    return obj;
  }

  return obj[currentKey];
}

function isObject(obj: any): obj is Record<string, any> {
  return obj && typeof obj === 'object';
}

function isArray(obj: any): obj is Array<any> {
  return obj && Array.isArray(obj);
}

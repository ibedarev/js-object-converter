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

  if (aPath[cAI] === '{}') {
    for (const key in aV) {
      convert(
        aV,
        bV,
        [key, ...aPath.slice(cAI + 1)],
        [key, ...bPath.slice(cBI + 1)],
        map,
      );
    }
  } else if (aPath[cAI] === '[]') {
    for (let i = 0; i < aV.length; i++) {
      convert(
        aV,
        bV,
        [i as any, ...aPath.slice(cAI + 1)],
        [i as any, ...bPath.slice(cBI + 1)],
        map,
      );
    }
  } else {
    const res = (aV != null && aV[aPath[cAI]]) || undefined;
    const newVal = isObject(res) ? JSON.parse(JSON.stringify(res)) : res;
    bV[bPath[cBI]] = (map && map(newVal, aPath[cAI])) || newVal; //присваиваем значение
  }

  return b;
}

const cycleSymbols = new Set(['{}', '[]']);

function goThroughPath(obj: any, path: string[], keyIsExist: boolean) {
  let i = 0;
  for (; i < path.length - 1; i++) {
    if (cycleSymbols.has(path[i])) {
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
  switch (nextKey) {
    case '{}':
      obj[currentKey] = (isObject(obj[currentKey]) && obj[currentKey]) || {};
      break;
    case '[]':
      obj[currentKey] = (isArray(obj[currentKey]) && obj[currentKey]) || [];
      break;
    case nextKey:
      obj[currentKey] = (isObject(obj[currentKey]) && obj[currentKey]) || {};
      break;
    default:
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

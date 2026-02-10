var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// Source/Configuration/ESBuild/Wind.js
var Wind_exports = {};
__export(Wind_exports, {
  Bundle: () => Bundle,
  Clean: () => Clean,
  Compile: () => Compile,
  On: () => On,
  default: () => Wind_default,
  posix: () => posix,
  sep: () => sep
});
var On, Clean, Bundle, Compile, Wind_default, sep, posix;
var init_Wind = __esm({
  async "Source/Configuration/ESBuild/Wind.js"() {
    "use strict";
    On = process.env["NODE_ENV"] === "development" || process.env["TAURI_ENV_DEBUG"] === "true";
    Clean = process.env["Clean"] === "true";
    Bundle = process.env["Bundle"] === "true";
    Compile = process.env["Compile"] === "true";
    Wind_default = {
      color: true,
      format: "esm",
      logLevel: "debug",
      metafile: true,
      minify: !On,
      outdir: "Configuration",
      platform: "node",
      target: "esnext",
      tsconfig: "tsconfig.json",
      write: true,
      legalComments: On ? "inline" : "none",
      bundle: Bundle,
      assetNames: "Asset/[name]-[hash]",
      sourcemap: On,
      drop: On ? [] : ["debugger"],
      ignoreAnnotations: !On,
      keepNames: On,
      plugins: [
        {
          name: "Target",
          // @ts-ignore
          setup({ onStart, initialOptions: { outdir } }) {
            switch (true) {
              case Clean === true:
                onStart(async () => {
                  try {
                    outdir ? await (await import("node:fs/promises")).rm(outdir, {
                      recursive: true
                    }) : {};
                  } catch (_Error) {
                    console.log(_Error);
                  }
                });
                break;
              default:
                break;
            }
          }
        }
      ],
      outbase: "Source/Configuration",
      loader: {
        ".json": "copy",
        ".sh": "copy"
      }
    };
    ({ sep, posix } = await import("node:path"));
  }
});

// ../../node_modules/.pnpm/deepmerge-ts@7.1.5/node_modules/deepmerge-ts/dist/index.mjs
var dist_exports = {};
__export(dist_exports, {
  deepmerge: () => deepmerge,
  deepmergeCustom: () => deepmergeCustom,
  deepmergeInto: () => deepmergeInto,
  deepmergeIntoCustom: () => deepmergeIntoCustom,
  getKeys: () => getKeys,
  getObjectType: () => getObjectType,
  objectHasProperty: () => objectHasProperty
});
function defaultMetaDataUpdater(previousMeta, metaMeta) {
  return metaMeta;
}
function defaultFilterValues(values, meta) {
  return values.filter((value) => value !== void 0);
}
function getObjectType(object) {
  if (typeof object !== "object" || object === null) {
    return 0;
  }
  if (Array.isArray(object)) {
    return 2;
  }
  if (isRecord(object)) {
    return 1;
  }
  if (object instanceof Set) {
    return 3;
  }
  if (object instanceof Map) {
    return 4;
  }
  return 5;
}
function getKeys(objects) {
  const keys = /* @__PURE__ */ new Set();
  for (const object of objects) {
    for (const key of [...Object.keys(object), ...Object.getOwnPropertySymbols(object)]) {
      keys.add(key);
    }
  }
  return keys;
}
function objectHasProperty(object, property) {
  return typeof object === "object" && Object.prototype.propertyIsEnumerable.call(object, property);
}
function getIterableOfIterables(iterables) {
  let mut_iterablesIndex = 0;
  let mut_iterator = iterables[0]?.[Symbol.iterator]();
  return {
    [Symbol.iterator]() {
      return {
        next() {
          do {
            if (mut_iterator === void 0) {
              return { done: true, value: void 0 };
            }
            const result = mut_iterator.next();
            if (result.done === true) {
              mut_iterablesIndex += 1;
              mut_iterator = iterables[mut_iterablesIndex]?.[Symbol.iterator]();
              continue;
            }
            return {
              done: false,
              value: result.value
            };
          } while (true);
        }
      };
    }
  };
}
function isRecord(value) {
  if (!validRecordToStringValues.includes(Object.prototype.toString.call(value))) {
    return false;
  }
  const { constructor } = value;
  if (constructor === void 0) {
    return true;
  }
  const prototype = constructor.prototype;
  if (prototype === null || typeof prototype !== "object" || !validRecordToStringValues.includes(Object.prototype.toString.call(prototype))) {
    return false;
  }
  if (!prototype.hasOwnProperty("isPrototypeOf")) {
    return false;
  }
  return true;
}
function mergeRecords$1(values, utils, meta) {
  const result = {};
  for (const key of getKeys(values)) {
    const propValues = [];
    for (const value of values) {
      if (objectHasProperty(value, key)) {
        propValues.push(value[key]);
      }
    }
    if (propValues.length === 0) {
      continue;
    }
    const updatedMeta = utils.metaDataUpdater(meta, {
      key,
      parents: values
    });
    const propertyResult = mergeUnknowns(propValues, utils, updatedMeta);
    if (propertyResult === actions.skip) {
      continue;
    }
    if (key === "__proto__") {
      Object.defineProperty(result, key, {
        value: propertyResult,
        configurable: true,
        enumerable: true,
        writable: true
      });
    } else {
      result[key] = propertyResult;
    }
  }
  return result;
}
function mergeArrays$1(values) {
  return values.flat();
}
function mergeSets$1(values) {
  return new Set(getIterableOfIterables(values));
}
function mergeMaps$1(values) {
  return new Map(getIterableOfIterables(values));
}
function mergeOthers$1(values) {
  return values.at(-1);
}
function deepmerge(...objects) {
  return deepmergeCustom({})(...objects);
}
function deepmergeCustom(options, rootMetaData) {
  const utils = getUtils(options, customizedDeepmerge);
  function customizedDeepmerge(...objects) {
    return mergeUnknowns(objects, utils, rootMetaData);
  }
  __name(customizedDeepmerge, "customizedDeepmerge");
  return customizedDeepmerge;
}
function getUtils(options, customizedDeepmerge) {
  return {
    defaultMergeFunctions: mergeFunctions,
    mergeFunctions: {
      ...mergeFunctions,
      ...Object.fromEntries(Object.entries(options).filter(([key, option]) => Object.hasOwn(mergeFunctions, key)).map(([key, option]) => option === false ? [key, mergeFunctions.mergeOthers] : [key, option]))
    },
    metaDataUpdater: options.metaDataUpdater ?? defaultMetaDataUpdater,
    deepmerge: customizedDeepmerge,
    useImplicitDefaultMerging: options.enableImplicitDefaultMerging ?? false,
    filterValues: options.filterValues === false ? void 0 : options.filterValues ?? defaultFilterValues,
    actions
  };
}
function mergeUnknowns(values, utils, meta) {
  const filteredValues = utils.filterValues?.(values, meta) ?? values;
  if (filteredValues.length === 0) {
    return void 0;
  }
  if (filteredValues.length === 1) {
    return mergeOthers(filteredValues, utils, meta);
  }
  const type = getObjectType(filteredValues[0]);
  if (type !== 0 && type !== 5) {
    for (let mut_index = 1; mut_index < filteredValues.length; mut_index++) {
      if (getObjectType(filteredValues[mut_index]) === type) {
        continue;
      }
      return mergeOthers(filteredValues, utils, meta);
    }
  }
  switch (type) {
    case 1: {
      return mergeRecords(filteredValues, utils, meta);
    }
    case 2: {
      return mergeArrays(filteredValues, utils, meta);
    }
    case 3: {
      return mergeSets(filteredValues, utils, meta);
    }
    case 4: {
      return mergeMaps(filteredValues, utils, meta);
    }
    default: {
      return mergeOthers(filteredValues, utils, meta);
    }
  }
}
function mergeRecords(values, utils, meta) {
  const result = utils.mergeFunctions.mergeRecords(values, utils, meta);
  if (result === actions.defaultMerge || utils.useImplicitDefaultMerging && result === void 0 && utils.mergeFunctions.mergeRecords !== utils.defaultMergeFunctions.mergeRecords) {
    return utils.defaultMergeFunctions.mergeRecords(values, utils, meta);
  }
  return result;
}
function mergeArrays(values, utils, meta) {
  const result = utils.mergeFunctions.mergeArrays(values, utils, meta);
  if (result === actions.defaultMerge || utils.useImplicitDefaultMerging && result === void 0 && utils.mergeFunctions.mergeArrays !== utils.defaultMergeFunctions.mergeArrays) {
    return utils.defaultMergeFunctions.mergeArrays(values);
  }
  return result;
}
function mergeSets(values, utils, meta) {
  const result = utils.mergeFunctions.mergeSets(values, utils, meta);
  if (result === actions.defaultMerge || utils.useImplicitDefaultMerging && result === void 0 && utils.mergeFunctions.mergeSets !== utils.defaultMergeFunctions.mergeSets) {
    return utils.defaultMergeFunctions.mergeSets(values);
  }
  return result;
}
function mergeMaps(values, utils, meta) {
  const result = utils.mergeFunctions.mergeMaps(values, utils, meta);
  if (result === actions.defaultMerge || utils.useImplicitDefaultMerging && result === void 0 && utils.mergeFunctions.mergeMaps !== utils.defaultMergeFunctions.mergeMaps) {
    return utils.defaultMergeFunctions.mergeMaps(values);
  }
  return result;
}
function mergeOthers(values, utils, meta) {
  const result = utils.mergeFunctions.mergeOthers(values, utils, meta);
  if (result === actions.defaultMerge || utils.useImplicitDefaultMerging && result === void 0 && utils.mergeFunctions.mergeOthers !== utils.defaultMergeFunctions.mergeOthers) {
    return utils.defaultMergeFunctions.mergeOthers(values);
  }
  return result;
}
function mergeRecordsInto$1(mut_target, values, utils, meta) {
  for (const key of getKeys(values)) {
    const propValues = [];
    for (const value of values) {
      if (objectHasProperty(value, key)) {
        propValues.push(value[key]);
      }
    }
    if (propValues.length === 0) {
      continue;
    }
    const updatedMeta = utils.metaDataUpdater(meta, {
      key,
      parents: values
    });
    const propertyTarget = { value: propValues[0] };
    mergeUnknownsInto(propertyTarget, propValues, utils, updatedMeta);
    if (key === "__proto__") {
      Object.defineProperty(mut_target.value, key, {
        value: propertyTarget.value,
        configurable: true,
        enumerable: true,
        writable: true
      });
    } else {
      mut_target.value[key] = propertyTarget.value;
    }
  }
}
function mergeArraysInto$1(mut_target, values) {
  mut_target.value.push(...values.slice(1).flat());
}
function mergeSetsInto$1(mut_target, values) {
  for (const value of getIterableOfIterables(values.slice(1))) {
    mut_target.value.add(value);
  }
}
function mergeMapsInto$1(mut_target, values) {
  for (const [key, value] of getIterableOfIterables(values.slice(1))) {
    mut_target.value.set(key, value);
  }
}
function mergeOthersInto$1(mut_target, values) {
  mut_target.value = values.at(-1);
}
function deepmergeInto(target, ...objects) {
  return void deepmergeIntoCustom({})(target, ...objects);
}
function deepmergeIntoCustom(options, rootMetaData) {
  const utils = getIntoUtils(options, customizedDeepmergeInto);
  function customizedDeepmergeInto(target, ...objects) {
    mergeUnknownsInto({ value: target }, [target, ...objects], utils, rootMetaData);
  }
  __name(customizedDeepmergeInto, "customizedDeepmergeInto");
  return customizedDeepmergeInto;
}
function getIntoUtils(options, customizedDeepmergeInto) {
  return {
    defaultMergeFunctions: mergeIntoFunctions,
    mergeFunctions: {
      ...mergeIntoFunctions,
      ...Object.fromEntries(Object.entries(options).filter(([key, option]) => Object.hasOwn(mergeIntoFunctions, key)).map(([key, option]) => option === false ? [key, mergeIntoFunctions.mergeOthers] : [key, option]))
    },
    metaDataUpdater: options.metaDataUpdater ?? defaultMetaDataUpdater,
    deepmergeInto: customizedDeepmergeInto,
    filterValues: options.filterValues === false ? void 0 : options.filterValues ?? defaultFilterValues,
    actions: actionsInto
  };
}
function mergeUnknownsInto(mut_target, values, utils, meta) {
  const filteredValues = utils.filterValues?.(values, meta) ?? values;
  if (filteredValues.length === 0) {
    return;
  }
  if (filteredValues.length === 1) {
    return void mergeOthersInto(mut_target, filteredValues, utils, meta);
  }
  const type = getObjectType(mut_target.value);
  if (type !== 0 && type !== 5) {
    for (let mut_index = 1; mut_index < filteredValues.length; mut_index++) {
      if (getObjectType(filteredValues[mut_index]) === type) {
        continue;
      }
      return void mergeOthersInto(mut_target, filteredValues, utils, meta);
    }
  }
  switch (type) {
    case 1: {
      return void mergeRecordsInto(mut_target, filteredValues, utils, meta);
    }
    case 2: {
      return void mergeArraysInto(mut_target, filteredValues, utils, meta);
    }
    case 3: {
      return void mergeSetsInto(mut_target, filteredValues, utils, meta);
    }
    case 4: {
      return void mergeMapsInto(mut_target, filteredValues, utils, meta);
    }
    default: {
      return void mergeOthersInto(mut_target, filteredValues, utils, meta);
    }
  }
}
function mergeRecordsInto(mut_target, values, utils, meta) {
  const action = utils.mergeFunctions.mergeRecords(mut_target, values, utils, meta);
  if (action === actionsInto.defaultMerge) {
    utils.defaultMergeFunctions.mergeRecords(mut_target, values, utils, meta);
  }
}
function mergeArraysInto(mut_target, values, utils, meta) {
  const action = utils.mergeFunctions.mergeArrays(mut_target, values, utils, meta);
  if (action === actionsInto.defaultMerge) {
    utils.defaultMergeFunctions.mergeArrays(mut_target, values);
  }
}
function mergeSetsInto(mut_target, values, utils, meta) {
  const action = utils.mergeFunctions.mergeSets(mut_target, values, utils, meta);
  if (action === actionsInto.defaultMerge) {
    utils.defaultMergeFunctions.mergeSets(mut_target, values);
  }
}
function mergeMapsInto(mut_target, values, utils, meta) {
  const action = utils.mergeFunctions.mergeMaps(mut_target, values, utils, meta);
  if (action === actionsInto.defaultMerge) {
    utils.defaultMergeFunctions.mergeMaps(mut_target, values);
  }
}
function mergeOthersInto(mut_target, values, utils, meta) {
  const action = utils.mergeFunctions.mergeOthers(mut_target, values, utils, meta);
  if (action === actionsInto.defaultMerge || mut_target.value === actionsInto.defaultMerge) {
    utils.defaultMergeFunctions.mergeOthers(mut_target, values);
  }
}
var actions, actionsInto, ObjectType, validRecordToStringValues, mergeFunctions, mergeIntoFunctions;
var init_dist = __esm({
  "../../node_modules/.pnpm/deepmerge-ts@7.1.5/node_modules/deepmerge-ts/dist/index.mjs"() {
    "use strict";
    actions = {
      defaultMerge: /* @__PURE__ */ Symbol("deepmerge-ts: default merge"),
      skip: /* @__PURE__ */ Symbol("deepmerge-ts: skip")
    };
    actionsInto = {
      defaultMerge: actions.defaultMerge
    };
    __name(defaultMetaDataUpdater, "defaultMetaDataUpdater");
    __name(defaultFilterValues, "defaultFilterValues");
    (function(ObjectType2) {
      ObjectType2[ObjectType2["NOT"] = 0] = "NOT";
      ObjectType2[ObjectType2["RECORD"] = 1] = "RECORD";
      ObjectType2[ObjectType2["ARRAY"] = 2] = "ARRAY";
      ObjectType2[ObjectType2["SET"] = 3] = "SET";
      ObjectType2[ObjectType2["MAP"] = 4] = "MAP";
      ObjectType2[ObjectType2["OTHER"] = 5] = "OTHER";
    })(ObjectType || (ObjectType = {}));
    __name(getObjectType, "getObjectType");
    __name(getKeys, "getKeys");
    __name(objectHasProperty, "objectHasProperty");
    __name(getIterableOfIterables, "getIterableOfIterables");
    validRecordToStringValues = ["[object Object]", "[object Module]"];
    __name(isRecord, "isRecord");
    __name(mergeRecords$1, "mergeRecords$1");
    __name(mergeArrays$1, "mergeArrays$1");
    __name(mergeSets$1, "mergeSets$1");
    __name(mergeMaps$1, "mergeMaps$1");
    __name(mergeOthers$1, "mergeOthers$1");
    mergeFunctions = {
      mergeRecords: mergeRecords$1,
      mergeArrays: mergeArrays$1,
      mergeSets: mergeSets$1,
      mergeMaps: mergeMaps$1,
      mergeOthers: mergeOthers$1
    };
    __name(deepmerge, "deepmerge");
    __name(deepmergeCustom, "deepmergeCustom");
    __name(getUtils, "getUtils");
    __name(mergeUnknowns, "mergeUnknowns");
    __name(mergeRecords, "mergeRecords");
    __name(mergeArrays, "mergeArrays");
    __name(mergeSets, "mergeSets");
    __name(mergeMaps, "mergeMaps");
    __name(mergeOthers, "mergeOthers");
    __name(mergeRecordsInto$1, "mergeRecordsInto$1");
    __name(mergeArraysInto$1, "mergeArraysInto$1");
    __name(mergeSetsInto$1, "mergeSetsInto$1");
    __name(mergeMapsInto$1, "mergeMapsInto$1");
    __name(mergeOthersInto$1, "mergeOthersInto$1");
    mergeIntoFunctions = {
      mergeRecords: mergeRecordsInto$1,
      mergeArrays: mergeArraysInto$1,
      mergeSets: mergeSetsInto$1,
      mergeMaps: mergeMapsInto$1,
      mergeOthers: mergeOthersInto$1
    };
    __name(deepmergeInto, "deepmergeInto");
    __name(deepmergeIntoCustom, "deepmergeIntoCustom");
    __name(getIntoUtils, "getIntoUtils");
    __name(mergeUnknownsInto, "mergeUnknownsInto");
    __name(mergeRecordsInto, "mergeRecordsInto");
    __name(mergeArraysInto, "mergeArraysInto");
    __name(mergeSetsInto, "mergeSetsInto");
    __name(mergeMapsInto, "mergeMapsInto");
    __name(mergeOthersInto, "mergeOthersInto");
  }
});

// ../../node_modules/.pnpm/ulid@3.0.2/node_modules/ulid/dist/node/index.js
var node_exports = {};
__export(node_exports, {
  MAX_ULID: () => MAX_ULID,
  MIN_ULID: () => MIN_ULID,
  TIME_LEN: () => TIME_LEN,
  TIME_MAX: () => TIME_MAX,
  ULIDError: () => ULIDError,
  ULIDErrorCode: () => ULIDErrorCode,
  decodeTime: () => decodeTime,
  encodeTime: () => encodeTime,
  fixULIDBase32: () => fixULIDBase32,
  incrementBase32: () => incrementBase32,
  isValid: () => isValid,
  monotonicFactory: () => monotonicFactory,
  ulid: () => ulid,
  ulidToUUID: () => ulidToUUID,
  uuidToULID: () => uuidToULID
});
import crypto from "node:crypto";
function randomChar(prng) {
  const randomPosition = Math.floor(prng() * ENCODING_LEN) % ENCODING_LEN;
  return ENCODING.charAt(randomPosition);
}
function replaceCharAt(str, index, char) {
  if (index > str.length - 1) {
    return str;
  }
  return str.substr(0, index) + char + str.substr(index + 1);
}
function crockfordEncode(input) {
  const output = [];
  let bitsRead = 0;
  let buffer = 0;
  const reversedInput = new Uint8Array(input.slice().reverse());
  for (const byte of reversedInput) {
    buffer |= byte << bitsRead;
    bitsRead += 8;
    while (bitsRead >= 5) {
      output.unshift(buffer & 31);
      buffer >>>= 5;
      bitsRead -= 5;
    }
  }
  if (bitsRead > 0) {
    output.unshift(buffer & 31);
  }
  return output.map((byte) => B32_CHARACTERS.charAt(byte)).join("");
}
function crockfordDecode(input) {
  const sanitizedInput = input.toUpperCase().split("").reverse().join("");
  const output = [];
  let bitsRead = 0;
  let buffer = 0;
  for (const character of sanitizedInput) {
    const byte = B32_CHARACTERS.indexOf(character);
    if (byte === -1) {
      throw new Error(`Invalid base 32 character found in string: ${character}`);
    }
    buffer |= byte << bitsRead;
    bitsRead += 5;
    while (bitsRead >= 8) {
      output.unshift(buffer & 255);
      buffer >>>= 8;
      bitsRead -= 8;
    }
  }
  if (bitsRead >= 5 || buffer > 0) {
    output.unshift(buffer & 255);
  }
  return new Uint8Array(output);
}
function fixULIDBase32(id) {
  return id.replace(/i/gi, "1").replace(/l/gi, "1").replace(/o/gi, "0").replace(/-/g, "");
}
function incrementBase32(str) {
  let done = void 0, index = str.length, char, charIndex, output = str;
  const maxCharIndex = ENCODING_LEN - 1;
  while (!done && index-- >= 0) {
    char = output[index];
    charIndex = ENCODING.indexOf(char);
    if (charIndex === -1) {
      throw new ULIDError(ULIDErrorCode.Base32IncorrectEncoding, "Incorrectly encoded string");
    }
    if (charIndex === maxCharIndex) {
      output = replaceCharAt(output, index, ENCODING[0]);
      continue;
    }
    done = replaceCharAt(output, index, ENCODING[charIndex + 1]);
  }
  if (typeof done === "string") {
    return done;
  }
  throw new ULIDError(ULIDErrorCode.Base32IncorrectEncoding, "Failed incrementing string");
}
function decodeTime(id) {
  if (id.length !== TIME_LEN + RANDOM_LEN) {
    throw new ULIDError(ULIDErrorCode.DecodeTimeValueMalformed, "Malformed ULID");
  }
  const time = id.substr(0, TIME_LEN).toUpperCase().split("").reverse().reduce((carry, char, index) => {
    const encodingIndex = ENCODING.indexOf(char);
    if (encodingIndex === -1) {
      throw new ULIDError(ULIDErrorCode.DecodeTimeInvalidCharacter, `Time decode error: Invalid character: ${char}`);
    }
    return carry += encodingIndex * Math.pow(ENCODING_LEN, index);
  }, 0);
  if (time > TIME_MAX) {
    throw new ULIDError(ULIDErrorCode.DecodeTimeValueMalformed, `Malformed ULID: timestamp too large: ${time}`);
  }
  return time;
}
function detectPRNG(root) {
  const rootLookup = detectRoot();
  const globalCrypto = rootLookup && (rootLookup.crypto || rootLookup.msCrypto) || (typeof crypto !== "undefined" ? crypto : null);
  if (typeof globalCrypto?.getRandomValues === "function") {
    return () => {
      const buffer = new Uint8Array(1);
      globalCrypto.getRandomValues(buffer);
      return buffer[0] / 256;
    };
  } else if (typeof globalCrypto?.randomBytes === "function") {
    return () => globalCrypto.randomBytes(1).readUInt8() / 256;
  } else if (crypto?.randomBytes) {
    return () => crypto.randomBytes(1).readUInt8() / 256;
  }
  throw new ULIDError(ULIDErrorCode.PRNGDetectFailure, "Failed to find a reliable PRNG");
}
function detectRoot() {
  if (inWebWorker())
    return self;
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  return null;
}
function encodeRandom(len, prng) {
  let str = "";
  for (; len > 0; len--) {
    str = randomChar(prng) + str;
  }
  return str;
}
function encodeTime(now, len = TIME_LEN) {
  if (isNaN(now)) {
    throw new ULIDError(ULIDErrorCode.EncodeTimeValueMalformed, `Time must be a number: ${now}`);
  } else if (now > TIME_MAX) {
    throw new ULIDError(ULIDErrorCode.EncodeTimeSizeExceeded, `Cannot encode a time larger than ${TIME_MAX}: ${now}`);
  } else if (now < 0) {
    throw new ULIDError(ULIDErrorCode.EncodeTimeNegative, `Time must be positive: ${now}`);
  } else if (Number.isInteger(now) === false) {
    throw new ULIDError(ULIDErrorCode.EncodeTimeValueMalformed, `Time must be an integer: ${now}`);
  }
  let mod, str = "";
  for (let currentLen = len; currentLen > 0; currentLen--) {
    mod = now % ENCODING_LEN;
    str = ENCODING.charAt(mod) + str;
    now = (now - mod) / ENCODING_LEN;
  }
  return str;
}
function inWebWorker() {
  return typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
}
function isValid(id) {
  return typeof id === "string" && id.length === TIME_LEN + RANDOM_LEN && id.toUpperCase().split("").every((char) => ENCODING.indexOf(char) !== -1);
}
function monotonicFactory(prng) {
  const currentPRNG = prng || detectPRNG();
  let lastTime = 0, lastRandom;
  return /* @__PURE__ */ __name(function _ulid(seedTime) {
    const seed = !seedTime || isNaN(seedTime) ? Date.now() : seedTime;
    if (seed <= lastTime) {
      const incrementedRandom = lastRandom = incrementBase32(lastRandom);
      return encodeTime(lastTime, TIME_LEN) + incrementedRandom;
    }
    lastTime = seed;
    const newRandom = lastRandom = encodeRandom(RANDOM_LEN, currentPRNG);
    return encodeTime(seed, TIME_LEN) + newRandom;
  }, "_ulid");
}
function ulid(seedTime, prng) {
  const currentPRNG = prng || detectPRNG();
  const seed = !seedTime || isNaN(seedTime) ? Date.now() : seedTime;
  return encodeTime(seed, TIME_LEN) + encodeRandom(RANDOM_LEN, currentPRNG);
}
function ulidToUUID(ulid2) {
  const isValid2 = ULID_REGEX.test(ulid2);
  if (!isValid2) {
    throw new ULIDError(ULIDErrorCode.ULIDInvalid, `Invalid ULID: ${ulid2}`);
  }
  const uint8Array = crockfordDecode(ulid2);
  let uuid = Array.from(uint8Array).map((byte) => byte.toString(16).padStart(2, "0")).join("");
  uuid = uuid.substring(0, 8) + "-" + uuid.substring(8, 12) + "-" + uuid.substring(12, 16) + "-" + uuid.substring(16, 20) + "-" + uuid.substring(20);
  return uuid.toUpperCase();
}
function uuidToULID(uuid) {
  const isValid2 = UUID_REGEX.test(uuid);
  if (!isValid2) {
    throw new ULIDError(ULIDErrorCode.UUIDInvalid, `Invalid UUID: ${uuid}`);
  }
  const bytes = uuid.replace(/-/g, "").match(/.{1,2}/g);
  if (!bytes) {
    throw new ULIDError(ULIDErrorCode.Unexpected, `Failed parsing UUID bytes: ${uuid}`);
  }
  const uint8Array = new Uint8Array(bytes.map((byte) => parseInt(byte, 16)));
  return crockfordEncode(uint8Array);
}
var B32_CHARACTERS, ENCODING, ENCODING_LEN, MAX_ULID, MIN_ULID, RANDOM_LEN, TIME_LEN, TIME_MAX, ULID_REGEX, UUID_REGEX, ULIDErrorCode, ULIDError;
var init_node = __esm({
  "../../node_modules/.pnpm/ulid@3.0.2/node_modules/ulid/dist/node/index.js"() {
    "use strict";
    B32_CHARACTERS = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
    ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
    ENCODING_LEN = 32;
    MAX_ULID = "7ZZZZZZZZZZZZZZZZZZZZZZZZZ";
    MIN_ULID = "00000000000000000000000000";
    RANDOM_LEN = 16;
    TIME_LEN = 10;
    TIME_MAX = 281474976710655;
    ULID_REGEX = /^[0-7][0-9a-hjkmnp-tv-zA-HJKMNP-TV-Z]{25}$/;
    UUID_REGEX = /^[0-9a-fA-F]{8}-(?:[0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/;
    (function(ULIDErrorCode2) {
      ULIDErrorCode2["Base32IncorrectEncoding"] = "B32_ENC_INVALID";
      ULIDErrorCode2["DecodeTimeInvalidCharacter"] = "DEC_TIME_CHAR";
      ULIDErrorCode2["DecodeTimeValueMalformed"] = "DEC_TIME_MALFORMED";
      ULIDErrorCode2["EncodeTimeNegative"] = "ENC_TIME_NEG";
      ULIDErrorCode2["EncodeTimeSizeExceeded"] = "ENC_TIME_SIZE_EXCEED";
      ULIDErrorCode2["EncodeTimeValueMalformed"] = "ENC_TIME_MALFORMED";
      ULIDErrorCode2["PRNGDetectFailure"] = "PRNG_DETECT";
      ULIDErrorCode2["ULIDInvalid"] = "ULID_INVALID";
      ULIDErrorCode2["Unexpected"] = "UNEXPECTED";
      ULIDErrorCode2["UUIDInvalid"] = "UUID_INVALID";
    })(ULIDErrorCode || (ULIDErrorCode = {}));
    ULIDError = class extends Error {
      static {
        __name(this, "ULIDError");
      }
      constructor(errorCode, message) {
        super(`${message} (${errorCode})`);
        this.name = "ULIDError";
        this.code = errorCode;
      }
    };
    __name(randomChar, "randomChar");
    __name(replaceCharAt, "replaceCharAt");
    __name(crockfordEncode, "crockfordEncode");
    __name(crockfordDecode, "crockfordDecode");
    __name(fixULIDBase32, "fixULIDBase32");
    __name(incrementBase32, "incrementBase32");
    __name(decodeTime, "decodeTime");
    __name(detectPRNG, "detectPRNG");
    __name(detectRoot, "detectRoot");
    __name(encodeRandom, "encodeRandom");
    __name(encodeTime, "encodeTime");
    __name(inWebWorker, "inWebWorker");
    __name(isValid, "isValid");
    __name(monotonicFactory, "monotonicFactory");
    __name(ulid, "ulid");
    __name(ulidToUUID, "ulidToUUID");
    __name(uuidToULID, "uuidToULID");
  }
});

// ../../node_modules/.pnpm/@playform+build@0.2.6/node_modules/@playform/build/Target/Function/JSON.js
var JSON_exports = {};
__export(JSON_exports, {
  default: () => a
});
var a;
var init_JSON = __esm({
  "../../node_modules/.pnpm/@playform+build@0.2.6/node_modules/@playform/build/Target/Function/JSON.js"() {
    "use strict";
    a = /* @__PURE__ */ __name((async (...[e2, t]) => JSON.parse((await (await import("node:fs/promises")).readFile(`${t ?? "."}/${e2}`, "utf-8")).toString())), "a");
  }
});

// ../../node_modules/.pnpm/@playform+build@0.2.6/node_modules/@playform/build/Target/Variable/ESBuild.js
var ESBuild_exports = {};
__export(ESBuild_exports, {
  On: () => e,
  default: () => i,
  posix: () => a2,
  sep: () => n
});
var e, i, n, a2;
var init_ESBuild = __esm({
  async "../../node_modules/.pnpm/@playform+build@0.2.6/node_modules/@playform/build/Target/Variable/ESBuild.js"() {
    "use strict";
    e = process.env.NODE_ENV === "development";
    i = { color: true, format: "esm", logLevel: "debug", metafile: true, minify: !e, outdir: "Target", platform: "node", target: "esnext", tsconfig: "tsconfig.json", write: true, legalComments: e ? "inline" : "none", bundle: false, assetNames: "Asset/[name]-[hash]", sourcemap: e, drop: e ? [] : ["debugger"], ignoreAnnotations: !e, keepNames: e, plugins: [{ name: "Target", setup({ onStart: s3, initialOptions: { outdir: t } }) {
      s3(async () => {
        try {
          t && await (await import("node:fs/promises")).rm(t, { recursive: true });
        } catch (o4) {
          console.log(o4);
        }
      });
    } }], define: { "process.env.VERSION_PACKAGE": `'${(await (await Promise.resolve().then(() => (init_JSON(), JSON_exports))).default("package.json"))?.version}'` } };
    ({ sep: n, posix: a2 } = await import("node:path"));
  }
});

// ../../node_modules/.pnpm/@playform+build@0.2.6/node_modules/@playform/build/Target/Function/Regex.js
var Regex_exports = {};
__export(Regex_exports, {
  default: () => i2,
  posix: () => s
});
var i2, s;
var init_Regex = __esm({
  async "../../node_modules/.pnpm/@playform+build@0.2.6/node_modules/@playform/build/Target/Function/Regex.js"() {
    "use strict";
    i2 = /* @__PURE__ */ __name((e2) => {
      let r = e2.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*\*/g, ".*").replace(/\*/g, `[^${s.sep}]+`);
      !e2.startsWith("**") && !e2.startsWith("*") && (r = `(?:^|\\${s.sep})${r}`), !e2.endsWith("**") && !e2.endsWith("*") ? r = `${r}(?:\\${s.sep}|$)` : !e2.includes("*") && !e2.includes("/") && e2.startsWith(".") ? r = `${r}$` : !e2.includes("*") && !e2.includes("/") && (r = `(?:^|\\${s.sep})${r}(?:\\${s.sep}|$)`);
      try {
        return new RegExp(r);
      } catch (t) {
        return console.error(`[Exclude] Invalid regex generated from glob "${e2}": ${r}`, t), new RegExp("$.");
      }
    }, "i");
    ({ posix: s } = await init_ESBuild().then(() => ESBuild_exports));
  }
});

// ../../node_modules/.pnpm/@playform+build@0.2.6/node_modules/@playform/build/Target/Function/Exclude.js
var Exclude_exports = {};
__export(Exclude_exports, {
  _Regex: () => l,
  default: () => o,
  posix: () => s2,
  sep: () => n2
});
var o, s2, n2, l;
var init_Exclude = __esm({
  async "../../node_modules/.pnpm/@playform+build@0.2.6/node_modules/@playform/build/Target/Function/Exclude.js"() {
    "use strict";
    o = /* @__PURE__ */ __name((i3, u) => {
      if (!i3) return false;
      const t = i3.split(n2).join(s2.sep);
      return u.some((r) => {
        if (!r) return false;
        const e2 = r.split(n2).join(s2.sep);
        return !e2.includes("*") && !e2.startsWith(".") && (t.includes(`${s2.sep}${e2}${s2.sep}`) || t.startsWith(`${e2}${s2.sep}`) || t.endsWith(`${s2.sep}${e2}`) || t === e2) || e2.startsWith(".") && !e2.includes("*") && !e2.includes("/") && t.endsWith(e2) || e2.includes("*") && l(e2).test(t) ? true : t.includes(e2) ? (console.warn(`[Exclude] Simple includes match (fallback): "${t}" includes "${e2}"`), true) : false;
      });
    }, "o");
    ({ posix: s2, sep: n2 } = await init_ESBuild().then(() => ESBuild_exports));
    ({ default: l } = await init_Regex().then(() => Regex_exports));
  }
});

// ../../node_modules/.pnpm/@playform+build@0.2.6/node_modules/@playform/build/Target/Function/Entry.js
var Entry_exports = {};
__export(Entry_exports, {
  Exclude: () => o2,
  default: () => y
});
var y, o2;
var init_Entry = __esm({
  async "../../node_modules/.pnpm/@playform+build@0.2.6/node_modules/@playform/build/Target/Function/Entry.js"() {
    "use strict";
    y = /* @__PURE__ */ __name((s3, r) => {
      let t = [];
      if (s3.entryPoints) {
        const e2 = s3.entryPoints;
        if (Array.isArray(e2) && (e2.length === 0 || typeof e2[0] == "string")) t = e2.filter((i3) => !o2(i3, r));
        else if (Array.isArray(e2) && e2.length > 0 && typeof e2[0] == "object" && e2[0] !== null && "in" in e2[0]) t = e2.filter((i3) => !o2(i3.in, r));
        else if (!Array.isArray(e2) && typeof e2 == "object" && e2 !== null) {
          const i3 = e2, f = {};
          for (const n3 in i3) if (Object.prototype.hasOwnProperty.call(i3, n3)) {
            const l2 = i3[n3];
            l2 !== void 0 && (o2(l2, r) || (f[n3] = l2));
          }
          t = f;
        } else Array.isArray(e2) && e2.length === 0 ? t = [] : t = e2;
      } else t = [];
      return t;
    }, "y");
    ({ default: o2 } = await init_Exclude().then(() => Exclude_exports));
  }
});

// ../../node_modules/.pnpm/@playform+build@0.2.6/node_modules/@playform/build/Target/Function/Exec.js
var Exec_exports = {};
__export(Exec_exports, {
  default: () => o3
});
var o3;
var init_Exec = __esm({
  "../../node_modules/.pnpm/@playform+build@0.2.6/node_modules/@playform/build/Target/Function/Exec.js"() {
    "use strict";
    o3 = /* @__PURE__ */ __name((async (...[r, a3 = /* @__PURE__ */ __name(async (t) => console.log(t), "a")]) => {
      try {
        const { stdout: t, stderr: n3 } = (await import("child_process")).exec(r);
        typeof a3 == "function" && (t?.on("data", async (e2) => await a3(e2.trim())), n3?.on("data", async (e2) => await a3(e2.trim(), true)));
      } catch (t) {
        console.log(t);
      }
    }), "o");
  }
});

// Source/Configuration/ESBuild/Target.ts
var On2 = (await init_Wind().then(() => Wind_exports)).On;
var Bundle2 = (await init_Wind().then(() => Wind_exports)).Bundle;
var Compile2 = (await init_Wind().then(() => Wind_exports)).Compile;
var Merge = (await Promise.resolve().then(() => (init_dist(), dist_exports))).deepmerge;
var Target_default = /* @__PURE__ */ __name(async (Current) => Merge(
  (await init_Wind().then(() => Wind_exports)).default,
  {
    outdir: "Target",
    drop: On2 ? [] : ["debugger", "console"],
    define: {
      __DEV__: On2 ? "true" : "false",
      __INCREMENT__: `"${`${On2 ? "DEVELOPMENT" : "PRODUCTION"}-${(await Promise.resolve().then(() => (init_node(), node_exports))).ulid()}`}"`
    },
    treeShaking: !On2,
    entryPoints: (await init_Entry().then(() => Entry_exports)).default(Current, ["Source/Configuration/*"]),
    platform: "browser",
    outbase: "Source",
    // external: [
    // 	"@tauri-apps/api",
    // 	"@tauri-apps/api/core",
    // 	"@tauri-apps/api/event",
    // 	"@codeeditorland/output",
    // ],
    plugins: Compile2 ? Merge(
      Current.plugins,
      [
        {
          name: "Compile",
          setup({ onEnd }) {
            onEnd(async ({ metafile }) => {
              const _Output = metafile?.outputs;
              for (const Output in _Output) {
                if (Object.prototype.hasOwnProperty.call(
                  _Output,
                  Output
                )) {
                  if (Output.endsWith(".js")) {
                    (await Promise.resolve().then(() => (init_Exec(), Exec_exports))).default(
                      `Build '${Output}' 													--ESBuild Configuration/ESBuild/Target/Compile.js 													--TypeScript Configuration/tsconfig/Target/Compile.json`
                    );
                  }
                }
              }
            });
          }
        }
      ]
    ) : []
  }
), "default");
export {
  Bundle2 as Bundle,
  Compile2 as Compile,
  Merge,
  On2 as On,
  Target_default as default
};
//# sourceMappingURL=Target.js.map

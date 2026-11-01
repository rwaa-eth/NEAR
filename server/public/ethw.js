"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod3) => function __require() {
    return mod3 || (0, cb[__getOwnPropNames(cb)[0]])((mod3 = { exports: {} }).exports, mod3), mod3.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from14, except, desc) => {
    if (from14 && typeof from14 === "object" || typeof from14 === "function") {
      for (let key of __getOwnPropNames(from14))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from14[key], enumerable: !(desc = __getOwnPropDesc(from14, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod3, isNodeMode, target) => (target = mod3 != null ? __create(__getProtoOf(mod3)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod3 || !mod3.__esModule ? __defProp(target, "default", { value: mod3, enumerable: true }) : target,
    mod3
  ));

  // node_modules/abitype/dist/esm/version.js
  var version;
  var init_version = __esm({
    "node_modules/abitype/dist/esm/version.js"() {
      version = "1.1.0";
    }
  });

  // node_modules/abitype/dist/esm/errors.js
  var BaseError;
  var init_errors = __esm({
    "node_modules/abitype/dist/esm/errors.js"() {
      init_version();
      BaseError = class _BaseError extends Error {
        constructor(shortMessage, args = {}) {
          const details = args.cause instanceof _BaseError ? args.cause.details : args.cause?.message ? args.cause.message : args.details;
          const docsPath8 = args.cause instanceof _BaseError ? args.cause.docsPath || args.docsPath : args.docsPath;
          const message = [
            shortMessage || "An error occurred.",
            "",
            ...args.metaMessages ? [...args.metaMessages, ""] : [],
            ...docsPath8 ? [`Docs: https://abitype.dev${docsPath8}`] : [],
            ...details ? [`Details: ${details}`] : [],
            `Version: abitype@${version}`
          ].join("\n");
          super(message);
          Object.defineProperty(this, "details", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          Object.defineProperty(this, "docsPath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          Object.defineProperty(this, "metaMessages", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          Object.defineProperty(this, "shortMessage", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "AbiTypeError"
          });
          if (args.cause)
            this.cause = args.cause;
          this.details = details;
          this.docsPath = docsPath8;
          this.metaMessages = args.metaMessages;
          this.shortMessage = shortMessage;
        }
      };
    }
  });

  // node_modules/abitype/dist/esm/regex.js
  function execTyped(regex, string) {
    const match = regex.exec(string);
    return match?.groups;
  }
  var bytesRegex, integerRegex, isTupleRegex;
  var init_regex = __esm({
    "node_modules/abitype/dist/esm/regex.js"() {
      bytesRegex = /^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/;
      integerRegex = /^u?int(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/;
      isTupleRegex = /^\(.+?\).*?$/;
    }
  });

  // node_modules/abitype/dist/esm/human-readable/formatAbiParameter.js
  function formatAbiParameter(abiParameter) {
    let type = abiParameter.type;
    if (tupleRegex.test(abiParameter.type) && "components" in abiParameter) {
      type = "(";
      const length = abiParameter.components.length;
      for (let i = 0; i < length; i++) {
        const component = abiParameter.components[i];
        type += formatAbiParameter(component);
        if (i < length - 1)
          type += ", ";
      }
      const result = execTyped(tupleRegex, abiParameter.type);
      type += `)${result?.array ?? ""}`;
      return formatAbiParameter({
        ...abiParameter,
        type
      });
    }
    if ("indexed" in abiParameter && abiParameter.indexed)
      type = `${type} indexed`;
    if (abiParameter.name)
      return `${type} ${abiParameter.name}`;
    return type;
  }
  var tupleRegex;
  var init_formatAbiParameter = __esm({
    "node_modules/abitype/dist/esm/human-readable/formatAbiParameter.js"() {
      init_regex();
      tupleRegex = /^tuple(?<array>(\[(\d*)\])*)$/;
    }
  });

  // node_modules/abitype/dist/esm/human-readable/formatAbiParameters.js
  function formatAbiParameters(abiParameters) {
    let params = "";
    const length = abiParameters.length;
    for (let i = 0; i < length; i++) {
      const abiParameter = abiParameters[i];
      params += formatAbiParameter(abiParameter);
      if (i !== length - 1)
        params += ", ";
    }
    return params;
  }
  var init_formatAbiParameters = __esm({
    "node_modules/abitype/dist/esm/human-readable/formatAbiParameters.js"() {
      init_formatAbiParameter();
    }
  });

  // node_modules/abitype/dist/esm/human-readable/formatAbiItem.js
  function formatAbiItem(abiItem) {
    if (abiItem.type === "function")
      return `function ${abiItem.name}(${formatAbiParameters(abiItem.inputs)})${abiItem.stateMutability && abiItem.stateMutability !== "nonpayable" ? ` ${abiItem.stateMutability}` : ""}${abiItem.outputs?.length ? ` returns (${formatAbiParameters(abiItem.outputs)})` : ""}`;
    if (abiItem.type === "event")
      return `event ${abiItem.name}(${formatAbiParameters(abiItem.inputs)})`;
    if (abiItem.type === "error")
      return `error ${abiItem.name}(${formatAbiParameters(abiItem.inputs)})`;
    if (abiItem.type === "constructor")
      return `constructor(${formatAbiParameters(abiItem.inputs)})${abiItem.stateMutability === "payable" ? " payable" : ""}`;
    if (abiItem.type === "fallback")
      return `fallback() external${abiItem.stateMutability === "payable" ? " payable" : ""}`;
    return "receive() external payable";
  }
  var init_formatAbiItem = __esm({
    "node_modules/abitype/dist/esm/human-readable/formatAbiItem.js"() {
      init_formatAbiParameters();
    }
  });

  // node_modules/abitype/dist/esm/human-readable/runtime/signatures.js
  function isErrorSignature(signature) {
    return errorSignatureRegex.test(signature);
  }
  function execErrorSignature(signature) {
    return execTyped(errorSignatureRegex, signature);
  }
  function isEventSignature(signature) {
    return eventSignatureRegex.test(signature);
  }
  function execEventSignature(signature) {
    return execTyped(eventSignatureRegex, signature);
  }
  function isFunctionSignature(signature) {
    return functionSignatureRegex.test(signature);
  }
  function execFunctionSignature(signature) {
    return execTyped(functionSignatureRegex, signature);
  }
  function isStructSignature(signature) {
    return structSignatureRegex.test(signature);
  }
  function execStructSignature(signature) {
    return execTyped(structSignatureRegex, signature);
  }
  function isConstructorSignature(signature) {
    return constructorSignatureRegex.test(signature);
  }
  function execConstructorSignature(signature) {
    return execTyped(constructorSignatureRegex, signature);
  }
  function isFallbackSignature(signature) {
    return fallbackSignatureRegex.test(signature);
  }
  function execFallbackSignature(signature) {
    return execTyped(fallbackSignatureRegex, signature);
  }
  function isReceiveSignature(signature) {
    return receiveSignatureRegex.test(signature);
  }
  var errorSignatureRegex, eventSignatureRegex, functionSignatureRegex, structSignatureRegex, constructorSignatureRegex, fallbackSignatureRegex, receiveSignatureRegex, modifiers, eventModifiers, functionModifiers;
  var init_signatures = __esm({
    "node_modules/abitype/dist/esm/human-readable/runtime/signatures.js"() {
      init_regex();
      errorSignatureRegex = /^error (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*)\((?<parameters>.*?)\)$/;
      eventSignatureRegex = /^event (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*)\((?<parameters>.*?)\)$/;
      functionSignatureRegex = /^function (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*)\((?<parameters>.*?)\)(?: (?<scope>external|public{1}))?(?: (?<stateMutability>pure|view|nonpayable|payable{1}))?(?: returns\s?\((?<returns>.*?)\))?$/;
      structSignatureRegex = /^struct (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*) \{(?<properties>.*?)\}$/;
      constructorSignatureRegex = /^constructor\((?<parameters>.*?)\)(?:\s(?<stateMutability>payable{1}))?$/;
      fallbackSignatureRegex = /^fallback\(\) external(?:\s(?<stateMutability>payable{1}))?$/;
      receiveSignatureRegex = /^receive\(\) external payable$/;
      modifiers = /* @__PURE__ */ new Set([
        "memory",
        "indexed",
        "storage",
        "calldata"
      ]);
      eventModifiers = /* @__PURE__ */ new Set(["indexed"]);
      functionModifiers = /* @__PURE__ */ new Set([
        "calldata",
        "memory",
        "storage"
      ]);
    }
  });

  // node_modules/abitype/dist/esm/human-readable/errors/abiItem.js
  var InvalidAbiItemError, UnknownTypeError, UnknownSolidityTypeError;
  var init_abiItem = __esm({
    "node_modules/abitype/dist/esm/human-readable/errors/abiItem.js"() {
      init_errors();
      InvalidAbiItemError = class extends BaseError {
        constructor({ signature }) {
          super("Failed to parse ABI item.", {
            details: `parseAbiItem(${JSON.stringify(signature, null, 2)})`,
            docsPath: "/api/human#parseabiitem-1"
          });
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "InvalidAbiItemError"
          });
        }
      };
      UnknownTypeError = class extends BaseError {
        constructor({ type }) {
          super("Unknown type.", {
            metaMessages: [
              `Type "${type}" is not a valid ABI type. Perhaps you forgot to include a struct signature?`
            ]
          });
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "UnknownTypeError"
          });
        }
      };
      UnknownSolidityTypeError = class extends BaseError {
        constructor({ type }) {
          super("Unknown type.", {
            metaMessages: [`Type "${type}" is not a valid ABI type.`]
          });
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "UnknownSolidityTypeError"
          });
        }
      };
    }
  });

  // node_modules/abitype/dist/esm/human-readable/errors/abiParameter.js
  var InvalidAbiParametersError, InvalidParameterError, SolidityProtectedKeywordError, InvalidModifierError, InvalidFunctionModifierError, InvalidAbiTypeParameterError;
  var init_abiParameter = __esm({
    "node_modules/abitype/dist/esm/human-readable/errors/abiParameter.js"() {
      init_errors();
      InvalidAbiParametersError = class extends BaseError {
        constructor({ params }) {
          super("Failed to parse ABI parameters.", {
            details: `parseAbiParameters(${JSON.stringify(params, null, 2)})`,
            docsPath: "/api/human#parseabiparameters-1"
          });
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "InvalidAbiParametersError"
          });
        }
      };
      InvalidParameterError = class extends BaseError {
        constructor({ param }) {
          super("Invalid ABI parameter.", {
            details: param
          });
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "InvalidParameterError"
          });
        }
      };
      SolidityProtectedKeywordError = class extends BaseError {
        constructor({ param, name }) {
          super("Invalid ABI parameter.", {
            details: param,
            metaMessages: [
              `"${name}" is a protected Solidity keyword. More info: https://docs.soliditylang.org/en/latest/cheatsheet.html`
            ]
          });
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "SolidityProtectedKeywordError"
          });
        }
      };
      InvalidModifierError = class extends BaseError {
        constructor({ param, type, modifier }) {
          super("Invalid ABI parameter.", {
            details: param,
            metaMessages: [
              `Modifier "${modifier}" not allowed${type ? ` in "${type}" type` : ""}.`
            ]
          });
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "InvalidModifierError"
          });
        }
      };
      InvalidFunctionModifierError = class extends BaseError {
        constructor({ param, type, modifier }) {
          super("Invalid ABI parameter.", {
            details: param,
            metaMessages: [
              `Modifier "${modifier}" not allowed${type ? ` in "${type}" type` : ""}.`,
              `Data location can only be specified for array, struct, or mapping types, but "${modifier}" was given.`
            ]
          });
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "InvalidFunctionModifierError"
          });
        }
      };
      InvalidAbiTypeParameterError = class extends BaseError {
        constructor({ abiParameter }) {
          super("Invalid ABI parameter.", {
            details: JSON.stringify(abiParameter, null, 2),
            metaMessages: ["ABI parameter type is invalid."]
          });
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "InvalidAbiTypeParameterError"
          });
        }
      };
    }
  });

  // node_modules/abitype/dist/esm/human-readable/errors/signature.js
  var InvalidSignatureError, UnknownSignatureError, InvalidStructSignatureError;
  var init_signature = __esm({
    "node_modules/abitype/dist/esm/human-readable/errors/signature.js"() {
      init_errors();
      InvalidSignatureError = class extends BaseError {
        constructor({ signature, type }) {
          super(`Invalid ${type} signature.`, {
            details: signature
          });
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "InvalidSignatureError"
          });
        }
      };
      UnknownSignatureError = class extends BaseError {
        constructor({ signature }) {
          super("Unknown signature.", {
            details: signature
          });
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "UnknownSignatureError"
          });
        }
      };
      InvalidStructSignatureError = class extends BaseError {
        constructor({ signature }) {
          super("Invalid struct signature.", {
            details: signature,
            metaMessages: ["No properties exist."]
          });
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "InvalidStructSignatureError"
          });
        }
      };
    }
  });

  // node_modules/abitype/dist/esm/human-readable/errors/struct.js
  var CircularReferenceError;
  var init_struct = __esm({
    "node_modules/abitype/dist/esm/human-readable/errors/struct.js"() {
      init_errors();
      CircularReferenceError = class extends BaseError {
        constructor({ type }) {
          super("Circular reference detected.", {
            metaMessages: [`Struct "${type}" is a circular reference.`]
          });
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "CircularReferenceError"
          });
        }
      };
    }
  });

  // node_modules/abitype/dist/esm/human-readable/errors/splitParameters.js
  var InvalidParenthesisError;
  var init_splitParameters = __esm({
    "node_modules/abitype/dist/esm/human-readable/errors/splitParameters.js"() {
      init_errors();
      InvalidParenthesisError = class extends BaseError {
        constructor({ current, depth }) {
          super("Unbalanced parentheses.", {
            metaMessages: [
              `"${current.trim()}" has too many ${depth > 0 ? "opening" : "closing"} parentheses.`
            ],
            details: `Depth "${depth}"`
          });
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "InvalidParenthesisError"
          });
        }
      };
    }
  });

  // node_modules/abitype/dist/esm/human-readable/runtime/cache.js
  function getParameterCacheKey(param, type, structs) {
    let structKey = "";
    if (structs)
      for (const struct of Object.entries(structs)) {
        if (!struct)
          continue;
        let propertyKey = "";
        for (const property of struct[1]) {
          propertyKey += `[${property.type}${property.name ? `:${property.name}` : ""}]`;
        }
        structKey += `(${struct[0]}{${propertyKey}})`;
      }
    if (type)
      return `${type}:${param}${structKey}`;
    return param;
  }
  var parameterCache;
  var init_cache = __esm({
    "node_modules/abitype/dist/esm/human-readable/runtime/cache.js"() {
      parameterCache = /* @__PURE__ */ new Map([
        // Unnamed
        ["address", { type: "address" }],
        ["bool", { type: "bool" }],
        ["bytes", { type: "bytes" }],
        ["bytes32", { type: "bytes32" }],
        ["int", { type: "int256" }],
        ["int256", { type: "int256" }],
        ["string", { type: "string" }],
        ["uint", { type: "uint256" }],
        ["uint8", { type: "uint8" }],
        ["uint16", { type: "uint16" }],
        ["uint24", { type: "uint24" }],
        ["uint32", { type: "uint32" }],
        ["uint64", { type: "uint64" }],
        ["uint96", { type: "uint96" }],
        ["uint112", { type: "uint112" }],
        ["uint160", { type: "uint160" }],
        ["uint192", { type: "uint192" }],
        ["uint256", { type: "uint256" }],
        // Named
        ["address owner", { type: "address", name: "owner" }],
        ["address to", { type: "address", name: "to" }],
        ["bool approved", { type: "bool", name: "approved" }],
        ["bytes _data", { type: "bytes", name: "_data" }],
        ["bytes data", { type: "bytes", name: "data" }],
        ["bytes signature", { type: "bytes", name: "signature" }],
        ["bytes32 hash", { type: "bytes32", name: "hash" }],
        ["bytes32 r", { type: "bytes32", name: "r" }],
        ["bytes32 root", { type: "bytes32", name: "root" }],
        ["bytes32 s", { type: "bytes32", name: "s" }],
        ["string name", { type: "string", name: "name" }],
        ["string symbol", { type: "string", name: "symbol" }],
        ["string tokenURI", { type: "string", name: "tokenURI" }],
        ["uint tokenId", { type: "uint256", name: "tokenId" }],
        ["uint8 v", { type: "uint8", name: "v" }],
        ["uint256 balance", { type: "uint256", name: "balance" }],
        ["uint256 tokenId", { type: "uint256", name: "tokenId" }],
        ["uint256 value", { type: "uint256", name: "value" }],
        // Indexed
        [
          "event:address indexed from",
          { type: "address", name: "from", indexed: true }
        ],
        ["event:address indexed to", { type: "address", name: "to", indexed: true }],
        [
          "event:uint indexed tokenId",
          { type: "uint256", name: "tokenId", indexed: true }
        ],
        [
          "event:uint256 indexed tokenId",
          { type: "uint256", name: "tokenId", indexed: true }
        ]
      ]);
    }
  });

  // node_modules/abitype/dist/esm/human-readable/runtime/utils.js
  function parseSignature(signature, structs = {}) {
    if (isFunctionSignature(signature))
      return parseFunctionSignature(signature, structs);
    if (isEventSignature(signature))
      return parseEventSignature(signature, structs);
    if (isErrorSignature(signature))
      return parseErrorSignature(signature, structs);
    if (isConstructorSignature(signature))
      return parseConstructorSignature(signature, structs);
    if (isFallbackSignature(signature))
      return parseFallbackSignature(signature);
    if (isReceiveSignature(signature))
      return {
        type: "receive",
        stateMutability: "payable"
      };
    throw new UnknownSignatureError({ signature });
  }
  function parseFunctionSignature(signature, structs = {}) {
    const match = execFunctionSignature(signature);
    if (!match)
      throw new InvalidSignatureError({ signature, type: "function" });
    const inputParams = splitParameters(match.parameters);
    const inputs = [];
    const inputLength = inputParams.length;
    for (let i = 0; i < inputLength; i++) {
      inputs.push(parseAbiParameter(inputParams[i], {
        modifiers: functionModifiers,
        structs,
        type: "function"
      }));
    }
    const outputs = [];
    if (match.returns) {
      const outputParams = splitParameters(match.returns);
      const outputLength = outputParams.length;
      for (let i = 0; i < outputLength; i++) {
        outputs.push(parseAbiParameter(outputParams[i], {
          modifiers: functionModifiers,
          structs,
          type: "function"
        }));
      }
    }
    return {
      name: match.name,
      type: "function",
      stateMutability: match.stateMutability ?? "nonpayable",
      inputs,
      outputs
    };
  }
  function parseEventSignature(signature, structs = {}) {
    const match = execEventSignature(signature);
    if (!match)
      throw new InvalidSignatureError({ signature, type: "event" });
    const params = splitParameters(match.parameters);
    const abiParameters = [];
    const length = params.length;
    for (let i = 0; i < length; i++)
      abiParameters.push(parseAbiParameter(params[i], {
        modifiers: eventModifiers,
        structs,
        type: "event"
      }));
    return { name: match.name, type: "event", inputs: abiParameters };
  }
  function parseErrorSignature(signature, structs = {}) {
    const match = execErrorSignature(signature);
    if (!match)
      throw new InvalidSignatureError({ signature, type: "error" });
    const params = splitParameters(match.parameters);
    const abiParameters = [];
    const length = params.length;
    for (let i = 0; i < length; i++)
      abiParameters.push(parseAbiParameter(params[i], { structs, type: "error" }));
    return { name: match.name, type: "error", inputs: abiParameters };
  }
  function parseConstructorSignature(signature, structs = {}) {
    const match = execConstructorSignature(signature);
    if (!match)
      throw new InvalidSignatureError({ signature, type: "constructor" });
    const params = splitParameters(match.parameters);
    const abiParameters = [];
    const length = params.length;
    for (let i = 0; i < length; i++)
      abiParameters.push(parseAbiParameter(params[i], { structs, type: "constructor" }));
    return {
      type: "constructor",
      stateMutability: match.stateMutability ?? "nonpayable",
      inputs: abiParameters
    };
  }
  function parseFallbackSignature(signature) {
    const match = execFallbackSignature(signature);
    if (!match)
      throw new InvalidSignatureError({ signature, type: "fallback" });
    return {
      type: "fallback",
      stateMutability: match.stateMutability ?? "nonpayable"
    };
  }
  function parseAbiParameter(param, options) {
    const parameterCacheKey = getParameterCacheKey(param, options?.type, options?.structs);
    if (parameterCache.has(parameterCacheKey))
      return parameterCache.get(parameterCacheKey);
    const isTuple = isTupleRegex.test(param);
    const match = execTyped(isTuple ? abiParameterWithTupleRegex : abiParameterWithoutTupleRegex, param);
    if (!match)
      throw new InvalidParameterError({ param });
    if (match.name && isSolidityKeyword(match.name))
      throw new SolidityProtectedKeywordError({ param, name: match.name });
    const name = match.name ? { name: match.name } : {};
    const indexed = match.modifier === "indexed" ? { indexed: true } : {};
    const structs = options?.structs ?? {};
    let type;
    let components = {};
    if (isTuple) {
      type = "tuple";
      const params = splitParameters(match.type);
      const components_ = [];
      const length = params.length;
      for (let i = 0; i < length; i++) {
        components_.push(parseAbiParameter(params[i], { structs }));
      }
      components = { components: components_ };
    } else if (match.type in structs) {
      type = "tuple";
      components = { components: structs[match.type] };
    } else if (dynamicIntegerRegex.test(match.type)) {
      type = `${match.type}256`;
    } else if (match.type === "address payable") {
      type = "address";
    } else {
      type = match.type;
      if (!(options?.type === "struct") && !isSolidityType(type))
        throw new UnknownSolidityTypeError({ type });
    }
    if (match.modifier) {
      if (!options?.modifiers?.has?.(match.modifier))
        throw new InvalidModifierError({
          param,
          type: options?.type,
          modifier: match.modifier
        });
      if (functionModifiers.has(match.modifier) && !isValidDataLocation(type, !!match.array))
        throw new InvalidFunctionModifierError({
          param,
          type: options?.type,
          modifier: match.modifier
        });
    }
    const abiParameter = {
      type: `${type}${match.array ?? ""}`,
      ...name,
      ...indexed,
      ...components
    };
    parameterCache.set(parameterCacheKey, abiParameter);
    return abiParameter;
  }
  function splitParameters(params, result = [], current = "", depth = 0) {
    const length = params.trim().length;
    for (let i = 0; i < length; i++) {
      const char = params[i];
      const tail = params.slice(i + 1);
      switch (char) {
        case ",":
          return depth === 0 ? splitParameters(tail, [...result, current.trim()]) : splitParameters(tail, result, `${current}${char}`, depth);
        case "(":
          return splitParameters(tail, result, `${current}${char}`, depth + 1);
        case ")":
          return splitParameters(tail, result, `${current}${char}`, depth - 1);
        default:
          return splitParameters(tail, result, `${current}${char}`, depth);
      }
    }
    if (current === "")
      return result;
    if (depth !== 0)
      throw new InvalidParenthesisError({ current, depth });
    result.push(current.trim());
    return result;
  }
  function isSolidityType(type) {
    return type === "address" || type === "bool" || type === "function" || type === "string" || bytesRegex.test(type) || integerRegex.test(type);
  }
  function isSolidityKeyword(name) {
    return name === "address" || name === "bool" || name === "function" || name === "string" || name === "tuple" || bytesRegex.test(name) || integerRegex.test(name) || protectedKeywordsRegex.test(name);
  }
  function isValidDataLocation(type, isArray) {
    return isArray || type === "bytes" || type === "string" || type === "tuple";
  }
  var abiParameterWithoutTupleRegex, abiParameterWithTupleRegex, dynamicIntegerRegex, protectedKeywordsRegex;
  var init_utils = __esm({
    "node_modules/abitype/dist/esm/human-readable/runtime/utils.js"() {
      init_regex();
      init_abiItem();
      init_abiParameter();
      init_signature();
      init_splitParameters();
      init_cache();
      init_signatures();
      abiParameterWithoutTupleRegex = /^(?<type>[a-zA-Z$_][a-zA-Z0-9$_]*(?:\spayable)?)(?<array>(?:\[\d*?\])+?)?(?:\s(?<modifier>calldata|indexed|memory|storage{1}))?(?:\s(?<name>[a-zA-Z$_][a-zA-Z0-9$_]*))?$/;
      abiParameterWithTupleRegex = /^\((?<type>.+?)\)(?<array>(?:\[\d*?\])+?)?(?:\s(?<modifier>calldata|indexed|memory|storage{1}))?(?:\s(?<name>[a-zA-Z$_][a-zA-Z0-9$_]*))?$/;
      dynamicIntegerRegex = /^u?int$/;
      protectedKeywordsRegex = /^(?:after|alias|anonymous|apply|auto|byte|calldata|case|catch|constant|copyof|default|defined|error|event|external|false|final|function|immutable|implements|in|indexed|inline|internal|let|mapping|match|memory|mutable|null|of|override|partial|private|promise|public|pure|reference|relocatable|return|returns|sizeof|static|storage|struct|super|supports|switch|this|true|try|typedef|typeof|var|view|virtual)$/;
    }
  });

  // node_modules/abitype/dist/esm/human-readable/runtime/structs.js
  function parseStructs(signatures) {
    const shallowStructs = {};
    const signaturesLength = signatures.length;
    for (let i = 0; i < signaturesLength; i++) {
      const signature = signatures[i];
      if (!isStructSignature(signature))
        continue;
      const match = execStructSignature(signature);
      if (!match)
        throw new InvalidSignatureError({ signature, type: "struct" });
      const properties = match.properties.split(";");
      const components = [];
      const propertiesLength = properties.length;
      for (let k = 0; k < propertiesLength; k++) {
        const property = properties[k];
        const trimmed = property.trim();
        if (!trimmed)
          continue;
        const abiParameter = parseAbiParameter(trimmed, {
          type: "struct"
        });
        components.push(abiParameter);
      }
      if (!components.length)
        throw new InvalidStructSignatureError({ signature });
      shallowStructs[match.name] = components;
    }
    const resolvedStructs = {};
    const entries = Object.entries(shallowStructs);
    const entriesLength = entries.length;
    for (let i = 0; i < entriesLength; i++) {
      const [name, parameters] = entries[i];
      resolvedStructs[name] = resolveStructs(parameters, shallowStructs);
    }
    return resolvedStructs;
  }
  function resolveStructs(abiParameters, structs, ancestors = /* @__PURE__ */ new Set()) {
    const components = [];
    const length = abiParameters.length;
    for (let i = 0; i < length; i++) {
      const abiParameter = abiParameters[i];
      const isTuple = isTupleRegex.test(abiParameter.type);
      if (isTuple)
        components.push(abiParameter);
      else {
        const match = execTyped(typeWithoutTupleRegex, abiParameter.type);
        if (!match?.type)
          throw new InvalidAbiTypeParameterError({ abiParameter });
        const { array, type } = match;
        if (type in structs) {
          if (ancestors.has(type))
            throw new CircularReferenceError({ type });
          components.push({
            ...abiParameter,
            type: `tuple${array ?? ""}`,
            components: resolveStructs(structs[type] ?? [], structs, /* @__PURE__ */ new Set([...ancestors, type]))
          });
        } else {
          if (isSolidityType(type))
            components.push(abiParameter);
          else
            throw new UnknownTypeError({ type });
        }
      }
    }
    return components;
  }
  var typeWithoutTupleRegex;
  var init_structs = __esm({
    "node_modules/abitype/dist/esm/human-readable/runtime/structs.js"() {
      init_regex();
      init_abiItem();
      init_abiParameter();
      init_signature();
      init_struct();
      init_signatures();
      init_utils();
      typeWithoutTupleRegex = /^(?<type>[a-zA-Z$_][a-zA-Z0-9$_]*)(?<array>(?:\[\d*?\])+?)?$/;
    }
  });

  // node_modules/abitype/dist/esm/human-readable/parseAbi.js
  function parseAbi(signatures) {
    const structs = parseStructs(signatures);
    const abi3 = [];
    const length = signatures.length;
    for (let i = 0; i < length; i++) {
      const signature = signatures[i];
      if (isStructSignature(signature))
        continue;
      abi3.push(parseSignature(signature, structs));
    }
    return abi3;
  }
  var init_parseAbi = __esm({
    "node_modules/abitype/dist/esm/human-readable/parseAbi.js"() {
      init_signatures();
      init_structs();
      init_utils();
    }
  });

  // node_modules/abitype/dist/esm/human-readable/parseAbiItem.js
  function parseAbiItem(signature) {
    let abiItem;
    if (typeof signature === "string")
      abiItem = parseSignature(signature);
    else {
      const structs = parseStructs(signature);
      const length = signature.length;
      for (let i = 0; i < length; i++) {
        const signature_ = signature[i];
        if (isStructSignature(signature_))
          continue;
        abiItem = parseSignature(signature_, structs);
        break;
      }
    }
    if (!abiItem)
      throw new InvalidAbiItemError({ signature });
    return abiItem;
  }
  var init_parseAbiItem = __esm({
    "node_modules/abitype/dist/esm/human-readable/parseAbiItem.js"() {
      init_abiItem();
      init_signatures();
      init_structs();
      init_utils();
    }
  });

  // node_modules/abitype/dist/esm/human-readable/parseAbiParameters.js
  function parseAbiParameters(params) {
    const abiParameters = [];
    if (typeof params === "string") {
      const parameters = splitParameters(params);
      const length = parameters.length;
      for (let i = 0; i < length; i++) {
        abiParameters.push(parseAbiParameter(parameters[i], { modifiers }));
      }
    } else {
      const structs = parseStructs(params);
      const length = params.length;
      for (let i = 0; i < length; i++) {
        const signature = params[i];
        if (isStructSignature(signature))
          continue;
        const parameters = splitParameters(signature);
        const length2 = parameters.length;
        for (let k = 0; k < length2; k++) {
          abiParameters.push(parseAbiParameter(parameters[k], { modifiers, structs }));
        }
      }
    }
    if (abiParameters.length === 0)
      throw new InvalidAbiParametersError({ params });
    return abiParameters;
  }
  var init_parseAbiParameters = __esm({
    "node_modules/abitype/dist/esm/human-readable/parseAbiParameters.js"() {
      init_abiParameter();
      init_signatures();
      init_structs();
      init_utils();
      init_utils();
    }
  });

  // node_modules/abitype/dist/esm/exports/index.js
  var init_exports = __esm({
    "node_modules/abitype/dist/esm/exports/index.js"() {
      init_formatAbiItem();
      init_formatAbiParameters();
      init_parseAbi();
      init_parseAbiItem();
      init_parseAbiParameters();
    }
  });

  // node_modules/viem/_esm/utils/getAction.js
  function getAction(client, actionFn, name) {
    const action_implicit = client[actionFn.name];
    if (typeof action_implicit === "function")
      return action_implicit;
    const action_explicit = client[name];
    if (typeof action_explicit === "function")
      return action_explicit;
    return (params) => actionFn(client, params);
  }
  var init_getAction = __esm({
    "node_modules/viem/_esm/utils/getAction.js"() {
    }
  });

  // node_modules/viem/_esm/utils/abi/formatAbiItem.js
  function formatAbiItem2(abiItem, { includeName = false } = {}) {
    if (abiItem.type !== "function" && abiItem.type !== "event" && abiItem.type !== "error")
      throw new InvalidDefinitionTypeError(abiItem.type);
    return `${abiItem.name}(${formatAbiParams(abiItem.inputs, { includeName })})`;
  }
  function formatAbiParams(params, { includeName = false } = {}) {
    if (!params)
      return "";
    return params.map((param) => formatAbiParam(param, { includeName })).join(includeName ? ", " : ",");
  }
  function formatAbiParam(param, { includeName }) {
    if (param.type.startsWith("tuple")) {
      return `(${formatAbiParams(param.components, { includeName })})${param.type.slice("tuple".length)}`;
    }
    return param.type + (includeName && param.name ? ` ${param.name}` : "");
  }
  var init_formatAbiItem2 = __esm({
    "node_modules/viem/_esm/utils/abi/formatAbiItem.js"() {
      init_abi();
    }
  });

  // node_modules/viem/_esm/utils/data/isHex.js
  function isHex(value, { strict = true } = {}) {
    if (!value)
      return false;
    if (typeof value !== "string")
      return false;
    return strict ? /^0x[0-9a-fA-F]*$/.test(value) : value.startsWith("0x");
  }
  var init_isHex = __esm({
    "node_modules/viem/_esm/utils/data/isHex.js"() {
    }
  });

  // node_modules/viem/_esm/utils/data/size.js
  function size(value) {
    if (isHex(value, { strict: false }))
      return Math.ceil((value.length - 2) / 2);
    return value.length;
  }
  var init_size = __esm({
    "node_modules/viem/_esm/utils/data/size.js"() {
      init_isHex();
    }
  });

  // node_modules/viem/_esm/errors/version.js
  var version2;
  var init_version2 = __esm({
    "node_modules/viem/_esm/errors/version.js"() {
      version2 = "2.38.3";
    }
  });

  // node_modules/viem/_esm/errors/base.js
  function walk(err, fn) {
    if (fn?.(err))
      return err;
    if (err && typeof err === "object" && "cause" in err && err.cause !== void 0)
      return walk(err.cause, fn);
    return fn ? null : err;
  }
  var errorConfig, BaseError2;
  var init_base = __esm({
    "node_modules/viem/_esm/errors/base.js"() {
      init_version2();
      errorConfig = {
        getDocsUrl: ({ docsBaseUrl, docsPath: docsPath8 = "", docsSlug }) => docsPath8 ? `${docsBaseUrl ?? "https://viem.sh"}${docsPath8}${docsSlug ? `#${docsSlug}` : ""}` : void 0,
        version: `viem@${version2}`
      };
      BaseError2 = class _BaseError extends Error {
        constructor(shortMessage, args = {}) {
          const details = (() => {
            if (args.cause instanceof _BaseError)
              return args.cause.details;
            if (args.cause?.message)
              return args.cause.message;
            return args.details;
          })();
          const docsPath8 = (() => {
            if (args.cause instanceof _BaseError)
              return args.cause.docsPath || args.docsPath;
            return args.docsPath;
          })();
          const docsUrl = errorConfig.getDocsUrl?.({ ...args, docsPath: docsPath8 });
          const message = [
            shortMessage || "An error occurred.",
            "",
            ...args.metaMessages ? [...args.metaMessages, ""] : [],
            ...docsUrl ? [`Docs: ${docsUrl}`] : [],
            ...details ? [`Details: ${details}`] : [],
            ...errorConfig.version ? [`Version: ${errorConfig.version}`] : []
          ].join("\n");
          super(message, args.cause ? { cause: args.cause } : void 0);
          Object.defineProperty(this, "details", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          Object.defineProperty(this, "docsPath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          Object.defineProperty(this, "metaMessages", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          Object.defineProperty(this, "shortMessage", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          Object.defineProperty(this, "version", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "BaseError"
          });
          this.details = details;
          this.docsPath = docsPath8;
          this.metaMessages = args.metaMessages;
          this.name = args.name ?? this.name;
          this.shortMessage = shortMessage;
          this.version = version2;
        }
        walk(fn) {
          return walk(this, fn);
        }
      };
    }
  });

  // node_modules/viem/_esm/errors/abi.js
  var AbiConstructorNotFoundError, AbiConstructorParamsNotFoundError, AbiDecodingDataSizeTooSmallError, AbiDecodingZeroDataError, AbiEncodingArrayLengthMismatchError, AbiEncodingBytesSizeMismatchError, AbiEncodingLengthMismatchError, AbiErrorInputsNotFoundError, AbiErrorNotFoundError, AbiErrorSignatureNotFoundError, AbiEventSignatureEmptyTopicsError, AbiEventSignatureNotFoundError, AbiEventNotFoundError, AbiFunctionNotFoundError, AbiFunctionOutputsNotFoundError, AbiFunctionSignatureNotFoundError, AbiItemAmbiguityError, BytesSizeMismatchError, DecodeLogDataMismatch, DecodeLogTopicsMismatch, InvalidAbiEncodingTypeError, InvalidAbiDecodingTypeError, InvalidArrayError, InvalidDefinitionTypeError, UnsupportedPackedAbiType;
  var init_abi = __esm({
    "node_modules/viem/_esm/errors/abi.js"() {
      init_formatAbiItem2();
      init_size();
      init_base();
      AbiConstructorNotFoundError = class extends BaseError2 {
        constructor({ docsPath: docsPath8 }) {
          super([
            "A constructor was not found on the ABI.",
            "Make sure you are using the correct ABI and that the constructor exists on it."
          ].join("\n"), {
            docsPath: docsPath8,
            name: "AbiConstructorNotFoundError"
          });
        }
      };
      AbiConstructorParamsNotFoundError = class extends BaseError2 {
        constructor({ docsPath: docsPath8 }) {
          super([
            "Constructor arguments were provided (`args`), but a constructor parameters (`inputs`) were not found on the ABI.",
            "Make sure you are using the correct ABI, and that the `inputs` attribute on the constructor exists."
          ].join("\n"), {
            docsPath: docsPath8,
            name: "AbiConstructorParamsNotFoundError"
          });
        }
      };
      AbiDecodingDataSizeTooSmallError = class extends BaseError2 {
        constructor({ data, params, size: size5 }) {
          super([`Data size of ${size5} bytes is too small for given parameters.`].join("\n"), {
            metaMessages: [
              `Params: (${formatAbiParams(params, { includeName: true })})`,
              `Data:   ${data} (${size5} bytes)`
            ],
            name: "AbiDecodingDataSizeTooSmallError"
          });
          Object.defineProperty(this, "data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          Object.defineProperty(this, "params", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          Object.defineProperty(this, "size", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          this.data = data;
          this.params = params;
          this.size = size5;
        }
      };
      AbiDecodingZeroDataError = class extends BaseError2 {
        constructor() {
          super('Cannot decode zero data ("0x") with ABI parameters.', {
            name: "AbiDecodingZeroDataError"
          });
        }
      };
      AbiEncodingArrayLengthMismatchError = class extends BaseError2 {
        constructor({ expectedLength, givenLength, type }) {
          super([
            `ABI encoding array length mismatch for type ${type}.`,
            `Expected length: ${expectedLength}`,
            `Given length: ${givenLength}`
          ].join("\n"), { name: "AbiEncodingArrayLengthMismatchError" });
        }
      };
      AbiEncodingBytesSizeMismatchError = class extends BaseError2 {
        constructor({ expectedSize, value }) {
          super(`Size of bytes "${value}" (bytes${size(value)}) does not match expected size (bytes${expectedSize}).`, { name: "AbiEncodingBytesSizeMismatchError" });
        }
      };
      AbiEncodingLengthMismatchError = class extends BaseError2 {
        constructor({ expectedLength, givenLength }) {
          super([
            "ABI encoding params/values length mismatch.",
            `Expected length (params): ${expectedLength}`,
            `Given length (values): ${givenLength}`
          ].join("\n"), { name: "AbiEncodingLengthMismatchError" });
        }
      };
      AbiErrorInputsNotFoundError = class extends BaseError2 {
        constructor(errorName, { docsPath: docsPath8 }) {
          super([
            `Arguments (\`args\`) were provided to "${errorName}", but "${errorName}" on the ABI does not contain any parameters (\`inputs\`).`,
            "Cannot encode error result without knowing what the parameter types are.",
            "Make sure you are using the correct ABI and that the inputs exist on it."
          ].join("\n"), {
            docsPath: docsPath8,
            name: "AbiErrorInputsNotFoundError"
          });
        }
      };
      AbiErrorNotFoundError = class extends BaseError2 {
        constructor(errorName, { docsPath: docsPath8 } = {}) {
          super([
            `Error ${errorName ? `"${errorName}" ` : ""}not found on ABI.`,
            "Make sure you are using the correct ABI and that the error exists on it."
          ].join("\n"), {
            docsPath: docsPath8,
            name: "AbiErrorNotFoundError"
          });
        }
      };
      AbiErrorSignatureNotFoundError = class extends BaseError2 {
        constructor(signature, { docsPath: docsPath8 }) {
          super([
            `Encoded error signature "${signature}" not found on ABI.`,
            "Make sure you are using the correct ABI and that the error exists on it.",
            `You can look up the decoded signature here: https://openchain.xyz/signatures?query=${signature}.`
          ].join("\n"), {
            docsPath: docsPath8,
            name: "AbiErrorSignatureNotFoundError"
          });
          Object.defineProperty(this, "signature", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          this.signature = signature;
        }
      };
      AbiEventSignatureEmptyTopicsError = class extends BaseError2 {
        constructor({ docsPath: docsPath8 }) {
          super("Cannot extract event signature from empty topics.", {
            docsPath: docsPath8,
            name: "AbiEventSignatureEmptyTopicsError"
          });
        }
      };
      AbiEventSignatureNotFoundError = class extends BaseError2 {
        constructor(signature, { docsPath: docsPath8 }) {
          super([
            `Encoded event signature "${signature}" not found on ABI.`,
            "Make sure you are using the correct ABI and that the event exists on it.",
            `You can look up the signature here: https://openchain.xyz/signatures?query=${signature}.`
          ].join("\n"), {
            docsPath: docsPath8,
            name: "AbiEventSignatureNotFoundError"
          });
        }
      };
      AbiEventNotFoundError = class extends BaseError2 {
        constructor(eventName, { docsPath: docsPath8 } = {}) {
          super([
            `Event ${eventName ? `"${eventName}" ` : ""}not found on ABI.`,
            "Make sure you are using the correct ABI and that the event exists on it."
          ].join("\n"), {
            docsPath: docsPath8,
            name: "AbiEventNotFoundError"
          });
        }
      };
      AbiFunctionNotFoundError = class extends BaseError2 {
        constructor(functionName, { docsPath: docsPath8 } = {}) {
          super([
            `Function ${functionName ? `"${functionName}" ` : ""}not found on ABI.`,
            "Make sure you are using the correct ABI and that the function exists on it."
          ].join("\n"), {
            docsPath: docsPath8,
            name: "AbiFunctionNotFoundError"
          });
        }
      };
      AbiFunctionOutputsNotFoundError = class extends BaseError2 {
        constructor(functionName, { docsPath: docsPath8 }) {
          super([
            `Function "${functionName}" does not contain any \`outputs\` on ABI.`,
            "Cannot decode function result without knowing what the parameter types are.",
            "Make sure you are using the correct ABI and that the function exists on it."
          ].join("\n"), {
            docsPath: docsPath8,
            name: "AbiFunctionOutputsNotFoundError"
          });
        }
      };
      AbiFunctionSignatureNotFoundError = class extends BaseError2 {
        constructor(signature, { docsPath: docsPath8 }) {
          super([
            `Encoded function signature "${signature}" not found on ABI.`,
            "Make sure you are using the correct ABI and that the function exists on it.",
            `You can look up the signature here: https://openchain.xyz/signatures?query=${signature}.`
          ].join("\n"), {
            docsPath: docsPath8,
            name: "AbiFunctionSignatureNotFoundError"
          });
        }
      };
      AbiItemAmbiguityError = class extends BaseError2 {
        constructor(x, y) {
          super("Found ambiguous types in overloaded ABI items.", {
            metaMessages: [
              `\`${x.type}\` in \`${formatAbiItem2(x.abiItem)}\`, and`,
              `\`${y.type}\` in \`${formatAbiItem2(y.abiItem)}\``,
              "",
              "These types encode differently and cannot be distinguished at runtime.",
              "Remove one of the ambiguous items in the ABI."
            ],
            name: "AbiItemAmbiguityError"
          });
        }
      };
      BytesSizeMismatchError = class extends BaseError2 {
        constructor({ expectedSize, givenSize }) {
          super(`Expected bytes${expectedSize}, got bytes${givenSize}.`, {
            name: "BytesSizeMismatchError"
          });
        }
      };
      DecodeLogDataMismatch = class extends BaseError2 {
        constructor({ abiItem, data, params, size: size5 }) {
          super([
            `Data size of ${size5} bytes is too small for non-indexed event parameters.`
          ].join("\n"), {
            metaMessages: [
              `Params: (${formatAbiParams(params, { includeName: true })})`,
              `Data:   ${data} (${size5} bytes)`
            ],
            name: "DecodeLogDataMismatch"
          });
          Object.defineProperty(this, "abiItem", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          Object.defineProperty(this, "data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          Object.defineProperty(this, "params", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          Object.defineProperty(this, "size", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          this.abiItem = abiItem;
          this.data = data;
          this.params = params;
          this.size = size5;
        }
      };
      DecodeLogTopicsMismatch = class extends BaseError2 {
        constructor({ abiItem, param }) {
          super([
            `Expected a topic for indexed event parameter${param.name ? ` "${param.name}"` : ""} on event "${formatAbiItem2(abiItem, { includeName: true })}".`
          ].join("\n"), { name: "DecodeLogTopicsMismatch" });
          Object.defineProperty(this, "abiItem", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          this.abiItem = abiItem;
        }
      };
      InvalidAbiEncodingTypeError = class extends BaseError2 {
        constructor(type, { docsPath: docsPath8 }) {
          super([
            `Type "${type}" is not a valid encoding type.`,
            "Please provide a valid ABI type."
          ].join("\n"), { docsPath: docsPath8, name: "InvalidAbiEncodingType" });
        }
      };
      InvalidAbiDecodingTypeError = class extends BaseError2 {
        constructor(type, { docsPath: docsPath8 }) {
          super([
            `Type "${type}" is not a valid decoding type.`,
            "Please provide a valid ABI type."
          ].join("\n"), { docsPath: docsPath8, name: "InvalidAbiDecodingType" });
        }
      };
      InvalidArrayError = class extends BaseError2 {
        constructor(value) {
          super([`Value "${value}" is not a valid array.`].join("\n"), {
            name: "InvalidArrayError"
          });
        }
      };
      InvalidDefinitionTypeError = class extends BaseError2 {
        constructor(type) {
          super([
            `"${type}" is not a valid definition type.`,
            'Valid types: "function", "event", "error"'
          ].join("\n"), { name: "InvalidDefinitionTypeError" });
        }
      };
      UnsupportedPackedAbiType = class extends BaseError2 {
        constructor(type) {
          super(`Type "${type}" is not supported for packed encoding.`, {
            name: "UnsupportedPackedAbiType"
          });
        }
      };
    }
  });

  // node_modules/viem/_esm/errors/log.js
  var FilterTypeNotSupportedError;
  var init_log = __esm({
    "node_modules/viem/_esm/errors/log.js"() {
      init_base();
      FilterTypeNotSupportedError = class extends BaseError2 {
        constructor(type) {
          super(`Filter type "${type}" is not supported.`, {
            name: "FilterTypeNotSupportedError"
          });
        }
      };
    }
  });

  // node_modules/viem/_esm/errors/data.js
  var SliceOffsetOutOfBoundsError, SizeExceedsPaddingSizeError, InvalidBytesLengthError;
  var init_data = __esm({
    "node_modules/viem/_esm/errors/data.js"() {
      init_base();
      SliceOffsetOutOfBoundsError = class extends BaseError2 {
        constructor({ offset, position, size: size5 }) {
          super(`Slice ${position === "start" ? "starting" : "ending"} at offset "${offset}" is out-of-bounds (size: ${size5}).`, { name: "SliceOffsetOutOfBoundsError" });
        }
      };
      SizeExceedsPaddingSizeError = class extends BaseError2 {
        constructor({ size: size5, targetSize, type }) {
          super(`${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()} size (${size5}) exceeds padding size (${targetSize}).`, { name: "SizeExceedsPaddingSizeError" });
        }
      };
      InvalidBytesLengthError = class extends BaseError2 {
        constructor({ size: size5, targetSize, type }) {
          super(`${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()} is expected to be ${targetSize} ${type} long, but is ${size5} ${type} long.`, { name: "InvalidBytesLengthError" });
        }
      };
    }
  });

  // node_modules/viem/_esm/utils/data/pad.js
  function pad(hexOrBytes, { dir, size: size5 = 32 } = {}) {
    if (typeof hexOrBytes === "string")
      return padHex(hexOrBytes, { dir, size: size5 });
    return padBytes(hexOrBytes, { dir, size: size5 });
  }
  function padHex(hex_, { dir, size: size5 = 32 } = {}) {
    if (size5 === null)
      return hex_;
    const hex = hex_.replace("0x", "");
    if (hex.length > size5 * 2)
      throw new SizeExceedsPaddingSizeError({
        size: Math.ceil(hex.length / 2),
        targetSize: size5,
        type: "hex"
      });
    return `0x${hex[dir === "right" ? "padEnd" : "padStart"](size5 * 2, "0")}`;
  }
  function padBytes(bytes, { dir, size: size5 = 32 } = {}) {
    if (size5 === null)
      return bytes;
    if (bytes.length > size5)
      throw new SizeExceedsPaddingSizeError({
        size: bytes.length,
        targetSize: size5,
        type: "bytes"
      });
    const paddedBytes = new Uint8Array(size5);
    for (let i = 0; i < size5; i++) {
      const padEnd = dir === "right";
      paddedBytes[padEnd ? i : size5 - i - 1] = bytes[padEnd ? i : bytes.length - i - 1];
    }
    return paddedBytes;
  }
  var init_pad = __esm({
    "node_modules/viem/_esm/utils/data/pad.js"() {
      init_data();
    }
  });

  // node_modules/viem/_esm/errors/encoding.js
  var IntegerOutOfRangeError, InvalidBytesBooleanError, InvalidHexBooleanError, SizeOverflowError;
  var init_encoding = __esm({
    "node_modules/viem/_esm/errors/encoding.js"() {
      init_base();
      IntegerOutOfRangeError = class extends BaseError2 {
        constructor({ max, min, signed, size: size5, value }) {
          super(`Number "${value}" is not in safe ${size5 ? `${size5 * 8}-bit ${signed ? "signed" : "unsigned"} ` : ""}integer range ${max ? `(${min} to ${max})` : `(above ${min})`}`, { name: "IntegerOutOfRangeError" });
        }
      };
      InvalidBytesBooleanError = class extends BaseError2 {
        constructor(bytes) {
          super(`Bytes value "${bytes}" is not a valid boolean. The bytes array must contain a single byte of either a 0 or 1 value.`, {
            name: "InvalidBytesBooleanError"
          });
        }
      };
      InvalidHexBooleanError = class extends BaseError2 {
        constructor(hex) {
          super(`Hex value "${hex}" is not a valid boolean. The hex value must be "0x0" (false) or "0x1" (true).`, { name: "InvalidHexBooleanError" });
        }
      };
      SizeOverflowError = class extends BaseError2 {
        constructor({ givenSize, maxSize }) {
          super(`Size cannot exceed ${maxSize} bytes. Given size: ${givenSize} bytes.`, { name: "SizeOverflowError" });
        }
      };
    }
  });

  // node_modules/viem/_esm/utils/data/trim.js
  function trim(hexOrBytes, { dir = "left" } = {}) {
    let data = typeof hexOrBytes === "string" ? hexOrBytes.replace("0x", "") : hexOrBytes;
    let sliceLength = 0;
    for (let i = 0; i < data.length - 1; i++) {
      if (data[dir === "left" ? i : data.length - i - 1].toString() === "0")
        sliceLength++;
      else
        break;
    }
    data = dir === "left" ? data.slice(sliceLength) : data.slice(0, data.length - sliceLength);
    if (typeof hexOrBytes === "string") {
      if (data.length === 1 && dir === "right")
        data = `${data}0`;
      return `0x${data.length % 2 === 1 ? `0${data}` : data}`;
    }
    return data;
  }
  var init_trim = __esm({
    "node_modules/viem/_esm/utils/data/trim.js"() {
    }
  });

  // node_modules/viem/_esm/utils/encoding/fromHex.js
  function assertSize(hexOrBytes, { size: size5 }) {
    if (size(hexOrBytes) > size5)
      throw new SizeOverflowError({
        givenSize: size(hexOrBytes),
        maxSize: size5
      });
  }
  function hexToBigInt(hex, opts = {}) {
    const { signed } = opts;
    if (opts.size)
      assertSize(hex, { size: opts.size });
    const value = BigInt(hex);
    if (!signed)
      return value;
    const size5 = (hex.length - 2) / 2;
    const max = (1n << BigInt(size5) * 8n - 1n) - 1n;
    if (value <= max)
      return value;
    return value - BigInt(`0x${"f".padStart(size5 * 2, "f")}`) - 1n;
  }
  function hexToBool(hex_, opts = {}) {
    let hex = hex_;
    if (opts.size) {
      assertSize(hex, { size: opts.size });
      hex = trim(hex);
    }
    if (trim(hex) === "0x00")
      return false;
    if (trim(hex) === "0x01")
      return true;
    throw new InvalidHexBooleanError(hex);
  }
  function hexToNumber(hex, opts = {}) {
    return Number(hexToBigInt(hex, opts));
  }
  var init_fromHex = __esm({
    "node_modules/viem/_esm/utils/encoding/fromHex.js"() {
      init_encoding();
      init_size();
      init_trim();
    }
  });

  // node_modules/viem/_esm/utils/encoding/toHex.js
  function toHex(value, opts = {}) {
    if (typeof value === "number" || typeof value === "bigint")
      return numberToHex(value, opts);
    if (typeof value === "string") {
      return stringToHex(value, opts);
    }
    if (typeof value === "boolean")
      return boolToHex(value, opts);
    return bytesToHex(value, opts);
  }
  function boolToHex(value, opts = {}) {
    const hex = `0x${Number(value)}`;
    if (typeof opts.size === "number") {
      assertSize(hex, { size: opts.size });
      return pad(hex, { size: opts.size });
    }
    return hex;
  }
  function bytesToHex(value, opts = {}) {
    let string = "";
    for (let i = 0; i < value.length; i++) {
      string += hexes[value[i]];
    }
    const hex = `0x${string}`;
    if (typeof opts.size === "number") {
      assertSize(hex, { size: opts.size });
      return pad(hex, { dir: "right", size: opts.size });
    }
    return hex;
  }
  function numberToHex(value_, opts = {}) {
    const { signed, size: size5 } = opts;
    const value = BigInt(value_);
    let maxValue;
    if (size5) {
      if (signed)
        maxValue = (1n << BigInt(size5) * 8n - 1n) - 1n;
      else
        maxValue = 2n ** (BigInt(size5) * 8n) - 1n;
    } else if (typeof value_ === "number") {
      maxValue = BigInt(Number.MAX_SAFE_INTEGER);
    }
    const minValue = typeof maxValue === "bigint" && signed ? -maxValue - 1n : 0;
    if (maxValue && value > maxValue || value < minValue) {
      const suffix = typeof value_ === "bigint" ? "n" : "";
      throw new IntegerOutOfRangeError({
        max: maxValue ? `${maxValue}${suffix}` : void 0,
        min: `${minValue}${suffix}`,
        signed,
        size: size5,
        value: `${value_}${suffix}`
      });
    }
    const hex = `0x${(signed && value < 0 ? (1n << BigInt(size5 * 8)) + BigInt(value) : value).toString(16)}`;
    if (size5)
      return pad(hex, { size: size5 });
    return hex;
  }
  function stringToHex(value_, opts = {}) {
    const value = encoder.encode(value_);
    return bytesToHex(value, opts);
  }
  var hexes, encoder;
  var init_toHex = __esm({
    "node_modules/viem/_esm/utils/encoding/toHex.js"() {
      init_encoding();
      init_pad();
      init_fromHex();
      hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_v, i) => i.toString(16).padStart(2, "0"));
      encoder = /* @__PURE__ */ new TextEncoder();
    }
  });

  // node_modules/viem/_esm/utils/encoding/toBytes.js
  function toBytes(value, opts = {}) {
    if (typeof value === "number" || typeof value === "bigint")
      return numberToBytes(value, opts);
    if (typeof value === "boolean")
      return boolToBytes(value, opts);
    if (isHex(value))
      return hexToBytes(value, opts);
    return stringToBytes(value, opts);
  }
  function boolToBytes(value, opts = {}) {
    const bytes = new Uint8Array(1);
    bytes[0] = Number(value);
    if (typeof opts.size === "number") {
      assertSize(bytes, { size: opts.size });
      return pad(bytes, { size: opts.size });
    }
    return bytes;
  }
  function charCodeToBase16(char) {
    if (char >= charCodeMap.zero && char <= charCodeMap.nine)
      return char - charCodeMap.zero;
    if (char >= charCodeMap.A && char <= charCodeMap.F)
      return char - (charCodeMap.A - 10);
    if (char >= charCodeMap.a && char <= charCodeMap.f)
      return char - (charCodeMap.a - 10);
    return void 0;
  }
  function hexToBytes(hex_, opts = {}) {
    let hex = hex_;
    if (opts.size) {
      assertSize(hex, { size: opts.size });
      hex = pad(hex, { dir: "right", size: opts.size });
    }
    let hexString = hex.slice(2);
    if (hexString.length % 2)
      hexString = `0${hexString}`;
    const length = hexString.length / 2;
    const bytes = new Uint8Array(length);
    for (let index2 = 0, j = 0; index2 < length; index2++) {
      const nibbleLeft = charCodeToBase16(hexString.charCodeAt(j++));
      const nibbleRight = charCodeToBase16(hexString.charCodeAt(j++));
      if (nibbleLeft === void 0 || nibbleRight === void 0) {
        throw new BaseError2(`Invalid byte sequence ("${hexString[j - 2]}${hexString[j - 1]}" in "${hexString}").`);
      }
      bytes[index2] = nibbleLeft * 16 + nibbleRight;
    }
    return bytes;
  }
  function numberToBytes(value, opts) {
    const hex = numberToHex(value, opts);
    return hexToBytes(hex);
  }
  function stringToBytes(value, opts = {}) {
    const bytes = encoder2.encode(value);
    if (typeof opts.size === "number") {
      assertSize(bytes, { size: opts.size });
      return pad(bytes, { dir: "right", size: opts.size });
    }
    return bytes;
  }
  var encoder2, charCodeMap;
  var init_toBytes = __esm({
    "node_modules/viem/_esm/utils/encoding/toBytes.js"() {
      init_base();
      init_isHex();
      init_pad();
      init_fromHex();
      init_toHex();
      encoder2 = /* @__PURE__ */ new TextEncoder();
      charCodeMap = {
        zero: 48,
        nine: 57,
        A: 65,
        F: 70,
        a: 97,
        f: 102
      };
    }
  });

  // node_modules/@noble/hashes/esm/_u64.js
  function fromBig(n, le = false) {
    if (le)
      return { h: Number(n & U32_MASK64), l: Number(n >> _32n & U32_MASK64) };
    return { h: Number(n >> _32n & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
  }
  function split(lst, le = false) {
    const len = lst.length;
    let Ah = new Uint32Array(len);
    let Al = new Uint32Array(len);
    for (let i = 0; i < len; i++) {
      const { h, l } = fromBig(lst[i], le);
      [Ah[i], Al[i]] = [h, l];
    }
    return [Ah, Al];
  }
  function add(Ah, Al, Bh, Bl) {
    const l = (Al >>> 0) + (Bl >>> 0);
    return { h: Ah + Bh + (l / 2 ** 32 | 0) | 0, l: l | 0 };
  }
  var U32_MASK64, _32n, shrSH, shrSL, rotrSH, rotrSL, rotrBH, rotrBL, rotlSH, rotlSL, rotlBH, rotlBL, add3L, add3H, add4L, add4H, add5L, add5H;
  var init_u64 = __esm({
    "node_modules/@noble/hashes/esm/_u64.js"() {
      U32_MASK64 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
      _32n = /* @__PURE__ */ BigInt(32);
      shrSH = (h, _l, s) => h >>> s;
      shrSL = (h, l, s) => h << 32 - s | l >>> s;
      rotrSH = (h, l, s) => h >>> s | l << 32 - s;
      rotrSL = (h, l, s) => h << 32 - s | l >>> s;
      rotrBH = (h, l, s) => h << 64 - s | l >>> s - 32;
      rotrBL = (h, l, s) => h >>> s - 32 | l << 64 - s;
      rotlSH = (h, l, s) => h << s | l >>> 32 - s;
      rotlSL = (h, l, s) => l << s | h >>> 32 - s;
      rotlBH = (h, l, s) => l << s - 32 | h >>> 64 - s;
      rotlBL = (h, l, s) => h << s - 32 | l >>> 64 - s;
      add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
      add3H = (low, Ah, Bh, Ch) => Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;
      add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
      add4H = (low, Ah, Bh, Ch, Dh) => Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0;
      add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
      add5H = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;
    }
  });

  // node_modules/@noble/hashes/esm/crypto.js
  var crypto2;
  var init_crypto = __esm({
    "node_modules/@noble/hashes/esm/crypto.js"() {
      crypto2 = typeof globalThis === "object" && "crypto" in globalThis ? globalThis.crypto : void 0;
    }
  });

  // node_modules/@noble/hashes/esm/utils.js
  function isBytes(a) {
    return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
  }
  function anumber(n) {
    if (!Number.isSafeInteger(n) || n < 0)
      throw new Error("positive integer expected, got " + n);
  }
  function abytes(b, ...lengths) {
    if (!isBytes(b))
      throw new Error("Uint8Array expected");
    if (lengths.length > 0 && !lengths.includes(b.length))
      throw new Error("Uint8Array expected of length " + lengths + ", got length=" + b.length);
  }
  function ahash(h) {
    if (typeof h !== "function" || typeof h.create !== "function")
      throw new Error("Hash should be wrapped by utils.createHasher");
    anumber(h.outputLen);
    anumber(h.blockLen);
  }
  function aexists(instance, checkFinished = true) {
    if (instance.destroyed)
      throw new Error("Hash instance has been destroyed");
    if (checkFinished && instance.finished)
      throw new Error("Hash#digest() has already been called");
  }
  function aoutput(out, instance) {
    abytes(out);
    const min = instance.outputLen;
    if (out.length < min) {
      throw new Error("digestInto() expects output buffer of length at least " + min);
    }
  }
  function u32(arr) {
    return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
  }
  function clean(...arrays) {
    for (let i = 0; i < arrays.length; i++) {
      arrays[i].fill(0);
    }
  }
  function createView(arr) {
    return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
  }
  function rotr(word, shift) {
    return word << 32 - shift | word >>> shift;
  }
  function byteSwap(word) {
    return word << 24 & 4278190080 | word << 8 & 16711680 | word >>> 8 & 65280 | word >>> 24 & 255;
  }
  function byteSwap32(arr) {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = byteSwap(arr[i]);
    }
    return arr;
  }
  function utf8ToBytes(str) {
    if (typeof str !== "string")
      throw new Error("string expected");
    return new Uint8Array(new TextEncoder().encode(str));
  }
  function toBytes2(data) {
    if (typeof data === "string")
      data = utf8ToBytes(data);
    abytes(data);
    return data;
  }
  function concatBytes(...arrays) {
    let sum = 0;
    for (let i = 0; i < arrays.length; i++) {
      const a = arrays[i];
      abytes(a);
      sum += a.length;
    }
    const res = new Uint8Array(sum);
    for (let i = 0, pad4 = 0; i < arrays.length; i++) {
      const a = arrays[i];
      res.set(a, pad4);
      pad4 += a.length;
    }
    return res;
  }
  function createHasher(hashCons) {
    const hashC = (msg) => hashCons().update(toBytes2(msg)).digest();
    const tmp = hashCons();
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = () => hashCons();
    return hashC;
  }
  function randomBytes(bytesLength = 32) {
    if (crypto2 && typeof crypto2.getRandomValues === "function") {
      return crypto2.getRandomValues(new Uint8Array(bytesLength));
    }
    if (crypto2 && typeof crypto2.randomBytes === "function") {
      return Uint8Array.from(crypto2.randomBytes(bytesLength));
    }
    throw new Error("crypto.getRandomValues must be defined");
  }
  var isLE, swap32IfBE, Hash;
  var init_utils2 = __esm({
    "node_modules/@noble/hashes/esm/utils.js"() {
      init_crypto();
      isLE = /* @__PURE__ */ (() => new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68)();
      swap32IfBE = isLE ? (u) => u : byteSwap32;
      Hash = class {
      };
    }
  });

  // node_modules/@noble/hashes/esm/sha3.js
  function keccakP(s, rounds = 24) {
    const B = new Uint32Array(5 * 2);
    for (let round = 24 - rounds; round < 24; round++) {
      for (let x = 0; x < 10; x++)
        B[x] = s[x] ^ s[x + 10] ^ s[x + 20] ^ s[x + 30] ^ s[x + 40];
      for (let x = 0; x < 10; x += 2) {
        const idx1 = (x + 8) % 10;
        const idx0 = (x + 2) % 10;
        const B0 = B[idx0];
        const B1 = B[idx0 + 1];
        const Th = rotlH(B0, B1, 1) ^ B[idx1];
        const Tl = rotlL(B0, B1, 1) ^ B[idx1 + 1];
        for (let y = 0; y < 50; y += 10) {
          s[x + y] ^= Th;
          s[x + y + 1] ^= Tl;
        }
      }
      let curH = s[2];
      let curL = s[3];
      for (let t = 0; t < 24; t++) {
        const shift = SHA3_ROTL[t];
        const Th = rotlH(curH, curL, shift);
        const Tl = rotlL(curH, curL, shift);
        const PI = SHA3_PI[t];
        curH = s[PI];
        curL = s[PI + 1];
        s[PI] = Th;
        s[PI + 1] = Tl;
      }
      for (let y = 0; y < 50; y += 10) {
        for (let x = 0; x < 10; x++)
          B[x] = s[y + x];
        for (let x = 0; x < 10; x++)
          s[y + x] ^= ~B[(x + 2) % 10] & B[(x + 4) % 10];
      }
      s[0] ^= SHA3_IOTA_H[round];
      s[1] ^= SHA3_IOTA_L[round];
    }
    clean(B);
  }
  var _0n, _1n, _2n, _7n, _256n, _0x71n, SHA3_PI, SHA3_ROTL, _SHA3_IOTA, IOTAS, SHA3_IOTA_H, SHA3_IOTA_L, rotlH, rotlL, Keccak, gen, keccak_256;
  var init_sha3 = __esm({
    "node_modules/@noble/hashes/esm/sha3.js"() {
      init_u64();
      init_utils2();
      _0n = BigInt(0);
      _1n = BigInt(1);
      _2n = BigInt(2);
      _7n = BigInt(7);
      _256n = BigInt(256);
      _0x71n = BigInt(113);
      SHA3_PI = [];
      SHA3_ROTL = [];
      _SHA3_IOTA = [];
      for (let round = 0, R = _1n, x = 1, y = 0; round < 24; round++) {
        [x, y] = [y, (2 * x + 3 * y) % 5];
        SHA3_PI.push(2 * (5 * y + x));
        SHA3_ROTL.push((round + 1) * (round + 2) / 2 % 64);
        let t = _0n;
        for (let j = 0; j < 7; j++) {
          R = (R << _1n ^ (R >> _7n) * _0x71n) % _256n;
          if (R & _2n)
            t ^= _1n << (_1n << /* @__PURE__ */ BigInt(j)) - _1n;
        }
        _SHA3_IOTA.push(t);
      }
      IOTAS = split(_SHA3_IOTA, true);
      SHA3_IOTA_H = IOTAS[0];
      SHA3_IOTA_L = IOTAS[1];
      rotlH = (h, l, s) => s > 32 ? rotlBH(h, l, s) : rotlSH(h, l, s);
      rotlL = (h, l, s) => s > 32 ? rotlBL(h, l, s) : rotlSL(h, l, s);
      Keccak = class _Keccak extends Hash {
        // NOTE: we accept arguments in bytes instead of bits here.
        constructor(blockLen, suffix, outputLen, enableXOF = false, rounds = 24) {
          super();
          this.pos = 0;
          this.posOut = 0;
          this.finished = false;
          this.destroyed = false;
          this.enableXOF = false;
          this.blockLen = blockLen;
          this.suffix = suffix;
          this.outputLen = outputLen;
          this.enableXOF = enableXOF;
          this.rounds = rounds;
          anumber(outputLen);
          if (!(0 < blockLen && blockLen < 200))
            throw new Error("only keccak-f1600 function is supported");
          this.state = new Uint8Array(200);
          this.state32 = u32(this.state);
        }
        clone() {
          return this._cloneInto();
        }
        keccak() {
          swap32IfBE(this.state32);
          keccakP(this.state32, this.rounds);
          swap32IfBE(this.state32);
          this.posOut = 0;
          this.pos = 0;
        }
        update(data) {
          aexists(this);
          data = toBytes2(data);
          abytes(data);
          const { blockLen, state } = this;
          const len = data.length;
          for (let pos = 0; pos < len; ) {
            const take = Math.min(blockLen - this.pos, len - pos);
            for (let i = 0; i < take; i++)
              state[this.pos++] ^= data[pos++];
            if (this.pos === blockLen)
              this.keccak();
          }
          return this;
        }
        finish() {
          if (this.finished)
            return;
          this.finished = true;
          const { state, suffix, pos, blockLen } = this;
          state[pos] ^= suffix;
          if ((suffix & 128) !== 0 && pos === blockLen - 1)
            this.keccak();
          state[blockLen - 1] ^= 128;
          this.keccak();
        }
        writeInto(out) {
          aexists(this, false);
          abytes(out);
          this.finish();
          const bufferOut = this.state;
          const { blockLen } = this;
          for (let pos = 0, len = out.length; pos < len; ) {
            if (this.posOut >= blockLen)
              this.keccak();
            const take = Math.min(blockLen - this.posOut, len - pos);
            out.set(bufferOut.subarray(this.posOut, this.posOut + take), pos);
            this.posOut += take;
            pos += take;
          }
          return out;
        }
        xofInto(out) {
          if (!this.enableXOF)
            throw new Error("XOF is not possible for this instance");
          return this.writeInto(out);
        }
        xof(bytes) {
          anumber(bytes);
          return this.xofInto(new Uint8Array(bytes));
        }
        digestInto(out) {
          aoutput(out, this);
          if (this.finished)
            throw new Error("digest() was already called");
          this.writeInto(out);
          this.destroy();
          return out;
        }
        digest() {
          return this.digestInto(new Uint8Array(this.outputLen));
        }
        destroy() {
          this.destroyed = true;
          clean(this.state);
        }
        _cloneInto(to) {
          const { blockLen, suffix, outputLen, rounds, enableXOF } = this;
          to || (to = new _Keccak(blockLen, suffix, outputLen, enableXOF, rounds));
          to.state32.set(this.state32);
          to.pos = this.pos;
          to.posOut = this.posOut;
          to.finished = this.finished;
          to.rounds = rounds;
          to.suffix = suffix;
          to.outputLen = outputLen;
          to.enableXOF = enableXOF;
          to.destroyed = this.destroyed;
          return to;
        }
      };
      gen = (suffix, blockLen, outputLen) => createHasher(() => new Keccak(blockLen, suffix, outputLen));
      keccak_256 = /* @__PURE__ */ (() => gen(1, 136, 256 / 8))();
    }
  });

  // node_modules/viem/_esm/utils/hash/keccak256.js
  function keccak256(value, to_) {
    const to = to_ || "hex";
    const bytes = keccak_256(isHex(value, { strict: false }) ? toBytes(value) : value);
    if (to === "bytes")
      return bytes;
    return toHex(bytes);
  }
  var init_keccak256 = __esm({
    "node_modules/viem/_esm/utils/hash/keccak256.js"() {
      init_sha3();
      init_isHex();
      init_toBytes();
      init_toHex();
    }
  });

  // node_modules/viem/_esm/utils/hash/hashSignature.js
  function hashSignature(sig) {
    return hash(sig);
  }
  var hash;
  var init_hashSignature = __esm({
    "node_modules/viem/_esm/utils/hash/hashSignature.js"() {
      init_toBytes();
      init_keccak256();
      hash = (value) => keccak256(toBytes(value));
    }
  });

  // node_modules/viem/_esm/utils/hash/normalizeSignature.js
  function normalizeSignature(signature) {
    let active = true;
    let current = "";
    let level = 0;
    let result = "";
    let valid = false;
    for (let i = 0; i < signature.length; i++) {
      const char = signature[i];
      if (["(", ")", ","].includes(char))
        active = true;
      if (char === "(")
        level++;
      if (char === ")")
        level--;
      if (!active)
        continue;
      if (level === 0) {
        if (char === " " && ["event", "function", ""].includes(result))
          result = "";
        else {
          result += char;
          if (char === ")") {
            valid = true;
            break;
          }
        }
        continue;
      }
      if (char === " ") {
        if (signature[i - 1] !== "," && current !== "," && current !== ",(") {
          current = "";
          active = false;
        }
        continue;
      }
      result += char;
      current += char;
    }
    if (!valid)
      throw new BaseError2("Unable to normalize signature.");
    return result;
  }
  var init_normalizeSignature = __esm({
    "node_modules/viem/_esm/utils/hash/normalizeSignature.js"() {
      init_base();
    }
  });

  // node_modules/viem/_esm/utils/hash/toSignature.js
  var toSignature;
  var init_toSignature = __esm({
    "node_modules/viem/_esm/utils/hash/toSignature.js"() {
      init_exports();
      init_normalizeSignature();
      toSignature = (def) => {
        const def_ = (() => {
          if (typeof def === "string")
            return def;
          return formatAbiItem(def);
        })();
        return normalizeSignature(def_);
      };
    }
  });

  // node_modules/viem/_esm/utils/hash/toSignatureHash.js
  function toSignatureHash(fn) {
    return hashSignature(toSignature(fn));
  }
  var init_toSignatureHash = __esm({
    "node_modules/viem/_esm/utils/hash/toSignatureHash.js"() {
      init_hashSignature();
      init_toSignature();
    }
  });

  // node_modules/viem/_esm/utils/hash/toEventSelector.js
  var toEventSelector;
  var init_toEventSelector = __esm({
    "node_modules/viem/_esm/utils/hash/toEventSelector.js"() {
      init_toSignatureHash();
      toEventSelector = toSignatureHash;
    }
  });

  // node_modules/viem/_esm/errors/address.js
  var InvalidAddressError;
  var init_address = __esm({
    "node_modules/viem/_esm/errors/address.js"() {
      init_base();
      InvalidAddressError = class extends BaseError2 {
        constructor({ address }) {
          super(`Address "${address}" is invalid.`, {
            metaMessages: [
              "- Address must be a hex value of 20 bytes (40 hex characters).",
              "- Address must match its checksum counterpart."
            ],
            name: "InvalidAddressError"
          });
        }
      };
    }
  });

  // node_modules/viem/_esm/utils/lru.js
  var LruMap;
  var init_lru = __esm({
    "node_modules/viem/_esm/utils/lru.js"() {
      LruMap = class extends Map {
        constructor(size5) {
          super();
          Object.defineProperty(this, "maxSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          this.maxSize = size5;
        }
        get(key) {
          const value = super.get(key);
          if (super.has(key) && value !== void 0) {
            this.delete(key);
            super.set(key, value);
          }
          return value;
        }
        set(key, value) {
          super.set(key, value);
          if (this.maxSize && this.size > this.maxSize) {
            const firstKey = this.keys().next().value;
            if (firstKey)
              this.delete(firstKey);
          }
          return this;
        }
      };
    }
  });

  // node_modules/viem/_esm/utils/address/getAddress.js
  function checksumAddress(address_, chainId) {
    if (checksumAddressCache.has(`${address_}.${chainId}`))
      return checksumAddressCache.get(`${address_}.${chainId}`);
    const hexAddress = chainId ? `${chainId}${address_.toLowerCase()}` : address_.substring(2).toLowerCase();
    const hash3 = keccak256(stringToBytes(hexAddress), "bytes");
    const address = (chainId ? hexAddress.substring(`${chainId}0x`.length) : hexAddress).split("");
    for (let i = 0; i < 40; i += 2) {
      if (hash3[i >> 1] >> 4 >= 8 && address[i]) {
        address[i] = address[i].toUpperCase();
      }
      if ((hash3[i >> 1] & 15) >= 8 && address[i + 1]) {
        address[i + 1] = address[i + 1].toUpperCase();
      }
    }
    const result = `0x${address.join("")}`;
    checksumAddressCache.set(`${address_}.${chainId}`, result);
    return result;
  }
  function getAddress(address, chainId) {
    if (!isAddress(address, { strict: false }))
      throw new InvalidAddressError({ address });
    return checksumAddress(address, chainId);
  }
  var checksumAddressCache;
  var init_getAddress = __esm({
    "node_modules/viem/_esm/utils/address/getAddress.js"() {
      init_address();
      init_toBytes();
      init_keccak256();
      init_lru();
      init_isAddress();
      checksumAddressCache = /* @__PURE__ */ new LruMap(8192);
    }
  });

  // node_modules/viem/_esm/utils/address/isAddress.js
  function isAddress(address, options) {
    const { strict = true } = options ?? {};
    const cacheKey2 = `${address}.${strict}`;
    if (isAddressCache.has(cacheKey2))
      return isAddressCache.get(cacheKey2);
    const result = (() => {
      if (!addressRegex.test(address))
        return false;
      if (address.toLowerCase() === address)
        return true;
      if (strict)
        return checksumAddress(address) === address;
      return true;
    })();
    isAddressCache.set(cacheKey2, result);
    return result;
  }
  var addressRegex, isAddressCache;
  var init_isAddress = __esm({
    "node_modules/viem/_esm/utils/address/isAddress.js"() {
      init_lru();
      init_getAddress();
      addressRegex = /^0x[a-fA-F0-9]{40}$/;
      isAddressCache = /* @__PURE__ */ new LruMap(8192);
    }
  });

  // node_modules/viem/_esm/utils/data/concat.js
  function concat(values) {
    if (typeof values[0] === "string")
      return concatHex(values);
    return concatBytes2(values);
  }
  function concatBytes2(values) {
    let length = 0;
    for (const arr of values) {
      length += arr.length;
    }
    const result = new Uint8Array(length);
    let offset = 0;
    for (const arr of values) {
      result.set(arr, offset);
      offset += arr.length;
    }
    return result;
  }
  function concatHex(values) {
    return `0x${values.reduce((acc, x) => acc + x.replace("0x", ""), "")}`;
  }
  var init_concat = __esm({
    "node_modules/viem/_esm/utils/data/concat.js"() {
    }
  });

  // node_modules/viem/_esm/utils/data/slice.js
  function slice(value, start, end, { strict } = {}) {
    if (isHex(value, { strict: false }))
      return sliceHex(value, start, end, {
        strict
      });
    return sliceBytes(value, start, end, {
      strict
    });
  }
  function assertStartOffset(value, start) {
    if (typeof start === "number" && start > 0 && start > size(value) - 1)
      throw new SliceOffsetOutOfBoundsError({
        offset: start,
        position: "start",
        size: size(value)
      });
  }
  function assertEndOffset(value, start, end) {
    if (typeof start === "number" && typeof end === "number" && size(value) !== end - start) {
      throw new SliceOffsetOutOfBoundsError({
        offset: end,
        position: "end",
        size: size(value)
      });
    }
  }
  function sliceBytes(value_, start, end, { strict } = {}) {
    assertStartOffset(value_, start);
    const value = value_.slice(start, end);
    if (strict)
      assertEndOffset(value, start, end);
    return value;
  }
  function sliceHex(value_, start, end, { strict } = {}) {
    assertStartOffset(value_, start);
    const value = `0x${value_.replace("0x", "").slice((start ?? 0) * 2, (end ?? value_.length) * 2)}`;
    if (strict)
      assertEndOffset(value, start, end);
    return value;
  }
  var init_slice = __esm({
    "node_modules/viem/_esm/utils/data/slice.js"() {
      init_data();
      init_isHex();
      init_size();
    }
  });

  // node_modules/viem/_esm/utils/regex.js
  var arrayRegex, bytesRegex2, integerRegex2;
  var init_regex2 = __esm({
    "node_modules/viem/_esm/utils/regex.js"() {
      arrayRegex = /^(.*)\[([0-9]*)\]$/;
      bytesRegex2 = /^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/;
      integerRegex2 = /^(u?int)(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/;
    }
  });

  // node_modules/viem/_esm/utils/abi/encodeAbiParameters.js
  function encodeAbiParameters(params, values) {
    if (params.length !== values.length)
      throw new AbiEncodingLengthMismatchError({
        expectedLength: params.length,
        givenLength: values.length
      });
    const preparedParams = prepareParams({
      params,
      values
    });
    const data = encodeParams(preparedParams);
    if (data.length === 0)
      return "0x";
    return data;
  }
  function prepareParams({ params, values }) {
    const preparedParams = [];
    for (let i = 0; i < params.length; i++) {
      preparedParams.push(prepareParam({ param: params[i], value: values[i] }));
    }
    return preparedParams;
  }
  function prepareParam({ param, value }) {
    const arrayComponents = getArrayComponents(param.type);
    if (arrayComponents) {
      const [length, type] = arrayComponents;
      return encodeArray(value, { length, param: { ...param, type } });
    }
    if (param.type === "tuple") {
      return encodeTuple(value, {
        param
      });
    }
    if (param.type === "address") {
      return encodeAddress(value);
    }
    if (param.type === "bool") {
      return encodeBool(value);
    }
    if (param.type.startsWith("uint") || param.type.startsWith("int")) {
      const signed = param.type.startsWith("int");
      const [, , size5 = "256"] = integerRegex2.exec(param.type) ?? [];
      return encodeNumber(value, {
        signed,
        size: Number(size5)
      });
    }
    if (param.type.startsWith("bytes")) {
      return encodeBytes(value, { param });
    }
    if (param.type === "string") {
      return encodeString(value);
    }
    throw new InvalidAbiEncodingTypeError(param.type, {
      docsPath: "/docs/contract/encodeAbiParameters"
    });
  }
  function encodeParams(preparedParams) {
    let staticSize = 0;
    for (let i = 0; i < preparedParams.length; i++) {
      const { dynamic, encoded } = preparedParams[i];
      if (dynamic)
        staticSize += 32;
      else
        staticSize += size(encoded);
    }
    const staticParams = [];
    const dynamicParams = [];
    let dynamicSize = 0;
    for (let i = 0; i < preparedParams.length; i++) {
      const { dynamic, encoded } = preparedParams[i];
      if (dynamic) {
        staticParams.push(numberToHex(staticSize + dynamicSize, { size: 32 }));
        dynamicParams.push(encoded);
        dynamicSize += size(encoded);
      } else {
        staticParams.push(encoded);
      }
    }
    return concat([...staticParams, ...dynamicParams]);
  }
  function encodeAddress(value) {
    if (!isAddress(value))
      throw new InvalidAddressError({ address: value });
    return { dynamic: false, encoded: padHex(value.toLowerCase()) };
  }
  function encodeArray(value, { length, param }) {
    const dynamic = length === null;
    if (!Array.isArray(value))
      throw new InvalidArrayError(value);
    if (!dynamic && value.length !== length)
      throw new AbiEncodingArrayLengthMismatchError({
        expectedLength: length,
        givenLength: value.length,
        type: `${param.type}[${length}]`
      });
    let dynamicChild = false;
    const preparedParams = [];
    for (let i = 0; i < value.length; i++) {
      const preparedParam = prepareParam({ param, value: value[i] });
      if (preparedParam.dynamic)
        dynamicChild = true;
      preparedParams.push(preparedParam);
    }
    if (dynamic || dynamicChild) {
      const data = encodeParams(preparedParams);
      if (dynamic) {
        const length2 = numberToHex(preparedParams.length, { size: 32 });
        return {
          dynamic: true,
          encoded: preparedParams.length > 0 ? concat([length2, data]) : length2
        };
      }
      if (dynamicChild)
        return { dynamic: true, encoded: data };
    }
    return {
      dynamic: false,
      encoded: concat(preparedParams.map(({ encoded }) => encoded))
    };
  }
  function encodeBytes(value, { param }) {
    const [, paramSize] = param.type.split("bytes");
    const bytesSize = size(value);
    if (!paramSize) {
      let value_ = value;
      if (bytesSize % 32 !== 0)
        value_ = padHex(value_, {
          dir: "right",
          size: Math.ceil((value.length - 2) / 2 / 32) * 32
        });
      return {
        dynamic: true,
        encoded: concat([padHex(numberToHex(bytesSize, { size: 32 })), value_])
      };
    }
    if (bytesSize !== Number.parseInt(paramSize, 10))
      throw new AbiEncodingBytesSizeMismatchError({
        expectedSize: Number.parseInt(paramSize, 10),
        value
      });
    return { dynamic: false, encoded: padHex(value, { dir: "right" }) };
  }
  function encodeBool(value) {
    if (typeof value !== "boolean")
      throw new BaseError2(`Invalid boolean value: "${value}" (type: ${typeof value}). Expected: \`true\` or \`false\`.`);
    return { dynamic: false, encoded: padHex(boolToHex(value)) };
  }
  function encodeNumber(value, { signed, size: size5 = 256 }) {
    if (typeof size5 === "number") {
      const max = 2n ** (BigInt(size5) - (signed ? 1n : 0n)) - 1n;
      const min = signed ? -max - 1n : 0n;
      if (value > max || value < min)
        throw new IntegerOutOfRangeError({
          max: max.toString(),
          min: min.toString(),
          signed,
          size: size5 / 8,
          value: value.toString()
        });
    }
    return {
      dynamic: false,
      encoded: numberToHex(value, {
        size: 32,
        signed
      })
    };
  }
  function encodeString(value) {
    const hexValue = stringToHex(value);
    const partsLength = Math.ceil(size(hexValue) / 32);
    const parts = [];
    for (let i = 0; i < partsLength; i++) {
      parts.push(padHex(slice(hexValue, i * 32, (i + 1) * 32), {
        dir: "right"
      }));
    }
    return {
      dynamic: true,
      encoded: concat([
        padHex(numberToHex(size(hexValue), { size: 32 })),
        ...parts
      ])
    };
  }
  function encodeTuple(value, { param }) {
    let dynamic = false;
    const preparedParams = [];
    for (let i = 0; i < param.components.length; i++) {
      const param_ = param.components[i];
      const index2 = Array.isArray(value) ? i : param_.name;
      const preparedParam = prepareParam({
        param: param_,
        value: value[index2]
      });
      preparedParams.push(preparedParam);
      if (preparedParam.dynamic)
        dynamic = true;
    }
    return {
      dynamic,
      encoded: dynamic ? encodeParams(preparedParams) : concat(preparedParams.map(({ encoded }) => encoded))
    };
  }
  function getArrayComponents(type) {
    const matches = type.match(/^(.*)\[(\d+)?\]$/);
    return matches ? (
      // Return `null` if the array is dynamic.
      [matches[2] ? Number(matches[2]) : null, matches[1]]
    ) : void 0;
  }
  var init_encodeAbiParameters = __esm({
    "node_modules/viem/_esm/utils/abi/encodeAbiParameters.js"() {
      init_abi();
      init_address();
      init_base();
      init_encoding();
      init_isAddress();
      init_concat();
      init_pad();
      init_size();
      init_slice();
      init_toHex();
      init_regex2();
    }
  });

  // node_modules/viem/_esm/utils/hash/toFunctionSelector.js
  var toFunctionSelector;
  var init_toFunctionSelector = __esm({
    "node_modules/viem/_esm/utils/hash/toFunctionSelector.js"() {
      init_slice();
      init_toSignatureHash();
      toFunctionSelector = (fn) => slice(toSignatureHash(fn), 0, 4);
    }
  });

  // node_modules/viem/_esm/utils/abi/getAbiItem.js
  function getAbiItem(parameters) {
    const { abi: abi3, args = [], name } = parameters;
    const isSelector = isHex(name, { strict: false });
    const abiItems = abi3.filter((abiItem) => {
      if (isSelector) {
        if (abiItem.type === "function")
          return toFunctionSelector(abiItem) === name;
        if (abiItem.type === "event")
          return toEventSelector(abiItem) === name;
        return false;
      }
      return "name" in abiItem && abiItem.name === name;
    });
    if (abiItems.length === 0)
      return void 0;
    if (abiItems.length === 1)
      return abiItems[0];
    let matchedAbiItem;
    for (const abiItem of abiItems) {
      if (!("inputs" in abiItem))
        continue;
      if (!args || args.length === 0) {
        if (!abiItem.inputs || abiItem.inputs.length === 0)
          return abiItem;
        continue;
      }
      if (!abiItem.inputs)
        continue;
      if (abiItem.inputs.length === 0)
        continue;
      if (abiItem.inputs.length !== args.length)
        continue;
      const matched = args.every((arg, index2) => {
        const abiParameter = "inputs" in abiItem && abiItem.inputs[index2];
        if (!abiParameter)
          return false;
        return isArgOfType(arg, abiParameter);
      });
      if (matched) {
        if (matchedAbiItem && "inputs" in matchedAbiItem && matchedAbiItem.inputs) {
          const ambiguousTypes = getAmbiguousTypes(abiItem.inputs, matchedAbiItem.inputs, args);
          if (ambiguousTypes)
            throw new AbiItemAmbiguityError({
              abiItem,
              type: ambiguousTypes[0]
            }, {
              abiItem: matchedAbiItem,
              type: ambiguousTypes[1]
            });
        }
        matchedAbiItem = abiItem;
      }
    }
    if (matchedAbiItem)
      return matchedAbiItem;
    return abiItems[0];
  }
  function isArgOfType(arg, abiParameter) {
    const argType = typeof arg;
    const abiParameterType = abiParameter.type;
    switch (abiParameterType) {
      case "address":
        return isAddress(arg, { strict: false });
      case "bool":
        return argType === "boolean";
      case "function":
        return argType === "string";
      case "string":
        return argType === "string";
      default: {
        if (abiParameterType === "tuple" && "components" in abiParameter)
          return Object.values(abiParameter.components).every((component, index2) => {
            return isArgOfType(Object.values(arg)[index2], component);
          });
        if (/^u?int(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/.test(abiParameterType))
          return argType === "number" || argType === "bigint";
        if (/^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/.test(abiParameterType))
          return argType === "string" || arg instanceof Uint8Array;
        if (/[a-z]+[1-9]{0,3}(\[[0-9]{0,}\])+$/.test(abiParameterType)) {
          return Array.isArray(arg) && arg.every((x) => isArgOfType(x, {
            ...abiParameter,
            // Pop off `[]` or `[M]` from end of type
            type: abiParameterType.replace(/(\[[0-9]{0,}\])$/, "")
          }));
        }
        return false;
      }
    }
  }
  function getAmbiguousTypes(sourceParameters, targetParameters, args) {
    for (const parameterIndex in sourceParameters) {
      const sourceParameter = sourceParameters[parameterIndex];
      const targetParameter = targetParameters[parameterIndex];
      if (sourceParameter.type === "tuple" && targetParameter.type === "tuple" && "components" in sourceParameter && "components" in targetParameter)
        return getAmbiguousTypes(sourceParameter.components, targetParameter.components, args[parameterIndex]);
      const types2 = [sourceParameter.type, targetParameter.type];
      const ambiguous = (() => {
        if (types2.includes("address") && types2.includes("bytes20"))
          return true;
        if (types2.includes("address") && types2.includes("string"))
          return isAddress(args[parameterIndex], { strict: false });
        if (types2.includes("address") && types2.includes("bytes"))
          return isAddress(args[parameterIndex], { strict: false });
        return false;
      })();
      if (ambiguous)
        return types2;
    }
    return;
  }
  var init_getAbiItem = __esm({
    "node_modules/viem/_esm/utils/abi/getAbiItem.js"() {
      init_abi();
      init_isHex();
      init_isAddress();
      init_toEventSelector();
      init_toFunctionSelector();
    }
  });

  // node_modules/viem/_esm/utils/abi/encodeEventTopics.js
  function encodeEventTopics(parameters) {
    const { abi: abi3, eventName, args } = parameters;
    let abiItem = abi3[0];
    if (eventName) {
      const item = getAbiItem({ abi: abi3, name: eventName });
      if (!item)
        throw new AbiEventNotFoundError(eventName, { docsPath });
      abiItem = item;
    }
    if (abiItem.type !== "event")
      throw new AbiEventNotFoundError(void 0, { docsPath });
    const definition = formatAbiItem2(abiItem);
    const signature = toEventSelector(definition);
    let topics = [];
    if (args && "inputs" in abiItem) {
      const indexedInputs = abiItem.inputs?.filter((param) => "indexed" in param && param.indexed);
      const args_ = Array.isArray(args) ? args : Object.values(args).length > 0 ? indexedInputs?.map((x) => args[x.name]) ?? [] : [];
      if (args_.length > 0) {
        topics = indexedInputs?.map((param, i) => {
          if (Array.isArray(args_[i]))
            return args_[i].map((_, j) => encodeArg({ param, value: args_[i][j] }));
          return typeof args_[i] !== "undefined" && args_[i] !== null ? encodeArg({ param, value: args_[i] }) : null;
        }) ?? [];
      }
    }
    return [signature, ...topics];
  }
  function encodeArg({ param, value }) {
    if (param.type === "string" || param.type === "bytes")
      return keccak256(toBytes(value));
    if (param.type === "tuple" || param.type.match(/^(.*)\[(\d+)?\]$/))
      throw new FilterTypeNotSupportedError(param.type);
    return encodeAbiParameters([param], [value]);
  }
  var docsPath;
  var init_encodeEventTopics = __esm({
    "node_modules/viem/_esm/utils/abi/encodeEventTopics.js"() {
      init_abi();
      init_log();
      init_toBytes();
      init_keccak256();
      init_toEventSelector();
      init_encodeAbiParameters();
      init_formatAbiItem2();
      init_getAbiItem();
      docsPath = "/docs/contract/encodeEventTopics";
    }
  });

  // node_modules/viem/_esm/utils/filters/createFilterRequestScope.js
  function createFilterRequestScope(client, { method }) {
    const requestMap = {};
    if (client.transport.type === "fallback")
      client.transport.onResponse?.(({ method: method_, response: id, status, transport }) => {
        if (status === "success" && method === method_)
          requestMap[id] = transport.request;
      });
    return ((id) => requestMap[id] || client.request);
  }
  var init_createFilterRequestScope = __esm({
    "node_modules/viem/_esm/utils/filters/createFilterRequestScope.js"() {
    }
  });

  // node_modules/viem/_esm/actions/public/createContractEventFilter.js
  async function createContractEventFilter(client, parameters) {
    const { address, abi: abi3, args, eventName, fromBlock, strict, toBlock } = parameters;
    const getRequest = createFilterRequestScope(client, {
      method: "eth_newFilter"
    });
    const topics = eventName ? encodeEventTopics({
      abi: abi3,
      args,
      eventName
    }) : void 0;
    const id = await client.request({
      method: "eth_newFilter",
      params: [
        {
          address,
          fromBlock: typeof fromBlock === "bigint" ? numberToHex(fromBlock) : fromBlock,
          toBlock: typeof toBlock === "bigint" ? numberToHex(toBlock) : toBlock,
          topics
        }
      ]
    });
    return {
      abi: abi3,
      args,
      eventName,
      id,
      request: getRequest(id),
      strict: Boolean(strict),
      type: "event"
    };
  }
  var init_createContractEventFilter = __esm({
    "node_modules/viem/_esm/actions/public/createContractEventFilter.js"() {
      init_encodeEventTopics();
      init_toHex();
      init_createFilterRequestScope();
    }
  });

  // node_modules/viem/_esm/accounts/utils/parseAccount.js
  function parseAccount(account) {
    if (typeof account === "string")
      return { address: account, type: "json-rpc" };
    return account;
  }
  var init_parseAccount = __esm({
    "node_modules/viem/_esm/accounts/utils/parseAccount.js"() {
    }
  });

  // node_modules/viem/_esm/utils/abi/prepareEncodeFunctionData.js
  function prepareEncodeFunctionData(parameters) {
    const { abi: abi3, args, functionName } = parameters;
    let abiItem = abi3[0];
    if (functionName) {
      const item = getAbiItem({
        abi: abi3,
        args,
        name: functionName
      });
      if (!item)
        throw new AbiFunctionNotFoundError(functionName, { docsPath: docsPath2 });
      abiItem = item;
    }
    if (abiItem.type !== "function")
      throw new AbiFunctionNotFoundError(void 0, { docsPath: docsPath2 });
    return {
      abi: [abiItem],
      functionName: toFunctionSelector(formatAbiItem2(abiItem))
    };
  }
  var docsPath2;
  var init_prepareEncodeFunctionData = __esm({
    "node_modules/viem/_esm/utils/abi/prepareEncodeFunctionData.js"() {
      init_abi();
      init_toFunctionSelector();
      init_formatAbiItem2();
      init_getAbiItem();
      docsPath2 = "/docs/contract/encodeFunctionData";
    }
  });

  // node_modules/viem/_esm/utils/abi/encodeFunctionData.js
  function encodeFunctionData(parameters) {
    const { args } = parameters;
    const { abi: abi3, functionName } = (() => {
      if (parameters.abi.length === 1 && parameters.functionName?.startsWith("0x"))
        return parameters;
      return prepareEncodeFunctionData(parameters);
    })();
    const abiItem = abi3[0];
    const signature = functionName;
    const data = "inputs" in abiItem && abiItem.inputs ? encodeAbiParameters(abiItem.inputs, args ?? []) : void 0;
    return concatHex([signature, data ?? "0x"]);
  }
  var init_encodeFunctionData = __esm({
    "node_modules/viem/_esm/utils/abi/encodeFunctionData.js"() {
      init_concat();
      init_encodeAbiParameters();
      init_prepareEncodeFunctionData();
    }
  });

  // node_modules/viem/_esm/constants/solidity.js
  var panicReasons, solidityError, solidityPanic;
  var init_solidity = __esm({
    "node_modules/viem/_esm/constants/solidity.js"() {
      panicReasons = {
        1: "An `assert` condition failed.",
        17: "Arithmetic operation resulted in underflow or overflow.",
        18: "Division or modulo by zero (e.g. `5 / 0` or `23 % 0`).",
        33: "Attempted to convert to an invalid type.",
        34: "Attempted to access a storage byte array that is incorrectly encoded.",
        49: "Performed `.pop()` on an empty array",
        50: "Array index is out of bounds.",
        65: "Allocated too much memory or created an array which is too large.",
        81: "Attempted to call a zero-initialized variable of internal function type."
      };
      solidityError = {
        inputs: [
          {
            name: "message",
            type: "string"
          }
        ],
        name: "Error",
        type: "error"
      };
      solidityPanic = {
        inputs: [
          {
            name: "reason",
            type: "uint256"
          }
        ],
        name: "Panic",
        type: "error"
      };
    }
  });

  // node_modules/viem/_esm/errors/cursor.js
  var NegativeOffsetError, PositionOutOfBoundsError, RecursiveReadLimitExceededError;
  var init_cursor = __esm({
    "node_modules/viem/_esm/errors/cursor.js"() {
      init_base();
      NegativeOffsetError = class extends BaseError2 {
        constructor({ offset }) {
          super(`Offset \`${offset}\` cannot be negative.`, {
            name: "NegativeOffsetError"
          });
        }
      };
      PositionOutOfBoundsError = class extends BaseError2 {
        constructor({ length, position }) {
          super(`Position \`${position}\` is out of bounds (\`0 < position < ${length}\`).`, { name: "PositionOutOfBoundsError" });
        }
      };
      RecursiveReadLimitExceededError = class extends BaseError2 {
        constructor({ count, limit }) {
          super(`Recursive read limit of \`${limit}\` exceeded (recursive read count: \`${count}\`).`, { name: "RecursiveReadLimitExceededError" });
        }
      };
    }
  });

  // node_modules/viem/_esm/utils/cursor.js
  function createCursor(bytes, { recursiveReadLimit = 8192 } = {}) {
    const cursor = Object.create(staticCursor);
    cursor.bytes = bytes;
    cursor.dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    cursor.positionReadCount = /* @__PURE__ */ new Map();
    cursor.recursiveReadLimit = recursiveReadLimit;
    return cursor;
  }
  var staticCursor;
  var init_cursor2 = __esm({
    "node_modules/viem/_esm/utils/cursor.js"() {
      init_cursor();
      staticCursor = {
        bytes: new Uint8Array(),
        dataView: new DataView(new ArrayBuffer(0)),
        position: 0,
        positionReadCount: /* @__PURE__ */ new Map(),
        recursiveReadCount: 0,
        recursiveReadLimit: Number.POSITIVE_INFINITY,
        assertReadLimit() {
          if (this.recursiveReadCount >= this.recursiveReadLimit)
            throw new RecursiveReadLimitExceededError({
              count: this.recursiveReadCount + 1,
              limit: this.recursiveReadLimit
            });
        },
        assertPosition(position) {
          if (position < 0 || position > this.bytes.length - 1)
            throw new PositionOutOfBoundsError({
              length: this.bytes.length,
              position
            });
        },
        decrementPosition(offset) {
          if (offset < 0)
            throw new NegativeOffsetError({ offset });
          const position = this.position - offset;
          this.assertPosition(position);
          this.position = position;
        },
        getReadCount(position) {
          return this.positionReadCount.get(position || this.position) || 0;
        },
        incrementPosition(offset) {
          if (offset < 0)
            throw new NegativeOffsetError({ offset });
          const position = this.position + offset;
          this.assertPosition(position);
          this.position = position;
        },
        inspectByte(position_) {
          const position = position_ ?? this.position;
          this.assertPosition(position);
          return this.bytes[position];
        },
        inspectBytes(length, position_) {
          const position = position_ ?? this.position;
          this.assertPosition(position + length - 1);
          return this.bytes.subarray(position, position + length);
        },
        inspectUint8(position_) {
          const position = position_ ?? this.position;
          this.assertPosition(position);
          return this.bytes[position];
        },
        inspectUint16(position_) {
          const position = position_ ?? this.position;
          this.assertPosition(position + 1);
          return this.dataView.getUint16(position);
        },
        inspectUint24(position_) {
          const position = position_ ?? this.position;
          this.assertPosition(position + 2);
          return (this.dataView.getUint16(position) << 8) + this.dataView.getUint8(position + 2);
        },
        inspectUint32(position_) {
          const position = position_ ?? this.position;
          this.assertPosition(position + 3);
          return this.dataView.getUint32(position);
        },
        pushByte(byte) {
          this.assertPosition(this.position);
          this.bytes[this.position] = byte;
          this.position++;
        },
        pushBytes(bytes) {
          this.assertPosition(this.position + bytes.length - 1);
          this.bytes.set(bytes, this.position);
          this.position += bytes.length;
        },
        pushUint8(value) {
          this.assertPosition(this.position);
          this.bytes[this.position] = value;
          this.position++;
        },
        pushUint16(value) {
          this.assertPosition(this.position + 1);
          this.dataView.setUint16(this.position, value);
          this.position += 2;
        },
        pushUint24(value) {
          this.assertPosition(this.position + 2);
          this.dataView.setUint16(this.position, value >> 8);
          this.dataView.setUint8(this.position + 2, value & ~4294967040);
          this.position += 3;
        },
        pushUint32(value) {
          this.assertPosition(this.position + 3);
          this.dataView.setUint32(this.position, value);
          this.position += 4;
        },
        readByte() {
          this.assertReadLimit();
          this._touch();
          const value = this.inspectByte();
          this.position++;
          return value;
        },
        readBytes(length, size5) {
          this.assertReadLimit();
          this._touch();
          const value = this.inspectBytes(length);
          this.position += size5 ?? length;
          return value;
        },
        readUint8() {
          this.assertReadLimit();
          this._touch();
          const value = this.inspectUint8();
          this.position += 1;
          return value;
        },
        readUint16() {
          this.assertReadLimit();
          this._touch();
          const value = this.inspectUint16();
          this.position += 2;
          return value;
        },
        readUint24() {
          this.assertReadLimit();
          this._touch();
          const value = this.inspectUint24();
          this.position += 3;
          return value;
        },
        readUint32() {
          this.assertReadLimit();
          this._touch();
          const value = this.inspectUint32();
          this.position += 4;
          return value;
        },
        get remaining() {
          return this.bytes.length - this.position;
        },
        setPosition(position) {
          const oldPosition = this.position;
          this.assertPosition(position);
          this.position = position;
          return () => this.position = oldPosition;
        },
        _touch() {
          if (this.recursiveReadLimit === Number.POSITIVE_INFINITY)
            return;
          const count = this.getReadCount();
          this.positionReadCount.set(this.position, count + 1);
          if (count > 0)
            this.recursiveReadCount++;
        }
      };
    }
  });

  // node_modules/viem/_esm/utils/encoding/fromBytes.js
  function bytesToBigInt(bytes, opts = {}) {
    if (typeof opts.size !== "undefined")
      assertSize(bytes, { size: opts.size });
    const hex = bytesToHex(bytes, opts);
    return hexToBigInt(hex, opts);
  }
  function bytesToBool(bytes_, opts = {}) {
    let bytes = bytes_;
    if (typeof opts.size !== "undefined") {
      assertSize(bytes, { size: opts.size });
      bytes = trim(bytes);
    }
    if (bytes.length > 1 || bytes[0] > 1)
      throw new InvalidBytesBooleanError(bytes);
    return Boolean(bytes[0]);
  }
  function bytesToNumber(bytes, opts = {}) {
    if (typeof opts.size !== "undefined")
      assertSize(bytes, { size: opts.size });
    const hex = bytesToHex(bytes, opts);
    return hexToNumber(hex, opts);
  }
  function bytesToString(bytes_, opts = {}) {
    let bytes = bytes_;
    if (typeof opts.size !== "undefined") {
      assertSize(bytes, { size: opts.size });
      bytes = trim(bytes, { dir: "right" });
    }
    return new TextDecoder().decode(bytes);
  }
  var init_fromBytes = __esm({
    "node_modules/viem/_esm/utils/encoding/fromBytes.js"() {
      init_encoding();
      init_trim();
      init_fromHex();
      init_toHex();
    }
  });

  // node_modules/viem/_esm/utils/abi/decodeAbiParameters.js
  function decodeAbiParameters(params, data) {
    const bytes = typeof data === "string" ? hexToBytes(data) : data;
    const cursor = createCursor(bytes);
    if (size(bytes) === 0 && params.length > 0)
      throw new AbiDecodingZeroDataError();
    if (size(data) && size(data) < 32)
      throw new AbiDecodingDataSizeTooSmallError({
        data: typeof data === "string" ? data : bytesToHex(data),
        params,
        size: size(data)
      });
    let consumed = 0;
    const values = [];
    for (let i = 0; i < params.length; ++i) {
      const param = params[i];
      cursor.setPosition(consumed);
      const [data2, consumed_] = decodeParameter(cursor, param, {
        staticPosition: 0
      });
      consumed += consumed_;
      values.push(data2);
    }
    return values;
  }
  function decodeParameter(cursor, param, { staticPosition }) {
    const arrayComponents = getArrayComponents(param.type);
    if (arrayComponents) {
      const [length, type] = arrayComponents;
      return decodeArray(cursor, { ...param, type }, { length, staticPosition });
    }
    if (param.type === "tuple")
      return decodeTuple(cursor, param, { staticPosition });
    if (param.type === "address")
      return decodeAddress(cursor);
    if (param.type === "bool")
      return decodeBool(cursor);
    if (param.type.startsWith("bytes"))
      return decodeBytes(cursor, param, { staticPosition });
    if (param.type.startsWith("uint") || param.type.startsWith("int"))
      return decodeNumber(cursor, param);
    if (param.type === "string")
      return decodeString(cursor, { staticPosition });
    throw new InvalidAbiDecodingTypeError(param.type, {
      docsPath: "/docs/contract/decodeAbiParameters"
    });
  }
  function decodeAddress(cursor) {
    const value = cursor.readBytes(32);
    return [checksumAddress(bytesToHex(sliceBytes(value, -20))), 32];
  }
  function decodeArray(cursor, param, { length, staticPosition }) {
    if (!length) {
      const offset = bytesToNumber(cursor.readBytes(sizeOfOffset));
      const start = staticPosition + offset;
      const startOfData = start + sizeOfLength;
      cursor.setPosition(start);
      const length2 = bytesToNumber(cursor.readBytes(sizeOfLength));
      const dynamicChild = hasDynamicChild(param);
      let consumed2 = 0;
      const value2 = [];
      for (let i = 0; i < length2; ++i) {
        cursor.setPosition(startOfData + (dynamicChild ? i * 32 : consumed2));
        const [data, consumed_] = decodeParameter(cursor, param, {
          staticPosition: startOfData
        });
        consumed2 += consumed_;
        value2.push(data);
      }
      cursor.setPosition(staticPosition + 32);
      return [value2, 32];
    }
    if (hasDynamicChild(param)) {
      const offset = bytesToNumber(cursor.readBytes(sizeOfOffset));
      const start = staticPosition + offset;
      const value2 = [];
      for (let i = 0; i < length; ++i) {
        cursor.setPosition(start + i * 32);
        const [data] = decodeParameter(cursor, param, {
          staticPosition: start
        });
        value2.push(data);
      }
      cursor.setPosition(staticPosition + 32);
      return [value2, 32];
    }
    let consumed = 0;
    const value = [];
    for (let i = 0; i < length; ++i) {
      const [data, consumed_] = decodeParameter(cursor, param, {
        staticPosition: staticPosition + consumed
      });
      consumed += consumed_;
      value.push(data);
    }
    return [value, consumed];
  }
  function decodeBool(cursor) {
    return [bytesToBool(cursor.readBytes(32), { size: 32 }), 32];
  }
  function decodeBytes(cursor, param, { staticPosition }) {
    const [_, size5] = param.type.split("bytes");
    if (!size5) {
      const offset = bytesToNumber(cursor.readBytes(32));
      cursor.setPosition(staticPosition + offset);
      const length = bytesToNumber(cursor.readBytes(32));
      if (length === 0) {
        cursor.setPosition(staticPosition + 32);
        return ["0x", 32];
      }
      const data = cursor.readBytes(length);
      cursor.setPosition(staticPosition + 32);
      return [bytesToHex(data), 32];
    }
    const value = bytesToHex(cursor.readBytes(Number.parseInt(size5, 10), 32));
    return [value, 32];
  }
  function decodeNumber(cursor, param) {
    const signed = param.type.startsWith("int");
    const size5 = Number.parseInt(param.type.split("int")[1] || "256", 10);
    const value = cursor.readBytes(32);
    return [
      size5 > 48 ? bytesToBigInt(value, { signed }) : bytesToNumber(value, { signed }),
      32
    ];
  }
  function decodeTuple(cursor, param, { staticPosition }) {
    const hasUnnamedChild = param.components.length === 0 || param.components.some(({ name }) => !name);
    const value = hasUnnamedChild ? [] : {};
    let consumed = 0;
    if (hasDynamicChild(param)) {
      const offset = bytesToNumber(cursor.readBytes(sizeOfOffset));
      const start = staticPosition + offset;
      for (let i = 0; i < param.components.length; ++i) {
        const component = param.components[i];
        cursor.setPosition(start + consumed);
        const [data, consumed_] = decodeParameter(cursor, component, {
          staticPosition: start
        });
        consumed += consumed_;
        value[hasUnnamedChild ? i : component?.name] = data;
      }
      cursor.setPosition(staticPosition + 32);
      return [value, 32];
    }
    for (let i = 0; i < param.components.length; ++i) {
      const component = param.components[i];
      const [data, consumed_] = decodeParameter(cursor, component, {
        staticPosition
      });
      value[hasUnnamedChild ? i : component?.name] = data;
      consumed += consumed_;
    }
    return [value, consumed];
  }
  function decodeString(cursor, { staticPosition }) {
    const offset = bytesToNumber(cursor.readBytes(32));
    const start = staticPosition + offset;
    cursor.setPosition(start);
    const length = bytesToNumber(cursor.readBytes(32));
    if (length === 0) {
      cursor.setPosition(staticPosition + 32);
      return ["", 32];
    }
    const data = cursor.readBytes(length, 32);
    const value = bytesToString(trim(data));
    cursor.setPosition(staticPosition + 32);
    return [value, 32];
  }
  function hasDynamicChild(param) {
    const { type } = param;
    if (type === "string")
      return true;
    if (type === "bytes")
      return true;
    if (type.endsWith("[]"))
      return true;
    if (type === "tuple")
      return param.components?.some(hasDynamicChild);
    const arrayComponents = getArrayComponents(param.type);
    if (arrayComponents && hasDynamicChild({ ...param, type: arrayComponents[1] }))
      return true;
    return false;
  }
  var sizeOfLength, sizeOfOffset;
  var init_decodeAbiParameters = __esm({
    "node_modules/viem/_esm/utils/abi/decodeAbiParameters.js"() {
      init_abi();
      init_getAddress();
      init_cursor2();
      init_size();
      init_slice();
      init_trim();
      init_fromBytes();
      init_toBytes();
      init_toHex();
      init_encodeAbiParameters();
      sizeOfLength = 32;
      sizeOfOffset = 32;
    }
  });

  // node_modules/viem/_esm/utils/abi/decodeErrorResult.js
  function decodeErrorResult(parameters) {
    const { abi: abi3, data } = parameters;
    const signature = slice(data, 0, 4);
    if (signature === "0x")
      throw new AbiDecodingZeroDataError();
    const abi_ = [...abi3 || [], solidityError, solidityPanic];
    const abiItem = abi_.find((x) => x.type === "error" && signature === toFunctionSelector(formatAbiItem2(x)));
    if (!abiItem)
      throw new AbiErrorSignatureNotFoundError(signature, {
        docsPath: "/docs/contract/decodeErrorResult"
      });
    return {
      abiItem,
      args: "inputs" in abiItem && abiItem.inputs && abiItem.inputs.length > 0 ? decodeAbiParameters(abiItem.inputs, slice(data, 4)) : void 0,
      errorName: abiItem.name
    };
  }
  var init_decodeErrorResult = __esm({
    "node_modules/viem/_esm/utils/abi/decodeErrorResult.js"() {
      init_solidity();
      init_abi();
      init_slice();
      init_toFunctionSelector();
      init_decodeAbiParameters();
      init_formatAbiItem2();
    }
  });

  // node_modules/viem/_esm/utils/stringify.js
  var stringify;
  var init_stringify = __esm({
    "node_modules/viem/_esm/utils/stringify.js"() {
      stringify = (value, replacer, space) => JSON.stringify(value, (key, value_) => {
        const value2 = typeof value_ === "bigint" ? value_.toString() : value_;
        return typeof replacer === "function" ? replacer(key, value2) : value2;
      }, space);
    }
  });

  // node_modules/viem/_esm/utils/abi/formatAbiItemWithArgs.js
  function formatAbiItemWithArgs({ abiItem, args, includeFunctionName = true, includeName = false }) {
    if (!("name" in abiItem))
      return;
    if (!("inputs" in abiItem))
      return;
    if (!abiItem.inputs)
      return;
    return `${includeFunctionName ? abiItem.name : ""}(${abiItem.inputs.map((input, i) => `${includeName && input.name ? `${input.name}: ` : ""}${typeof args[i] === "object" ? stringify(args[i]) : args[i]}`).join(", ")})`;
  }
  var init_formatAbiItemWithArgs = __esm({
    "node_modules/viem/_esm/utils/abi/formatAbiItemWithArgs.js"() {
      init_stringify();
    }
  });

  // node_modules/viem/_esm/constants/unit.js
  var etherUnits, gweiUnits;
  var init_unit = __esm({
    "node_modules/viem/_esm/constants/unit.js"() {
      etherUnits = {
        gwei: 9,
        wei: 18
      };
      gweiUnits = {
        ether: -9,
        wei: 9
      };
    }
  });

  // node_modules/viem/_esm/utils/unit/formatUnits.js
  function formatUnits(value, decimals) {
    let display = value.toString();
    const negative = display.startsWith("-");
    if (negative)
      display = display.slice(1);
    display = display.padStart(decimals, "0");
    let [integer, fraction] = [
      display.slice(0, display.length - decimals),
      display.slice(display.length - decimals)
    ];
    fraction = fraction.replace(/(0+)$/, "");
    return `${negative ? "-" : ""}${integer || "0"}${fraction ? `.${fraction}` : ""}`;
  }
  var init_formatUnits = __esm({
    "node_modules/viem/_esm/utils/unit/formatUnits.js"() {
    }
  });

  // node_modules/viem/_esm/utils/unit/formatEther.js
  function formatEther(wei, unit = "wei") {
    return formatUnits(wei, etherUnits[unit]);
  }
  var init_formatEther = __esm({
    "node_modules/viem/_esm/utils/unit/formatEther.js"() {
      init_unit();
      init_formatUnits();
    }
  });

  // node_modules/viem/_esm/utils/unit/formatGwei.js
  function formatGwei(wei, unit = "wei") {
    return formatUnits(wei, gweiUnits[unit]);
  }
  var init_formatGwei = __esm({
    "node_modules/viem/_esm/utils/unit/formatGwei.js"() {
      init_unit();
      init_formatUnits();
    }
  });

  // node_modules/viem/_esm/errors/stateOverride.js
  function prettyStateMapping(stateMapping) {
    return stateMapping.reduce((pretty, { slot, value }) => {
      return `${pretty}        ${slot}: ${value}
`;
    }, "");
  }
  function prettyStateOverride(stateOverride) {
    return stateOverride.reduce((pretty, { address, ...state }) => {
      let val = `${pretty}    ${address}:
`;
      if (state.nonce)
        val += `      nonce: ${state.nonce}
`;
      if (state.balance)
        val += `      balance: ${state.balance}
`;
      if (state.code)
        val += `      code: ${state.code}
`;
      if (state.state) {
        val += "      state:\n";
        val += prettyStateMapping(state.state);
      }
      if (state.stateDiff) {
        val += "      stateDiff:\n";
        val += prettyStateMapping(state.stateDiff);
      }
      return val;
    }, "  State Override:\n").slice(0, -1);
  }
  var AccountStateConflictError, StateAssignmentConflictError;
  var init_stateOverride = __esm({
    "node_modules/viem/_esm/errors/stateOverride.js"() {
      init_base();
      AccountStateConflictError = class extends BaseError2 {
        constructor({ address }) {
          super(`State for account "${address}" is set multiple times.`, {
            name: "AccountStateConflictError"
          });
        }
      };
      StateAssignmentConflictError = class extends BaseError2 {
        constructor() {
          super("state and stateDiff are set on the same account.", {
            name: "StateAssignmentConflictError"
          });
        }
      };
    }
  });

  // node_modules/viem/_esm/errors/transaction.js
  function prettyPrint(args) {
    const entries = Object.entries(args).map(([key, value]) => {
      if (value === void 0 || value === false)
        return null;
      return [key, value];
    }).filter(Boolean);
    const maxLength = entries.reduce((acc, [key]) => Math.max(acc, key.length), 0);
    return entries.map(([key, value]) => `  ${`${key}:`.padEnd(maxLength + 1)}  ${value}`).join("\n");
  }
  var FeeConflictError, InvalidLegacyVError, InvalidSerializableTransactionError, InvalidStorageKeySizeError, TransactionNotFoundError, TransactionReceiptNotFoundError, TransactionReceiptRevertedError, WaitForTransactionReceiptTimeoutError;
  var init_transaction = __esm({
    "node_modules/viem/_esm/errors/transaction.js"() {
      init_base();
      FeeConflictError = class extends BaseError2 {
        constructor() {
          super([
            "Cannot specify both a `gasPrice` and a `maxFeePerGas`/`maxPriorityFeePerGas`.",
            "Use `maxFeePerGas`/`maxPriorityFeePerGas` for EIP-1559 compatible networks, and `gasPrice` for others."
          ].join("\n"), { name: "FeeConflictError" });
        }
      };
      InvalidLegacyVError = class extends BaseError2 {
        constructor({ v }) {
          super(`Invalid \`v\` value "${v}". Expected 27 or 28.`, {
            name: "InvalidLegacyVError"
          });
        }
      };
      InvalidSerializableTransactionError = class extends BaseError2 {
        constructor({ transaction }) {
          super("Cannot infer a transaction type from provided transaction.", {
            metaMessages: [
              "Provided Transaction:",
              "{",
              prettyPrint(transaction),
              "}",
              "",
              "To infer the type, either provide:",
              "- a `type` to the Transaction, or",
              "- an EIP-1559 Transaction with `maxFeePerGas`, or",
              "- an EIP-2930 Transaction with `gasPrice` & `accessList`, or",
              "- an EIP-4844 Transaction with `blobs`, `blobVersionedHashes`, `sidecars`, or",
              "- an EIP-7702 Transaction with `authorizationList`, or",
              "- a Legacy Transaction with `gasPrice`"
            ],
            name: "InvalidSerializableTransactionError"
          });
        }
      };
      InvalidStorageKeySizeError = class extends BaseError2 {
        constructor({ storageKey }) {
          super(`Size for storage key "${storageKey}" is invalid. Expected 32 bytes. Got ${Math.floor((storageKey.length - 2) / 2)} bytes.`, { name: "InvalidStorageKeySizeError" });
        }
      };
      TransactionNotFoundError = class extends BaseError2 {
        constructor({ blockHash, blockNumber, blockTag, hash: hash3, index: index2 }) {
          let identifier = "Transaction";
          if (blockTag && index2 !== void 0)
            identifier = `Transaction at block time "${blockTag}" at index "${index2}"`;
          if (blockHash && index2 !== void 0)
            identifier = `Transaction at block hash "${blockHash}" at index "${index2}"`;
          if (blockNumber && index2 !== void 0)
            identifier = `Transaction at block number "${blockNumber}" at index "${index2}"`;
          if (hash3)
            identifier = `Transaction with hash "${hash3}"`;
          super(`${identifier} could not be found.`, {
            name: "TransactionNotFoundError"
          });
        }
      };
      TransactionReceiptNotFoundError = class extends BaseError2 {
        constructor({ hash: hash3 }) {
          super(`Transaction receipt with hash "${hash3}" could not be found. The Transaction may not be processed on a block yet.`, {
            name: "TransactionReceiptNotFoundError"
          });
        }
      };
      TransactionReceiptRevertedError = class extends BaseError2 {
        constructor({ receipt }) {
          super(`Transaction with hash "${receipt.transactionHash}" reverted.`, {
            metaMessages: [
              'The receipt marked the transaction as "reverted". This could mean that the function on the contract you are trying to call threw an error.',
              " ",
              "You can attempt to extract the revert reason by:",
              "- calling the `simulateContract` or `simulateCalls` Action with the `abi` and `functionName` of the contract",
              "- using the `call` Action with raw `data`"
            ],
            name: "TransactionReceiptRevertedError"
          });
          Object.defineProperty(this, "receipt", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          this.receipt = receipt;
        }
      };
      WaitForTransactionReceiptTimeoutError = class extends BaseError2 {
        constructor({ hash: hash3 }) {
          super(`Timed out while waiting for transaction with hash "${hash3}" to be confirmed.`, { name: "WaitForTransactionReceiptTimeoutError" });
        }
      };
    }
  });

  // node_modules/viem/_esm/errors/utils.js
  var getContractAddress, getUrl;
  var init_utils3 = __esm({
    "node_modules/viem/_esm/errors/utils.js"() {
      getContractAddress = (address) => address;
      getUrl = (url) => url;
    }
  });

  // node_modules/viem/_esm/errors/contract.js
  var CallExecutionError, ContractFunctionExecutionError, ContractFunctionRevertedError, ContractFunctionZeroDataError, CounterfactualDeploymentFailedError, RawContractError;
  var init_contract = __esm({
    "node_modules/viem/_esm/errors/contract.js"() {
      init_parseAccount();
      init_solidity();
      init_decodeErrorResult();
      init_formatAbiItem2();
      init_formatAbiItemWithArgs();
      init_getAbiItem();
      init_formatEther();
      init_formatGwei();
      init_abi();
      init_base();
      init_stateOverride();
      init_transaction();
      init_utils3();
      CallExecutionError = class extends BaseError2 {
        constructor(cause, { account: account_, docsPath: docsPath8, chain, data, gas, gasPrice, maxFeePerGas, maxPriorityFeePerGas, nonce, to, value, stateOverride }) {
          const account = account_ ? parseAccount(account_) : void 0;
          let prettyArgs = prettyPrint({
            from: account?.address,
            to,
            value: typeof value !== "undefined" && `${formatEther(value)} ${chain?.nativeCurrency?.symbol || "ETH"}`,
            data,
            gas,
            gasPrice: typeof gasPrice !== "undefined" && `${formatGwei(gasPrice)} gwei`,
            maxFeePerGas: typeof maxFeePerGas !== "undefined" && `${formatGwei(maxFeePerGas)} gwei`,
            maxPriorityFeePerGas: typeof maxPriorityFeePerGas !== "undefined" && `${formatGwei(maxPriorityFeePerGas)} gwei`,
            nonce
          });
          if (stateOverride) {
            prettyArgs += `
${prettyStateOverride(stateOverride)}`;
          }
          super(cause.shortMessage, {
            cause,
            docsPath: docsPath8,
            metaMessages: [
              ...cause.metaMessages ? [...cause.metaMessages, " "] : [],
              "Raw Call Arguments:",
              prettyArgs
            ].filter(Boolean),
            name: "CallExecutionError"
          });
          Object.defineProperty(this, "cause", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          this.cause = cause;
        }
      };
      ContractFunctionExecutionError = class extends BaseError2 {
        constructor(cause, { abi: abi3, args, contractAddress, docsPath: docsPath8, functionName, sender }) {
          const abiItem = getAbiItem({ abi: abi3, args, name: functionName });
          const formattedArgs = abiItem ? formatAbiItemWithArgs({
            abiItem,
            args,
            includeFunctionName: false,
            includeName: false
          }) : void 0;
          const functionWithParams = abiItem ? formatAbiItem2(abiItem, { includeName: true }) : void 0;
          const prettyArgs = prettyPrint({
            address: contractAddress && getContractAddress(contractAddress),
            function: functionWithParams,
            args: formattedArgs && formattedArgs !== "()" && `${[...Array(functionName?.length ?? 0).keys()].map(() => " ").join("")}${formattedArgs}`,
            sender
          });
          super(cause.shortMessage || `An unknown error occurred while executing the contract function "${functionName}".`, {
            cause,
            docsPath: docsPath8,
            metaMessages: [
              ...cause.metaMessages ? [...cause.metaMessages, " "] : [],
              prettyArgs && "Contract Call:",
              prettyArgs
            ].filter(Boolean),
            name: "ContractFunctionExecutionError"
          });
          Object.defineProperty(this, "abi", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          Object.defineProperty(this, "args", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          Object.defineProperty(this, "cause", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          Object.defineProperty(this, "contractAddress", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          Object.defineProperty(this, "formattedArgs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          Object.defineProperty(this, "functionName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          Object.defineProperty(this, "sender", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          this.abi = abi3;
          this.args = args;
          this.cause = cause;
          this.contractAddress = contractAddress;
          this.functionName = functionName;
          this.sender = sender;
        }
      };
      ContractFunctionRevertedError = class extends BaseError2 {
        constructor({ abi: abi3, data, functionName, message }) {
          let cause;
          let decodedData;
          let metaMessages;
          let reason;
          if (data && data !== "0x") {
            try {
              decodedData = decodeErrorResult({ abi: abi3, data });
              const { abiItem, errorName, args: errorArgs } = decodedData;
              if (errorName === "Error") {
                reason = errorArgs[0];
              } else if (errorName === "Panic") {
                const [firstArg] = errorArgs;
                reason = panicReasons[firstArg];
              } else {
                const errorWithParams = abiItem ? formatAbiItem2(abiItem, { includeName: true }) : void 0;
                const formattedArgs = abiItem && errorArgs ? formatAbiItemWithArgs({
                  abiItem,
                  args: errorArgs,
                  includeFunctionName: false,
                  includeName: false
                }) : void 0;
                metaMessages = [
                  errorWithParams ? `Error: ${errorWithParams}` : "",
                  formattedArgs && formattedArgs !== "()" ? `       ${[...Array(errorName?.length ?? 0).keys()].map(() => " ").join("")}${formattedArgs}` : ""
                ];
              }
            } catch (err) {
              cause = err;
            }
          } else if (message)
            reason = message;
          let signature;
          if (cause instanceof AbiErrorSignatureNotFoundError) {
            signature = cause.signature;
            metaMessages = [
              `Unable to decode signature "${signature}" as it was not found on the provided ABI.`,
              "Make sure you are using the correct ABI and that the error exists on it.",
              `You can look up the decoded signature here: https://openchain.xyz/signatures?query=${signature}.`
            ];
          }
          super(reason && reason !== "execution reverted" || signature ? [
            `The contract function "${functionName}" reverted with the following ${signature ? "signature" : "reason"}:`,
            reason || signature
          ].join("\n") : `The contract function "${functionName}" reverted.`, {
            cause,
            metaMessages,
            name: "ContractFunctionRevertedError"
          });
          Object.defineProperty(this, "data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          Object.defineProperty(this, "raw", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          Object.defineProperty(this, "reason", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          Object.defineProperty(this, "signature", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          this.data = decodedData;
          this.raw = data;
          this.reason = reason;
          this.signature = signature;
        }
      };
      ContractFunctionZeroDataError = class extends BaseError2 {
        constructor({ functionName }) {
          super(`The contract function "${functionName}" returned no data ("0x").`, {
            metaMessages: [
              "This could be due to any of the following:",
              `  - The contract does not have the function "${functionName}",`,
              "  - The parameters passed to the contract function may be invalid, or",
              "  - The address is not a contract."
            ],
            name: "ContractFunctionZeroDataError"
          });
        }
      };
      CounterfactualDeploymentFailedError = class extends BaseError2 {
        constructor({ factory }) {
          super(`Deployment for counterfactual contract call failed${factory ? ` for factory "${factory}".` : ""}`, {
            metaMessages: [
              "Please ensure:",
              "- The `factory` is a valid contract deployment factory (ie. Create2 Factory, ERC-4337 Factory, etc).",
              "- The `factoryData` is a valid encoded function call for contract deployment function on the factory."
            ],
            name: "CounterfactualDeploymentFailedError"
          });
        }
      };
      RawContractError = class extends BaseError2 {
        constructor({ data, message }) {
          super(message || "", { name: "RawContractError" });
          Object.defineProperty(this, "code", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 3
          });
          Object.defineProperty(this, "data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          this.data = data;
        }
      };
    }
  });

  // node_modules/viem/_esm/errors/request.js
  var HttpRequestError, RpcRequestError, TimeoutError;
  var init_request = __esm({
    "node_modules/viem/_esm/errors/request.js"() {
      init_stringify();
      init_base();
      init_utils3();
      HttpRequestError = class extends BaseError2 {
        constructor({ body, cause, details, headers, status, url }) {
          super("HTTP request failed.", {
            cause,
            details,
            metaMessages: [
              status && `Status: ${status}`,
              `URL: ${getUrl(url)}`,
              body && `Request body: ${stringify(body)}`
            ].filter(Boolean),
            name: "HttpRequestError"
          });
          Object.defineProperty(this, "body", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          Object.defineProperty(this, "headers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          Object.defineProperty(this, "status", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          Object.defineProperty(this, "url", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          this.body = body;
          this.headers = headers;
          this.status = status;
          this.url = url;
        }
      };
      RpcRequestError = class extends BaseError2 {
        constructor({ body, error, url }) {
          super("RPC Request failed.", {
            cause: error,
            details: error.message,
            metaMessages: [`URL: ${getUrl(url)}`, `Request body: ${stringify(body)}`],
            name: "RpcRequestError"
          });
          Object.defineProperty(this, "code", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          Object.defineProperty(this, "data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          this.code = error.code;
          this.data = error.data;
        }
      };
      TimeoutError = class extends BaseError2 {
        constructor({ body, url }) {
          super("The request took too long to respond.", {
            details: "The request timed out.",
            metaMessages: [`URL: ${getUrl(url)}`, `Request body: ${stringify(body)}`],
            name: "TimeoutError"
          });
        }
      };
    }
  });

  // node_modules/viem/_esm/errors/rpc.js
  var unknownErrorCode, RpcError, ProviderRpcError, ParseRpcError, InvalidRequestRpcError, MethodNotFoundRpcError, InvalidParamsRpcError, InternalRpcError, InvalidInputRpcError, ResourceNotFoundRpcError, ResourceUnavailableRpcError, TransactionRejectedRpcError, MethodNotSupportedRpcError, LimitExceededRpcError, JsonRpcVersionUnsupportedError, UserRejectedRequestError, UnauthorizedProviderError, UnsupportedProviderMethodError, ProviderDisconnectedError, ChainDisconnectedError, SwitchChainError, UnsupportedNonOptionalCapabilityError, UnsupportedChainIdError, DuplicateIdError, UnknownBundleIdError, BundleTooLargeError, AtomicReadyWalletRejectedUpgradeError, AtomicityNotSupportedError, UnknownRpcError;
  var init_rpc = __esm({
    "node_modules/viem/_esm/errors/rpc.js"() {
      init_base();
      init_request();
      unknownErrorCode = -1;
      RpcError = class extends BaseError2 {
        constructor(cause, { code, docsPath: docsPath8, metaMessages, name, shortMessage }) {
          super(shortMessage, {
            cause,
            docsPath: docsPath8,
            metaMessages: metaMessages || cause?.metaMessages,
            name: name || "RpcError"
          });
          Object.defineProperty(this, "code", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          this.name = name || cause.name;
          this.code = cause instanceof RpcRequestError ? cause.code : code ?? unknownErrorCode;
        }
      };
      ProviderRpcError = class extends RpcError {
        constructor(cause, options) {
          super(cause, options);
          Object.defineProperty(this, "data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          this.data = options.data;
        }
      };
      ParseRpcError = class _ParseRpcError extends RpcError {
        constructor(cause) {
          super(cause, {
            code: _ParseRpcError.code,
            name: "ParseRpcError",
            shortMessage: "Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text."
          });
        }
      };
      Object.defineProperty(ParseRpcError, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: -32700
      });
      InvalidRequestRpcError = class _InvalidRequestRpcError extends RpcError {
        constructor(cause) {
          super(cause, {
            code: _InvalidRequestRpcError.code,
            name: "InvalidRequestRpcError",
            shortMessage: "JSON is not a valid request object."
          });
        }
      };
      Object.defineProperty(InvalidRequestRpcError, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: -32600
      });
      MethodNotFoundRpcError = class _MethodNotFoundRpcError extends RpcError {
        constructor(cause, { method } = {}) {
          super(cause, {
            code: _MethodNotFoundRpcError.code,
            name: "MethodNotFoundRpcError",
            shortMessage: `The method${method ? ` "${method}"` : ""} does not exist / is not available.`
          });
        }
      };
      Object.defineProperty(MethodNotFoundRpcError, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: -32601
      });
      InvalidParamsRpcError = class _InvalidParamsRpcError extends RpcError {
        constructor(cause) {
          super(cause, {
            code: _InvalidParamsRpcError.code,
            name: "InvalidParamsRpcError",
            shortMessage: [
              "Invalid parameters were provided to the RPC method.",
              "Double check you have provided the correct parameters."
            ].join("\n")
          });
        }
      };
      Object.defineProperty(InvalidParamsRpcError, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: -32602
      });
      InternalRpcError = class _InternalRpcError extends RpcError {
        constructor(cause) {
          super(cause, {
            code: _InternalRpcError.code,
            name: "InternalRpcError",
            shortMessage: "An internal error was received."
          });
        }
      };
      Object.defineProperty(InternalRpcError, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: -32603
      });
      InvalidInputRpcError = class _InvalidInputRpcError extends RpcError {
        constructor(cause) {
          super(cause, {
            code: _InvalidInputRpcError.code,
            name: "InvalidInputRpcError",
            shortMessage: [
              "Missing or invalid parameters.",
              "Double check you have provided the correct parameters."
            ].join("\n")
          });
        }
      };
      Object.defineProperty(InvalidInputRpcError, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: -32e3
      });
      ResourceNotFoundRpcError = class _ResourceNotFoundRpcError extends RpcError {
        constructor(cause) {
          super(cause, {
            code: _ResourceNotFoundRpcError.code,
            name: "ResourceNotFoundRpcError",
            shortMessage: "Requested resource not found."
          });
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "ResourceNotFoundRpcError"
          });
        }
      };
      Object.defineProperty(ResourceNotFoundRpcError, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: -32001
      });
      ResourceUnavailableRpcError = class _ResourceUnavailableRpcError extends RpcError {
        constructor(cause) {
          super(cause, {
            code: _ResourceUnavailableRpcError.code,
            name: "ResourceUnavailableRpcError",
            shortMessage: "Requested resource not available."
          });
        }
      };
      Object.defineProperty(ResourceUnavailableRpcError, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: -32002
      });
      TransactionRejectedRpcError = class _TransactionRejectedRpcError extends RpcError {
        constructor(cause) {
          super(cause, {
            code: _TransactionRejectedRpcError.code,
            name: "TransactionRejectedRpcError",
            shortMessage: "Transaction creation failed."
          });
        }
      };
      Object.defineProperty(TransactionRejectedRpcError, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: -32003
      });
      MethodNotSupportedRpcError = class _MethodNotSupportedRpcError extends RpcError {
        constructor(cause, { method } = {}) {
          super(cause, {
            code: _MethodNotSupportedRpcError.code,
            name: "MethodNotSupportedRpcError",
            shortMessage: `Method${method ? ` "${method}"` : ""} is not supported.`
          });
        }
      };
      Object.defineProperty(MethodNotSupportedRpcError, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: -32004
      });
      LimitExceededRpcError = class _LimitExceededRpcError extends RpcError {
        constructor(cause) {
          super(cause, {
            code: _LimitExceededRpcError.code,
            name: "LimitExceededRpcError",
            shortMessage: "Request exceeds defined limit."
          });
        }
      };
      Object.defineProperty(LimitExceededRpcError, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: -32005
      });
      JsonRpcVersionUnsupportedError = class _JsonRpcVersionUnsupportedError extends RpcError {
        constructor(cause) {
          super(cause, {
            code: _JsonRpcVersionUnsupportedError.code,
            name: "JsonRpcVersionUnsupportedError",
            shortMessage: "Version of JSON-RPC protocol is not supported."
          });
        }
      };
      Object.defineProperty(JsonRpcVersionUnsupportedError, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: -32006
      });
      UserRejectedRequestError = class _UserRejectedRequestError extends ProviderRpcError {
        constructor(cause) {
          super(cause, {
            code: _UserRejectedRequestError.code,
            name: "UserRejectedRequestError",
            shortMessage: "User rejected the request."
          });
        }
      };
      Object.defineProperty(UserRejectedRequestError, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: 4001
      });
      UnauthorizedProviderError = class _UnauthorizedProviderError extends ProviderRpcError {
        constructor(cause) {
          super(cause, {
            code: _UnauthorizedProviderError.code,
            name: "UnauthorizedProviderError",
            shortMessage: "The requested method and/or account has not been authorized by the user."
          });
        }
      };
      Object.defineProperty(UnauthorizedProviderError, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: 4100
      });
      UnsupportedProviderMethodError = class _UnsupportedProviderMethodError extends ProviderRpcError {
        constructor(cause, { method } = {}) {
          super(cause, {
            code: _UnsupportedProviderMethodError.code,
            name: "UnsupportedProviderMethodError",
            shortMessage: `The Provider does not support the requested method${method ? ` " ${method}"` : ""}.`
          });
        }
      };
      Object.defineProperty(UnsupportedProviderMethodError, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: 4200
      });
      ProviderDisconnectedError = class _ProviderDisconnectedError extends ProviderRpcError {
        constructor(cause) {
          super(cause, {
            code: _ProviderDisconnectedError.code,
            name: "ProviderDisconnectedError",
            shortMessage: "The Provider is disconnected from all chains."
          });
        }
      };
      Object.defineProperty(ProviderDisconnectedError, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: 4900
      });
      ChainDisconnectedError = class _ChainDisconnectedError extends ProviderRpcError {
        constructor(cause) {
          super(cause, {
            code: _ChainDisconnectedError.code,
            name: "ChainDisconnectedError",
            shortMessage: "The Provider is not connected to the requested chain."
          });
        }
      };
      Object.defineProperty(ChainDisconnectedError, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: 4901
      });
      SwitchChainError = class _SwitchChainError extends ProviderRpcError {
        constructor(cause) {
          super(cause, {
            code: _SwitchChainError.code,
            name: "SwitchChainError",
            shortMessage: "An error occurred when attempting to switch chain."
          });
        }
      };
      Object.defineProperty(SwitchChainError, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: 4902
      });
      UnsupportedNonOptionalCapabilityError = class _UnsupportedNonOptionalCapabilityError extends ProviderRpcError {
        constructor(cause) {
          super(cause, {
            code: _UnsupportedNonOptionalCapabilityError.code,
            name: "UnsupportedNonOptionalCapabilityError",
            shortMessage: "This Wallet does not support a capability that was not marked as optional."
          });
        }
      };
      Object.defineProperty(UnsupportedNonOptionalCapabilityError, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: 5700
      });
      UnsupportedChainIdError = class _UnsupportedChainIdError extends ProviderRpcError {
        constructor(cause) {
          super(cause, {
            code: _UnsupportedChainIdError.code,
            name: "UnsupportedChainIdError",
            shortMessage: "This Wallet does not support the requested chain ID."
          });
        }
      };
      Object.defineProperty(UnsupportedChainIdError, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: 5710
      });
      DuplicateIdError = class _DuplicateIdError extends ProviderRpcError {
        constructor(cause) {
          super(cause, {
            code: _DuplicateIdError.code,
            name: "DuplicateIdError",
            shortMessage: "There is already a bundle submitted with this ID."
          });
        }
      };
      Object.defineProperty(DuplicateIdError, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: 5720
      });
      UnknownBundleIdError = class _UnknownBundleIdError extends ProviderRpcError {
        constructor(cause) {
          super(cause, {
            code: _UnknownBundleIdError.code,
            name: "UnknownBundleIdError",
            shortMessage: "This bundle id is unknown / has not been submitted"
          });
        }
      };
      Object.defineProperty(UnknownBundleIdError, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: 5730
      });
      BundleTooLargeError = class _BundleTooLargeError extends ProviderRpcError {
        constructor(cause) {
          super(cause, {
            code: _BundleTooLargeError.code,
            name: "BundleTooLargeError",
            shortMessage: "The call bundle is too large for the Wallet to process."
          });
        }
      };
      Object.defineProperty(BundleTooLargeError, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: 5740
      });
      AtomicReadyWalletRejectedUpgradeError = class _AtomicReadyWalletRejectedUpgradeError extends ProviderRpcError {
        constructor(cause) {
          super(cause, {
            code: _AtomicReadyWalletRejectedUpgradeError.code,
            name: "AtomicReadyWalletRejectedUpgradeError",
            shortMessage: "The Wallet can support atomicity after an upgrade, but the user rejected the upgrade."
          });
        }
      };
      Object.defineProperty(AtomicReadyWalletRejectedUpgradeError, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: 5750
      });
      AtomicityNotSupportedError = class _AtomicityNotSupportedError extends ProviderRpcError {
        constructor(cause) {
          super(cause, {
            code: _AtomicityNotSupportedError.code,
            name: "AtomicityNotSupportedError",
            shortMessage: "The wallet does not support atomic execution but the request requires it."
          });
        }
      };
      Object.defineProperty(AtomicityNotSupportedError, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: 5760
      });
      UnknownRpcError = class extends RpcError {
        constructor(cause) {
          super(cause, {
            name: "UnknownRpcError",
            shortMessage: "An unknown RPC error occurred."
          });
        }
      };
    }
  });

  // node_modules/viem/_esm/utils/errors/getContractError.js
  function getContractError(err, { abi: abi3, address, args, docsPath: docsPath8, functionName, sender }) {
    const error = err instanceof RawContractError ? err : err instanceof BaseError2 ? err.walk((err2) => "data" in err2) || err.walk() : {};
    const { code, data, details, message, shortMessage } = error;
    const cause = (() => {
      if (err instanceof AbiDecodingZeroDataError)
        return new ContractFunctionZeroDataError({ functionName });
      if ([EXECUTION_REVERTED_ERROR_CODE, InternalRpcError.code].includes(code) && (data || details || message || shortMessage)) {
        return new ContractFunctionRevertedError({
          abi: abi3,
          data: typeof data === "object" ? data.data : data,
          functionName,
          message: error instanceof RpcRequestError ? details : shortMessage ?? message
        });
      }
      return err;
    })();
    return new ContractFunctionExecutionError(cause, {
      abi: abi3,
      args,
      contractAddress: address,
      docsPath: docsPath8,
      functionName,
      sender
    });
  }
  var EXECUTION_REVERTED_ERROR_CODE;
  var init_getContractError = __esm({
    "node_modules/viem/_esm/utils/errors/getContractError.js"() {
      init_abi();
      init_base();
      init_contract();
      init_request();
      init_rpc();
      EXECUTION_REVERTED_ERROR_CODE = 3;
    }
  });

  // node_modules/viem/_esm/accounts/utils/publicKeyToAddress.js
  function publicKeyToAddress(publicKey) {
    const address = keccak256(`0x${publicKey.substring(4)}`).substring(26);
    return checksumAddress(`0x${address}`);
  }
  var init_publicKeyToAddress = __esm({
    "node_modules/viem/_esm/accounts/utils/publicKeyToAddress.js"() {
      init_getAddress();
      init_keccak256();
    }
  });

  // node_modules/@noble/hashes/esm/_md.js
  function setBigUint64(view, byteOffset, value, isLE2) {
    if (typeof view.setBigUint64 === "function")
      return view.setBigUint64(byteOffset, value, isLE2);
    const _32n2 = BigInt(32);
    const _u32_max = BigInt(4294967295);
    const wh = Number(value >> _32n2 & _u32_max);
    const wl = Number(value & _u32_max);
    const h = isLE2 ? 4 : 0;
    const l = isLE2 ? 0 : 4;
    view.setUint32(byteOffset + h, wh, isLE2);
    view.setUint32(byteOffset + l, wl, isLE2);
  }
  function Chi(a, b, c) {
    return a & b ^ ~a & c;
  }
  function Maj(a, b, c) {
    return a & b ^ a & c ^ b & c;
  }
  var HashMD, SHA256_IV, SHA384_IV, SHA512_IV;
  var init_md = __esm({
    "node_modules/@noble/hashes/esm/_md.js"() {
      init_utils2();
      HashMD = class extends Hash {
        constructor(blockLen, outputLen, padOffset, isLE2) {
          super();
          this.finished = false;
          this.length = 0;
          this.pos = 0;
          this.destroyed = false;
          this.blockLen = blockLen;
          this.outputLen = outputLen;
          this.padOffset = padOffset;
          this.isLE = isLE2;
          this.buffer = new Uint8Array(blockLen);
          this.view = createView(this.buffer);
        }
        update(data) {
          aexists(this);
          data = toBytes2(data);
          abytes(data);
          const { view, buffer: buffer2, blockLen } = this;
          const len = data.length;
          for (let pos = 0; pos < len; ) {
            const take = Math.min(blockLen - this.pos, len - pos);
            if (take === blockLen) {
              const dataView = createView(data);
              for (; blockLen <= len - pos; pos += blockLen)
                this.process(dataView, pos);
              continue;
            }
            buffer2.set(data.subarray(pos, pos + take), this.pos);
            this.pos += take;
            pos += take;
            if (this.pos === blockLen) {
              this.process(view, 0);
              this.pos = 0;
            }
          }
          this.length += data.length;
          this.roundClean();
          return this;
        }
        digestInto(out) {
          aexists(this);
          aoutput(out, this);
          this.finished = true;
          const { buffer: buffer2, view, blockLen, isLE: isLE2 } = this;
          let { pos } = this;
          buffer2[pos++] = 128;
          clean(this.buffer.subarray(pos));
          if (this.padOffset > blockLen - pos) {
            this.process(view, 0);
            pos = 0;
          }
          for (let i = pos; i < blockLen; i++)
            buffer2[i] = 0;
          setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE2);
          this.process(view, 0);
          const oview = createView(out);
          const len = this.outputLen;
          if (len % 4)
            throw new Error("_sha2: outputLen should be aligned to 32bit");
          const outLen = len / 4;
          const state = this.get();
          if (outLen > state.length)
            throw new Error("_sha2: outputLen bigger than state");
          for (let i = 0; i < outLen; i++)
            oview.setUint32(4 * i, state[i], isLE2);
        }
        digest() {
          const { buffer: buffer2, outputLen } = this;
          this.digestInto(buffer2);
          const res = buffer2.slice(0, outputLen);
          this.destroy();
          return res;
        }
        _cloneInto(to) {
          to || (to = new this.constructor());
          to.set(...this.get());
          const { blockLen, buffer: buffer2, length, finished, destroyed, pos } = this;
          to.destroyed = destroyed;
          to.finished = finished;
          to.length = length;
          to.pos = pos;
          if (length % blockLen)
            to.buffer.set(buffer2);
          return to;
        }
        clone() {
          return this._cloneInto();
        }
      };
      SHA256_IV = /* @__PURE__ */ Uint32Array.from([
        1779033703,
        3144134277,
        1013904242,
        2773480762,
        1359893119,
        2600822924,
        528734635,
        1541459225
      ]);
      SHA384_IV = /* @__PURE__ */ Uint32Array.from([
        3418070365,
        3238371032,
        1654270250,
        914150663,
        2438529370,
        812702999,
        355462360,
        4144912697,
        1731405415,
        4290775857,
        2394180231,
        1750603025,
        3675008525,
        1694076839,
        1203062813,
        3204075428
      ]);
      SHA512_IV = /* @__PURE__ */ Uint32Array.from([
        1779033703,
        4089235720,
        3144134277,
        2227873595,
        1013904242,
        4271175723,
        2773480762,
        1595750129,
        1359893119,
        2917565137,
        2600822924,
        725511199,
        528734635,
        4215389547,
        1541459225,
        327033209
      ]);
    }
  });

  // node_modules/@noble/hashes/esm/sha2.js
  var SHA256_K, SHA256_W, SHA256, K512, SHA512_Kh, SHA512_Kl, SHA512_W_H, SHA512_W_L, SHA512, SHA384, sha256, sha512, sha384;
  var init_sha2 = __esm({
    "node_modules/@noble/hashes/esm/sha2.js"() {
      init_md();
      init_u64();
      init_utils2();
      SHA256_K = /* @__PURE__ */ Uint32Array.from([
        1116352408,
        1899447441,
        3049323471,
        3921009573,
        961987163,
        1508970993,
        2453635748,
        2870763221,
        3624381080,
        310598401,
        607225278,
        1426881987,
        1925078388,
        2162078206,
        2614888103,
        3248222580,
        3835390401,
        4022224774,
        264347078,
        604807628,
        770255983,
        1249150122,
        1555081692,
        1996064986,
        2554220882,
        2821834349,
        2952996808,
        3210313671,
        3336571891,
        3584528711,
        113926993,
        338241895,
        666307205,
        773529912,
        1294757372,
        1396182291,
        1695183700,
        1986661051,
        2177026350,
        2456956037,
        2730485921,
        2820302411,
        3259730800,
        3345764771,
        3516065817,
        3600352804,
        4094571909,
        275423344,
        430227734,
        506948616,
        659060556,
        883997877,
        958139571,
        1322822218,
        1537002063,
        1747873779,
        1955562222,
        2024104815,
        2227730452,
        2361852424,
        2428436474,
        2756734187,
        3204031479,
        3329325298
      ]);
      SHA256_W = /* @__PURE__ */ new Uint32Array(64);
      SHA256 = class extends HashMD {
        constructor(outputLen = 32) {
          super(64, outputLen, 8, false);
          this.A = SHA256_IV[0] | 0;
          this.B = SHA256_IV[1] | 0;
          this.C = SHA256_IV[2] | 0;
          this.D = SHA256_IV[3] | 0;
          this.E = SHA256_IV[4] | 0;
          this.F = SHA256_IV[5] | 0;
          this.G = SHA256_IV[6] | 0;
          this.H = SHA256_IV[7] | 0;
        }
        get() {
          const { A, B, C, D, E, F, G, H } = this;
          return [A, B, C, D, E, F, G, H];
        }
        // prettier-ignore
        set(A, B, C, D, E, F, G, H) {
          this.A = A | 0;
          this.B = B | 0;
          this.C = C | 0;
          this.D = D | 0;
          this.E = E | 0;
          this.F = F | 0;
          this.G = G | 0;
          this.H = H | 0;
        }
        process(view, offset) {
          for (let i = 0; i < 16; i++, offset += 4)
            SHA256_W[i] = view.getUint32(offset, false);
          for (let i = 16; i < 64; i++) {
            const W15 = SHA256_W[i - 15];
            const W2 = SHA256_W[i - 2];
            const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
            const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
            SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
          }
          let { A, B, C, D, E, F, G, H } = this;
          for (let i = 0; i < 64; i++) {
            const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
            const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
            const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
            const T2 = sigma0 + Maj(A, B, C) | 0;
            H = G;
            G = F;
            F = E;
            E = D + T1 | 0;
            D = C;
            C = B;
            B = A;
            A = T1 + T2 | 0;
          }
          A = A + this.A | 0;
          B = B + this.B | 0;
          C = C + this.C | 0;
          D = D + this.D | 0;
          E = E + this.E | 0;
          F = F + this.F | 0;
          G = G + this.G | 0;
          H = H + this.H | 0;
          this.set(A, B, C, D, E, F, G, H);
        }
        roundClean() {
          clean(SHA256_W);
        }
        destroy() {
          this.set(0, 0, 0, 0, 0, 0, 0, 0);
          clean(this.buffer);
        }
      };
      K512 = /* @__PURE__ */ (() => split([
        "0x428a2f98d728ae22",
        "0x7137449123ef65cd",
        "0xb5c0fbcfec4d3b2f",
        "0xe9b5dba58189dbbc",
        "0x3956c25bf348b538",
        "0x59f111f1b605d019",
        "0x923f82a4af194f9b",
        "0xab1c5ed5da6d8118",
        "0xd807aa98a3030242",
        "0x12835b0145706fbe",
        "0x243185be4ee4b28c",
        "0x550c7dc3d5ffb4e2",
        "0x72be5d74f27b896f",
        "0x80deb1fe3b1696b1",
        "0x9bdc06a725c71235",
        "0xc19bf174cf692694",
        "0xe49b69c19ef14ad2",
        "0xefbe4786384f25e3",
        "0x0fc19dc68b8cd5b5",
        "0x240ca1cc77ac9c65",
        "0x2de92c6f592b0275",
        "0x4a7484aa6ea6e483",
        "0x5cb0a9dcbd41fbd4",
        "0x76f988da831153b5",
        "0x983e5152ee66dfab",
        "0xa831c66d2db43210",
        "0xb00327c898fb213f",
        "0xbf597fc7beef0ee4",
        "0xc6e00bf33da88fc2",
        "0xd5a79147930aa725",
        "0x06ca6351e003826f",
        "0x142929670a0e6e70",
        "0x27b70a8546d22ffc",
        "0x2e1b21385c26c926",
        "0x4d2c6dfc5ac42aed",
        "0x53380d139d95b3df",
        "0x650a73548baf63de",
        "0x766a0abb3c77b2a8",
        "0x81c2c92e47edaee6",
        "0x92722c851482353b",
        "0xa2bfe8a14cf10364",
        "0xa81a664bbc423001",
        "0xc24b8b70d0f89791",
        "0xc76c51a30654be30",
        "0xd192e819d6ef5218",
        "0xd69906245565a910",
        "0xf40e35855771202a",
        "0x106aa07032bbd1b8",
        "0x19a4c116b8d2d0c8",
        "0x1e376c085141ab53",
        "0x2748774cdf8eeb99",
        "0x34b0bcb5e19b48a8",
        "0x391c0cb3c5c95a63",
        "0x4ed8aa4ae3418acb",
        "0x5b9cca4f7763e373",
        "0x682e6ff3d6b2b8a3",
        "0x748f82ee5defb2fc",
        "0x78a5636f43172f60",
        "0x84c87814a1f0ab72",
        "0x8cc702081a6439ec",
        "0x90befffa23631e28",
        "0xa4506cebde82bde9",
        "0xbef9a3f7b2c67915",
        "0xc67178f2e372532b",
        "0xca273eceea26619c",
        "0xd186b8c721c0c207",
        "0xeada7dd6cde0eb1e",
        "0xf57d4f7fee6ed178",
        "0x06f067aa72176fba",
        "0x0a637dc5a2c898a6",
        "0x113f9804bef90dae",
        "0x1b710b35131c471b",
        "0x28db77f523047d84",
        "0x32caab7b40c72493",
        "0x3c9ebe0a15c9bebc",
        "0x431d67c49c100d4c",
        "0x4cc5d4becb3e42b6",
        "0x597f299cfc657e2a",
        "0x5fcb6fab3ad6faec",
        "0x6c44198c4a475817"
      ].map((n) => BigInt(n))))();
      SHA512_Kh = /* @__PURE__ */ (() => K512[0])();
      SHA512_Kl = /* @__PURE__ */ (() => K512[1])();
      SHA512_W_H = /* @__PURE__ */ new Uint32Array(80);
      SHA512_W_L = /* @__PURE__ */ new Uint32Array(80);
      SHA512 = class extends HashMD {
        constructor(outputLen = 64) {
          super(128, outputLen, 16, false);
          this.Ah = SHA512_IV[0] | 0;
          this.Al = SHA512_IV[1] | 0;
          this.Bh = SHA512_IV[2] | 0;
          this.Bl = SHA512_IV[3] | 0;
          this.Ch = SHA512_IV[4] | 0;
          this.Cl = SHA512_IV[5] | 0;
          this.Dh = SHA512_IV[6] | 0;
          this.Dl = SHA512_IV[7] | 0;
          this.Eh = SHA512_IV[8] | 0;
          this.El = SHA512_IV[9] | 0;
          this.Fh = SHA512_IV[10] | 0;
          this.Fl = SHA512_IV[11] | 0;
          this.Gh = SHA512_IV[12] | 0;
          this.Gl = SHA512_IV[13] | 0;
          this.Hh = SHA512_IV[14] | 0;
          this.Hl = SHA512_IV[15] | 0;
        }
        // prettier-ignore
        get() {
          const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
          return [Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl];
        }
        // prettier-ignore
        set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
          this.Ah = Ah | 0;
          this.Al = Al | 0;
          this.Bh = Bh | 0;
          this.Bl = Bl | 0;
          this.Ch = Ch | 0;
          this.Cl = Cl | 0;
          this.Dh = Dh | 0;
          this.Dl = Dl | 0;
          this.Eh = Eh | 0;
          this.El = El | 0;
          this.Fh = Fh | 0;
          this.Fl = Fl | 0;
          this.Gh = Gh | 0;
          this.Gl = Gl | 0;
          this.Hh = Hh | 0;
          this.Hl = Hl | 0;
        }
        process(view, offset) {
          for (let i = 0; i < 16; i++, offset += 4) {
            SHA512_W_H[i] = view.getUint32(offset);
            SHA512_W_L[i] = view.getUint32(offset += 4);
          }
          for (let i = 16; i < 80; i++) {
            const W15h = SHA512_W_H[i - 15] | 0;
            const W15l = SHA512_W_L[i - 15] | 0;
            const s0h = rotrSH(W15h, W15l, 1) ^ rotrSH(W15h, W15l, 8) ^ shrSH(W15h, W15l, 7);
            const s0l = rotrSL(W15h, W15l, 1) ^ rotrSL(W15h, W15l, 8) ^ shrSL(W15h, W15l, 7);
            const W2h = SHA512_W_H[i - 2] | 0;
            const W2l = SHA512_W_L[i - 2] | 0;
            const s1h = rotrSH(W2h, W2l, 19) ^ rotrBH(W2h, W2l, 61) ^ shrSH(W2h, W2l, 6);
            const s1l = rotrSL(W2h, W2l, 19) ^ rotrBL(W2h, W2l, 61) ^ shrSL(W2h, W2l, 6);
            const SUMl = add4L(s0l, s1l, SHA512_W_L[i - 7], SHA512_W_L[i - 16]);
            const SUMh = add4H(SUMl, s0h, s1h, SHA512_W_H[i - 7], SHA512_W_H[i - 16]);
            SHA512_W_H[i] = SUMh | 0;
            SHA512_W_L[i] = SUMl | 0;
          }
          let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
          for (let i = 0; i < 80; i++) {
            const sigma1h = rotrSH(Eh, El, 14) ^ rotrSH(Eh, El, 18) ^ rotrBH(Eh, El, 41);
            const sigma1l = rotrSL(Eh, El, 14) ^ rotrSL(Eh, El, 18) ^ rotrBL(Eh, El, 41);
            const CHIh = Eh & Fh ^ ~Eh & Gh;
            const CHIl = El & Fl ^ ~El & Gl;
            const T1ll = add5L(Hl, sigma1l, CHIl, SHA512_Kl[i], SHA512_W_L[i]);
            const T1h = add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i], SHA512_W_H[i]);
            const T1l = T1ll | 0;
            const sigma0h = rotrSH(Ah, Al, 28) ^ rotrBH(Ah, Al, 34) ^ rotrBH(Ah, Al, 39);
            const sigma0l = rotrSL(Ah, Al, 28) ^ rotrBL(Ah, Al, 34) ^ rotrBL(Ah, Al, 39);
            const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
            const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
            Hh = Gh | 0;
            Hl = Gl | 0;
            Gh = Fh | 0;
            Gl = Fl | 0;
            Fh = Eh | 0;
            Fl = El | 0;
            ({ h: Eh, l: El } = add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
            Dh = Ch | 0;
            Dl = Cl | 0;
            Ch = Bh | 0;
            Cl = Bl | 0;
            Bh = Ah | 0;
            Bl = Al | 0;
            const All = add3L(T1l, sigma0l, MAJl);
            Ah = add3H(All, T1h, sigma0h, MAJh);
            Al = All | 0;
          }
          ({ h: Ah, l: Al } = add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
          ({ h: Bh, l: Bl } = add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
          ({ h: Ch, l: Cl } = add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
          ({ h: Dh, l: Dl } = add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
          ({ h: Eh, l: El } = add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
          ({ h: Fh, l: Fl } = add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
          ({ h: Gh, l: Gl } = add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
          ({ h: Hh, l: Hl } = add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
          this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
        }
        roundClean() {
          clean(SHA512_W_H, SHA512_W_L);
        }
        destroy() {
          clean(this.buffer);
          this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        }
      };
      SHA384 = class extends SHA512 {
        constructor() {
          super(48);
          this.Ah = SHA384_IV[0] | 0;
          this.Al = SHA384_IV[1] | 0;
          this.Bh = SHA384_IV[2] | 0;
          this.Bl = SHA384_IV[3] | 0;
          this.Ch = SHA384_IV[4] | 0;
          this.Cl = SHA384_IV[5] | 0;
          this.Dh = SHA384_IV[6] | 0;
          this.Dl = SHA384_IV[7] | 0;
          this.Eh = SHA384_IV[8] | 0;
          this.El = SHA384_IV[9] | 0;
          this.Fh = SHA384_IV[10] | 0;
          this.Fl = SHA384_IV[11] | 0;
          this.Gh = SHA384_IV[12] | 0;
          this.Gl = SHA384_IV[13] | 0;
          this.Hh = SHA384_IV[14] | 0;
          this.Hl = SHA384_IV[15] | 0;
        }
      };
      sha256 = /* @__PURE__ */ createHasher(() => new SHA256());
      sha512 = /* @__PURE__ */ createHasher(() => new SHA512());
      sha384 = /* @__PURE__ */ createHasher(() => new SHA384());
    }
  });

  // node_modules/@noble/hashes/esm/hmac.js
  var HMAC, hmac;
  var init_hmac = __esm({
    "node_modules/@noble/hashes/esm/hmac.js"() {
      init_utils2();
      HMAC = class extends Hash {
        constructor(hash3, _key) {
          super();
          this.finished = false;
          this.destroyed = false;
          ahash(hash3);
          const key = toBytes2(_key);
          this.iHash = hash3.create();
          if (typeof this.iHash.update !== "function")
            throw new Error("Expected instance of class which extends utils.Hash");
          this.blockLen = this.iHash.blockLen;
          this.outputLen = this.iHash.outputLen;
          const blockLen = this.blockLen;
          const pad4 = new Uint8Array(blockLen);
          pad4.set(key.length > blockLen ? hash3.create().update(key).digest() : key);
          for (let i = 0; i < pad4.length; i++)
            pad4[i] ^= 54;
          this.iHash.update(pad4);
          this.oHash = hash3.create();
          for (let i = 0; i < pad4.length; i++)
            pad4[i] ^= 54 ^ 92;
          this.oHash.update(pad4);
          clean(pad4);
        }
        update(buf) {
          aexists(this);
          this.iHash.update(buf);
          return this;
        }
        digestInto(out) {
          aexists(this);
          abytes(out, this.outputLen);
          this.finished = true;
          this.iHash.digestInto(out);
          this.oHash.update(out);
          this.oHash.digestInto(out);
          this.destroy();
        }
        digest() {
          const out = new Uint8Array(this.oHash.outputLen);
          this.digestInto(out);
          return out;
        }
        _cloneInto(to) {
          to || (to = Object.create(Object.getPrototypeOf(this), {}));
          const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
          to = to;
          to.finished = finished;
          to.destroyed = destroyed;
          to.blockLen = blockLen;
          to.outputLen = outputLen;
          to.oHash = oHash._cloneInto(to.oHash);
          to.iHash = iHash._cloneInto(to.iHash);
          return to;
        }
        clone() {
          return this._cloneInto();
        }
        destroy() {
          this.destroyed = true;
          this.oHash.destroy();
          this.iHash.destroy();
        }
      };
      hmac = (hash3, key, message) => new HMAC(hash3, key).update(message).digest();
      hmac.create = (hash3, key) => new HMAC(hash3, key);
    }
  });

  // node_modules/viem/node_modules/@noble/curves/esm/abstract/utils.js
  function isBytes2(a) {
    return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
  }
  function abytes2(item) {
    if (!isBytes2(item))
      throw new Error("Uint8Array expected");
  }
  function abool(title, value) {
    if (typeof value !== "boolean")
      throw new Error(title + " boolean expected, got " + value);
  }
  function numberToHexUnpadded(num2) {
    const hex = num2.toString(16);
    return hex.length & 1 ? "0" + hex : hex;
  }
  function hexToNumber2(hex) {
    if (typeof hex !== "string")
      throw new Error("hex string expected, got " + typeof hex);
    return hex === "" ? _0n2 : BigInt("0x" + hex);
  }
  function bytesToHex2(bytes) {
    abytes2(bytes);
    if (hasHexBuiltin)
      return bytes.toHex();
    let hex = "";
    for (let i = 0; i < bytes.length; i++) {
      hex += hexes2[bytes[i]];
    }
    return hex;
  }
  function asciiToBase16(ch) {
    if (ch >= asciis._0 && ch <= asciis._9)
      return ch - asciis._0;
    if (ch >= asciis.A && ch <= asciis.F)
      return ch - (asciis.A - 10);
    if (ch >= asciis.a && ch <= asciis.f)
      return ch - (asciis.a - 10);
    return;
  }
  function hexToBytes2(hex) {
    if (typeof hex !== "string")
      throw new Error("hex string expected, got " + typeof hex);
    if (hasHexBuiltin)
      return Uint8Array.fromHex(hex);
    const hl = hex.length;
    const al = hl / 2;
    if (hl % 2)
      throw new Error("hex string expected, got unpadded hex of length " + hl);
    const array = new Uint8Array(al);
    for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
      const n1 = asciiToBase16(hex.charCodeAt(hi));
      const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
      if (n1 === void 0 || n2 === void 0) {
        const char = hex[hi] + hex[hi + 1];
        throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
      }
      array[ai] = n1 * 16 + n2;
    }
    return array;
  }
  function bytesToNumberBE(bytes) {
    return hexToNumber2(bytesToHex2(bytes));
  }
  function bytesToNumberLE(bytes) {
    abytes2(bytes);
    return hexToNumber2(bytesToHex2(Uint8Array.from(bytes).reverse()));
  }
  function numberToBytesBE(n, len) {
    return hexToBytes2(n.toString(16).padStart(len * 2, "0"));
  }
  function numberToBytesLE(n, len) {
    return numberToBytesBE(n, len).reverse();
  }
  function ensureBytes(title, hex, expectedLength) {
    let res;
    if (typeof hex === "string") {
      try {
        res = hexToBytes2(hex);
      } catch (e) {
        throw new Error(title + " must be hex string or Uint8Array, cause: " + e);
      }
    } else if (isBytes2(hex)) {
      res = Uint8Array.from(hex);
    } else {
      throw new Error(title + " must be hex string or Uint8Array");
    }
    const len = res.length;
    if (typeof expectedLength === "number" && len !== expectedLength)
      throw new Error(title + " of length " + expectedLength + " expected, got " + len);
    return res;
  }
  function concatBytes3(...arrays) {
    let sum = 0;
    for (let i = 0; i < arrays.length; i++) {
      const a = arrays[i];
      abytes2(a);
      sum += a.length;
    }
    const res = new Uint8Array(sum);
    for (let i = 0, pad4 = 0; i < arrays.length; i++) {
      const a = arrays[i];
      res.set(a, pad4);
      pad4 += a.length;
    }
    return res;
  }
  function utf8ToBytes2(str) {
    if (typeof str !== "string")
      throw new Error("string expected");
    return new Uint8Array(new TextEncoder().encode(str));
  }
  function inRange(n, min, max) {
    return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max;
  }
  function aInRange(title, n, min, max) {
    if (!inRange(n, min, max))
      throw new Error("expected valid " + title + ": " + min + " <= n < " + max + ", got " + n);
  }
  function bitLen(n) {
    let len;
    for (len = 0; n > _0n2; n >>= _1n2, len += 1)
      ;
    return len;
  }
  function createHmacDrbg(hashLen, qByteLen, hmacFn) {
    if (typeof hashLen !== "number" || hashLen < 2)
      throw new Error("hashLen must be a number");
    if (typeof qByteLen !== "number" || qByteLen < 2)
      throw new Error("qByteLen must be a number");
    if (typeof hmacFn !== "function")
      throw new Error("hmacFn must be a function");
    let v = u8n(hashLen);
    let k = u8n(hashLen);
    let i = 0;
    const reset = () => {
      v.fill(1);
      k.fill(0);
      i = 0;
    };
    const h = (...b) => hmacFn(k, v, ...b);
    const reseed = (seed = u8n(0)) => {
      k = h(u8fr([0]), seed);
      v = h();
      if (seed.length === 0)
        return;
      k = h(u8fr([1]), seed);
      v = h();
    };
    const gen2 = () => {
      if (i++ >= 1e3)
        throw new Error("drbg: tried 1000 values");
      let len = 0;
      const out = [];
      while (len < qByteLen) {
        v = h();
        const sl = v.slice();
        out.push(sl);
        len += v.length;
      }
      return concatBytes3(...out);
    };
    const genUntil = (seed, pred) => {
      reset();
      reseed(seed);
      let res = void 0;
      while (!(res = pred(gen2())))
        reseed();
      reset();
      return res;
    };
    return genUntil;
  }
  function validateObject(object, validators, optValidators = {}) {
    const checkField = (fieldName, type, isOptional) => {
      const checkVal = validatorFns[type];
      if (typeof checkVal !== "function")
        throw new Error("invalid validator function");
      const val = object[fieldName];
      if (isOptional && val === void 0)
        return;
      if (!checkVal(val, object)) {
        throw new Error("param " + String(fieldName) + " is invalid. Expected " + type + ", got " + val);
      }
    };
    for (const [fieldName, type] of Object.entries(validators))
      checkField(fieldName, type, false);
    for (const [fieldName, type] of Object.entries(optValidators))
      checkField(fieldName, type, true);
    return object;
  }
  function memoized(fn) {
    const map = /* @__PURE__ */ new WeakMap();
    return (arg, ...args) => {
      const val = map.get(arg);
      if (val !== void 0)
        return val;
      const computed = fn(arg, ...args);
      map.set(arg, computed);
      return computed;
    };
  }
  var _0n2, _1n2, hasHexBuiltin, hexes2, asciis, isPosBig, bitMask, u8n, u8fr, validatorFns;
  var init_utils4 = __esm({
    "node_modules/viem/node_modules/@noble/curves/esm/abstract/utils.js"() {
      _0n2 = /* @__PURE__ */ BigInt(0);
      _1n2 = /* @__PURE__ */ BigInt(1);
      hasHexBuiltin = // @ts-ignore
      typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function";
      hexes2 = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
      asciis = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
      isPosBig = (n) => typeof n === "bigint" && _0n2 <= n;
      bitMask = (n) => (_1n2 << BigInt(n)) - _1n2;
      u8n = (len) => new Uint8Array(len);
      u8fr = (arr) => Uint8Array.from(arr);
      validatorFns = {
        bigint: (val) => typeof val === "bigint",
        function: (val) => typeof val === "function",
        boolean: (val) => typeof val === "boolean",
        string: (val) => typeof val === "string",
        stringOrUint8Array: (val) => typeof val === "string" || isBytes2(val),
        isSafeInteger: (val) => Number.isSafeInteger(val),
        array: (val) => Array.isArray(val),
        field: (val, object) => object.Fp.isValid(val),
        hash: (val) => typeof val === "function" && Number.isSafeInteger(val.outputLen)
      };
    }
  });

  // node_modules/viem/node_modules/@noble/curves/esm/abstract/modular.js
  function mod(a, b) {
    const result = a % b;
    return result >= _0n3 ? result : b + result;
  }
  function pow2(x, power, modulo) {
    let res = x;
    while (power-- > _0n3) {
      res *= res;
      res %= modulo;
    }
    return res;
  }
  function invert(number, modulo) {
    if (number === _0n3)
      throw new Error("invert: expected non-zero number");
    if (modulo <= _0n3)
      throw new Error("invert: expected positive modulus, got " + modulo);
    let a = mod(number, modulo);
    let b = modulo;
    let x = _0n3, y = _1n3, u = _1n3, v = _0n3;
    while (a !== _0n3) {
      const q = b / a;
      const r = b % a;
      const m = x - u * q;
      const n = y - v * q;
      b = a, a = r, x = u, y = v, u = m, v = n;
    }
    const gcd = b;
    if (gcd !== _1n3)
      throw new Error("invert: does not exist");
    return mod(x, modulo);
  }
  function sqrt3mod4(Fp, n) {
    const p1div4 = (Fp.ORDER + _1n3) / _4n;
    const root = Fp.pow(n, p1div4);
    if (!Fp.eql(Fp.sqr(root), n))
      throw new Error("Cannot find square root");
    return root;
  }
  function sqrt5mod8(Fp, n) {
    const p5div8 = (Fp.ORDER - _5n) / _8n;
    const n2 = Fp.mul(n, _2n2);
    const v = Fp.pow(n2, p5div8);
    const nv = Fp.mul(n, v);
    const i = Fp.mul(Fp.mul(nv, _2n2), v);
    const root = Fp.mul(nv, Fp.sub(i, Fp.ONE));
    if (!Fp.eql(Fp.sqr(root), n))
      throw new Error("Cannot find square root");
    return root;
  }
  function tonelliShanks(P) {
    if (P < BigInt(3))
      throw new Error("sqrt is not defined for small field");
    let Q = P - _1n3;
    let S = 0;
    while (Q % _2n2 === _0n3) {
      Q /= _2n2;
      S++;
    }
    let Z = _2n2;
    const _Fp = Field(P);
    while (FpLegendre(_Fp, Z) === 1) {
      if (Z++ > 1e3)
        throw new Error("Cannot find square root: probably non-prime P");
    }
    if (S === 1)
      return sqrt3mod4;
    let cc = _Fp.pow(Z, Q);
    const Q1div2 = (Q + _1n3) / _2n2;
    return function tonelliSlow(Fp, n) {
      if (Fp.is0(n))
        return n;
      if (FpLegendre(Fp, n) !== 1)
        throw new Error("Cannot find square root");
      let M = S;
      let c = Fp.mul(Fp.ONE, cc);
      let t = Fp.pow(n, Q);
      let R = Fp.pow(n, Q1div2);
      while (!Fp.eql(t, Fp.ONE)) {
        if (Fp.is0(t))
          return Fp.ZERO;
        let i = 1;
        let t_tmp = Fp.sqr(t);
        while (!Fp.eql(t_tmp, Fp.ONE)) {
          i++;
          t_tmp = Fp.sqr(t_tmp);
          if (i === M)
            throw new Error("Cannot find square root");
        }
        const exponent = _1n3 << BigInt(M - i - 1);
        const b = Fp.pow(c, exponent);
        M = i;
        c = Fp.sqr(b);
        t = Fp.mul(t, c);
        R = Fp.mul(R, b);
      }
      return R;
    };
  }
  function FpSqrt(P) {
    if (P % _4n === _3n)
      return sqrt3mod4;
    if (P % _8n === _5n)
      return sqrt5mod8;
    return tonelliShanks(P);
  }
  function validateField(field) {
    const initial = {
      ORDER: "bigint",
      MASK: "bigint",
      BYTES: "isSafeInteger",
      BITS: "isSafeInteger"
    };
    const opts = FIELD_FIELDS.reduce((map, val) => {
      map[val] = "function";
      return map;
    }, initial);
    return validateObject(field, opts);
  }
  function FpPow(Fp, num2, power) {
    if (power < _0n3)
      throw new Error("invalid exponent, negatives unsupported");
    if (power === _0n3)
      return Fp.ONE;
    if (power === _1n3)
      return num2;
    let p = Fp.ONE;
    let d = num2;
    while (power > _0n3) {
      if (power & _1n3)
        p = Fp.mul(p, d);
      d = Fp.sqr(d);
      power >>= _1n3;
    }
    return p;
  }
  function FpInvertBatch(Fp, nums, passZero = false) {
    const inverted = new Array(nums.length).fill(passZero ? Fp.ZERO : void 0);
    const multipliedAcc = nums.reduce((acc, num2, i) => {
      if (Fp.is0(num2))
        return acc;
      inverted[i] = acc;
      return Fp.mul(acc, num2);
    }, Fp.ONE);
    const invertedAcc = Fp.inv(multipliedAcc);
    nums.reduceRight((acc, num2, i) => {
      if (Fp.is0(num2))
        return acc;
      inverted[i] = Fp.mul(acc, inverted[i]);
      return Fp.mul(acc, num2);
    }, invertedAcc);
    return inverted;
  }
  function FpLegendre(Fp, n) {
    const p1mod2 = (Fp.ORDER - _1n3) / _2n2;
    const powered = Fp.pow(n, p1mod2);
    const yes = Fp.eql(powered, Fp.ONE);
    const zero = Fp.eql(powered, Fp.ZERO);
    const no = Fp.eql(powered, Fp.neg(Fp.ONE));
    if (!yes && !zero && !no)
      throw new Error("invalid Legendre symbol result");
    return yes ? 1 : zero ? 0 : -1;
  }
  function nLength(n, nBitLength) {
    if (nBitLength !== void 0)
      anumber(nBitLength);
    const _nBitLength = nBitLength !== void 0 ? nBitLength : n.toString(2).length;
    const nByteLength = Math.ceil(_nBitLength / 8);
    return { nBitLength: _nBitLength, nByteLength };
  }
  function Field(ORDER, bitLen3, isLE2 = false, redef = {}) {
    if (ORDER <= _0n3)
      throw new Error("invalid field: expected ORDER > 0, got " + ORDER);
    const { nBitLength: BITS, nByteLength: BYTES } = nLength(ORDER, bitLen3);
    if (BYTES > 2048)
      throw new Error("invalid field: expected ORDER of <= 2048 bytes");
    let sqrtP;
    const f = Object.freeze({
      ORDER,
      isLE: isLE2,
      BITS,
      BYTES,
      MASK: bitMask(BITS),
      ZERO: _0n3,
      ONE: _1n3,
      create: (num2) => mod(num2, ORDER),
      isValid: (num2) => {
        if (typeof num2 !== "bigint")
          throw new Error("invalid field element: expected bigint, got " + typeof num2);
        return _0n3 <= num2 && num2 < ORDER;
      },
      is0: (num2) => num2 === _0n3,
      isOdd: (num2) => (num2 & _1n3) === _1n3,
      neg: (num2) => mod(-num2, ORDER),
      eql: (lhs, rhs) => lhs === rhs,
      sqr: (num2) => mod(num2 * num2, ORDER),
      add: (lhs, rhs) => mod(lhs + rhs, ORDER),
      sub: (lhs, rhs) => mod(lhs - rhs, ORDER),
      mul: (lhs, rhs) => mod(lhs * rhs, ORDER),
      pow: (num2, power) => FpPow(f, num2, power),
      div: (lhs, rhs) => mod(lhs * invert(rhs, ORDER), ORDER),
      // Same as above, but doesn't normalize
      sqrN: (num2) => num2 * num2,
      addN: (lhs, rhs) => lhs + rhs,
      subN: (lhs, rhs) => lhs - rhs,
      mulN: (lhs, rhs) => lhs * rhs,
      inv: (num2) => invert(num2, ORDER),
      sqrt: redef.sqrt || ((n) => {
        if (!sqrtP)
          sqrtP = FpSqrt(ORDER);
        return sqrtP(f, n);
      }),
      toBytes: (num2) => isLE2 ? numberToBytesLE(num2, BYTES) : numberToBytesBE(num2, BYTES),
      fromBytes: (bytes) => {
        if (bytes.length !== BYTES)
          throw new Error("Field.fromBytes: expected " + BYTES + " bytes, got " + bytes.length);
        return isLE2 ? bytesToNumberLE(bytes) : bytesToNumberBE(bytes);
      },
      // TODO: we don't need it here, move out to separate fn
      invertBatch: (lst) => FpInvertBatch(f, lst),
      // We can't move this out because Fp6, Fp12 implement it
      // and it's unclear what to return in there.
      cmov: (a, b, c) => c ? b : a
    });
    return Object.freeze(f);
  }
  function getFieldBytesLength(fieldOrder) {
    if (typeof fieldOrder !== "bigint")
      throw new Error("field order must be bigint");
    const bitLength = fieldOrder.toString(2).length;
    return Math.ceil(bitLength / 8);
  }
  function getMinHashLength(fieldOrder) {
    const length = getFieldBytesLength(fieldOrder);
    return length + Math.ceil(length / 2);
  }
  function mapHashToField(key, fieldOrder, isLE2 = false) {
    const len = key.length;
    const fieldLen = getFieldBytesLength(fieldOrder);
    const minLen = getMinHashLength(fieldOrder);
    if (len < 16 || len < minLen || len > 1024)
      throw new Error("expected " + minLen + "-1024 bytes of input, got " + len);
    const num2 = isLE2 ? bytesToNumberLE(key) : bytesToNumberBE(key);
    const reduced = mod(num2, fieldOrder - _1n3) + _1n3;
    return isLE2 ? numberToBytesLE(reduced, fieldLen) : numberToBytesBE(reduced, fieldLen);
  }
  var _0n3, _1n3, _2n2, _3n, _4n, _5n, _8n, FIELD_FIELDS;
  var init_modular = __esm({
    "node_modules/viem/node_modules/@noble/curves/esm/abstract/modular.js"() {
      init_utils2();
      init_utils4();
      _0n3 = BigInt(0);
      _1n3 = BigInt(1);
      _2n2 = /* @__PURE__ */ BigInt(2);
      _3n = /* @__PURE__ */ BigInt(3);
      _4n = /* @__PURE__ */ BigInt(4);
      _5n = /* @__PURE__ */ BigInt(5);
      _8n = /* @__PURE__ */ BigInt(8);
      FIELD_FIELDS = [
        "create",
        "isValid",
        "is0",
        "neg",
        "inv",
        "sqrt",
        "sqr",
        "eql",
        "add",
        "sub",
        "mul",
        "pow",
        "div",
        "addN",
        "subN",
        "mulN",
        "sqrN"
      ];
    }
  });

  // node_modules/viem/node_modules/@noble/curves/esm/abstract/curve.js
  function constTimeNegate(condition, item) {
    const neg = item.negate();
    return condition ? neg : item;
  }
  function validateW(W, bits) {
    if (!Number.isSafeInteger(W) || W <= 0 || W > bits)
      throw new Error("invalid window size, expected [1.." + bits + "], got W=" + W);
  }
  function calcWOpts(W, scalarBits) {
    validateW(W, scalarBits);
    const windows = Math.ceil(scalarBits / W) + 1;
    const windowSize = 2 ** (W - 1);
    const maxNumber = 2 ** W;
    const mask = bitMask(W);
    const shiftBy = BigInt(W);
    return { windows, windowSize, mask, maxNumber, shiftBy };
  }
  function calcOffsets(n, window2, wOpts) {
    const { windowSize, mask, maxNumber, shiftBy } = wOpts;
    let wbits = Number(n & mask);
    let nextN = n >> shiftBy;
    if (wbits > windowSize) {
      wbits -= maxNumber;
      nextN += _1n4;
    }
    const offsetStart = window2 * windowSize;
    const offset = offsetStart + Math.abs(wbits) - 1;
    const isZero = wbits === 0;
    const isNeg = wbits < 0;
    const isNegF = window2 % 2 !== 0;
    const offsetF = offsetStart;
    return { nextN, offset, isZero, isNeg, isNegF, offsetF };
  }
  function validateMSMPoints(points, c) {
    if (!Array.isArray(points))
      throw new Error("array expected");
    points.forEach((p, i) => {
      if (!(p instanceof c))
        throw new Error("invalid point at index " + i);
    });
  }
  function validateMSMScalars(scalars, field) {
    if (!Array.isArray(scalars))
      throw new Error("array of scalars expected");
    scalars.forEach((s, i) => {
      if (!field.isValid(s))
        throw new Error("invalid scalar at index " + i);
    });
  }
  function getW(P) {
    return pointWindowSizes.get(P) || 1;
  }
  function wNAF(c, bits) {
    return {
      constTimeNegate,
      hasPrecomputes(elm) {
        return getW(elm) !== 1;
      },
      // non-const time multiplication ladder
      unsafeLadder(elm, n, p = c.ZERO) {
        let d = elm;
        while (n > _0n4) {
          if (n & _1n4)
            p = p.add(d);
          d = d.double();
          n >>= _1n4;
        }
        return p;
      },
      /**
       * Creates a wNAF precomputation window. Used for caching.
       * Default window size is set by `utils.precompute()` and is equal to 8.
       * Number of precomputed points depends on the curve size:
       * 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
       * - 𝑊 is the window size
       * - 𝑛 is the bitlength of the curve order.
       * For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
       * @param elm Point instance
       * @param W window size
       * @returns precomputed point tables flattened to a single array
       */
      precomputeWindow(elm, W) {
        const { windows, windowSize } = calcWOpts(W, bits);
        const points = [];
        let p = elm;
        let base = p;
        for (let window2 = 0; window2 < windows; window2++) {
          base = p;
          points.push(base);
          for (let i = 1; i < windowSize; i++) {
            base = base.add(p);
            points.push(base);
          }
          p = base.double();
        }
        return points;
      },
      /**
       * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
       * @param W window size
       * @param precomputes precomputed tables
       * @param n scalar (we don't check here, but should be less than curve order)
       * @returns real and fake (for const-time) points
       */
      wNAF(W, precomputes, n) {
        let p = c.ZERO;
        let f = c.BASE;
        const wo = calcWOpts(W, bits);
        for (let window2 = 0; window2 < wo.windows; window2++) {
          const { nextN, offset, isZero, isNeg, isNegF, offsetF } = calcOffsets(n, window2, wo);
          n = nextN;
          if (isZero) {
            f = f.add(constTimeNegate(isNegF, precomputes[offsetF]));
          } else {
            p = p.add(constTimeNegate(isNeg, precomputes[offset]));
          }
        }
        return { p, f };
      },
      /**
       * Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
       * @param W window size
       * @param precomputes precomputed tables
       * @param n scalar (we don't check here, but should be less than curve order)
       * @param acc accumulator point to add result of multiplication
       * @returns point
       */
      wNAFUnsafe(W, precomputes, n, acc = c.ZERO) {
        const wo = calcWOpts(W, bits);
        for (let window2 = 0; window2 < wo.windows; window2++) {
          if (n === _0n4)
            break;
          const { nextN, offset, isZero, isNeg } = calcOffsets(n, window2, wo);
          n = nextN;
          if (isZero) {
            continue;
          } else {
            const item = precomputes[offset];
            acc = acc.add(isNeg ? item.negate() : item);
          }
        }
        return acc;
      },
      getPrecomputes(W, P, transform) {
        let comp = pointPrecomputes.get(P);
        if (!comp) {
          comp = this.precomputeWindow(P, W);
          if (W !== 1)
            pointPrecomputes.set(P, transform(comp));
        }
        return comp;
      },
      wNAFCached(P, n, transform) {
        const W = getW(P);
        return this.wNAF(W, this.getPrecomputes(W, P, transform), n);
      },
      wNAFCachedUnsafe(P, n, transform, prev) {
        const W = getW(P);
        if (W === 1)
          return this.unsafeLadder(P, n, prev);
        return this.wNAFUnsafe(W, this.getPrecomputes(W, P, transform), n, prev);
      },
      // We calculate precomputes for elliptic curve point multiplication
      // using windowed method. This specifies window size and
      // stores precomputed values. Usually only base point would be precomputed.
      setWindowSize(P, W) {
        validateW(W, bits);
        pointWindowSizes.set(P, W);
        pointPrecomputes.delete(P);
      }
    };
  }
  function pippenger(c, fieldN, points, scalars) {
    validateMSMPoints(points, c);
    validateMSMScalars(scalars, fieldN);
    const plength = points.length;
    const slength = scalars.length;
    if (plength !== slength)
      throw new Error("arrays of points and scalars must have equal length");
    const zero = c.ZERO;
    const wbits = bitLen(BigInt(plength));
    let windowSize = 1;
    if (wbits > 12)
      windowSize = wbits - 3;
    else if (wbits > 4)
      windowSize = wbits - 2;
    else if (wbits > 0)
      windowSize = 2;
    const MASK = bitMask(windowSize);
    const buckets = new Array(Number(MASK) + 1).fill(zero);
    const lastBits = Math.floor((fieldN.BITS - 1) / windowSize) * windowSize;
    let sum = zero;
    for (let i = lastBits; i >= 0; i -= windowSize) {
      buckets.fill(zero);
      for (let j = 0; j < slength; j++) {
        const scalar = scalars[j];
        const wbits2 = Number(scalar >> BigInt(i) & MASK);
        buckets[wbits2] = buckets[wbits2].add(points[j]);
      }
      let resI = zero;
      for (let j = buckets.length - 1, sumI = zero; j > 0; j--) {
        sumI = sumI.add(buckets[j]);
        resI = resI.add(sumI);
      }
      sum = sum.add(resI);
      if (i !== 0)
        for (let j = 0; j < windowSize; j++)
          sum = sum.double();
    }
    return sum;
  }
  function validateBasic(curve) {
    validateField(curve.Fp);
    validateObject(curve, {
      n: "bigint",
      h: "bigint",
      Gx: "field",
      Gy: "field"
    }, {
      nBitLength: "isSafeInteger",
      nByteLength: "isSafeInteger"
    });
    return Object.freeze({
      ...nLength(curve.n, curve.nBitLength),
      ...curve,
      ...{ p: curve.Fp.ORDER }
    });
  }
  var _0n4, _1n4, pointPrecomputes, pointWindowSizes;
  var init_curve = __esm({
    "node_modules/viem/node_modules/@noble/curves/esm/abstract/curve.js"() {
      init_modular();
      init_utils4();
      _0n4 = BigInt(0);
      _1n4 = BigInt(1);
      pointPrecomputes = /* @__PURE__ */ new WeakMap();
      pointWindowSizes = /* @__PURE__ */ new WeakMap();
    }
  });

  // node_modules/viem/node_modules/@noble/curves/esm/abstract/weierstrass.js
  function validateSigVerOpts(opts) {
    if (opts.lowS !== void 0)
      abool("lowS", opts.lowS);
    if (opts.prehash !== void 0)
      abool("prehash", opts.prehash);
  }
  function validatePointOpts(curve) {
    const opts = validateBasic(curve);
    validateObject(opts, {
      a: "field",
      b: "field"
    }, {
      allowInfinityPoint: "boolean",
      allowedPrivateKeyLengths: "array",
      clearCofactor: "function",
      fromBytes: "function",
      isTorsionFree: "function",
      toBytes: "function",
      wrapPrivateKey: "boolean"
    });
    const { endo, Fp, a } = opts;
    if (endo) {
      if (!Fp.eql(a, Fp.ZERO)) {
        throw new Error("invalid endo: CURVE.a must be 0");
      }
      if (typeof endo !== "object" || typeof endo.beta !== "bigint" || typeof endo.splitScalar !== "function") {
        throw new Error('invalid endo: expected "beta": bigint and "splitScalar": function');
      }
    }
    return Object.freeze({ ...opts });
  }
  function numToSizedHex(num2, size5) {
    return bytesToHex2(numberToBytesBE(num2, size5));
  }
  function weierstrassPoints(opts) {
    const CURVE = validatePointOpts(opts);
    const { Fp } = CURVE;
    const Fn = Field(CURVE.n, CURVE.nBitLength);
    const toBytes5 = CURVE.toBytes || ((_c, point, _isCompressed) => {
      const a = point.toAffine();
      return concatBytes3(Uint8Array.from([4]), Fp.toBytes(a.x), Fp.toBytes(a.y));
    });
    const fromBytes4 = CURVE.fromBytes || ((bytes) => {
      const tail = bytes.subarray(1);
      const x = Fp.fromBytes(tail.subarray(0, Fp.BYTES));
      const y = Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES));
      return { x, y };
    });
    function weierstrassEquation(x) {
      const { a, b } = CURVE;
      const x2 = Fp.sqr(x);
      const x3 = Fp.mul(x2, x);
      return Fp.add(Fp.add(x3, Fp.mul(x, a)), b);
    }
    function isValidXY(x, y) {
      const left = Fp.sqr(y);
      const right = weierstrassEquation(x);
      return Fp.eql(left, right);
    }
    if (!isValidXY(CURVE.Gx, CURVE.Gy))
      throw new Error("bad curve params: generator point");
    const _4a3 = Fp.mul(Fp.pow(CURVE.a, _3n2), _4n2);
    const _27b2 = Fp.mul(Fp.sqr(CURVE.b), BigInt(27));
    if (Fp.is0(Fp.add(_4a3, _27b2)))
      throw new Error("bad curve params: a or b");
    function isWithinCurveOrder(num2) {
      return inRange(num2, _1n5, CURVE.n);
    }
    function normPrivateKeyToScalar(key) {
      const { allowedPrivateKeyLengths: lengths, nByteLength, wrapPrivateKey, n: N } = CURVE;
      if (lengths && typeof key !== "bigint") {
        if (isBytes2(key))
          key = bytesToHex2(key);
        if (typeof key !== "string" || !lengths.includes(key.length))
          throw new Error("invalid private key");
        key = key.padStart(nByteLength * 2, "0");
      }
      let num2;
      try {
        num2 = typeof key === "bigint" ? key : bytesToNumberBE(ensureBytes("private key", key, nByteLength));
      } catch (error) {
        throw new Error("invalid private key, expected hex or " + nByteLength + " bytes, got " + typeof key);
      }
      if (wrapPrivateKey)
        num2 = mod(num2, N);
      aInRange("private key", num2, _1n5, N);
      return num2;
    }
    function aprjpoint(other) {
      if (!(other instanceof Point2))
        throw new Error("ProjectivePoint expected");
    }
    const toAffineMemo = memoized((p, iz) => {
      const { px: x, py: y, pz: z } = p;
      if (Fp.eql(z, Fp.ONE))
        return { x, y };
      const is0 = p.is0();
      if (iz == null)
        iz = is0 ? Fp.ONE : Fp.inv(z);
      const ax = Fp.mul(x, iz);
      const ay = Fp.mul(y, iz);
      const zz = Fp.mul(z, iz);
      if (is0)
        return { x: Fp.ZERO, y: Fp.ZERO };
      if (!Fp.eql(zz, Fp.ONE))
        throw new Error("invZ was invalid");
      return { x: ax, y: ay };
    });
    const assertValidMemo = memoized((p) => {
      if (p.is0()) {
        if (CURVE.allowInfinityPoint && !Fp.is0(p.py))
          return;
        throw new Error("bad point: ZERO");
      }
      const { x, y } = p.toAffine();
      if (!Fp.isValid(x) || !Fp.isValid(y))
        throw new Error("bad point: x or y not FE");
      if (!isValidXY(x, y))
        throw new Error("bad point: equation left != right");
      if (!p.isTorsionFree())
        throw new Error("bad point: not in prime-order subgroup");
      return true;
    });
    class Point2 {
      constructor(px, py, pz) {
        if (px == null || !Fp.isValid(px))
          throw new Error("x required");
        if (py == null || !Fp.isValid(py) || Fp.is0(py))
          throw new Error("y required");
        if (pz == null || !Fp.isValid(pz))
          throw new Error("z required");
        this.px = px;
        this.py = py;
        this.pz = pz;
        Object.freeze(this);
      }
      // Does not validate if the point is on-curve.
      // Use fromHex instead, or call assertValidity() later.
      static fromAffine(p) {
        const { x, y } = p || {};
        if (!p || !Fp.isValid(x) || !Fp.isValid(y))
          throw new Error("invalid affine point");
        if (p instanceof Point2)
          throw new Error("projective point not allowed");
        const is0 = (i) => Fp.eql(i, Fp.ZERO);
        if (is0(x) && is0(y))
          return Point2.ZERO;
        return new Point2(x, y, Fp.ONE);
      }
      get x() {
        return this.toAffine().x;
      }
      get y() {
        return this.toAffine().y;
      }
      /**
       * Takes a bunch of Projective Points but executes only one
       * inversion on all of them. Inversion is very slow operation,
       * so this improves performance massively.
       * Optimization: converts a list of projective points to a list of identical points with Z=1.
       */
      static normalizeZ(points) {
        const toInv = FpInvertBatch(Fp, points.map((p) => p.pz));
        return points.map((p, i) => p.toAffine(toInv[i])).map(Point2.fromAffine);
      }
      /**
       * Converts hash string or Uint8Array to Point.
       * @param hex short/long ECDSA hex
       */
      static fromHex(hex) {
        const P = Point2.fromAffine(fromBytes4(ensureBytes("pointHex", hex)));
        P.assertValidity();
        return P;
      }
      // Multiplies generator point by privateKey.
      static fromPrivateKey(privateKey) {
        return Point2.BASE.multiply(normPrivateKeyToScalar(privateKey));
      }
      // Multiscalar Multiplication
      static msm(points, scalars) {
        return pippenger(Point2, Fn, points, scalars);
      }
      // "Private method", don't use it directly
      _setWindowSize(windowSize) {
        wnaf.setWindowSize(this, windowSize);
      }
      // A point on curve is valid if it conforms to equation.
      assertValidity() {
        assertValidMemo(this);
      }
      hasEvenY() {
        const { y } = this.toAffine();
        if (Fp.isOdd)
          return !Fp.isOdd(y);
        throw new Error("Field doesn't support isOdd");
      }
      /**
       * Compare one point to another.
       */
      equals(other) {
        aprjpoint(other);
        const { px: X1, py: Y1, pz: Z1 } = this;
        const { px: X2, py: Y2, pz: Z2 } = other;
        const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1));
        const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
        return U1 && U2;
      }
      /**
       * Flips point to one corresponding to (x, -y) in Affine coordinates.
       */
      negate() {
        return new Point2(this.px, Fp.neg(this.py), this.pz);
      }
      // Renes-Costello-Batina exception-free doubling formula.
      // There is 30% faster Jacobian formula, but it is not complete.
      // https://eprint.iacr.org/2015/1060, algorithm 3
      // Cost: 8M + 3S + 3*a + 2*b3 + 15add.
      double() {
        const { a, b } = CURVE;
        const b3 = Fp.mul(b, _3n2);
        const { px: X1, py: Y1, pz: Z1 } = this;
        let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
        let t0 = Fp.mul(X1, X1);
        let t1 = Fp.mul(Y1, Y1);
        let t2 = Fp.mul(Z1, Z1);
        let t3 = Fp.mul(X1, Y1);
        t3 = Fp.add(t3, t3);
        Z3 = Fp.mul(X1, Z1);
        Z3 = Fp.add(Z3, Z3);
        X3 = Fp.mul(a, Z3);
        Y3 = Fp.mul(b3, t2);
        Y3 = Fp.add(X3, Y3);
        X3 = Fp.sub(t1, Y3);
        Y3 = Fp.add(t1, Y3);
        Y3 = Fp.mul(X3, Y3);
        X3 = Fp.mul(t3, X3);
        Z3 = Fp.mul(b3, Z3);
        t2 = Fp.mul(a, t2);
        t3 = Fp.sub(t0, t2);
        t3 = Fp.mul(a, t3);
        t3 = Fp.add(t3, Z3);
        Z3 = Fp.add(t0, t0);
        t0 = Fp.add(Z3, t0);
        t0 = Fp.add(t0, t2);
        t0 = Fp.mul(t0, t3);
        Y3 = Fp.add(Y3, t0);
        t2 = Fp.mul(Y1, Z1);
        t2 = Fp.add(t2, t2);
        t0 = Fp.mul(t2, t3);
        X3 = Fp.sub(X3, t0);
        Z3 = Fp.mul(t2, t1);
        Z3 = Fp.add(Z3, Z3);
        Z3 = Fp.add(Z3, Z3);
        return new Point2(X3, Y3, Z3);
      }
      // Renes-Costello-Batina exception-free addition formula.
      // There is 30% faster Jacobian formula, but it is not complete.
      // https://eprint.iacr.org/2015/1060, algorithm 1
      // Cost: 12M + 0S + 3*a + 3*b3 + 23add.
      add(other) {
        aprjpoint(other);
        const { px: X1, py: Y1, pz: Z1 } = this;
        const { px: X2, py: Y2, pz: Z2 } = other;
        let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
        const a = CURVE.a;
        const b3 = Fp.mul(CURVE.b, _3n2);
        let t0 = Fp.mul(X1, X2);
        let t1 = Fp.mul(Y1, Y2);
        let t2 = Fp.mul(Z1, Z2);
        let t3 = Fp.add(X1, Y1);
        let t4 = Fp.add(X2, Y2);
        t3 = Fp.mul(t3, t4);
        t4 = Fp.add(t0, t1);
        t3 = Fp.sub(t3, t4);
        t4 = Fp.add(X1, Z1);
        let t5 = Fp.add(X2, Z2);
        t4 = Fp.mul(t4, t5);
        t5 = Fp.add(t0, t2);
        t4 = Fp.sub(t4, t5);
        t5 = Fp.add(Y1, Z1);
        X3 = Fp.add(Y2, Z2);
        t5 = Fp.mul(t5, X3);
        X3 = Fp.add(t1, t2);
        t5 = Fp.sub(t5, X3);
        Z3 = Fp.mul(a, t4);
        X3 = Fp.mul(b3, t2);
        Z3 = Fp.add(X3, Z3);
        X3 = Fp.sub(t1, Z3);
        Z3 = Fp.add(t1, Z3);
        Y3 = Fp.mul(X3, Z3);
        t1 = Fp.add(t0, t0);
        t1 = Fp.add(t1, t0);
        t2 = Fp.mul(a, t2);
        t4 = Fp.mul(b3, t4);
        t1 = Fp.add(t1, t2);
        t2 = Fp.sub(t0, t2);
        t2 = Fp.mul(a, t2);
        t4 = Fp.add(t4, t2);
        t0 = Fp.mul(t1, t4);
        Y3 = Fp.add(Y3, t0);
        t0 = Fp.mul(t5, t4);
        X3 = Fp.mul(t3, X3);
        X3 = Fp.sub(X3, t0);
        t0 = Fp.mul(t3, t1);
        Z3 = Fp.mul(t5, Z3);
        Z3 = Fp.add(Z3, t0);
        return new Point2(X3, Y3, Z3);
      }
      subtract(other) {
        return this.add(other.negate());
      }
      is0() {
        return this.equals(Point2.ZERO);
      }
      wNAF(n) {
        return wnaf.wNAFCached(this, n, Point2.normalizeZ);
      }
      /**
       * Non-constant-time multiplication. Uses double-and-add algorithm.
       * It's faster, but should only be used when you don't care about
       * an exposed private key e.g. sig verification, which works over *public* keys.
       */
      multiplyUnsafe(sc) {
        const { endo: endo2, n: N } = CURVE;
        aInRange("scalar", sc, _0n5, N);
        const I = Point2.ZERO;
        if (sc === _0n5)
          return I;
        if (this.is0() || sc === _1n5)
          return this;
        if (!endo2 || wnaf.hasPrecomputes(this))
          return wnaf.wNAFCachedUnsafe(this, sc, Point2.normalizeZ);
        let { k1neg, k1, k2neg, k2 } = endo2.splitScalar(sc);
        let k1p = I;
        let k2p = I;
        let d = this;
        while (k1 > _0n5 || k2 > _0n5) {
          if (k1 & _1n5)
            k1p = k1p.add(d);
          if (k2 & _1n5)
            k2p = k2p.add(d);
          d = d.double();
          k1 >>= _1n5;
          k2 >>= _1n5;
        }
        if (k1neg)
          k1p = k1p.negate();
        if (k2neg)
          k2p = k2p.negate();
        k2p = new Point2(Fp.mul(k2p.px, endo2.beta), k2p.py, k2p.pz);
        return k1p.add(k2p);
      }
      /**
       * Constant time multiplication.
       * Uses wNAF method. Windowed method may be 10% faster,
       * but takes 2x longer to generate and consumes 2x memory.
       * Uses precomputes when available.
       * Uses endomorphism for Koblitz curves.
       * @param scalar by which the point would be multiplied
       * @returns New point
       */
      multiply(scalar) {
        const { endo: endo2, n: N } = CURVE;
        aInRange("scalar", scalar, _1n5, N);
        let point, fake;
        if (endo2) {
          const { k1neg, k1, k2neg, k2 } = endo2.splitScalar(scalar);
          let { p: k1p, f: f1p } = this.wNAF(k1);
          let { p: k2p, f: f2p } = this.wNAF(k2);
          k1p = wnaf.constTimeNegate(k1neg, k1p);
          k2p = wnaf.constTimeNegate(k2neg, k2p);
          k2p = new Point2(Fp.mul(k2p.px, endo2.beta), k2p.py, k2p.pz);
          point = k1p.add(k2p);
          fake = f1p.add(f2p);
        } else {
          const { p, f } = this.wNAF(scalar);
          point = p;
          fake = f;
        }
        return Point2.normalizeZ([point, fake])[0];
      }
      /**
       * Efficiently calculate `aP + bQ`. Unsafe, can expose private key, if used incorrectly.
       * Not using Strauss-Shamir trick: precomputation tables are faster.
       * The trick could be useful if both P and Q are not G (not in our case).
       * @returns non-zero affine point
       */
      multiplyAndAddUnsafe(Q, a, b) {
        const G = Point2.BASE;
        const mul = (P, a2) => a2 === _0n5 || a2 === _1n5 || !P.equals(G) ? P.multiplyUnsafe(a2) : P.multiply(a2);
        const sum = mul(this, a).add(mul(Q, b));
        return sum.is0() ? void 0 : sum;
      }
      // Converts Projective point to affine (x, y) coordinates.
      // Can accept precomputed Z^-1 - for example, from invertBatch.
      // (x, y, z) ∋ (x=x/z, y=y/z)
      toAffine(iz) {
        return toAffineMemo(this, iz);
      }
      isTorsionFree() {
        const { h: cofactor, isTorsionFree } = CURVE;
        if (cofactor === _1n5)
          return true;
        if (isTorsionFree)
          return isTorsionFree(Point2, this);
        throw new Error("isTorsionFree() has not been declared for the elliptic curve");
      }
      clearCofactor() {
        const { h: cofactor, clearCofactor } = CURVE;
        if (cofactor === _1n5)
          return this;
        if (clearCofactor)
          return clearCofactor(Point2, this);
        return this.multiplyUnsafe(CURVE.h);
      }
      toRawBytes(isCompressed = true) {
        abool("isCompressed", isCompressed);
        this.assertValidity();
        return toBytes5(Point2, this, isCompressed);
      }
      toHex(isCompressed = true) {
        abool("isCompressed", isCompressed);
        return bytesToHex2(this.toRawBytes(isCompressed));
      }
    }
    Point2.BASE = new Point2(CURVE.Gx, CURVE.Gy, Fp.ONE);
    Point2.ZERO = new Point2(Fp.ZERO, Fp.ONE, Fp.ZERO);
    const { endo, nBitLength } = CURVE;
    const wnaf = wNAF(Point2, endo ? Math.ceil(nBitLength / 2) : nBitLength);
    return {
      CURVE,
      ProjectivePoint: Point2,
      normPrivateKeyToScalar,
      weierstrassEquation,
      isWithinCurveOrder
    };
  }
  function validateOpts(curve) {
    const opts = validateBasic(curve);
    validateObject(opts, {
      hash: "hash",
      hmac: "function",
      randomBytes: "function"
    }, {
      bits2int: "function",
      bits2int_modN: "function",
      lowS: "boolean"
    });
    return Object.freeze({ lowS: true, ...opts });
  }
  function weierstrass(curveDef) {
    const CURVE = validateOpts(curveDef);
    const { Fp, n: CURVE_ORDER, nByteLength, nBitLength } = CURVE;
    const compressedLen = Fp.BYTES + 1;
    const uncompressedLen = 2 * Fp.BYTES + 1;
    function modN2(a) {
      return mod(a, CURVE_ORDER);
    }
    function invN(a) {
      return invert(a, CURVE_ORDER);
    }
    const { ProjectivePoint: Point2, normPrivateKeyToScalar, weierstrassEquation, isWithinCurveOrder } = weierstrassPoints({
      ...CURVE,
      toBytes(_c, point, isCompressed) {
        const a = point.toAffine();
        const x = Fp.toBytes(a.x);
        const cat = concatBytes3;
        abool("isCompressed", isCompressed);
        if (isCompressed) {
          return cat(Uint8Array.from([point.hasEvenY() ? 2 : 3]), x);
        } else {
          return cat(Uint8Array.from([4]), x, Fp.toBytes(a.y));
        }
      },
      fromBytes(bytes) {
        const len = bytes.length;
        const head = bytes[0];
        const tail = bytes.subarray(1);
        if (len === compressedLen && (head === 2 || head === 3)) {
          const x = bytesToNumberBE(tail);
          if (!inRange(x, _1n5, Fp.ORDER))
            throw new Error("Point is not on curve");
          const y2 = weierstrassEquation(x);
          let y;
          try {
            y = Fp.sqrt(y2);
          } catch (sqrtError) {
            const suffix = sqrtError instanceof Error ? ": " + sqrtError.message : "";
            throw new Error("Point is not on curve" + suffix);
          }
          const isYOdd = (y & _1n5) === _1n5;
          const isHeadOdd = (head & 1) === 1;
          if (isHeadOdd !== isYOdd)
            y = Fp.neg(y);
          return { x, y };
        } else if (len === uncompressedLen && head === 4) {
          const x = Fp.fromBytes(tail.subarray(0, Fp.BYTES));
          const y = Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES));
          return { x, y };
        } else {
          const cl = compressedLen;
          const ul = uncompressedLen;
          throw new Error("invalid Point, expected length of " + cl + ", or uncompressed " + ul + ", got " + len);
        }
      }
    });
    function isBiggerThanHalfOrder(number) {
      const HALF = CURVE_ORDER >> _1n5;
      return number > HALF;
    }
    function normalizeS(s) {
      return isBiggerThanHalfOrder(s) ? modN2(-s) : s;
    }
    const slcNum = (b, from14, to) => bytesToNumberBE(b.slice(from14, to));
    class Signature {
      constructor(r, s, recovery) {
        aInRange("r", r, _1n5, CURVE_ORDER);
        aInRange("s", s, _1n5, CURVE_ORDER);
        this.r = r;
        this.s = s;
        if (recovery != null)
          this.recovery = recovery;
        Object.freeze(this);
      }
      // pair (bytes of r, bytes of s)
      static fromCompact(hex) {
        const l = nByteLength;
        hex = ensureBytes("compactSignature", hex, l * 2);
        return new Signature(slcNum(hex, 0, l), slcNum(hex, l, 2 * l));
      }
      // DER encoded ECDSA signature
      // https://bitcoin.stackexchange.com/questions/57644/what-are-the-parts-of-a-bitcoin-transaction-input-script
      static fromDER(hex) {
        const { r, s } = DER.toSig(ensureBytes("DER", hex));
        return new Signature(r, s);
      }
      /**
       * @todo remove
       * @deprecated
       */
      assertValidity() {
      }
      addRecoveryBit(recovery) {
        return new Signature(this.r, this.s, recovery);
      }
      recoverPublicKey(msgHash) {
        const { r, s, recovery: rec } = this;
        const h = bits2int_modN(ensureBytes("msgHash", msgHash));
        if (rec == null || ![0, 1, 2, 3].includes(rec))
          throw new Error("recovery id invalid");
        const radj = rec === 2 || rec === 3 ? r + CURVE.n : r;
        if (radj >= Fp.ORDER)
          throw new Error("recovery id 2 or 3 invalid");
        const prefix = (rec & 1) === 0 ? "02" : "03";
        const R = Point2.fromHex(prefix + numToSizedHex(radj, Fp.BYTES));
        const ir = invN(radj);
        const u1 = modN2(-h * ir);
        const u2 = modN2(s * ir);
        const Q = Point2.BASE.multiplyAndAddUnsafe(R, u1, u2);
        if (!Q)
          throw new Error("point at infinify");
        Q.assertValidity();
        return Q;
      }
      // Signatures should be low-s, to prevent malleability.
      hasHighS() {
        return isBiggerThanHalfOrder(this.s);
      }
      normalizeS() {
        return this.hasHighS() ? new Signature(this.r, modN2(-this.s), this.recovery) : this;
      }
      // DER-encoded
      toDERRawBytes() {
        return hexToBytes2(this.toDERHex());
      }
      toDERHex() {
        return DER.hexFromSig(this);
      }
      // padded bytes of r, then padded bytes of s
      toCompactRawBytes() {
        return hexToBytes2(this.toCompactHex());
      }
      toCompactHex() {
        const l = nByteLength;
        return numToSizedHex(this.r, l) + numToSizedHex(this.s, l);
      }
    }
    const utils = {
      isValidPrivateKey(privateKey) {
        try {
          normPrivateKeyToScalar(privateKey);
          return true;
        } catch (error) {
          return false;
        }
      },
      normPrivateKeyToScalar,
      /**
       * Produces cryptographically secure private key from random of size
       * (groupLen + ceil(groupLen / 2)) with modulo bias being negligible.
       */
      randomPrivateKey: () => {
        const length = getMinHashLength(CURVE.n);
        return mapHashToField(CURVE.randomBytes(length), CURVE.n);
      },
      /**
       * Creates precompute table for an arbitrary EC point. Makes point "cached".
       * Allows to massively speed-up `point.multiply(scalar)`.
       * @returns cached point
       * @example
       * const fast = utils.precompute(8, ProjectivePoint.fromHex(someonesPubKey));
       * fast.multiply(privKey); // much faster ECDH now
       */
      precompute(windowSize = 8, point = Point2.BASE) {
        point._setWindowSize(windowSize);
        point.multiply(BigInt(3));
        return point;
      }
    };
    function getPublicKey(privateKey, isCompressed = true) {
      return Point2.fromPrivateKey(privateKey).toRawBytes(isCompressed);
    }
    function isProbPub(item) {
      if (typeof item === "bigint")
        return false;
      if (item instanceof Point2)
        return true;
      const arr = ensureBytes("key", item);
      const len = arr.length;
      const fpl = Fp.BYTES;
      const compLen = fpl + 1;
      const uncompLen = 2 * fpl + 1;
      if (CURVE.allowedPrivateKeyLengths || nByteLength === compLen) {
        return void 0;
      } else {
        return len === compLen || len === uncompLen;
      }
    }
    function getSharedSecret(privateA, publicB, isCompressed = true) {
      if (isProbPub(privateA) === true)
        throw new Error("first arg must be private key");
      if (isProbPub(publicB) === false)
        throw new Error("second arg must be public key");
      const b = Point2.fromHex(publicB);
      return b.multiply(normPrivateKeyToScalar(privateA)).toRawBytes(isCompressed);
    }
    const bits2int = CURVE.bits2int || function(bytes) {
      if (bytes.length > 8192)
        throw new Error("input is too large");
      const num2 = bytesToNumberBE(bytes);
      const delta = bytes.length * 8 - nBitLength;
      return delta > 0 ? num2 >> BigInt(delta) : num2;
    };
    const bits2int_modN = CURVE.bits2int_modN || function(bytes) {
      return modN2(bits2int(bytes));
    };
    const ORDER_MASK = bitMask(nBitLength);
    function int2octets(num2) {
      aInRange("num < 2^" + nBitLength, num2, _0n5, ORDER_MASK);
      return numberToBytesBE(num2, nByteLength);
    }
    function prepSig(msgHash, privateKey, opts = defaultSigOpts) {
      if (["recovered", "canonical"].some((k) => k in opts))
        throw new Error("sign() legacy options not supported");
      const { hash: hash3, randomBytes: randomBytes2 } = CURVE;
      let { lowS, prehash, extraEntropy: ent } = opts;
      if (lowS == null)
        lowS = true;
      msgHash = ensureBytes("msgHash", msgHash);
      validateSigVerOpts(opts);
      if (prehash)
        msgHash = ensureBytes("prehashed msgHash", hash3(msgHash));
      const h1int = bits2int_modN(msgHash);
      const d = normPrivateKeyToScalar(privateKey);
      const seedArgs = [int2octets(d), int2octets(h1int)];
      if (ent != null && ent !== false) {
        const e = ent === true ? randomBytes2(Fp.BYTES) : ent;
        seedArgs.push(ensureBytes("extraEntropy", e));
      }
      const seed = concatBytes3(...seedArgs);
      const m = h1int;
      function k2sig(kBytes) {
        const k = bits2int(kBytes);
        if (!isWithinCurveOrder(k))
          return;
        const ik = invN(k);
        const q = Point2.BASE.multiply(k).toAffine();
        const r = modN2(q.x);
        if (r === _0n5)
          return;
        const s = modN2(ik * modN2(m + r * d));
        if (s === _0n5)
          return;
        let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1n5);
        let normS = s;
        if (lowS && isBiggerThanHalfOrder(s)) {
          normS = normalizeS(s);
          recovery ^= 1;
        }
        return new Signature(r, normS, recovery);
      }
      return { seed, k2sig };
    }
    const defaultSigOpts = { lowS: CURVE.lowS, prehash: false };
    const defaultVerOpts = { lowS: CURVE.lowS, prehash: false };
    function sign3(msgHash, privKey, opts = defaultSigOpts) {
      const { seed, k2sig } = prepSig(msgHash, privKey, opts);
      const C = CURVE;
      const drbg = createHmacDrbg(C.hash.outputLen, C.nByteLength, C.hmac);
      return drbg(seed, k2sig);
    }
    Point2.BASE._setWindowSize(8);
    function verify(signature, msgHash, publicKey, opts = defaultVerOpts) {
      const sg = signature;
      msgHash = ensureBytes("msgHash", msgHash);
      publicKey = ensureBytes("publicKey", publicKey);
      const { lowS, prehash, format } = opts;
      validateSigVerOpts(opts);
      if ("strict" in opts)
        throw new Error("options.strict was renamed to lowS");
      if (format !== void 0 && format !== "compact" && format !== "der")
        throw new Error("format must be compact or der");
      const isHex2 = typeof sg === "string" || isBytes2(sg);
      const isObj = !isHex2 && !format && typeof sg === "object" && sg !== null && typeof sg.r === "bigint" && typeof sg.s === "bigint";
      if (!isHex2 && !isObj)
        throw new Error("invalid signature, expected Uint8Array, hex string or Signature instance");
      let _sig = void 0;
      let P;
      try {
        if (isObj)
          _sig = new Signature(sg.r, sg.s);
        if (isHex2) {
          try {
            if (format !== "compact")
              _sig = Signature.fromDER(sg);
          } catch (derError) {
            if (!(derError instanceof DER.Err))
              throw derError;
          }
          if (!_sig && format !== "der")
            _sig = Signature.fromCompact(sg);
        }
        P = Point2.fromHex(publicKey);
      } catch (error) {
        return false;
      }
      if (!_sig)
        return false;
      if (lowS && _sig.hasHighS())
        return false;
      if (prehash)
        msgHash = CURVE.hash(msgHash);
      const { r, s } = _sig;
      const h = bits2int_modN(msgHash);
      const is = invN(s);
      const u1 = modN2(h * is);
      const u2 = modN2(r * is);
      const R = Point2.BASE.multiplyAndAddUnsafe(P, u1, u2)?.toAffine();
      if (!R)
        return false;
      const v = modN2(R.x);
      return v === r;
    }
    return {
      CURVE,
      getPublicKey,
      getSharedSecret,
      sign: sign3,
      verify,
      ProjectivePoint: Point2,
      Signature,
      utils
    };
  }
  function SWUFpSqrtRatio(Fp, Z) {
    const q = Fp.ORDER;
    let l = _0n5;
    for (let o = q - _1n5; o % _2n3 === _0n5; o /= _2n3)
      l += _1n5;
    const c1 = l;
    const _2n_pow_c1_1 = _2n3 << c1 - _1n5 - _1n5;
    const _2n_pow_c1 = _2n_pow_c1_1 * _2n3;
    const c2 = (q - _1n5) / _2n_pow_c1;
    const c3 = (c2 - _1n5) / _2n3;
    const c4 = _2n_pow_c1 - _1n5;
    const c5 = _2n_pow_c1_1;
    const c6 = Fp.pow(Z, c2);
    const c7 = Fp.pow(Z, (c2 + _1n5) / _2n3);
    let sqrtRatio = (u, v) => {
      let tv1 = c6;
      let tv2 = Fp.pow(v, c4);
      let tv3 = Fp.sqr(tv2);
      tv3 = Fp.mul(tv3, v);
      let tv5 = Fp.mul(u, tv3);
      tv5 = Fp.pow(tv5, c3);
      tv5 = Fp.mul(tv5, tv2);
      tv2 = Fp.mul(tv5, v);
      tv3 = Fp.mul(tv5, u);
      let tv4 = Fp.mul(tv3, tv2);
      tv5 = Fp.pow(tv4, c5);
      let isQR = Fp.eql(tv5, Fp.ONE);
      tv2 = Fp.mul(tv3, c7);
      tv5 = Fp.mul(tv4, tv1);
      tv3 = Fp.cmov(tv2, tv3, isQR);
      tv4 = Fp.cmov(tv5, tv4, isQR);
      for (let i = c1; i > _1n5; i--) {
        let tv52 = i - _2n3;
        tv52 = _2n3 << tv52 - _1n5;
        let tvv5 = Fp.pow(tv4, tv52);
        const e1 = Fp.eql(tvv5, Fp.ONE);
        tv2 = Fp.mul(tv3, tv1);
        tv1 = Fp.mul(tv1, tv1);
        tvv5 = Fp.mul(tv4, tv1);
        tv3 = Fp.cmov(tv2, tv3, e1);
        tv4 = Fp.cmov(tvv5, tv4, e1);
      }
      return { isValid: isQR, value: tv3 };
    };
    if (Fp.ORDER % _4n2 === _3n2) {
      const c12 = (Fp.ORDER - _3n2) / _4n2;
      const c22 = Fp.sqrt(Fp.neg(Z));
      sqrtRatio = (u, v) => {
        let tv1 = Fp.sqr(v);
        const tv2 = Fp.mul(u, v);
        tv1 = Fp.mul(tv1, tv2);
        let y1 = Fp.pow(tv1, c12);
        y1 = Fp.mul(y1, tv2);
        const y2 = Fp.mul(y1, c22);
        const tv3 = Fp.mul(Fp.sqr(y1), v);
        const isQR = Fp.eql(tv3, u);
        let y = Fp.cmov(y2, y1, isQR);
        return { isValid: isQR, value: y };
      };
    }
    return sqrtRatio;
  }
  function mapToCurveSimpleSWU(Fp, opts) {
    validateField(Fp);
    if (!Fp.isValid(opts.A) || !Fp.isValid(opts.B) || !Fp.isValid(opts.Z))
      throw new Error("mapToCurveSimpleSWU: invalid opts");
    const sqrtRatio = SWUFpSqrtRatio(Fp, opts.Z);
    if (!Fp.isOdd)
      throw new Error("Fp.isOdd is not implemented!");
    return (u) => {
      let tv1, tv2, tv3, tv4, tv5, tv6, x, y;
      tv1 = Fp.sqr(u);
      tv1 = Fp.mul(tv1, opts.Z);
      tv2 = Fp.sqr(tv1);
      tv2 = Fp.add(tv2, tv1);
      tv3 = Fp.add(tv2, Fp.ONE);
      tv3 = Fp.mul(tv3, opts.B);
      tv4 = Fp.cmov(opts.Z, Fp.neg(tv2), !Fp.eql(tv2, Fp.ZERO));
      tv4 = Fp.mul(tv4, opts.A);
      tv2 = Fp.sqr(tv3);
      tv6 = Fp.sqr(tv4);
      tv5 = Fp.mul(tv6, opts.A);
      tv2 = Fp.add(tv2, tv5);
      tv2 = Fp.mul(tv2, tv3);
      tv6 = Fp.mul(tv6, tv4);
      tv5 = Fp.mul(tv6, opts.B);
      tv2 = Fp.add(tv2, tv5);
      x = Fp.mul(tv1, tv3);
      const { isValid, value } = sqrtRatio(tv2, tv6);
      y = Fp.mul(tv1, u);
      y = Fp.mul(y, value);
      x = Fp.cmov(x, tv3, isValid);
      y = Fp.cmov(y, value, isValid);
      const e1 = Fp.isOdd(u) === Fp.isOdd(y);
      y = Fp.cmov(Fp.neg(y), y, e1);
      const tv4_inv = FpInvertBatch(Fp, [tv4], true)[0];
      x = Fp.mul(x, tv4_inv);
      return { x, y };
    };
  }
  var DERErr, DER, _0n5, _1n5, _2n3, _3n2, _4n2;
  var init_weierstrass = __esm({
    "node_modules/viem/node_modules/@noble/curves/esm/abstract/weierstrass.js"() {
      init_curve();
      init_modular();
      init_utils4();
      DERErr = class extends Error {
        constructor(m = "") {
          super(m);
        }
      };
      DER = {
        // asn.1 DER encoding utils
        Err: DERErr,
        // Basic building block is TLV (Tag-Length-Value)
        _tlv: {
          encode: (tag, data) => {
            const { Err: E } = DER;
            if (tag < 0 || tag > 256)
              throw new E("tlv.encode: wrong tag");
            if (data.length & 1)
              throw new E("tlv.encode: unpadded data");
            const dataLen = data.length / 2;
            const len = numberToHexUnpadded(dataLen);
            if (len.length / 2 & 128)
              throw new E("tlv.encode: long form length too big");
            const lenLen = dataLen > 127 ? numberToHexUnpadded(len.length / 2 | 128) : "";
            const t = numberToHexUnpadded(tag);
            return t + lenLen + len + data;
          },
          // v - value, l - left bytes (unparsed)
          decode(tag, data) {
            const { Err: E } = DER;
            let pos = 0;
            if (tag < 0 || tag > 256)
              throw new E("tlv.encode: wrong tag");
            if (data.length < 2 || data[pos++] !== tag)
              throw new E("tlv.decode: wrong tlv");
            const first = data[pos++];
            const isLong = !!(first & 128);
            let length = 0;
            if (!isLong)
              length = first;
            else {
              const lenLen = first & 127;
              if (!lenLen)
                throw new E("tlv.decode(long): indefinite length not supported");
              if (lenLen > 4)
                throw new E("tlv.decode(long): byte length is too big");
              const lengthBytes = data.subarray(pos, pos + lenLen);
              if (lengthBytes.length !== lenLen)
                throw new E("tlv.decode: length bytes not complete");
              if (lengthBytes[0] === 0)
                throw new E("tlv.decode(long): zero leftmost byte");
              for (const b of lengthBytes)
                length = length << 8 | b;
              pos += lenLen;
              if (length < 128)
                throw new E("tlv.decode(long): not minimal encoding");
            }
            const v = data.subarray(pos, pos + length);
            if (v.length !== length)
              throw new E("tlv.decode: wrong value length");
            return { v, l: data.subarray(pos + length) };
          }
        },
        // https://crypto.stackexchange.com/a/57734 Leftmost bit of first byte is 'negative' flag,
        // since we always use positive integers here. It must always be empty:
        // - add zero byte if exists
        // - if next byte doesn't have a flag, leading zero is not allowed (minimal encoding)
        _int: {
          encode(num2) {
            const { Err: E } = DER;
            if (num2 < _0n5)
              throw new E("integer: negative integers are not allowed");
            let hex = numberToHexUnpadded(num2);
            if (Number.parseInt(hex[0], 16) & 8)
              hex = "00" + hex;
            if (hex.length & 1)
              throw new E("unexpected DER parsing assertion: unpadded hex");
            return hex;
          },
          decode(data) {
            const { Err: E } = DER;
            if (data[0] & 128)
              throw new E("invalid signature integer: negative");
            if (data[0] === 0 && !(data[1] & 128))
              throw new E("invalid signature integer: unnecessary leading zero");
            return bytesToNumberBE(data);
          }
        },
        toSig(hex) {
          const { Err: E, _int: int, _tlv: tlv } = DER;
          const data = ensureBytes("signature", hex);
          const { v: seqBytes, l: seqLeftBytes } = tlv.decode(48, data);
          if (seqLeftBytes.length)
            throw new E("invalid signature: left bytes after parsing");
          const { v: rBytes, l: rLeftBytes } = tlv.decode(2, seqBytes);
          const { v: sBytes, l: sLeftBytes } = tlv.decode(2, rLeftBytes);
          if (sLeftBytes.length)
            throw new E("invalid signature: left bytes after parsing");
          return { r: int.decode(rBytes), s: int.decode(sBytes) };
        },
        hexFromSig(sig) {
          const { _tlv: tlv, _int: int } = DER;
          const rs = tlv.encode(2, int.encode(sig.r));
          const ss = tlv.encode(2, int.encode(sig.s));
          const seq = rs + ss;
          return tlv.encode(48, seq);
        }
      };
      _0n5 = BigInt(0);
      _1n5 = BigInt(1);
      _2n3 = BigInt(2);
      _3n2 = BigInt(3);
      _4n2 = BigInt(4);
    }
  });

  // node_modules/viem/node_modules/@noble/curves/esm/_shortw_utils.js
  function getHash(hash3) {
    return {
      hash: hash3,
      hmac: (key, ...msgs) => hmac(hash3, key, concatBytes(...msgs)),
      randomBytes
    };
  }
  function createCurve(curveDef, defHash) {
    const create2 = (hash3) => weierstrass({ ...curveDef, ...getHash(hash3) });
    return { ...create2(defHash), create: create2 };
  }
  var init_shortw_utils = __esm({
    "node_modules/viem/node_modules/@noble/curves/esm/_shortw_utils.js"() {
      init_hmac();
      init_utils2();
      init_weierstrass();
    }
  });

  // node_modules/viem/node_modules/@noble/curves/esm/abstract/hash-to-curve.js
  function i2osp(value, length) {
    anum(value);
    anum(length);
    if (value < 0 || value >= 1 << 8 * length)
      throw new Error("invalid I2OSP input: " + value);
    const res = Array.from({ length }).fill(0);
    for (let i = length - 1; i >= 0; i--) {
      res[i] = value & 255;
      value >>>= 8;
    }
    return new Uint8Array(res);
  }
  function strxor(a, b) {
    const arr = new Uint8Array(a.length);
    for (let i = 0; i < a.length; i++) {
      arr[i] = a[i] ^ b[i];
    }
    return arr;
  }
  function anum(item) {
    if (!Number.isSafeInteger(item))
      throw new Error("number expected");
  }
  function expand_message_xmd(msg, DST, lenInBytes, H) {
    abytes2(msg);
    abytes2(DST);
    anum(lenInBytes);
    if (DST.length > 255)
      DST = H(concatBytes3(utf8ToBytes2("H2C-OVERSIZE-DST-"), DST));
    const { outputLen: b_in_bytes, blockLen: r_in_bytes } = H;
    const ell = Math.ceil(lenInBytes / b_in_bytes);
    if (lenInBytes > 65535 || ell > 255)
      throw new Error("expand_message_xmd: invalid lenInBytes");
    const DST_prime = concatBytes3(DST, i2osp(DST.length, 1));
    const Z_pad = i2osp(0, r_in_bytes);
    const l_i_b_str = i2osp(lenInBytes, 2);
    const b = new Array(ell);
    const b_0 = H(concatBytes3(Z_pad, msg, l_i_b_str, i2osp(0, 1), DST_prime));
    b[0] = H(concatBytes3(b_0, i2osp(1, 1), DST_prime));
    for (let i = 1; i <= ell; i++) {
      const args = [strxor(b_0, b[i - 1]), i2osp(i + 1, 1), DST_prime];
      b[i] = H(concatBytes3(...args));
    }
    const pseudo_random_bytes = concatBytes3(...b);
    return pseudo_random_bytes.slice(0, lenInBytes);
  }
  function expand_message_xof(msg, DST, lenInBytes, k, H) {
    abytes2(msg);
    abytes2(DST);
    anum(lenInBytes);
    if (DST.length > 255) {
      const dkLen = Math.ceil(2 * k / 8);
      DST = H.create({ dkLen }).update(utf8ToBytes2("H2C-OVERSIZE-DST-")).update(DST).digest();
    }
    if (lenInBytes > 65535 || DST.length > 255)
      throw new Error("expand_message_xof: invalid lenInBytes");
    return H.create({ dkLen: lenInBytes }).update(msg).update(i2osp(lenInBytes, 2)).update(DST).update(i2osp(DST.length, 1)).digest();
  }
  function hash_to_field(msg, count, options) {
    validateObject(options, {
      DST: "stringOrUint8Array",
      p: "bigint",
      m: "isSafeInteger",
      k: "isSafeInteger",
      hash: "hash"
    });
    const { p, k, m, hash: hash3, expand, DST: _DST } = options;
    abytes2(msg);
    anum(count);
    const DST = typeof _DST === "string" ? utf8ToBytes2(_DST) : _DST;
    const log2p = p.toString(2).length;
    const L = Math.ceil((log2p + k) / 8);
    const len_in_bytes = count * m * L;
    let prb;
    if (expand === "xmd") {
      prb = expand_message_xmd(msg, DST, len_in_bytes, hash3);
    } else if (expand === "xof") {
      prb = expand_message_xof(msg, DST, len_in_bytes, k, hash3);
    } else if (expand === "_internal_pass") {
      prb = msg;
    } else {
      throw new Error('expand must be "xmd" or "xof"');
    }
    const u = new Array(count);
    for (let i = 0; i < count; i++) {
      const e = new Array(m);
      for (let j = 0; j < m; j++) {
        const elm_offset = L * (j + i * m);
        const tv = prb.subarray(elm_offset, elm_offset + L);
        e[j] = mod(os2ip(tv), p);
      }
      u[i] = e;
    }
    return u;
  }
  function isogenyMap(field, map) {
    const coeff = map.map((i) => Array.from(i).reverse());
    return (x, y) => {
      const [xn, xd, yn, yd] = coeff.map((val) => val.reduce((acc, i) => field.add(field.mul(acc, x), i)));
      const [xd_inv, yd_inv] = FpInvertBatch(field, [xd, yd], true);
      x = field.mul(xn, xd_inv);
      y = field.mul(y, field.mul(yn, yd_inv));
      return { x, y };
    };
  }
  function createHasher2(Point2, mapToCurve, defaults) {
    if (typeof mapToCurve !== "function")
      throw new Error("mapToCurve() must be defined");
    function map(num2) {
      return Point2.fromAffine(mapToCurve(num2));
    }
    function clear(initial) {
      const P = initial.clearCofactor();
      if (P.equals(Point2.ZERO))
        return Point2.ZERO;
      P.assertValidity();
      return P;
    }
    return {
      defaults,
      // Encodes byte string to elliptic curve.
      // hash_to_curve from https://www.rfc-editor.org/rfc/rfc9380#section-3
      hashToCurve(msg, options) {
        const u = hash_to_field(msg, 2, { ...defaults, DST: defaults.DST, ...options });
        const u0 = map(u[0]);
        const u1 = map(u[1]);
        return clear(u0.add(u1));
      },
      // Encodes byte string to elliptic curve.
      // encode_to_curve from https://www.rfc-editor.org/rfc/rfc9380#section-3
      encodeToCurve(msg, options) {
        const u = hash_to_field(msg, 1, { ...defaults, DST: defaults.encodeDST, ...options });
        return clear(map(u[0]));
      },
      // Same as encodeToCurve, but without hash
      mapToCurve(scalars) {
        if (!Array.isArray(scalars))
          throw new Error("expected array of bigints");
        for (const i of scalars)
          if (typeof i !== "bigint")
            throw new Error("expected array of bigints");
        return clear(map(scalars));
      }
    };
  }
  var os2ip;
  var init_hash_to_curve = __esm({
    "node_modules/viem/node_modules/@noble/curves/esm/abstract/hash-to-curve.js"() {
      init_modular();
      init_utils4();
      os2ip = bytesToNumberBE;
    }
  });

  // node_modules/viem/node_modules/@noble/curves/esm/secp256k1.js
  var secp256k1_exports = {};
  __export(secp256k1_exports, {
    encodeToCurve: () => encodeToCurve,
    hashToCurve: () => hashToCurve,
    schnorr: () => schnorr,
    secp256k1: () => secp256k1,
    secp256k1_hasher: () => secp256k1_hasher
  });
  function sqrtMod(y) {
    const P = secp256k1P;
    const _3n5 = BigInt(3), _6n = BigInt(6), _11n = BigInt(11), _22n = BigInt(22);
    const _23n = BigInt(23), _44n = BigInt(44), _88n = BigInt(88);
    const b2 = y * y * y % P;
    const b3 = b2 * b2 * y % P;
    const b6 = pow2(b3, _3n5, P) * b3 % P;
    const b9 = pow2(b6, _3n5, P) * b3 % P;
    const b11 = pow2(b9, _2n4, P) * b2 % P;
    const b22 = pow2(b11, _11n, P) * b11 % P;
    const b44 = pow2(b22, _22n, P) * b22 % P;
    const b88 = pow2(b44, _44n, P) * b44 % P;
    const b176 = pow2(b88, _88n, P) * b88 % P;
    const b220 = pow2(b176, _44n, P) * b44 % P;
    const b223 = pow2(b220, _3n5, P) * b3 % P;
    const t1 = pow2(b223, _23n, P) * b22 % P;
    const t2 = pow2(t1, _6n, P) * b2 % P;
    const root = pow2(t2, _2n4, P);
    if (!Fpk1.eql(Fpk1.sqr(root), y))
      throw new Error("Cannot find square root");
    return root;
  }
  function taggedHash(tag, ...messages) {
    let tagP = TAGGED_HASH_PREFIXES[tag];
    if (tagP === void 0) {
      const tagH = sha256(Uint8Array.from(tag, (c) => c.charCodeAt(0)));
      tagP = concatBytes3(tagH, tagH);
      TAGGED_HASH_PREFIXES[tag] = tagP;
    }
    return sha256(concatBytes3(tagP, ...messages));
  }
  function schnorrGetExtPubKey(priv) {
    let d_ = secp256k1.utils.normPrivateKeyToScalar(priv);
    let p = Point.fromPrivateKey(d_);
    const scalar = p.hasEvenY() ? d_ : modN(-d_);
    return { scalar, bytes: pointToBytes(p) };
  }
  function lift_x(x) {
    aInRange("x", x, _1n6, secp256k1P);
    const xx = modP(x * x);
    const c = modP(xx * x + BigInt(7));
    let y = sqrtMod(c);
    if (y % _2n4 !== _0n6)
      y = modP(-y);
    const p = new Point(x, y, _1n6);
    p.assertValidity();
    return p;
  }
  function challenge(...args) {
    return modN(num(taggedHash("BIP0340/challenge", ...args)));
  }
  function schnorrGetPublicKey(privateKey) {
    return schnorrGetExtPubKey(privateKey).bytes;
  }
  function schnorrSign(message, privateKey, auxRand = randomBytes(32)) {
    const m = ensureBytes("message", message);
    const { bytes: px, scalar: d } = schnorrGetExtPubKey(privateKey);
    const a = ensureBytes("auxRand", auxRand, 32);
    const t = numTo32b(d ^ num(taggedHash("BIP0340/aux", a)));
    const rand = taggedHash("BIP0340/nonce", t, px, m);
    const k_ = modN(num(rand));
    if (k_ === _0n6)
      throw new Error("sign failed: k is zero");
    const { bytes: rx, scalar: k } = schnorrGetExtPubKey(k_);
    const e = challenge(rx, px, m);
    const sig = new Uint8Array(64);
    sig.set(rx, 0);
    sig.set(numTo32b(modN(k + e * d)), 32);
    if (!schnorrVerify(sig, m, px))
      throw new Error("sign: Invalid signature produced");
    return sig;
  }
  function schnorrVerify(signature, message, publicKey) {
    const sig = ensureBytes("signature", signature, 64);
    const m = ensureBytes("message", message);
    const pub = ensureBytes("publicKey", publicKey, 32);
    try {
      const P = lift_x(num(pub));
      const r = num(sig.subarray(0, 32));
      if (!inRange(r, _1n6, secp256k1P))
        return false;
      const s = num(sig.subarray(32, 64));
      if (!inRange(s, _1n6, secp256k1N))
        return false;
      const e = challenge(numTo32b(r), pointToBytes(P), m);
      const R = GmulAdd(P, s, modN(-e));
      if (!R || !R.hasEvenY() || R.toAffine().x !== r)
        return false;
      return true;
    } catch (error) {
      return false;
    }
  }
  var secp256k1P, secp256k1N, _0n6, _1n6, _2n4, divNearest, Fpk1, secp256k1, TAGGED_HASH_PREFIXES, pointToBytes, numTo32b, modP, modN, Point, GmulAdd, num, schnorr, isoMap, mapSWU, secp256k1_hasher, hashToCurve, encodeToCurve;
  var init_secp256k1 = __esm({
    "node_modules/viem/node_modules/@noble/curves/esm/secp256k1.js"() {
      init_sha2();
      init_utils2();
      init_shortw_utils();
      init_hash_to_curve();
      init_modular();
      init_utils4();
      init_weierstrass();
      secp256k1P = BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f");
      secp256k1N = BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141");
      _0n6 = BigInt(0);
      _1n6 = BigInt(1);
      _2n4 = BigInt(2);
      divNearest = (a, b) => (a + b / _2n4) / b;
      Fpk1 = Field(secp256k1P, void 0, void 0, { sqrt: sqrtMod });
      secp256k1 = createCurve({
        a: _0n6,
        b: BigInt(7),
        Fp: Fpk1,
        n: secp256k1N,
        Gx: BigInt("55066263022277343669578718895168534326250603453777594175500187360389116729240"),
        Gy: BigInt("32670510020758816978083085130507043184471273380659243275938904335757337482424"),
        h: BigInt(1),
        lowS: true,
        // Allow only low-S signatures by default in sign() and verify()
        endo: {
          // Endomorphism, see above
          beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
          splitScalar: (k) => {
            const n = secp256k1N;
            const a1 = BigInt("0x3086d221a7d46bcde86c90e49284eb15");
            const b1 = -_1n6 * BigInt("0xe4437ed6010e88286f547fa90abfe4c3");
            const a2 = BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8");
            const b2 = a1;
            const POW_2_128 = BigInt("0x100000000000000000000000000000000");
            const c1 = divNearest(b2 * k, n);
            const c2 = divNearest(-b1 * k, n);
            let k1 = mod(k - c1 * a1 - c2 * a2, n);
            let k2 = mod(-c1 * b1 - c2 * b2, n);
            const k1neg = k1 > POW_2_128;
            const k2neg = k2 > POW_2_128;
            if (k1neg)
              k1 = n - k1;
            if (k2neg)
              k2 = n - k2;
            if (k1 > POW_2_128 || k2 > POW_2_128) {
              throw new Error("splitScalar: Endomorphism failed, k=" + k);
            }
            return { k1neg, k1, k2neg, k2 };
          }
        }
      }, sha256);
      TAGGED_HASH_PREFIXES = {};
      pointToBytes = (point) => point.toRawBytes(true).slice(1);
      numTo32b = (n) => numberToBytesBE(n, 32);
      modP = (x) => mod(x, secp256k1P);
      modN = (x) => mod(x, secp256k1N);
      Point = /* @__PURE__ */ (() => secp256k1.ProjectivePoint)();
      GmulAdd = (Q, a, b) => Point.BASE.multiplyAndAddUnsafe(Q, a, b);
      num = bytesToNumberBE;
      schnorr = /* @__PURE__ */ (() => ({
        getPublicKey: schnorrGetPublicKey,
        sign: schnorrSign,
        verify: schnorrVerify,
        utils: {
          randomPrivateKey: secp256k1.utils.randomPrivateKey,
          lift_x,
          pointToBytes,
          numberToBytesBE,
          bytesToNumberBE,
          taggedHash,
          mod
        }
      }))();
      isoMap = /* @__PURE__ */ (() => isogenyMap(Fpk1, [
        // xNum
        [
          "0x8e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38daaaaa8c7",
          "0x7d3d4c80bc321d5b9f315cea7fd44c5d595d2fc0bf63b92dfff1044f17c6581",
          "0x534c328d23f234e6e2a413deca25caece4506144037c40314ecbd0b53d9dd262",
          "0x8e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38daaaaa88c"
        ],
        // xDen
        [
          "0xd35771193d94918a9ca34ccbb7b640dd86cd409542f8487d9fe6b745781eb49b",
          "0xedadc6f64383dc1df7c4b2d51b54225406d36b641f5e41bbc52a56612a8c6d14",
          "0x0000000000000000000000000000000000000000000000000000000000000001"
          // LAST 1
        ],
        // yNum
        [
          "0x4bda12f684bda12f684bda12f684bda12f684bda12f684bda12f684b8e38e23c",
          "0xc75e0c32d5cb7c0fa9d0a54b12a0a6d5647ab046d686da6fdffc90fc201d71a3",
          "0x29a6194691f91a73715209ef6512e576722830a201be2018a765e85a9ecee931",
          "0x2f684bda12f684bda12f684bda12f684bda12f684bda12f684bda12f38e38d84"
        ],
        // yDen
        [
          "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffff93b",
          "0x7a06534bb8bdb49fd5e9e6632722c2989467c1bfc8e8d978dfb425d2685c2573",
          "0x6484aa716545ca2cf3a70c3fa8fe337e0a3d21162f0d6299a7bf8192bfd2a76f",
          "0x0000000000000000000000000000000000000000000000000000000000000001"
          // LAST 1
        ]
      ].map((i) => i.map((j) => BigInt(j)))))();
      mapSWU = /* @__PURE__ */ (() => mapToCurveSimpleSWU(Fpk1, {
        A: BigInt("0x3f8731abdd661adca08a5558f0f5d272e953d363cb6f0e5d405447c01a444533"),
        B: BigInt("1771"),
        Z: Fpk1.create(BigInt("-11"))
      }))();
      secp256k1_hasher = /* @__PURE__ */ (() => createHasher2(secp256k1.ProjectivePoint, (scalars) => {
        const { x, y } = mapSWU(Fpk1.create(scalars[0]));
        return isoMap(x, y);
      }, {
        DST: "secp256k1_XMD:SHA-256_SSWU_RO_",
        encodeDST: "secp256k1_XMD:SHA-256_SSWU_NU_",
        p: Fpk1.ORDER,
        m: 1,
        k: 128,
        expand: "xmd",
        hash: sha256
      }))();
      hashToCurve = /* @__PURE__ */ (() => secp256k1_hasher.hashToCurve)();
      encodeToCurve = /* @__PURE__ */ (() => secp256k1_hasher.encodeToCurve)();
    }
  });

  // node_modules/viem/_esm/utils/signature/recoverPublicKey.js
  async function recoverPublicKey({ hash: hash3, signature }) {
    const hashHex = isHex(hash3) ? hash3 : toHex(hash3);
    const { secp256k1: secp256k13 } = await Promise.resolve().then(() => (init_secp256k1(), secp256k1_exports));
    const signature_ = (() => {
      if (typeof signature === "object" && "r" in signature && "s" in signature) {
        const { r, s, v, yParity } = signature;
        const yParityOrV2 = Number(yParity ?? v);
        const recoveryBit2 = toRecoveryBit(yParityOrV2);
        return new secp256k13.Signature(hexToBigInt(r), hexToBigInt(s)).addRecoveryBit(recoveryBit2);
      }
      const signatureHex = isHex(signature) ? signature : toHex(signature);
      if (size(signatureHex) !== 65)
        throw new Error("invalid signature length");
      const yParityOrV = hexToNumber(`0x${signatureHex.slice(130)}`);
      const recoveryBit = toRecoveryBit(yParityOrV);
      return secp256k13.Signature.fromCompact(signatureHex.substring(2, 130)).addRecoveryBit(recoveryBit);
    })();
    const publicKey = signature_.recoverPublicKey(hashHex.substring(2)).toHex(false);
    return `0x${publicKey}`;
  }
  function toRecoveryBit(yParityOrV) {
    if (yParityOrV === 0 || yParityOrV === 1)
      return yParityOrV;
    if (yParityOrV === 27)
      return 0;
    if (yParityOrV === 28)
      return 1;
    throw new Error("Invalid yParityOrV value");
  }
  var init_recoverPublicKey = __esm({
    "node_modules/viem/_esm/utils/signature/recoverPublicKey.js"() {
      init_isHex();
      init_size();
      init_fromHex();
      init_toHex();
    }
  });

  // node_modules/viem/_esm/utils/signature/recoverAddress.js
  async function recoverAddress({ hash: hash3, signature }) {
    return publicKeyToAddress(await recoverPublicKey({ hash: hash3, signature }));
  }
  var init_recoverAddress = __esm({
    "node_modules/viem/_esm/utils/signature/recoverAddress.js"() {
      init_publicKeyToAddress();
      init_recoverPublicKey();
    }
  });

  // node_modules/viem/_esm/utils/encoding/toRlp.js
  function toRlp(bytes, to = "hex") {
    const encodable = getEncodable(bytes);
    const cursor = createCursor(new Uint8Array(encodable.length));
    encodable.encode(cursor);
    if (to === "hex")
      return bytesToHex(cursor.bytes);
    return cursor.bytes;
  }
  function getEncodable(bytes) {
    if (Array.isArray(bytes))
      return getEncodableList(bytes.map((x) => getEncodable(x)));
    return getEncodableBytes(bytes);
  }
  function getEncodableList(list) {
    const bodyLength = list.reduce((acc, x) => acc + x.length, 0);
    const sizeOfBodyLength = getSizeOfLength(bodyLength);
    const length = (() => {
      if (bodyLength <= 55)
        return 1 + bodyLength;
      return 1 + sizeOfBodyLength + bodyLength;
    })();
    return {
      length,
      encode(cursor) {
        if (bodyLength <= 55) {
          cursor.pushByte(192 + bodyLength);
        } else {
          cursor.pushByte(192 + 55 + sizeOfBodyLength);
          if (sizeOfBodyLength === 1)
            cursor.pushUint8(bodyLength);
          else if (sizeOfBodyLength === 2)
            cursor.pushUint16(bodyLength);
          else if (sizeOfBodyLength === 3)
            cursor.pushUint24(bodyLength);
          else
            cursor.pushUint32(bodyLength);
        }
        for (const { encode: encode5 } of list) {
          encode5(cursor);
        }
      }
    };
  }
  function getEncodableBytes(bytesOrHex) {
    const bytes = typeof bytesOrHex === "string" ? hexToBytes(bytesOrHex) : bytesOrHex;
    const sizeOfBytesLength = getSizeOfLength(bytes.length);
    const length = (() => {
      if (bytes.length === 1 && bytes[0] < 128)
        return 1;
      if (bytes.length <= 55)
        return 1 + bytes.length;
      return 1 + sizeOfBytesLength + bytes.length;
    })();
    return {
      length,
      encode(cursor) {
        if (bytes.length === 1 && bytes[0] < 128) {
          cursor.pushBytes(bytes);
        } else if (bytes.length <= 55) {
          cursor.pushByte(128 + bytes.length);
          cursor.pushBytes(bytes);
        } else {
          cursor.pushByte(128 + 55 + sizeOfBytesLength);
          if (sizeOfBytesLength === 1)
            cursor.pushUint8(bytes.length);
          else if (sizeOfBytesLength === 2)
            cursor.pushUint16(bytes.length);
          else if (sizeOfBytesLength === 3)
            cursor.pushUint24(bytes.length);
          else
            cursor.pushUint32(bytes.length);
          cursor.pushBytes(bytes);
        }
      }
    };
  }
  function getSizeOfLength(length) {
    if (length < 2 ** 8)
      return 1;
    if (length < 2 ** 16)
      return 2;
    if (length < 2 ** 24)
      return 3;
    if (length < 2 ** 32)
      return 4;
    throw new BaseError2("Length is too large.");
  }
  var init_toRlp = __esm({
    "node_modules/viem/_esm/utils/encoding/toRlp.js"() {
      init_base();
      init_cursor2();
      init_toBytes();
      init_toHex();
    }
  });

  // node_modules/viem/_esm/utils/authorization/hashAuthorization.js
  function hashAuthorization(parameters) {
    const { chainId, nonce, to } = parameters;
    const address = parameters.contractAddress ?? parameters.address;
    const hash3 = keccak256(concatHex([
      "0x05",
      toRlp([
        chainId ? numberToHex(chainId) : "0x",
        address,
        nonce ? numberToHex(nonce) : "0x"
      ])
    ]));
    if (to === "bytes")
      return hexToBytes(hash3);
    return hash3;
  }
  var init_hashAuthorization = __esm({
    "node_modules/viem/_esm/utils/authorization/hashAuthorization.js"() {
      init_concat();
      init_toBytes();
      init_toHex();
      init_toRlp();
      init_keccak256();
    }
  });

  // node_modules/viem/_esm/utils/authorization/recoverAuthorizationAddress.js
  async function recoverAuthorizationAddress(parameters) {
    const { authorization, signature } = parameters;
    return recoverAddress({
      hash: hashAuthorization(authorization),
      signature: signature ?? authorization
    });
  }
  var init_recoverAuthorizationAddress = __esm({
    "node_modules/viem/_esm/utils/authorization/recoverAuthorizationAddress.js"() {
      init_recoverAddress();
      init_hashAuthorization();
    }
  });

  // node_modules/viem/_esm/errors/estimateGas.js
  var EstimateGasExecutionError;
  var init_estimateGas = __esm({
    "node_modules/viem/_esm/errors/estimateGas.js"() {
      init_formatEther();
      init_formatGwei();
      init_base();
      init_transaction();
      EstimateGasExecutionError = class extends BaseError2 {
        constructor(cause, { account, docsPath: docsPath8, chain, data, gas, gasPrice, maxFeePerGas, maxPriorityFeePerGas, nonce, to, value }) {
          const prettyArgs = prettyPrint({
            from: account?.address,
            to,
            value: typeof value !== "undefined" && `${formatEther(value)} ${chain?.nativeCurrency?.symbol || "ETH"}`,
            data,
            gas,
            gasPrice: typeof gasPrice !== "undefined" && `${formatGwei(gasPrice)} gwei`,
            maxFeePerGas: typeof maxFeePerGas !== "undefined" && `${formatGwei(maxFeePerGas)} gwei`,
            maxPriorityFeePerGas: typeof maxPriorityFeePerGas !== "undefined" && `${formatGwei(maxPriorityFeePerGas)} gwei`,
            nonce
          });
          super(cause.shortMessage, {
            cause,
            docsPath: docsPath8,
            metaMessages: [
              ...cause.metaMessages ? [...cause.metaMessages, " "] : [],
              "Estimate Gas Arguments:",
              prettyArgs
            ].filter(Boolean),
            name: "EstimateGasExecutionError"
          });
          Object.defineProperty(this, "cause", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          this.cause = cause;
        }
      };
    }
  });

  // node_modules/viem/_esm/errors/node.js
  var ExecutionRevertedError, FeeCapTooHighError, FeeCapTooLowError, NonceTooHighError, NonceTooLowError, NonceMaxValueError, InsufficientFundsError, IntrinsicGasTooHighError, IntrinsicGasTooLowError, TransactionTypeNotSupportedError, TipAboveFeeCapError, UnknownNodeError;
  var init_node = __esm({
    "node_modules/viem/_esm/errors/node.js"() {
      init_formatGwei();
      init_base();
      ExecutionRevertedError = class extends BaseError2 {
        constructor({ cause, message } = {}) {
          const reason = message?.replace("execution reverted: ", "")?.replace("execution reverted", "");
          super(`Execution reverted ${reason ? `with reason: ${reason}` : "for an unknown reason"}.`, {
            cause,
            name: "ExecutionRevertedError"
          });
        }
      };
      Object.defineProperty(ExecutionRevertedError, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: 3
      });
      Object.defineProperty(ExecutionRevertedError, "nodeMessage", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /execution reverted/
      });
      FeeCapTooHighError = class extends BaseError2 {
        constructor({ cause, maxFeePerGas } = {}) {
          super(`The fee cap (\`maxFeePerGas\`${maxFeePerGas ? ` = ${formatGwei(maxFeePerGas)} gwei` : ""}) cannot be higher than the maximum allowed value (2^256-1).`, {
            cause,
            name: "FeeCapTooHighError"
          });
        }
      };
      Object.defineProperty(FeeCapTooHighError, "nodeMessage", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /max fee per gas higher than 2\^256-1|fee cap higher than 2\^256-1/
      });
      FeeCapTooLowError = class extends BaseError2 {
        constructor({ cause, maxFeePerGas } = {}) {
          super(`The fee cap (\`maxFeePerGas\`${maxFeePerGas ? ` = ${formatGwei(maxFeePerGas)}` : ""} gwei) cannot be lower than the block base fee.`, {
            cause,
            name: "FeeCapTooLowError"
          });
        }
      };
      Object.defineProperty(FeeCapTooLowError, "nodeMessage", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /max fee per gas less than block base fee|fee cap less than block base fee|transaction is outdated/
      });
      NonceTooHighError = class extends BaseError2 {
        constructor({ cause, nonce } = {}) {
          super(`Nonce provided for the transaction ${nonce ? `(${nonce}) ` : ""}is higher than the next one expected.`, { cause, name: "NonceTooHighError" });
        }
      };
      Object.defineProperty(NonceTooHighError, "nodeMessage", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /nonce too high/
      });
      NonceTooLowError = class extends BaseError2 {
        constructor({ cause, nonce } = {}) {
          super([
            `Nonce provided for the transaction ${nonce ? `(${nonce}) ` : ""}is lower than the current nonce of the account.`,
            "Try increasing the nonce or find the latest nonce with `getTransactionCount`."
          ].join("\n"), { cause, name: "NonceTooLowError" });
        }
      };
      Object.defineProperty(NonceTooLowError, "nodeMessage", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /nonce too low|transaction already imported|already known/
      });
      NonceMaxValueError = class extends BaseError2 {
        constructor({ cause, nonce } = {}) {
          super(`Nonce provided for the transaction ${nonce ? `(${nonce}) ` : ""}exceeds the maximum allowed nonce.`, { cause, name: "NonceMaxValueError" });
        }
      };
      Object.defineProperty(NonceMaxValueError, "nodeMessage", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /nonce has max value/
      });
      InsufficientFundsError = class extends BaseError2 {
        constructor({ cause } = {}) {
          super([
            "The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account."
          ].join("\n"), {
            cause,
            metaMessages: [
              "This error could arise when the account does not have enough funds to:",
              " - pay for the total gas fee,",
              " - pay for the value to send.",
              " ",
              "The cost of the transaction is calculated as `gas * gas fee + value`, where:",
              " - `gas` is the amount of gas needed for transaction to execute,",
              " - `gas fee` is the gas fee,",
              " - `value` is the amount of ether to send to the recipient."
            ],
            name: "InsufficientFundsError"
          });
        }
      };
      Object.defineProperty(InsufficientFundsError, "nodeMessage", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /insufficient funds|exceeds transaction sender account balance/
      });
      IntrinsicGasTooHighError = class extends BaseError2 {
        constructor({ cause, gas } = {}) {
          super(`The amount of gas ${gas ? `(${gas}) ` : ""}provided for the transaction exceeds the limit allowed for the block.`, {
            cause,
            name: "IntrinsicGasTooHighError"
          });
        }
      };
      Object.defineProperty(IntrinsicGasTooHighError, "nodeMessage", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /intrinsic gas too high|gas limit reached/
      });
      IntrinsicGasTooLowError = class extends BaseError2 {
        constructor({ cause, gas } = {}) {
          super(`The amount of gas ${gas ? `(${gas}) ` : ""}provided for the transaction is too low.`, {
            cause,
            name: "IntrinsicGasTooLowError"
          });
        }
      };
      Object.defineProperty(IntrinsicGasTooLowError, "nodeMessage", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /intrinsic gas too low/
      });
      TransactionTypeNotSupportedError = class extends BaseError2 {
        constructor({ cause }) {
          super("The transaction type is not supported for this chain.", {
            cause,
            name: "TransactionTypeNotSupportedError"
          });
        }
      };
      Object.defineProperty(TransactionTypeNotSupportedError, "nodeMessage", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /transaction type not valid/
      });
      TipAboveFeeCapError = class extends BaseError2 {
        constructor({ cause, maxPriorityFeePerGas, maxFeePerGas } = {}) {
          super([
            `The provided tip (\`maxPriorityFeePerGas\`${maxPriorityFeePerGas ? ` = ${formatGwei(maxPriorityFeePerGas)} gwei` : ""}) cannot be higher than the fee cap (\`maxFeePerGas\`${maxFeePerGas ? ` = ${formatGwei(maxFeePerGas)} gwei` : ""}).`
          ].join("\n"), {
            cause,
            name: "TipAboveFeeCapError"
          });
        }
      };
      Object.defineProperty(TipAboveFeeCapError, "nodeMessage", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /max priority fee per gas higher than max fee per gas|tip higher than fee cap/
      });
      UnknownNodeError = class extends BaseError2 {
        constructor({ cause }) {
          super(`An error occurred while executing: ${cause?.shortMessage}`, {
            cause,
            name: "UnknownNodeError"
          });
        }
      };
    }
  });

  // node_modules/viem/_esm/utils/errors/getNodeError.js
  function getNodeError(err, args) {
    const message = (err.details || "").toLowerCase();
    const executionRevertedError = err instanceof BaseError2 ? err.walk((e) => e?.code === ExecutionRevertedError.code) : err;
    if (executionRevertedError instanceof BaseError2)
      return new ExecutionRevertedError({
        cause: err,
        message: executionRevertedError.details
      });
    if (ExecutionRevertedError.nodeMessage.test(message))
      return new ExecutionRevertedError({
        cause: err,
        message: err.details
      });
    if (FeeCapTooHighError.nodeMessage.test(message))
      return new FeeCapTooHighError({
        cause: err,
        maxFeePerGas: args?.maxFeePerGas
      });
    if (FeeCapTooLowError.nodeMessage.test(message))
      return new FeeCapTooLowError({
        cause: err,
        maxFeePerGas: args?.maxFeePerGas
      });
    if (NonceTooHighError.nodeMessage.test(message))
      return new NonceTooHighError({ cause: err, nonce: args?.nonce });
    if (NonceTooLowError.nodeMessage.test(message))
      return new NonceTooLowError({ cause: err, nonce: args?.nonce });
    if (NonceMaxValueError.nodeMessage.test(message))
      return new NonceMaxValueError({ cause: err, nonce: args?.nonce });
    if (InsufficientFundsError.nodeMessage.test(message))
      return new InsufficientFundsError({ cause: err });
    if (IntrinsicGasTooHighError.nodeMessage.test(message))
      return new IntrinsicGasTooHighError({ cause: err, gas: args?.gas });
    if (IntrinsicGasTooLowError.nodeMessage.test(message))
      return new IntrinsicGasTooLowError({ cause: err, gas: args?.gas });
    if (TransactionTypeNotSupportedError.nodeMessage.test(message))
      return new TransactionTypeNotSupportedError({ cause: err });
    if (TipAboveFeeCapError.nodeMessage.test(message))
      return new TipAboveFeeCapError({
        cause: err,
        maxFeePerGas: args?.maxFeePerGas,
        maxPriorityFeePerGas: args?.maxPriorityFeePerGas
      });
    return new UnknownNodeError({
      cause: err
    });
  }
  var init_getNodeError = __esm({
    "node_modules/viem/_esm/utils/errors/getNodeError.js"() {
      init_base();
      init_node();
    }
  });

  // node_modules/viem/_esm/utils/errors/getEstimateGasError.js
  function getEstimateGasError(err, { docsPath: docsPath8, ...args }) {
    const cause = (() => {
      const cause2 = getNodeError(err, args);
      if (cause2 instanceof UnknownNodeError)
        return err;
      return cause2;
    })();
    return new EstimateGasExecutionError(cause, {
      docsPath: docsPath8,
      ...args
    });
  }
  var init_getEstimateGasError = __esm({
    "node_modules/viem/_esm/utils/errors/getEstimateGasError.js"() {
      init_estimateGas();
      init_node();
      init_getNodeError();
    }
  });

  // node_modules/viem/_esm/utils/formatters/extract.js
  function extract(value_, { format }) {
    if (!format)
      return {};
    const value = {};
    function extract_(formatted2) {
      const keys = Object.keys(formatted2);
      for (const key of keys) {
        if (key in value_)
          value[key] = value_[key];
        if (formatted2[key] && typeof formatted2[key] === "object" && !Array.isArray(formatted2[key]))
          extract_(formatted2[key]);
      }
    }
    const formatted = format(value_ || {});
    extract_(formatted);
    return value;
  }
  var init_extract = __esm({
    "node_modules/viem/_esm/utils/formatters/extract.js"() {
    }
  });

  // node_modules/viem/_esm/utils/formatters/formatter.js
  function defineFormatter(type, format) {
    return ({ exclude, format: overrides }) => {
      return {
        exclude,
        format: (args, action) => {
          const formatted = format(args, action);
          if (exclude) {
            for (const key of exclude) {
              delete formatted[key];
            }
          }
          return {
            ...formatted,
            ...overrides(args, action)
          };
        },
        type
      };
    };
  }
  var init_formatter = __esm({
    "node_modules/viem/_esm/utils/formatters/formatter.js"() {
    }
  });

  // node_modules/viem/_esm/utils/formatters/transactionRequest.js
  function formatTransactionRequest(request, _) {
    const rpcRequest = {};
    if (typeof request.authorizationList !== "undefined")
      rpcRequest.authorizationList = formatAuthorizationList(request.authorizationList);
    if (typeof request.accessList !== "undefined")
      rpcRequest.accessList = request.accessList;
    if (typeof request.blobVersionedHashes !== "undefined")
      rpcRequest.blobVersionedHashes = request.blobVersionedHashes;
    if (typeof request.blobs !== "undefined") {
      if (typeof request.blobs[0] !== "string")
        rpcRequest.blobs = request.blobs.map((x) => bytesToHex(x));
      else
        rpcRequest.blobs = request.blobs;
    }
    if (typeof request.data !== "undefined")
      rpcRequest.data = request.data;
    if (typeof request.from !== "undefined")
      rpcRequest.from = request.from;
    if (typeof request.gas !== "undefined")
      rpcRequest.gas = numberToHex(request.gas);
    if (typeof request.gasPrice !== "undefined")
      rpcRequest.gasPrice = numberToHex(request.gasPrice);
    if (typeof request.maxFeePerBlobGas !== "undefined")
      rpcRequest.maxFeePerBlobGas = numberToHex(request.maxFeePerBlobGas);
    if (typeof request.maxFeePerGas !== "undefined")
      rpcRequest.maxFeePerGas = numberToHex(request.maxFeePerGas);
    if (typeof request.maxPriorityFeePerGas !== "undefined")
      rpcRequest.maxPriorityFeePerGas = numberToHex(request.maxPriorityFeePerGas);
    if (typeof request.nonce !== "undefined")
      rpcRequest.nonce = numberToHex(request.nonce);
    if (typeof request.to !== "undefined")
      rpcRequest.to = request.to;
    if (typeof request.type !== "undefined")
      rpcRequest.type = rpcTransactionType[request.type];
    if (typeof request.value !== "undefined")
      rpcRequest.value = numberToHex(request.value);
    return rpcRequest;
  }
  function formatAuthorizationList(authorizationList) {
    return authorizationList.map((authorization) => ({
      address: authorization.address,
      r: authorization.r ? numberToHex(BigInt(authorization.r)) : authorization.r,
      s: authorization.s ? numberToHex(BigInt(authorization.s)) : authorization.s,
      chainId: numberToHex(authorization.chainId),
      nonce: numberToHex(authorization.nonce),
      ...typeof authorization.yParity !== "undefined" ? { yParity: numberToHex(authorization.yParity) } : {},
      ...typeof authorization.v !== "undefined" && typeof authorization.yParity === "undefined" ? { v: numberToHex(authorization.v) } : {}
    }));
  }
  var rpcTransactionType;
  var init_transactionRequest = __esm({
    "node_modules/viem/_esm/utils/formatters/transactionRequest.js"() {
      init_toHex();
      rpcTransactionType = {
        legacy: "0x0",
        eip2930: "0x1",
        eip1559: "0x2",
        eip4844: "0x3",
        eip7702: "0x4"
      };
    }
  });

  // node_modules/viem/_esm/utils/stateOverride.js
  function serializeStateMapping(stateMapping) {
    if (!stateMapping || stateMapping.length === 0)
      return void 0;
    return stateMapping.reduce((acc, { slot, value }) => {
      if (slot.length !== 66)
        throw new InvalidBytesLengthError({
          size: slot.length,
          targetSize: 66,
          type: "hex"
        });
      if (value.length !== 66)
        throw new InvalidBytesLengthError({
          size: value.length,
          targetSize: 66,
          type: "hex"
        });
      acc[slot] = value;
      return acc;
    }, {});
  }
  function serializeAccountStateOverride(parameters) {
    const { balance, nonce, state, stateDiff, code } = parameters;
    const rpcAccountStateOverride = {};
    if (code !== void 0)
      rpcAccountStateOverride.code = code;
    if (balance !== void 0)
      rpcAccountStateOverride.balance = numberToHex(balance);
    if (nonce !== void 0)
      rpcAccountStateOverride.nonce = numberToHex(nonce);
    if (state !== void 0)
      rpcAccountStateOverride.state = serializeStateMapping(state);
    if (stateDiff !== void 0) {
      if (rpcAccountStateOverride.state)
        throw new StateAssignmentConflictError();
      rpcAccountStateOverride.stateDiff = serializeStateMapping(stateDiff);
    }
    return rpcAccountStateOverride;
  }
  function serializeStateOverride(parameters) {
    if (!parameters)
      return void 0;
    const rpcStateOverride = {};
    for (const { address, ...accountState } of parameters) {
      if (!isAddress(address, { strict: false }))
        throw new InvalidAddressError({ address });
      if (rpcStateOverride[address])
        throw new AccountStateConflictError({ address });
      rpcStateOverride[address] = serializeAccountStateOverride(accountState);
    }
    return rpcStateOverride;
  }
  var init_stateOverride2 = __esm({
    "node_modules/viem/_esm/utils/stateOverride.js"() {
      init_address();
      init_data();
      init_stateOverride();
      init_isAddress();
      init_toHex();
    }
  });

  // node_modules/viem/_esm/constants/number.js
  var maxInt8, maxInt16, maxInt24, maxInt32, maxInt40, maxInt48, maxInt56, maxInt64, maxInt72, maxInt80, maxInt88, maxInt96, maxInt104, maxInt112, maxInt120, maxInt128, maxInt136, maxInt144, maxInt152, maxInt160, maxInt168, maxInt176, maxInt184, maxInt192, maxInt200, maxInt208, maxInt216, maxInt224, maxInt232, maxInt240, maxInt248, maxInt256, minInt8, minInt16, minInt24, minInt32, minInt40, minInt48, minInt56, minInt64, minInt72, minInt80, minInt88, minInt96, minInt104, minInt112, minInt120, minInt128, minInt136, minInt144, minInt152, minInt160, minInt168, minInt176, minInt184, minInt192, minInt200, minInt208, minInt216, minInt224, minInt232, minInt240, minInt248, minInt256, maxUint8, maxUint16, maxUint24, maxUint32, maxUint40, maxUint48, maxUint56, maxUint64, maxUint72, maxUint80, maxUint88, maxUint96, maxUint104, maxUint112, maxUint120, maxUint128, maxUint136, maxUint144, maxUint152, maxUint160, maxUint168, maxUint176, maxUint184, maxUint192, maxUint200, maxUint208, maxUint216, maxUint224, maxUint232, maxUint240, maxUint248, maxUint256;
  var init_number = __esm({
    "node_modules/viem/_esm/constants/number.js"() {
      maxInt8 = 2n ** (8n - 1n) - 1n;
      maxInt16 = 2n ** (16n - 1n) - 1n;
      maxInt24 = 2n ** (24n - 1n) - 1n;
      maxInt32 = 2n ** (32n - 1n) - 1n;
      maxInt40 = 2n ** (40n - 1n) - 1n;
      maxInt48 = 2n ** (48n - 1n) - 1n;
      maxInt56 = 2n ** (56n - 1n) - 1n;
      maxInt64 = 2n ** (64n - 1n) - 1n;
      maxInt72 = 2n ** (72n - 1n) - 1n;
      maxInt80 = 2n ** (80n - 1n) - 1n;
      maxInt88 = 2n ** (88n - 1n) - 1n;
      maxInt96 = 2n ** (96n - 1n) - 1n;
      maxInt104 = 2n ** (104n - 1n) - 1n;
      maxInt112 = 2n ** (112n - 1n) - 1n;
      maxInt120 = 2n ** (120n - 1n) - 1n;
      maxInt128 = 2n ** (128n - 1n) - 1n;
      maxInt136 = 2n ** (136n - 1n) - 1n;
      maxInt144 = 2n ** (144n - 1n) - 1n;
      maxInt152 = 2n ** (152n - 1n) - 1n;
      maxInt160 = 2n ** (160n - 1n) - 1n;
      maxInt168 = 2n ** (168n - 1n) - 1n;
      maxInt176 = 2n ** (176n - 1n) - 1n;
      maxInt184 = 2n ** (184n - 1n) - 1n;
      maxInt192 = 2n ** (192n - 1n) - 1n;
      maxInt200 = 2n ** (200n - 1n) - 1n;
      maxInt208 = 2n ** (208n - 1n) - 1n;
      maxInt216 = 2n ** (216n - 1n) - 1n;
      maxInt224 = 2n ** (224n - 1n) - 1n;
      maxInt232 = 2n ** (232n - 1n) - 1n;
      maxInt240 = 2n ** (240n - 1n) - 1n;
      maxInt248 = 2n ** (248n - 1n) - 1n;
      maxInt256 = 2n ** (256n - 1n) - 1n;
      minInt8 = -(2n ** (8n - 1n));
      minInt16 = -(2n ** (16n - 1n));
      minInt24 = -(2n ** (24n - 1n));
      minInt32 = -(2n ** (32n - 1n));
      minInt40 = -(2n ** (40n - 1n));
      minInt48 = -(2n ** (48n - 1n));
      minInt56 = -(2n ** (56n - 1n));
      minInt64 = -(2n ** (64n - 1n));
      minInt72 = -(2n ** (72n - 1n));
      minInt80 = -(2n ** (80n - 1n));
      minInt88 = -(2n ** (88n - 1n));
      minInt96 = -(2n ** (96n - 1n));
      minInt104 = -(2n ** (104n - 1n));
      minInt112 = -(2n ** (112n - 1n));
      minInt120 = -(2n ** (120n - 1n));
      minInt128 = -(2n ** (128n - 1n));
      minInt136 = -(2n ** (136n - 1n));
      minInt144 = -(2n ** (144n - 1n));
      minInt152 = -(2n ** (152n - 1n));
      minInt160 = -(2n ** (160n - 1n));
      minInt168 = -(2n ** (168n - 1n));
      minInt176 = -(2n ** (176n - 1n));
      minInt184 = -(2n ** (184n - 1n));
      minInt192 = -(2n ** (192n - 1n));
      minInt200 = -(2n ** (200n - 1n));
      minInt208 = -(2n ** (208n - 1n));
      minInt216 = -(2n ** (216n - 1n));
      minInt224 = -(2n ** (224n - 1n));
      minInt232 = -(2n ** (232n - 1n));
      minInt240 = -(2n ** (240n - 1n));
      minInt248 = -(2n ** (248n - 1n));
      minInt256 = -(2n ** (256n - 1n));
      maxUint8 = 2n ** 8n - 1n;
      maxUint16 = 2n ** 16n - 1n;
      maxUint24 = 2n ** 24n - 1n;
      maxUint32 = 2n ** 32n - 1n;
      maxUint40 = 2n ** 40n - 1n;
      maxUint48 = 2n ** 48n - 1n;
      maxUint56 = 2n ** 56n - 1n;
      maxUint64 = 2n ** 64n - 1n;
      maxUint72 = 2n ** 72n - 1n;
      maxUint80 = 2n ** 80n - 1n;
      maxUint88 = 2n ** 88n - 1n;
      maxUint96 = 2n ** 96n - 1n;
      maxUint104 = 2n ** 104n - 1n;
      maxUint112 = 2n ** 112n - 1n;
      maxUint120 = 2n ** 120n - 1n;
      maxUint128 = 2n ** 128n - 1n;
      maxUint136 = 2n ** 136n - 1n;
      maxUint144 = 2n ** 144n - 1n;
      maxUint152 = 2n ** 152n - 1n;
      maxUint160 = 2n ** 160n - 1n;
      maxUint168 = 2n ** 168n - 1n;
      maxUint176 = 2n ** 176n - 1n;
      maxUint184 = 2n ** 184n - 1n;
      maxUint192 = 2n ** 192n - 1n;
      maxUint200 = 2n ** 200n - 1n;
      maxUint208 = 2n ** 208n - 1n;
      maxUint216 = 2n ** 216n - 1n;
      maxUint224 = 2n ** 224n - 1n;
      maxUint232 = 2n ** 232n - 1n;
      maxUint240 = 2n ** 240n - 1n;
      maxUint248 = 2n ** 248n - 1n;
      maxUint256 = 2n ** 256n - 1n;
    }
  });

  // node_modules/viem/_esm/utils/transaction/assertRequest.js
  function assertRequest(args) {
    const { account: account_, gasPrice, maxFeePerGas, maxPriorityFeePerGas, to } = args;
    const account = account_ ? parseAccount(account_) : void 0;
    if (account && !isAddress(account.address))
      throw new InvalidAddressError({ address: account.address });
    if (to && !isAddress(to))
      throw new InvalidAddressError({ address: to });
    if (typeof gasPrice !== "undefined" && (typeof maxFeePerGas !== "undefined" || typeof maxPriorityFeePerGas !== "undefined"))
      throw new FeeConflictError();
    if (maxFeePerGas && maxFeePerGas > maxUint256)
      throw new FeeCapTooHighError({ maxFeePerGas });
    if (maxPriorityFeePerGas && maxFeePerGas && maxPriorityFeePerGas > maxFeePerGas)
      throw new TipAboveFeeCapError({ maxFeePerGas, maxPriorityFeePerGas });
  }
  var init_assertRequest = __esm({
    "node_modules/viem/_esm/utils/transaction/assertRequest.js"() {
      init_parseAccount();
      init_number();
      init_address();
      init_node();
      init_transaction();
      init_isAddress();
    }
  });

  // node_modules/viem/_esm/errors/fee.js
  var BaseFeeScalarError, Eip1559FeesNotSupportedError, MaxFeePerGasTooLowError;
  var init_fee = __esm({
    "node_modules/viem/_esm/errors/fee.js"() {
      init_formatGwei();
      init_base();
      BaseFeeScalarError = class extends BaseError2 {
        constructor() {
          super("`baseFeeMultiplier` must be greater than 1.", {
            name: "BaseFeeScalarError"
          });
        }
      };
      Eip1559FeesNotSupportedError = class extends BaseError2 {
        constructor() {
          super("Chain does not support EIP-1559 fees.", {
            name: "Eip1559FeesNotSupportedError"
          });
        }
      };
      MaxFeePerGasTooLowError = class extends BaseError2 {
        constructor({ maxPriorityFeePerGas }) {
          super(`\`maxFeePerGas\` cannot be less than the \`maxPriorityFeePerGas\` (${formatGwei(maxPriorityFeePerGas)} gwei).`, { name: "MaxFeePerGasTooLowError" });
        }
      };
    }
  });

  // node_modules/viem/_esm/errors/block.js
  var BlockNotFoundError;
  var init_block = __esm({
    "node_modules/viem/_esm/errors/block.js"() {
      init_base();
      BlockNotFoundError = class extends BaseError2 {
        constructor({ blockHash, blockNumber }) {
          let identifier = "Block";
          if (blockHash)
            identifier = `Block at hash "${blockHash}"`;
          if (blockNumber)
            identifier = `Block at number "${blockNumber}"`;
          super(`${identifier} could not be found.`, { name: "BlockNotFoundError" });
        }
      };
    }
  });

  // node_modules/viem/_esm/utils/formatters/transaction.js
  function formatTransaction(transaction, _) {
    const transaction_ = {
      ...transaction,
      blockHash: transaction.blockHash ? transaction.blockHash : null,
      blockNumber: transaction.blockNumber ? BigInt(transaction.blockNumber) : null,
      chainId: transaction.chainId ? hexToNumber(transaction.chainId) : void 0,
      gas: transaction.gas ? BigInt(transaction.gas) : void 0,
      gasPrice: transaction.gasPrice ? BigInt(transaction.gasPrice) : void 0,
      maxFeePerBlobGas: transaction.maxFeePerBlobGas ? BigInt(transaction.maxFeePerBlobGas) : void 0,
      maxFeePerGas: transaction.maxFeePerGas ? BigInt(transaction.maxFeePerGas) : void 0,
      maxPriorityFeePerGas: transaction.maxPriorityFeePerGas ? BigInt(transaction.maxPriorityFeePerGas) : void 0,
      nonce: transaction.nonce ? hexToNumber(transaction.nonce) : void 0,
      to: transaction.to ? transaction.to : null,
      transactionIndex: transaction.transactionIndex ? Number(transaction.transactionIndex) : null,
      type: transaction.type ? transactionType[transaction.type] : void 0,
      typeHex: transaction.type ? transaction.type : void 0,
      value: transaction.value ? BigInt(transaction.value) : void 0,
      v: transaction.v ? BigInt(transaction.v) : void 0
    };
    if (transaction.authorizationList)
      transaction_.authorizationList = formatAuthorizationList2(transaction.authorizationList);
    transaction_.yParity = (() => {
      if (transaction.yParity)
        return Number(transaction.yParity);
      if (typeof transaction_.v === "bigint") {
        if (transaction_.v === 0n || transaction_.v === 27n)
          return 0;
        if (transaction_.v === 1n || transaction_.v === 28n)
          return 1;
        if (transaction_.v >= 35n)
          return transaction_.v % 2n === 0n ? 1 : 0;
      }
      return void 0;
    })();
    if (transaction_.type === "legacy") {
      delete transaction_.accessList;
      delete transaction_.maxFeePerBlobGas;
      delete transaction_.maxFeePerGas;
      delete transaction_.maxPriorityFeePerGas;
      delete transaction_.yParity;
    }
    if (transaction_.type === "eip2930") {
      delete transaction_.maxFeePerBlobGas;
      delete transaction_.maxFeePerGas;
      delete transaction_.maxPriorityFeePerGas;
    }
    if (transaction_.type === "eip1559") {
      delete transaction_.maxFeePerBlobGas;
    }
    return transaction_;
  }
  function formatAuthorizationList2(authorizationList) {
    return authorizationList.map((authorization) => ({
      address: authorization.address,
      chainId: Number(authorization.chainId),
      nonce: Number(authorization.nonce),
      r: authorization.r,
      s: authorization.s,
      yParity: Number(authorization.yParity)
    }));
  }
  var transactionType, defineTransaction;
  var init_transaction2 = __esm({
    "node_modules/viem/_esm/utils/formatters/transaction.js"() {
      init_fromHex();
      init_formatter();
      transactionType = {
        "0x0": "legacy",
        "0x1": "eip2930",
        "0x2": "eip1559",
        "0x3": "eip4844",
        "0x4": "eip7702"
      };
      defineTransaction = /* @__PURE__ */ defineFormatter("transaction", formatTransaction);
    }
  });

  // node_modules/viem/_esm/utils/formatters/block.js
  function formatBlock(block, _) {
    const transactions = (block.transactions ?? []).map((transaction) => {
      if (typeof transaction === "string")
        return transaction;
      return formatTransaction(transaction);
    });
    return {
      ...block,
      baseFeePerGas: block.baseFeePerGas ? BigInt(block.baseFeePerGas) : null,
      blobGasUsed: block.blobGasUsed ? BigInt(block.blobGasUsed) : void 0,
      difficulty: block.difficulty ? BigInt(block.difficulty) : void 0,
      excessBlobGas: block.excessBlobGas ? BigInt(block.excessBlobGas) : void 0,
      gasLimit: block.gasLimit ? BigInt(block.gasLimit) : void 0,
      gasUsed: block.gasUsed ? BigInt(block.gasUsed) : void 0,
      hash: block.hash ? block.hash : null,
      logsBloom: block.logsBloom ? block.logsBloom : null,
      nonce: block.nonce ? block.nonce : null,
      number: block.number ? BigInt(block.number) : null,
      size: block.size ? BigInt(block.size) : void 0,
      timestamp: block.timestamp ? BigInt(block.timestamp) : void 0,
      transactions,
      totalDifficulty: block.totalDifficulty ? BigInt(block.totalDifficulty) : null
    };
  }
  var defineBlock;
  var init_block2 = __esm({
    "node_modules/viem/_esm/utils/formatters/block.js"() {
      init_formatter();
      init_transaction2();
      defineBlock = /* @__PURE__ */ defineFormatter("block", formatBlock);
    }
  });

  // node_modules/viem/_esm/actions/public/getBlock.js
  async function getBlock(client, { blockHash, blockNumber, blockTag = client.experimental_blockTag ?? "latest", includeTransactions: includeTransactions_ } = {}) {
    const includeTransactions = includeTransactions_ ?? false;
    const blockNumberHex = blockNumber !== void 0 ? numberToHex(blockNumber) : void 0;
    let block = null;
    if (blockHash) {
      block = await client.request({
        method: "eth_getBlockByHash",
        params: [blockHash, includeTransactions]
      }, { dedupe: true });
    } else {
      block = await client.request({
        method: "eth_getBlockByNumber",
        params: [blockNumberHex || blockTag, includeTransactions]
      }, { dedupe: Boolean(blockNumberHex) });
    }
    if (!block)
      throw new BlockNotFoundError({ blockHash, blockNumber });
    const format = client.chain?.formatters?.block?.format || formatBlock;
    return format(block, "getBlock");
  }
  var init_getBlock = __esm({
    "node_modules/viem/_esm/actions/public/getBlock.js"() {
      init_block();
      init_toHex();
      init_block2();
    }
  });

  // node_modules/viem/_esm/actions/public/getGasPrice.js
  async function getGasPrice(client) {
    const gasPrice = await client.request({
      method: "eth_gasPrice"
    });
    return BigInt(gasPrice);
  }
  var init_getGasPrice = __esm({
    "node_modules/viem/_esm/actions/public/getGasPrice.js"() {
    }
  });

  // node_modules/viem/_esm/actions/public/estimateMaxPriorityFeePerGas.js
  async function estimateMaxPriorityFeePerGas(client, args) {
    return internal_estimateMaxPriorityFeePerGas(client, args);
  }
  async function internal_estimateMaxPriorityFeePerGas(client, args) {
    const { block: block_, chain = client.chain, request } = args || {};
    try {
      const maxPriorityFeePerGas = chain?.fees?.maxPriorityFeePerGas ?? chain?.fees?.defaultPriorityFee;
      if (typeof maxPriorityFeePerGas === "function") {
        const block = block_ || await getAction(client, getBlock, "getBlock")({});
        const maxPriorityFeePerGas_ = await maxPriorityFeePerGas({
          block,
          client,
          request
        });
        if (maxPriorityFeePerGas_ === null)
          throw new Error();
        return maxPriorityFeePerGas_;
      }
      if (typeof maxPriorityFeePerGas !== "undefined")
        return maxPriorityFeePerGas;
      const maxPriorityFeePerGasHex = await client.request({
        method: "eth_maxPriorityFeePerGas"
      });
      return hexToBigInt(maxPriorityFeePerGasHex);
    } catch {
      const [block, gasPrice] = await Promise.all([
        block_ ? Promise.resolve(block_) : getAction(client, getBlock, "getBlock")({}),
        getAction(client, getGasPrice, "getGasPrice")({})
      ]);
      if (typeof block.baseFeePerGas !== "bigint")
        throw new Eip1559FeesNotSupportedError();
      const maxPriorityFeePerGas = gasPrice - block.baseFeePerGas;
      if (maxPriorityFeePerGas < 0n)
        return 0n;
      return maxPriorityFeePerGas;
    }
  }
  var init_estimateMaxPriorityFeePerGas = __esm({
    "node_modules/viem/_esm/actions/public/estimateMaxPriorityFeePerGas.js"() {
      init_fee();
      init_fromHex();
      init_getAction();
      init_getBlock();
      init_getGasPrice();
    }
  });

  // node_modules/viem/_esm/actions/public/estimateFeesPerGas.js
  async function estimateFeesPerGas(client, args) {
    return internal_estimateFeesPerGas(client, args);
  }
  async function internal_estimateFeesPerGas(client, args) {
    const { block: block_, chain = client.chain, request, type = "eip1559" } = args || {};
    const baseFeeMultiplier = await (async () => {
      if (typeof chain?.fees?.baseFeeMultiplier === "function")
        return chain.fees.baseFeeMultiplier({
          block: block_,
          client,
          request
        });
      return chain?.fees?.baseFeeMultiplier ?? 1.2;
    })();
    if (baseFeeMultiplier < 1)
      throw new BaseFeeScalarError();
    const decimals = baseFeeMultiplier.toString().split(".")[1]?.length ?? 0;
    const denominator = 10 ** decimals;
    const multiply = (base) => base * BigInt(Math.ceil(baseFeeMultiplier * denominator)) / BigInt(denominator);
    const block = block_ ? block_ : await getAction(client, getBlock, "getBlock")({});
    if (typeof chain?.fees?.estimateFeesPerGas === "function") {
      const fees = await chain.fees.estimateFeesPerGas({
        block: block_,
        client,
        multiply,
        request,
        type
      });
      if (fees !== null)
        return fees;
    }
    if (type === "eip1559") {
      if (typeof block.baseFeePerGas !== "bigint")
        throw new Eip1559FeesNotSupportedError();
      const maxPriorityFeePerGas = typeof request?.maxPriorityFeePerGas === "bigint" ? request.maxPriorityFeePerGas : await internal_estimateMaxPriorityFeePerGas(client, {
        block,
        chain,
        request
      });
      const baseFeePerGas = multiply(block.baseFeePerGas);
      const maxFeePerGas = request?.maxFeePerGas ?? baseFeePerGas + maxPriorityFeePerGas;
      return {
        maxFeePerGas,
        maxPriorityFeePerGas
      };
    }
    const gasPrice = request?.gasPrice ?? multiply(await getAction(client, getGasPrice, "getGasPrice")({}));
    return {
      gasPrice
    };
  }
  var init_estimateFeesPerGas = __esm({
    "node_modules/viem/_esm/actions/public/estimateFeesPerGas.js"() {
      init_fee();
      init_getAction();
      init_estimateMaxPriorityFeePerGas();
      init_getBlock();
      init_getGasPrice();
    }
  });

  // node_modules/viem/_esm/actions/public/getTransactionCount.js
  async function getTransactionCount(client, { address, blockTag = "latest", blockNumber }) {
    const count = await client.request({
      method: "eth_getTransactionCount",
      params: [
        address,
        typeof blockNumber === "bigint" ? numberToHex(blockNumber) : blockTag
      ]
    }, {
      dedupe: Boolean(blockNumber)
    });
    return hexToNumber(count);
  }
  var init_getTransactionCount = __esm({
    "node_modules/viem/_esm/actions/public/getTransactionCount.js"() {
      init_fromHex();
      init_toHex();
    }
  });

  // node_modules/viem/_esm/utils/blob/blobsToCommitments.js
  function blobsToCommitments(parameters) {
    const { kzg } = parameters;
    const to = parameters.to ?? (typeof parameters.blobs[0] === "string" ? "hex" : "bytes");
    const blobs = typeof parameters.blobs[0] === "string" ? parameters.blobs.map((x) => hexToBytes(x)) : parameters.blobs;
    const commitments = [];
    for (const blob of blobs)
      commitments.push(Uint8Array.from(kzg.blobToKzgCommitment(blob)));
    return to === "bytes" ? commitments : commitments.map((x) => bytesToHex(x));
  }
  var init_blobsToCommitments = __esm({
    "node_modules/viem/_esm/utils/blob/blobsToCommitments.js"() {
      init_toBytes();
      init_toHex();
    }
  });

  // node_modules/viem/_esm/utils/blob/blobsToProofs.js
  function blobsToProofs(parameters) {
    const { kzg } = parameters;
    const to = parameters.to ?? (typeof parameters.blobs[0] === "string" ? "hex" : "bytes");
    const blobs = typeof parameters.blobs[0] === "string" ? parameters.blobs.map((x) => hexToBytes(x)) : parameters.blobs;
    const commitments = typeof parameters.commitments[0] === "string" ? parameters.commitments.map((x) => hexToBytes(x)) : parameters.commitments;
    const proofs = [];
    for (let i = 0; i < blobs.length; i++) {
      const blob = blobs[i];
      const commitment = commitments[i];
      proofs.push(Uint8Array.from(kzg.computeBlobKzgProof(blob, commitment)));
    }
    return to === "bytes" ? proofs : proofs.map((x) => bytesToHex(x));
  }
  var init_blobsToProofs = __esm({
    "node_modules/viem/_esm/utils/blob/blobsToProofs.js"() {
      init_toBytes();
      init_toHex();
    }
  });

  // node_modules/@noble/hashes/esm/sha256.js
  var sha2562;
  var init_sha256 = __esm({
    "node_modules/@noble/hashes/esm/sha256.js"() {
      init_sha2();
      sha2562 = sha256;
    }
  });

  // node_modules/viem/_esm/utils/hash/sha256.js
  function sha2563(value, to_) {
    const to = to_ || "hex";
    const bytes = sha2562(isHex(value, { strict: false }) ? toBytes(value) : value);
    if (to === "bytes")
      return bytes;
    return toHex(bytes);
  }
  var init_sha2562 = __esm({
    "node_modules/viem/_esm/utils/hash/sha256.js"() {
      init_sha256();
      init_isHex();
      init_toBytes();
      init_toHex();
    }
  });

  // node_modules/viem/_esm/utils/blob/commitmentToVersionedHash.js
  function commitmentToVersionedHash(parameters) {
    const { commitment, version: version4 = 1 } = parameters;
    const to = parameters.to ?? (typeof commitment === "string" ? "hex" : "bytes");
    const versionedHash = sha2563(commitment, "bytes");
    versionedHash.set([version4], 0);
    return to === "bytes" ? versionedHash : bytesToHex(versionedHash);
  }
  var init_commitmentToVersionedHash = __esm({
    "node_modules/viem/_esm/utils/blob/commitmentToVersionedHash.js"() {
      init_toHex();
      init_sha2562();
    }
  });

  // node_modules/viem/_esm/utils/blob/commitmentsToVersionedHashes.js
  function commitmentsToVersionedHashes(parameters) {
    const { commitments, version: version4 } = parameters;
    const to = parameters.to ?? (typeof commitments[0] === "string" ? "hex" : "bytes");
    const hashes = [];
    for (const commitment of commitments) {
      hashes.push(commitmentToVersionedHash({
        commitment,
        to,
        version: version4
      }));
    }
    return hashes;
  }
  var init_commitmentsToVersionedHashes = __esm({
    "node_modules/viem/_esm/utils/blob/commitmentsToVersionedHashes.js"() {
      init_commitmentToVersionedHash();
    }
  });

  // node_modules/viem/_esm/constants/blob.js
  var blobsPerTransaction, bytesPerFieldElement, fieldElementsPerBlob, bytesPerBlob, maxBytesPerTransaction;
  var init_blob = __esm({
    "node_modules/viem/_esm/constants/blob.js"() {
      blobsPerTransaction = 6;
      bytesPerFieldElement = 32;
      fieldElementsPerBlob = 4096;
      bytesPerBlob = bytesPerFieldElement * fieldElementsPerBlob;
      maxBytesPerTransaction = bytesPerBlob * blobsPerTransaction - // terminator byte (0x80).
      1 - // zero byte (0x00) appended to each field element.
      1 * fieldElementsPerBlob * blobsPerTransaction;
    }
  });

  // node_modules/viem/_esm/constants/kzg.js
  var versionedHashVersionKzg;
  var init_kzg = __esm({
    "node_modules/viem/_esm/constants/kzg.js"() {
      versionedHashVersionKzg = 1;
    }
  });

  // node_modules/viem/_esm/errors/blob.js
  var BlobSizeTooLargeError, EmptyBlobError, InvalidVersionedHashSizeError, InvalidVersionedHashVersionError;
  var init_blob2 = __esm({
    "node_modules/viem/_esm/errors/blob.js"() {
      init_kzg();
      init_base();
      BlobSizeTooLargeError = class extends BaseError2 {
        constructor({ maxSize, size: size5 }) {
          super("Blob size is too large.", {
            metaMessages: [`Max: ${maxSize} bytes`, `Given: ${size5} bytes`],
            name: "BlobSizeTooLargeError"
          });
        }
      };
      EmptyBlobError = class extends BaseError2 {
        constructor() {
          super("Blob data must not be empty.", { name: "EmptyBlobError" });
        }
      };
      InvalidVersionedHashSizeError = class extends BaseError2 {
        constructor({ hash: hash3, size: size5 }) {
          super(`Versioned hash "${hash3}" size is invalid.`, {
            metaMessages: ["Expected: 32", `Received: ${size5}`],
            name: "InvalidVersionedHashSizeError"
          });
        }
      };
      InvalidVersionedHashVersionError = class extends BaseError2 {
        constructor({ hash: hash3, version: version4 }) {
          super(`Versioned hash "${hash3}" version is invalid.`, {
            metaMessages: [
              `Expected: ${versionedHashVersionKzg}`,
              `Received: ${version4}`
            ],
            name: "InvalidVersionedHashVersionError"
          });
        }
      };
    }
  });

  // node_modules/viem/_esm/utils/blob/toBlobs.js
  function toBlobs(parameters) {
    const to = parameters.to ?? (typeof parameters.data === "string" ? "hex" : "bytes");
    const data = typeof parameters.data === "string" ? hexToBytes(parameters.data) : parameters.data;
    const size_ = size(data);
    if (!size_)
      throw new EmptyBlobError();
    if (size_ > maxBytesPerTransaction)
      throw new BlobSizeTooLargeError({
        maxSize: maxBytesPerTransaction,
        size: size_
      });
    const blobs = [];
    let active = true;
    let position = 0;
    while (active) {
      const blob = createCursor(new Uint8Array(bytesPerBlob));
      let size5 = 0;
      while (size5 < fieldElementsPerBlob) {
        const bytes = data.slice(position, position + (bytesPerFieldElement - 1));
        blob.pushByte(0);
        blob.pushBytes(bytes);
        if (bytes.length < 31) {
          blob.pushByte(128);
          active = false;
          break;
        }
        size5++;
        position += 31;
      }
      blobs.push(blob);
    }
    return to === "bytes" ? blobs.map((x) => x.bytes) : blobs.map((x) => bytesToHex(x.bytes));
  }
  var init_toBlobs = __esm({
    "node_modules/viem/_esm/utils/blob/toBlobs.js"() {
      init_blob();
      init_blob2();
      init_cursor2();
      init_size();
      init_toBytes();
      init_toHex();
    }
  });

  // node_modules/viem/_esm/utils/blob/toBlobSidecars.js
  function toBlobSidecars(parameters) {
    const { data, kzg, to } = parameters;
    const blobs = parameters.blobs ?? toBlobs({ data, to });
    const commitments = parameters.commitments ?? blobsToCommitments({ blobs, kzg, to });
    const proofs = parameters.proofs ?? blobsToProofs({ blobs, commitments, kzg, to });
    const sidecars = [];
    for (let i = 0; i < blobs.length; i++)
      sidecars.push({
        blob: blobs[i],
        commitment: commitments[i],
        proof: proofs[i]
      });
    return sidecars;
  }
  var init_toBlobSidecars = __esm({
    "node_modules/viem/_esm/utils/blob/toBlobSidecars.js"() {
      init_blobsToCommitments();
      init_blobsToProofs();
      init_toBlobs();
    }
  });

  // node_modules/viem/_esm/utils/transaction/getTransactionType.js
  function getTransactionType(transaction) {
    if (transaction.type)
      return transaction.type;
    if (typeof transaction.authorizationList !== "undefined")
      return "eip7702";
    if (typeof transaction.blobs !== "undefined" || typeof transaction.blobVersionedHashes !== "undefined" || typeof transaction.maxFeePerBlobGas !== "undefined" || typeof transaction.sidecars !== "undefined")
      return "eip4844";
    if (typeof transaction.maxFeePerGas !== "undefined" || typeof transaction.maxPriorityFeePerGas !== "undefined") {
      return "eip1559";
    }
    if (typeof transaction.gasPrice !== "undefined") {
      if (typeof transaction.accessList !== "undefined")
        return "eip2930";
      return "legacy";
    }
    throw new InvalidSerializableTransactionError({ transaction });
  }
  var init_getTransactionType = __esm({
    "node_modules/viem/_esm/utils/transaction/getTransactionType.js"() {
      init_transaction();
    }
  });

  // node_modules/viem/_esm/actions/public/getChainId.js
  async function getChainId(client) {
    const chainIdHex = await client.request({
      method: "eth_chainId"
    }, { dedupe: true });
    return hexToNumber(chainIdHex);
  }
  var init_getChainId = __esm({
    "node_modules/viem/_esm/actions/public/getChainId.js"() {
      init_fromHex();
    }
  });

  // node_modules/viem/_esm/actions/wallet/prepareTransactionRequest.js
  async function prepareTransactionRequest(client, args) {
    const { account: account_ = client.account, blobs, chain, gas, kzg, nonce, nonceManager: nonceManager2, parameters = defaultParameters, type } = args;
    const account = account_ ? parseAccount(account_) : account_;
    const request = { ...args, ...account ? { from: account?.address } : {} };
    let block;
    async function getBlock2() {
      if (block)
        return block;
      block = await getAction(client, getBlock, "getBlock")({ blockTag: "latest" });
      return block;
    }
    let chainId;
    async function getChainId2() {
      if (chainId)
        return chainId;
      if (chain)
        return chain.id;
      if (typeof args.chainId !== "undefined")
        return args.chainId;
      const chainId_ = await getAction(client, getChainId, "getChainId")({});
      chainId = chainId_;
      return chainId;
    }
    if (parameters.includes("nonce") && typeof nonce === "undefined" && account) {
      if (nonceManager2) {
        const chainId2 = await getChainId2();
        request.nonce = await nonceManager2.consume({
          address: account.address,
          chainId: chainId2,
          client
        });
      } else {
        request.nonce = await getAction(client, getTransactionCount, "getTransactionCount")({
          address: account.address,
          blockTag: "pending"
        });
      }
    }
    if ((parameters.includes("blobVersionedHashes") || parameters.includes("sidecars")) && blobs && kzg) {
      const commitments = blobsToCommitments({ blobs, kzg });
      if (parameters.includes("blobVersionedHashes")) {
        const versionedHashes = commitmentsToVersionedHashes({
          commitments,
          to: "hex"
        });
        request.blobVersionedHashes = versionedHashes;
      }
      if (parameters.includes("sidecars")) {
        const proofs = blobsToProofs({ blobs, commitments, kzg });
        const sidecars = toBlobSidecars({
          blobs,
          commitments,
          proofs,
          to: "hex"
        });
        request.sidecars = sidecars;
      }
    }
    if (parameters.includes("chainId"))
      request.chainId = await getChainId2();
    if ((parameters.includes("fees") || parameters.includes("type")) && typeof type === "undefined") {
      try {
        request.type = getTransactionType(request);
      } catch {
        let isEip1559Network = eip1559NetworkCache.get(client.uid);
        if (typeof isEip1559Network === "undefined") {
          const block2 = await getBlock2();
          isEip1559Network = typeof block2?.baseFeePerGas === "bigint";
          eip1559NetworkCache.set(client.uid, isEip1559Network);
        }
        request.type = isEip1559Network ? "eip1559" : "legacy";
      }
    }
    if (parameters.includes("fees")) {
      if (request.type !== "legacy" && request.type !== "eip2930") {
        if (typeof request.maxFeePerGas === "undefined" || typeof request.maxPriorityFeePerGas === "undefined") {
          const block2 = await getBlock2();
          const { maxFeePerGas, maxPriorityFeePerGas } = await internal_estimateFeesPerGas(client, {
            block: block2,
            chain,
            request
          });
          if (typeof args.maxPriorityFeePerGas === "undefined" && args.maxFeePerGas && args.maxFeePerGas < maxPriorityFeePerGas)
            throw new MaxFeePerGasTooLowError({
              maxPriorityFeePerGas
            });
          request.maxPriorityFeePerGas = maxPriorityFeePerGas;
          request.maxFeePerGas = maxFeePerGas;
        }
      } else {
        if (typeof args.maxFeePerGas !== "undefined" || typeof args.maxPriorityFeePerGas !== "undefined")
          throw new Eip1559FeesNotSupportedError();
        if (typeof args.gasPrice === "undefined") {
          const block2 = await getBlock2();
          const { gasPrice: gasPrice_ } = await internal_estimateFeesPerGas(client, {
            block: block2,
            chain,
            request,
            type: "legacy"
          });
          request.gasPrice = gasPrice_;
        }
      }
    }
    if (parameters.includes("gas") && typeof gas === "undefined")
      request.gas = await getAction(client, estimateGas, "estimateGas")({
        ...request,
        account: account ? { address: account.address, type: "json-rpc" } : account
      });
    assertRequest(request);
    delete request.parameters;
    return request;
  }
  var defaultParameters, eip1559NetworkCache;
  var init_prepareTransactionRequest = __esm({
    "node_modules/viem/_esm/actions/wallet/prepareTransactionRequest.js"() {
      init_parseAccount();
      init_estimateFeesPerGas();
      init_estimateGas2();
      init_getBlock();
      init_getTransactionCount();
      init_fee();
      init_blobsToCommitments();
      init_blobsToProofs();
      init_commitmentsToVersionedHashes();
      init_toBlobSidecars();
      init_getAction();
      init_assertRequest();
      init_getTransactionType();
      init_getChainId();
      defaultParameters = [
        "blobVersionedHashes",
        "chainId",
        "fees",
        "gas",
        "nonce",
        "type"
      ];
      eip1559NetworkCache = /* @__PURE__ */ new Map();
    }
  });

  // node_modules/viem/_esm/actions/public/estimateGas.js
  async function estimateGas(client, args) {
    const { account: account_ = client.account } = args;
    const account = account_ ? parseAccount(account_) : void 0;
    try {
      const { accessList, authorizationList, blobs, blobVersionedHashes, blockNumber, blockTag, data, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, nonce, value, stateOverride, ...rest } = await prepareTransactionRequest(client, {
        ...args,
        parameters: (
          // Some RPC Providers do not compute versioned hashes from blobs. We will need
          // to compute them.
          account?.type === "local" ? void 0 : ["blobVersionedHashes"]
        )
      });
      const blockNumberHex = typeof blockNumber === "bigint" ? numberToHex(blockNumber) : void 0;
      const block = blockNumberHex || blockTag;
      const rpcStateOverride = serializeStateOverride(stateOverride);
      const to = await (async () => {
        if (rest.to)
          return rest.to;
        if (authorizationList && authorizationList.length > 0)
          return await recoverAuthorizationAddress({
            authorization: authorizationList[0]
          }).catch(() => {
            throw new BaseError2("`to` is required. Could not infer from `authorizationList`");
          });
        return void 0;
      })();
      assertRequest(args);
      const chainFormat = client.chain?.formatters?.transactionRequest?.format;
      const format = chainFormat || formatTransactionRequest;
      const request = format({
        // Pick out extra data that might exist on the chain's transaction request type.
        ...extract(rest, { format: chainFormat }),
        from: account?.address,
        accessList,
        authorizationList,
        blobs,
        blobVersionedHashes,
        data,
        gas,
        gasPrice,
        maxFeePerBlobGas,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        to,
        value
      }, "estimateGas");
      return BigInt(await client.request({
        method: "eth_estimateGas",
        params: rpcStateOverride ? [
          request,
          block ?? client.experimental_blockTag ?? "latest",
          rpcStateOverride
        ] : block ? [request, block] : [request]
      }));
    } catch (err) {
      throw getEstimateGasError(err, {
        ...args,
        account,
        chain: client.chain
      });
    }
  }
  var init_estimateGas2 = __esm({
    "node_modules/viem/_esm/actions/public/estimateGas.js"() {
      init_parseAccount();
      init_base();
      init_recoverAuthorizationAddress();
      init_toHex();
      init_getEstimateGasError();
      init_extract();
      init_transactionRequest();
      init_stateOverride2();
      init_assertRequest();
      init_prepareTransactionRequest();
    }
  });

  // node_modules/viem/_esm/actions/public/estimateContractGas.js
  async function estimateContractGas(client, parameters) {
    const { abi: abi3, address, args, functionName, dataSuffix, ...request } = parameters;
    const data = encodeFunctionData({
      abi: abi3,
      args,
      functionName
    });
    try {
      const gas = await getAction(client, estimateGas, "estimateGas")({
        data: `${data}${dataSuffix ? dataSuffix.replace("0x", "") : ""}`,
        to: address,
        ...request
      });
      return gas;
    } catch (error) {
      const account = request.account ? parseAccount(request.account) : void 0;
      throw getContractError(error, {
        abi: abi3,
        address,
        args,
        docsPath: "/docs/contract/estimateContractGas",
        functionName,
        sender: account?.address
      });
    }
  }
  var init_estimateContractGas = __esm({
    "node_modules/viem/_esm/actions/public/estimateContractGas.js"() {
      init_parseAccount();
      init_encodeFunctionData();
      init_getContractError();
      init_getAction();
      init_estimateGas2();
    }
  });

  // node_modules/viem/_esm/utils/address/isAddressEqual.js
  function isAddressEqual(a, b) {
    if (!isAddress(a, { strict: false }))
      throw new InvalidAddressError({ address: a });
    if (!isAddress(b, { strict: false }))
      throw new InvalidAddressError({ address: b });
    return a.toLowerCase() === b.toLowerCase();
  }
  var init_isAddressEqual = __esm({
    "node_modules/viem/_esm/utils/address/isAddressEqual.js"() {
      init_address();
      init_isAddress();
    }
  });

  // node_modules/viem/_esm/utils/abi/decodeEventLog.js
  function decodeEventLog(parameters) {
    const { abi: abi3, data, strict: strict_, topics } = parameters;
    const strict = strict_ ?? true;
    const [signature, ...argTopics] = topics;
    if (!signature)
      throw new AbiEventSignatureEmptyTopicsError({ docsPath: docsPath3 });
    const abiItem = abi3.find((x) => x.type === "event" && signature === toEventSelector(formatAbiItem2(x)));
    if (!(abiItem && "name" in abiItem) || abiItem.type !== "event")
      throw new AbiEventSignatureNotFoundError(signature, { docsPath: docsPath3 });
    const { name, inputs } = abiItem;
    const isUnnamed = inputs?.some((x) => !("name" in x && x.name));
    const args = isUnnamed ? [] : {};
    const indexedInputs = inputs.map((x, i) => [x, i]).filter(([x]) => "indexed" in x && x.indexed);
    for (let i = 0; i < indexedInputs.length; i++) {
      const [param, argIndex] = indexedInputs[i];
      const topic = argTopics[i];
      if (!topic)
        throw new DecodeLogTopicsMismatch({
          abiItem,
          param
        });
      args[isUnnamed ? argIndex : param.name || argIndex] = decodeTopic({
        param,
        value: topic
      });
    }
    const nonIndexedInputs = inputs.filter((x) => !("indexed" in x && x.indexed));
    if (nonIndexedInputs.length > 0) {
      if (data && data !== "0x") {
        try {
          const decodedData = decodeAbiParameters(nonIndexedInputs, data);
          if (decodedData) {
            if (isUnnamed)
              for (let i = 0; i < inputs.length; i++)
                args[i] = args[i] ?? decodedData.shift();
            else
              for (let i = 0; i < nonIndexedInputs.length; i++)
                args[nonIndexedInputs[i].name] = decodedData[i];
          }
        } catch (err) {
          if (strict) {
            if (err instanceof AbiDecodingDataSizeTooSmallError || err instanceof PositionOutOfBoundsError)
              throw new DecodeLogDataMismatch({
                abiItem,
                data,
                params: nonIndexedInputs,
                size: size(data)
              });
            throw err;
          }
        }
      } else if (strict) {
        throw new DecodeLogDataMismatch({
          abiItem,
          data: "0x",
          params: nonIndexedInputs,
          size: 0
        });
      }
    }
    return {
      eventName: name,
      args: Object.values(args).length > 0 ? args : void 0
    };
  }
  function decodeTopic({ param, value }) {
    if (param.type === "string" || param.type === "bytes" || param.type === "tuple" || param.type.match(/^(.*)\[(\d+)?\]$/))
      return value;
    const decodedArg = decodeAbiParameters([param], value) || [];
    return decodedArg[0];
  }
  var docsPath3;
  var init_decodeEventLog = __esm({
    "node_modules/viem/_esm/utils/abi/decodeEventLog.js"() {
      init_abi();
      init_cursor();
      init_size();
      init_toEventSelector();
      init_decodeAbiParameters();
      init_formatAbiItem2();
      docsPath3 = "/docs/contract/decodeEventLog";
    }
  });

  // node_modules/viem/_esm/utils/abi/parseEventLogs.js
  function parseEventLogs(parameters) {
    const { abi: abi3, args, logs, strict = true } = parameters;
    const eventName = (() => {
      if (!parameters.eventName)
        return void 0;
      if (Array.isArray(parameters.eventName))
        return parameters.eventName;
      return [parameters.eventName];
    })();
    return logs.map((log) => {
      try {
        const abiItem = abi3.find((abiItem2) => abiItem2.type === "event" && log.topics[0] === toEventSelector(abiItem2));
        if (!abiItem)
          return null;
        const event = decodeEventLog({
          ...log,
          abi: [abiItem],
          strict
        });
        if (eventName && !eventName.includes(event.eventName))
          return null;
        if (!includesArgs({
          args: event.args,
          inputs: abiItem.inputs,
          matchArgs: args
        }))
          return null;
        return { ...event, ...log };
      } catch (err) {
        let eventName2;
        let isUnnamed;
        if (err instanceof AbiEventSignatureNotFoundError)
          return null;
        if (err instanceof DecodeLogDataMismatch || err instanceof DecodeLogTopicsMismatch) {
          if (strict)
            return null;
          eventName2 = err.abiItem.name;
          isUnnamed = err.abiItem.inputs?.some((x) => !("name" in x && x.name));
        }
        return { ...log, args: isUnnamed ? [] : {}, eventName: eventName2 };
      }
    }).filter(Boolean);
  }
  function includesArgs(parameters) {
    const { args, inputs, matchArgs } = parameters;
    if (!matchArgs)
      return true;
    if (!args)
      return false;
    function isEqual2(input, value, arg) {
      try {
        if (input.type === "address")
          return isAddressEqual(value, arg);
        if (input.type === "string" || input.type === "bytes")
          return keccak256(toBytes(value)) === arg;
        return value === arg;
      } catch {
        return false;
      }
    }
    if (Array.isArray(args) && Array.isArray(matchArgs)) {
      return matchArgs.every((value, index2) => {
        if (value === null || value === void 0)
          return true;
        const input = inputs[index2];
        if (!input)
          return false;
        const value_ = Array.isArray(value) ? value : [value];
        return value_.some((value2) => isEqual2(input, value2, args[index2]));
      });
    }
    if (typeof args === "object" && !Array.isArray(args) && typeof matchArgs === "object" && !Array.isArray(matchArgs))
      return Object.entries(matchArgs).every(([key, value]) => {
        if (value === null || value === void 0)
          return true;
        const input = inputs.find((input2) => input2.name === key);
        if (!input)
          return false;
        const value_ = Array.isArray(value) ? value : [value];
        return value_.some((value2) => isEqual2(input, value2, args[key]));
      });
    return false;
  }
  var init_parseEventLogs = __esm({
    "node_modules/viem/_esm/utils/abi/parseEventLogs.js"() {
      init_abi();
      init_isAddressEqual();
      init_toBytes();
      init_keccak256();
      init_toEventSelector();
      init_decodeEventLog();
    }
  });

  // node_modules/viem/_esm/utils/formatters/log.js
  function formatLog(log, { args, eventName } = {}) {
    return {
      ...log,
      blockHash: log.blockHash ? log.blockHash : null,
      blockNumber: log.blockNumber ? BigInt(log.blockNumber) : null,
      logIndex: log.logIndex ? Number(log.logIndex) : null,
      transactionHash: log.transactionHash ? log.transactionHash : null,
      transactionIndex: log.transactionIndex ? Number(log.transactionIndex) : null,
      ...eventName ? { args, eventName } : {}
    };
  }
  var init_log2 = __esm({
    "node_modules/viem/_esm/utils/formatters/log.js"() {
    }
  });

  // node_modules/viem/_esm/actions/public/getLogs.js
  async function getLogs(client, { address, blockHash, fromBlock, toBlock, event, events: events_, args, strict: strict_ } = {}) {
    const strict = strict_ ?? false;
    const events = events_ ?? (event ? [event] : void 0);
    let topics = [];
    if (events) {
      const encoded = events.flatMap((event2) => encodeEventTopics({
        abi: [event2],
        eventName: event2.name,
        args: events_ ? void 0 : args
      }));
      topics = [encoded];
      if (event)
        topics = topics[0];
    }
    let logs;
    if (blockHash) {
      logs = await client.request({
        method: "eth_getLogs",
        params: [{ address, topics, blockHash }]
      });
    } else {
      logs = await client.request({
        method: "eth_getLogs",
        params: [
          {
            address,
            topics,
            fromBlock: typeof fromBlock === "bigint" ? numberToHex(fromBlock) : fromBlock,
            toBlock: typeof toBlock === "bigint" ? numberToHex(toBlock) : toBlock
          }
        ]
      });
    }
    const formattedLogs = logs.map((log) => formatLog(log));
    if (!events)
      return formattedLogs;
    return parseEventLogs({
      abi: events,
      args,
      logs: formattedLogs,
      strict
    });
  }
  var init_getLogs = __esm({
    "node_modules/viem/_esm/actions/public/getLogs.js"() {
      init_encodeEventTopics();
      init_parseEventLogs();
      init_toHex();
      init_log2();
    }
  });

  // node_modules/viem/_esm/actions/public/getContractEvents.js
  async function getContractEvents(client, parameters) {
    const { abi: abi3, address, args, blockHash, eventName, fromBlock, toBlock, strict } = parameters;
    const event = eventName ? getAbiItem({ abi: abi3, name: eventName }) : void 0;
    const events = !event ? abi3.filter((x) => x.type === "event") : void 0;
    return getAction(client, getLogs, "getLogs")({
      address,
      args,
      blockHash,
      event,
      events,
      fromBlock,
      toBlock,
      strict
    });
  }
  var init_getContractEvents = __esm({
    "node_modules/viem/_esm/actions/public/getContractEvents.js"() {
      init_getAbiItem();
      init_getAction();
      init_getLogs();
    }
  });

  // node_modules/viem/_esm/utils/abi/decodeFunctionResult.js
  function decodeFunctionResult(parameters) {
    const { abi: abi3, args, functionName, data } = parameters;
    let abiItem = abi3[0];
    if (functionName) {
      const item = getAbiItem({ abi: abi3, args, name: functionName });
      if (!item)
        throw new AbiFunctionNotFoundError(functionName, { docsPath: docsPath4 });
      abiItem = item;
    }
    if (abiItem.type !== "function")
      throw new AbiFunctionNotFoundError(void 0, { docsPath: docsPath4 });
    if (!abiItem.outputs)
      throw new AbiFunctionOutputsNotFoundError(abiItem.name, { docsPath: docsPath4 });
    const values = decodeAbiParameters(abiItem.outputs, data);
    if (values && values.length > 1)
      return values;
    if (values && values.length === 1)
      return values[0];
    return void 0;
  }
  var docsPath4;
  var init_decodeFunctionResult = __esm({
    "node_modules/viem/_esm/utils/abi/decodeFunctionResult.js"() {
      init_abi();
      init_decodeAbiParameters();
      init_getAbiItem();
      docsPath4 = "/docs/contract/decodeFunctionResult";
    }
  });

  // node_modules/ox/node_modules/@noble/curves/esm/abstract/utils.js
  function isBytes3(a) {
    return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
  }
  function abytes3(item) {
    if (!isBytes3(item))
      throw new Error("Uint8Array expected");
  }
  function abool2(title, value) {
    if (typeof value !== "boolean")
      throw new Error(title + " boolean expected, got " + value);
  }
  function numberToHexUnpadded2(num2) {
    const hex = num2.toString(16);
    return hex.length & 1 ? "0" + hex : hex;
  }
  function hexToNumber3(hex) {
    if (typeof hex !== "string")
      throw new Error("hex string expected, got " + typeof hex);
    return hex === "" ? _0n7 : BigInt("0x" + hex);
  }
  function bytesToHex3(bytes) {
    abytes3(bytes);
    if (hasHexBuiltin2)
      return bytes.toHex();
    let hex = "";
    for (let i = 0; i < bytes.length; i++) {
      hex += hexes3[bytes[i]];
    }
    return hex;
  }
  function asciiToBase162(ch) {
    if (ch >= asciis2._0 && ch <= asciis2._9)
      return ch - asciis2._0;
    if (ch >= asciis2.A && ch <= asciis2.F)
      return ch - (asciis2.A - 10);
    if (ch >= asciis2.a && ch <= asciis2.f)
      return ch - (asciis2.a - 10);
    return;
  }
  function hexToBytes3(hex) {
    if (typeof hex !== "string")
      throw new Error("hex string expected, got " + typeof hex);
    if (hasHexBuiltin2)
      return Uint8Array.fromHex(hex);
    const hl = hex.length;
    const al = hl / 2;
    if (hl % 2)
      throw new Error("hex string expected, got unpadded hex of length " + hl);
    const array = new Uint8Array(al);
    for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
      const n1 = asciiToBase162(hex.charCodeAt(hi));
      const n2 = asciiToBase162(hex.charCodeAt(hi + 1));
      if (n1 === void 0 || n2 === void 0) {
        const char = hex[hi] + hex[hi + 1];
        throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
      }
      array[ai] = n1 * 16 + n2;
    }
    return array;
  }
  function bytesToNumberBE2(bytes) {
    return hexToNumber3(bytesToHex3(bytes));
  }
  function bytesToNumberLE2(bytes) {
    abytes3(bytes);
    return hexToNumber3(bytesToHex3(Uint8Array.from(bytes).reverse()));
  }
  function numberToBytesBE2(n, len) {
    return hexToBytes3(n.toString(16).padStart(len * 2, "0"));
  }
  function numberToBytesLE2(n, len) {
    return numberToBytesBE2(n, len).reverse();
  }
  function ensureBytes2(title, hex, expectedLength) {
    let res;
    if (typeof hex === "string") {
      try {
        res = hexToBytes3(hex);
      } catch (e) {
        throw new Error(title + " must be hex string or Uint8Array, cause: " + e);
      }
    } else if (isBytes3(hex)) {
      res = Uint8Array.from(hex);
    } else {
      throw new Error(title + " must be hex string or Uint8Array");
    }
    const len = res.length;
    if (typeof expectedLength === "number" && len !== expectedLength)
      throw new Error(title + " of length " + expectedLength + " expected, got " + len);
    return res;
  }
  function concatBytes4(...arrays) {
    let sum = 0;
    for (let i = 0; i < arrays.length; i++) {
      const a = arrays[i];
      abytes3(a);
      sum += a.length;
    }
    const res = new Uint8Array(sum);
    for (let i = 0, pad4 = 0; i < arrays.length; i++) {
      const a = arrays[i];
      res.set(a, pad4);
      pad4 += a.length;
    }
    return res;
  }
  function inRange2(n, min, max) {
    return isPosBig2(n) && isPosBig2(min) && isPosBig2(max) && min <= n && n < max;
  }
  function aInRange2(title, n, min, max) {
    if (!inRange2(n, min, max))
      throw new Error("expected valid " + title + ": " + min + " <= n < " + max + ", got " + n);
  }
  function bitLen2(n) {
    let len;
    for (len = 0; n > _0n7; n >>= _1n7, len += 1)
      ;
    return len;
  }
  function createHmacDrbg2(hashLen, qByteLen, hmacFn) {
    if (typeof hashLen !== "number" || hashLen < 2)
      throw new Error("hashLen must be a number");
    if (typeof qByteLen !== "number" || qByteLen < 2)
      throw new Error("qByteLen must be a number");
    if (typeof hmacFn !== "function")
      throw new Error("hmacFn must be a function");
    let v = u8n2(hashLen);
    let k = u8n2(hashLen);
    let i = 0;
    const reset = () => {
      v.fill(1);
      k.fill(0);
      i = 0;
    };
    const h = (...b) => hmacFn(k, v, ...b);
    const reseed = (seed = u8n2(0)) => {
      k = h(u8fr2([0]), seed);
      v = h();
      if (seed.length === 0)
        return;
      k = h(u8fr2([1]), seed);
      v = h();
    };
    const gen2 = () => {
      if (i++ >= 1e3)
        throw new Error("drbg: tried 1000 values");
      let len = 0;
      const out = [];
      while (len < qByteLen) {
        v = h();
        const sl = v.slice();
        out.push(sl);
        len += v.length;
      }
      return concatBytes4(...out);
    };
    const genUntil = (seed, pred) => {
      reset();
      reseed(seed);
      let res = void 0;
      while (!(res = pred(gen2())))
        reseed();
      reset();
      return res;
    };
    return genUntil;
  }
  function validateObject2(object, validators, optValidators = {}) {
    const checkField = (fieldName, type, isOptional) => {
      const checkVal = validatorFns2[type];
      if (typeof checkVal !== "function")
        throw new Error("invalid validator function");
      const val = object[fieldName];
      if (isOptional && val === void 0)
        return;
      if (!checkVal(val, object)) {
        throw new Error("param " + String(fieldName) + " is invalid. Expected " + type + ", got " + val);
      }
    };
    for (const [fieldName, type] of Object.entries(validators))
      checkField(fieldName, type, false);
    for (const [fieldName, type] of Object.entries(optValidators))
      checkField(fieldName, type, true);
    return object;
  }
  function memoized2(fn) {
    const map = /* @__PURE__ */ new WeakMap();
    return (arg, ...args) => {
      const val = map.get(arg);
      if (val !== void 0)
        return val;
      const computed = fn(arg, ...args);
      map.set(arg, computed);
      return computed;
    };
  }
  var _0n7, _1n7, hasHexBuiltin2, hexes3, asciis2, isPosBig2, bitMask2, u8n2, u8fr2, validatorFns2;
  var init_utils5 = __esm({
    "node_modules/ox/node_modules/@noble/curves/esm/abstract/utils.js"() {
      _0n7 = /* @__PURE__ */ BigInt(0);
      _1n7 = /* @__PURE__ */ BigInt(1);
      hasHexBuiltin2 = // @ts-ignore
      typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function";
      hexes3 = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
      asciis2 = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
      isPosBig2 = (n) => typeof n === "bigint" && _0n7 <= n;
      bitMask2 = (n) => (_1n7 << BigInt(n)) - _1n7;
      u8n2 = (len) => new Uint8Array(len);
      u8fr2 = (arr) => Uint8Array.from(arr);
      validatorFns2 = {
        bigint: (val) => typeof val === "bigint",
        function: (val) => typeof val === "function",
        boolean: (val) => typeof val === "boolean",
        string: (val) => typeof val === "string",
        stringOrUint8Array: (val) => typeof val === "string" || isBytes3(val),
        isSafeInteger: (val) => Number.isSafeInteger(val),
        array: (val) => Array.isArray(val),
        field: (val, object) => object.Fp.isValid(val),
        hash: (val) => typeof val === "function" && Number.isSafeInteger(val.outputLen)
      };
    }
  });

  // node_modules/ox/_esm/core/version.js
  var version3;
  var init_version3 = __esm({
    "node_modules/ox/_esm/core/version.js"() {
      version3 = "0.1.1";
    }
  });

  // node_modules/ox/_esm/core/internal/errors.js
  function getVersion() {
    return version3;
  }
  var init_errors2 = __esm({
    "node_modules/ox/_esm/core/internal/errors.js"() {
      init_version3();
    }
  });

  // node_modules/ox/_esm/core/Errors.js
  function walk2(err, fn) {
    if (fn?.(err))
      return err;
    if (err && typeof err === "object" && "cause" in err && err.cause)
      return walk2(err.cause, fn);
    return fn ? null : err;
  }
  var BaseError3;
  var init_Errors = __esm({
    "node_modules/ox/_esm/core/Errors.js"() {
      init_errors2();
      BaseError3 = class _BaseError extends Error {
        constructor(shortMessage, options = {}) {
          const details = (() => {
            if (options.cause instanceof _BaseError) {
              if (options.cause.details)
                return options.cause.details;
              if (options.cause.shortMessage)
                return options.cause.shortMessage;
            }
            if (options.cause && "details" in options.cause && typeof options.cause.details === "string")
              return options.cause.details;
            if (options.cause?.message)
              return options.cause.message;
            return options.details;
          })();
          const docsPath8 = (() => {
            if (options.cause instanceof _BaseError)
              return options.cause.docsPath || options.docsPath;
            return options.docsPath;
          })();
          const docsBaseUrl = "https://oxlib.sh";
          const docs = `${docsBaseUrl}${docsPath8 ?? ""}`;
          const message = [
            shortMessage || "An error occurred.",
            ...options.metaMessages ? ["", ...options.metaMessages] : [],
            ...details || docsPath8 ? [
              "",
              details ? `Details: ${details}` : void 0,
              docsPath8 ? `See: ${docs}` : void 0
            ] : []
          ].filter((x) => typeof x === "string").join("\n");
          super(message, options.cause ? { cause: options.cause } : void 0);
          Object.defineProperty(this, "details", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          Object.defineProperty(this, "docs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          Object.defineProperty(this, "docsPath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          Object.defineProperty(this, "shortMessage", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          Object.defineProperty(this, "cause", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "BaseError"
          });
          Object.defineProperty(this, "version", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: `ox@${getVersion()}`
          });
          this.cause = options.cause;
          this.details = details;
          this.docs = docs;
          this.docsPath = docsPath8;
          this.shortMessage = shortMessage;
        }
        walk(fn) {
          return walk2(this, fn);
        }
      };
    }
  });

  // node_modules/ox/_esm/core/internal/bytes.js
  function assertSize2(bytes, size_) {
    if (size2(bytes) > size_)
      throw new SizeOverflowError2({
        givenSize: size2(bytes),
        maxSize: size_
      });
  }
  function assertStartOffset2(value, start) {
    if (typeof start === "number" && start > 0 && start > size2(value) - 1)
      throw new SliceOffsetOutOfBoundsError2({
        offset: start,
        position: "start",
        size: size2(value)
      });
  }
  function assertEndOffset2(value, start, end) {
    if (typeof start === "number" && typeof end === "number" && size2(value) !== end - start) {
      throw new SliceOffsetOutOfBoundsError2({
        offset: end,
        position: "end",
        size: size2(value)
      });
    }
  }
  function charCodeToBase162(char) {
    if (char >= charCodeMap2.zero && char <= charCodeMap2.nine)
      return char - charCodeMap2.zero;
    if (char >= charCodeMap2.A && char <= charCodeMap2.F)
      return char - (charCodeMap2.A - 10);
    if (char >= charCodeMap2.a && char <= charCodeMap2.f)
      return char - (charCodeMap2.a - 10);
    return void 0;
  }
  function pad2(bytes, options = {}) {
    const { dir, size: size5 = 32 } = options;
    if (size5 === 0)
      return bytes;
    if (bytes.length > size5)
      throw new SizeExceedsPaddingSizeError2({
        size: bytes.length,
        targetSize: size5,
        type: "Bytes"
      });
    const paddedBytes = new Uint8Array(size5);
    for (let i = 0; i < size5; i++) {
      const padEnd = dir === "right";
      paddedBytes[padEnd ? i : size5 - i - 1] = bytes[padEnd ? i : bytes.length - i - 1];
    }
    return paddedBytes;
  }
  function trim2(value, options = {}) {
    const { dir = "left" } = options;
    let data = value;
    let sliceLength = 0;
    for (let i = 0; i < data.length - 1; i++) {
      if (data[dir === "left" ? i : data.length - i - 1].toString() === "0")
        sliceLength++;
      else
        break;
    }
    data = dir === "left" ? data.slice(sliceLength) : data.slice(0, data.length - sliceLength);
    return data;
  }
  var charCodeMap2;
  var init_bytes = __esm({
    "node_modules/ox/_esm/core/internal/bytes.js"() {
      init_Bytes();
      charCodeMap2 = {
        zero: 48,
        nine: 57,
        A: 65,
        F: 70,
        a: 97,
        f: 102
      };
    }
  });

  // node_modules/ox/_esm/core/internal/hex.js
  function assertSize3(hex, size_) {
    if (size3(hex) > size_)
      throw new SizeOverflowError3({
        givenSize: size3(hex),
        maxSize: size_
      });
  }
  function assertStartOffset3(value, start) {
    if (typeof start === "number" && start > 0 && start > size3(value) - 1)
      throw new SliceOffsetOutOfBoundsError3({
        offset: start,
        position: "start",
        size: size3(value)
      });
  }
  function assertEndOffset3(value, start, end) {
    if (typeof start === "number" && typeof end === "number" && size3(value) !== end - start) {
      throw new SliceOffsetOutOfBoundsError3({
        offset: end,
        position: "end",
        size: size3(value)
      });
    }
  }
  function pad3(hex_, options = {}) {
    const { dir, size: size5 = 32 } = options;
    if (size5 === 0)
      return hex_;
    const hex = hex_.replace("0x", "");
    if (hex.length > size5 * 2)
      throw new SizeExceedsPaddingSizeError3({
        size: Math.ceil(hex.length / 2),
        targetSize: size5,
        type: "Hex"
      });
    return `0x${hex[dir === "right" ? "padEnd" : "padStart"](size5 * 2, "0")}`;
  }
  function trim3(value, options = {}) {
    const { dir = "left" } = options;
    let data = value.replace("0x", "");
    let sliceLength = 0;
    for (let i = 0; i < data.length - 1; i++) {
      if (data[dir === "left" ? i : data.length - i - 1].toString() === "0")
        sliceLength++;
      else
        break;
    }
    data = dir === "left" ? data.slice(sliceLength) : data.slice(0, data.length - sliceLength);
    if (data === "0")
      return "0x";
    if (dir === "right" && data.length % 2 === 1)
      return `0x${data}0`;
    return `0x${data}`;
  }
  var init_hex = __esm({
    "node_modules/ox/_esm/core/internal/hex.js"() {
      init_Hex();
    }
  });

  // node_modules/ox/_esm/core/Json.js
  function stringify2(value, replacer, space) {
    return JSON.stringify(value, (key, value2) => {
      if (typeof replacer === "function")
        return replacer(key, value2);
      if (typeof value2 === "bigint")
        return value2.toString() + bigIntSuffix;
      return value2;
    }, space);
  }
  var bigIntSuffix;
  var init_Json = __esm({
    "node_modules/ox/_esm/core/Json.js"() {
      bigIntSuffix = "#__bigint";
    }
  });

  // node_modules/ox/_esm/core/Bytes.js
  function assert(value) {
    if (value instanceof Uint8Array)
      return;
    if (!value)
      throw new InvalidBytesTypeError(value);
    if (typeof value !== "object")
      throw new InvalidBytesTypeError(value);
    if (!("BYTES_PER_ELEMENT" in value))
      throw new InvalidBytesTypeError(value);
    if (value.BYTES_PER_ELEMENT !== 1 || value.constructor.name !== "Uint8Array")
      throw new InvalidBytesTypeError(value);
  }
  function from(value) {
    if (value instanceof Uint8Array)
      return value;
    if (typeof value === "string")
      return fromHex(value);
    return fromArray(value);
  }
  function fromArray(value) {
    return value instanceof Uint8Array ? value : new Uint8Array(value);
  }
  function fromHex(value, options = {}) {
    const { size: size5 } = options;
    let hex = value;
    if (size5) {
      assertSize3(value, size5);
      hex = padRight(value, size5);
    }
    let hexString = hex.slice(2);
    if (hexString.length % 2)
      hexString = `0${hexString}`;
    const length = hexString.length / 2;
    const bytes = new Uint8Array(length);
    for (let index2 = 0, j = 0; index2 < length; index2++) {
      const nibbleLeft = charCodeToBase162(hexString.charCodeAt(j++));
      const nibbleRight = charCodeToBase162(hexString.charCodeAt(j++));
      if (nibbleLeft === void 0 || nibbleRight === void 0) {
        throw new BaseError3(`Invalid byte sequence ("${hexString[j - 2]}${hexString[j - 1]}" in "${hexString}").`);
      }
      bytes[index2] = nibbleLeft * 16 + nibbleRight;
    }
    return bytes;
  }
  function fromString(value, options = {}) {
    const { size: size5 } = options;
    const bytes = encoder3.encode(value);
    if (typeof size5 === "number") {
      assertSize2(bytes, size5);
      return padRight2(bytes, size5);
    }
    return bytes;
  }
  function padRight2(value, size5) {
    return pad2(value, { dir: "right", size: size5 });
  }
  function size2(value) {
    return value.length;
  }
  function slice2(value, start, end, options = {}) {
    const { strict } = options;
    assertStartOffset2(value, start);
    const value_ = value.slice(start, end);
    if (strict)
      assertEndOffset2(value_, start, end);
    return value_;
  }
  function toBigInt2(bytes, options = {}) {
    const { size: size5 } = options;
    if (typeof size5 !== "undefined")
      assertSize2(bytes, size5);
    const hex = fromBytes(bytes, options);
    return toBigInt(hex, options);
  }
  function toBoolean(bytes, options = {}) {
    const { size: size5 } = options;
    let bytes_ = bytes;
    if (typeof size5 !== "undefined") {
      assertSize2(bytes_, size5);
      bytes_ = trimLeft(bytes_);
    }
    if (bytes_.length > 1 || bytes_[0] > 1)
      throw new InvalidBytesBooleanError2(bytes_);
    return Boolean(bytes_[0]);
  }
  function toNumber2(bytes, options = {}) {
    const { size: size5 } = options;
    if (typeof size5 !== "undefined")
      assertSize2(bytes, size5);
    const hex = fromBytes(bytes, options);
    return toNumber(hex, options);
  }
  function toString(bytes, options = {}) {
    const { size: size5 } = options;
    let bytes_ = bytes;
    if (typeof size5 !== "undefined") {
      assertSize2(bytes_, size5);
      bytes_ = trimRight(bytes_);
    }
    return decoder.decode(bytes_);
  }
  function trimLeft(value) {
    return trim2(value, { dir: "left" });
  }
  function trimRight(value) {
    return trim2(value, { dir: "right" });
  }
  function validate(value) {
    try {
      assert(value);
      return true;
    } catch {
      return false;
    }
  }
  var decoder, encoder3, InvalidBytesBooleanError2, InvalidBytesTypeError, SizeOverflowError2, SliceOffsetOutOfBoundsError2, SizeExceedsPaddingSizeError2;
  var init_Bytes = __esm({
    "node_modules/ox/_esm/core/Bytes.js"() {
      init_Errors();
      init_Hex();
      init_bytes();
      init_hex();
      init_Json();
      decoder = /* @__PURE__ */ new TextDecoder();
      encoder3 = /* @__PURE__ */ new TextEncoder();
      InvalidBytesBooleanError2 = class extends BaseError3 {
        constructor(bytes) {
          super(`Bytes value \`${bytes}\` is not a valid boolean.`, {
            metaMessages: [
              "The bytes array must contain a single byte of either a `0` or `1` value."
            ]
          });
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Bytes.InvalidBytesBooleanError"
          });
        }
      };
      InvalidBytesTypeError = class extends BaseError3 {
        constructor(value) {
          super(`Value \`${typeof value === "object" ? stringify2(value) : value}\` of type \`${typeof value}\` is an invalid Bytes value.`, {
            metaMessages: ["Bytes values must be of type `Bytes`."]
          });
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Bytes.InvalidBytesTypeError"
          });
        }
      };
      SizeOverflowError2 = class extends BaseError3 {
        constructor({ givenSize, maxSize }) {
          super(`Size cannot exceed \`${maxSize}\` bytes. Given size: \`${givenSize}\` bytes.`);
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Bytes.SizeOverflowError"
          });
        }
      };
      SliceOffsetOutOfBoundsError2 = class extends BaseError3 {
        constructor({ offset, position, size: size5 }) {
          super(`Slice ${position === "start" ? "starting" : "ending"} at offset \`${offset}\` is out-of-bounds (size: \`${size5}\`).`);
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Bytes.SliceOffsetOutOfBoundsError"
          });
        }
      };
      SizeExceedsPaddingSizeError2 = class extends BaseError3 {
        constructor({ size: size5, targetSize, type }) {
          super(`${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()} size (\`${size5}\`) exceeds padding size (\`${targetSize}\`).`);
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Bytes.SizeExceedsPaddingSizeError"
          });
        }
      };
    }
  });

  // node_modules/ox/_esm/core/Hex.js
  function assert2(value, options = {}) {
    const { strict = false } = options;
    if (!value)
      throw new InvalidHexTypeError(value);
    if (typeof value !== "string")
      throw new InvalidHexTypeError(value);
    if (strict) {
      if (!/^0x[0-9a-fA-F]*$/.test(value))
        throw new InvalidHexValueError(value);
    }
    if (!value.startsWith("0x"))
      throw new InvalidHexValueError(value);
  }
  function concat2(...values) {
    return `0x${values.reduce((acc, x) => acc + x.replace("0x", ""), "")}`;
  }
  function from2(value) {
    if (value instanceof Uint8Array)
      return fromBytes(value);
    if (Array.isArray(value))
      return fromBytes(new Uint8Array(value));
    return value;
  }
  function fromBoolean(value, options = {}) {
    const hex = `0x${Number(value)}`;
    if (typeof options.size === "number") {
      assertSize3(hex, options.size);
      return padLeft(hex, options.size);
    }
    return hex;
  }
  function fromBytes(value, options = {}) {
    let string = "";
    for (let i = 0; i < value.length; i++)
      string += hexes4[value[i]];
    const hex = `0x${string}`;
    if (typeof options.size === "number") {
      assertSize3(hex, options.size);
      return padRight(hex, options.size);
    }
    return hex;
  }
  function fromNumber(value, options = {}) {
    const { signed, size: size5 } = options;
    const value_ = BigInt(value);
    let maxValue;
    if (size5) {
      if (signed)
        maxValue = (1n << BigInt(size5) * 8n - 1n) - 1n;
      else
        maxValue = 2n ** (BigInt(size5) * 8n) - 1n;
    } else if (typeof value === "number") {
      maxValue = BigInt(Number.MAX_SAFE_INTEGER);
    }
    const minValue = typeof maxValue === "bigint" && signed ? -maxValue - 1n : 0;
    if (maxValue && value_ > maxValue || value_ < minValue) {
      const suffix = typeof value === "bigint" ? "n" : "";
      throw new IntegerOutOfRangeError2({
        max: maxValue ? `${maxValue}${suffix}` : void 0,
        min: `${minValue}${suffix}`,
        signed,
        size: size5,
        value: `${value}${suffix}`
      });
    }
    const stringValue = (signed && value_ < 0 ? (1n << BigInt(size5 * 8)) + BigInt(value_) : value_).toString(16);
    const hex = `0x${stringValue}`;
    if (size5)
      return padLeft(hex, size5);
    return hex;
  }
  function fromString2(value, options = {}) {
    return fromBytes(encoder4.encode(value), options);
  }
  function padLeft(value, size5) {
    return pad3(value, { dir: "left", size: size5 });
  }
  function padRight(value, size5) {
    return pad3(value, { dir: "right", size: size5 });
  }
  function slice3(value, start, end, options = {}) {
    const { strict } = options;
    assertStartOffset3(value, start);
    const value_ = `0x${value.replace("0x", "").slice((start ?? 0) * 2, (end ?? value.length) * 2)}`;
    if (strict)
      assertEndOffset3(value_, start, end);
    return value_;
  }
  function size3(value) {
    return Math.ceil((value.length - 2) / 2);
  }
  function trimLeft2(value) {
    return trim3(value, { dir: "left" });
  }
  function toBigInt(hex, options = {}) {
    const { signed } = options;
    if (options.size)
      assertSize3(hex, options.size);
    const value = BigInt(hex);
    if (!signed)
      return value;
    const size5 = (hex.length - 2) / 2;
    const max_unsigned = (1n << BigInt(size5) * 8n) - 1n;
    const max_signed = max_unsigned >> 1n;
    if (value <= max_signed)
      return value;
    return value - max_unsigned - 1n;
  }
  function toNumber(hex, options = {}) {
    const { signed, size: size5 } = options;
    if (!signed && !size5)
      return Number(hex);
    return Number(toBigInt(hex, options));
  }
  function validate2(value, options = {}) {
    const { strict = false } = options;
    try {
      assert2(value, { strict });
      return true;
    } catch {
      return false;
    }
  }
  var encoder4, hexes4, IntegerOutOfRangeError2, InvalidHexTypeError, InvalidHexValueError, SizeOverflowError3, SliceOffsetOutOfBoundsError3, SizeExceedsPaddingSizeError3;
  var init_Hex = __esm({
    "node_modules/ox/_esm/core/Hex.js"() {
      init_Errors();
      init_hex();
      init_Json();
      encoder4 = /* @__PURE__ */ new TextEncoder();
      hexes4 = /* @__PURE__ */ Array.from({ length: 256 }, (_v, i) => i.toString(16).padStart(2, "0"));
      IntegerOutOfRangeError2 = class extends BaseError3 {
        constructor({ max, min, signed, size: size5, value }) {
          super(`Number \`${value}\` is not in safe${size5 ? ` ${size5 * 8}-bit` : ""}${signed ? " signed" : " unsigned"} integer range ${max ? `(\`${min}\` to \`${max}\`)` : `(above \`${min}\`)`}`);
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Hex.IntegerOutOfRangeError"
          });
        }
      };
      InvalidHexTypeError = class extends BaseError3 {
        constructor(value) {
          super(`Value \`${typeof value === "object" ? stringify2(value) : value}\` of type \`${typeof value}\` is an invalid hex type.`, {
            metaMessages: ['Hex types must be represented as `"0x${string}"`.']
          });
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Hex.InvalidHexTypeError"
          });
        }
      };
      InvalidHexValueError = class extends BaseError3 {
        constructor(value) {
          super(`Value \`${value}\` is an invalid hex value.`, {
            metaMessages: [
              'Hex values must start with `"0x"` and contain only hexadecimal characters (0-9, a-f, A-F).'
            ]
          });
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Hex.InvalidHexValueError"
          });
        }
      };
      SizeOverflowError3 = class extends BaseError3 {
        constructor({ givenSize, maxSize }) {
          super(`Size cannot exceed \`${maxSize}\` bytes. Given size: \`${givenSize}\` bytes.`);
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Hex.SizeOverflowError"
          });
        }
      };
      SliceOffsetOutOfBoundsError3 = class extends BaseError3 {
        constructor({ offset, position, size: size5 }) {
          super(`Slice ${position === "start" ? "starting" : "ending"} at offset \`${offset}\` is out-of-bounds (size: \`${size5}\`).`);
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Hex.SliceOffsetOutOfBoundsError"
          });
        }
      };
      SizeExceedsPaddingSizeError3 = class extends BaseError3 {
        constructor({ size: size5, targetSize, type }) {
          super(`${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()} size (\`${size5}\`) exceeds padding size (\`${targetSize}\`).`);
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Hex.SizeExceedsPaddingSizeError"
          });
        }
      };
    }
  });

  // node_modules/ox/_esm/core/Withdrawal.js
  function toRpc(withdrawal) {
    return {
      address: withdrawal.address,
      amount: fromNumber(withdrawal.amount),
      index: fromNumber(withdrawal.index),
      validatorIndex: fromNumber(withdrawal.validatorIndex)
    };
  }
  var init_Withdrawal = __esm({
    "node_modules/ox/_esm/core/Withdrawal.js"() {
      init_Hex();
    }
  });

  // node_modules/ox/_esm/core/BlockOverrides.js
  function toRpc2(blockOverrides) {
    return {
      ...typeof blockOverrides.baseFeePerGas === "bigint" && {
        baseFeePerGas: fromNumber(blockOverrides.baseFeePerGas)
      },
      ...typeof blockOverrides.blobBaseFee === "bigint" && {
        blobBaseFee: fromNumber(blockOverrides.blobBaseFee)
      },
      ...typeof blockOverrides.feeRecipient === "string" && {
        feeRecipient: blockOverrides.feeRecipient
      },
      ...typeof blockOverrides.gasLimit === "bigint" && {
        gasLimit: fromNumber(blockOverrides.gasLimit)
      },
      ...typeof blockOverrides.number === "bigint" && {
        number: fromNumber(blockOverrides.number)
      },
      ...typeof blockOverrides.prevRandao === "bigint" && {
        prevRandao: fromNumber(blockOverrides.prevRandao)
      },
      ...typeof blockOverrides.time === "bigint" && {
        time: fromNumber(blockOverrides.time)
      },
      ...blockOverrides.withdrawals && {
        withdrawals: blockOverrides.withdrawals.map(toRpc)
      }
    };
  }
  var init_BlockOverrides = __esm({
    "node_modules/ox/_esm/core/BlockOverrides.js"() {
      init_Hex();
      init_Withdrawal();
    }
  });

  // node_modules/viem/_esm/constants/abis.js
  var multicall3Abi, batchGatewayAbi, universalResolverErrors, universalResolverResolveAbi, universalResolverReverseAbi, textResolverAbi, addressResolverAbi, erc1271Abi, erc6492SignatureValidatorAbi, erc20Abi;
  var init_abis = __esm({
    "node_modules/viem/_esm/constants/abis.js"() {
      multicall3Abi = [
        {
          inputs: [
            {
              components: [
                {
                  name: "target",
                  type: "address"
                },
                {
                  name: "allowFailure",
                  type: "bool"
                },
                {
                  name: "callData",
                  type: "bytes"
                }
              ],
              name: "calls",
              type: "tuple[]"
            }
          ],
          name: "aggregate3",
          outputs: [
            {
              components: [
                {
                  name: "success",
                  type: "bool"
                },
                {
                  name: "returnData",
                  type: "bytes"
                }
              ],
              name: "returnData",
              type: "tuple[]"
            }
          ],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [],
          name: "getCurrentBlockTimestamp",
          outputs: [
            {
              internalType: "uint256",
              name: "timestamp",
              type: "uint256"
            }
          ],
          stateMutability: "view",
          type: "function"
        }
      ];
      batchGatewayAbi = [
        {
          name: "query",
          type: "function",
          stateMutability: "view",
          inputs: [
            {
              type: "tuple[]",
              name: "queries",
              components: [
                {
                  type: "address",
                  name: "sender"
                },
                {
                  type: "string[]",
                  name: "urls"
                },
                {
                  type: "bytes",
                  name: "data"
                }
              ]
            }
          ],
          outputs: [
            {
              type: "bool[]",
              name: "failures"
            },
            {
              type: "bytes[]",
              name: "responses"
            }
          ]
        },
        {
          name: "HttpError",
          type: "error",
          inputs: [
            {
              type: "uint16",
              name: "status"
            },
            {
              type: "string",
              name: "message"
            }
          ]
        }
      ];
      universalResolverErrors = [
        {
          inputs: [
            {
              name: "dns",
              type: "bytes"
            }
          ],
          name: "DNSDecodingFailed",
          type: "error"
        },
        {
          inputs: [
            {
              name: "ens",
              type: "string"
            }
          ],
          name: "DNSEncodingFailed",
          type: "error"
        },
        {
          inputs: [],
          name: "EmptyAddress",
          type: "error"
        },
        {
          inputs: [
            {
              name: "status",
              type: "uint16"
            },
            {
              name: "message",
              type: "string"
            }
          ],
          name: "HttpError",
          type: "error"
        },
        {
          inputs: [],
          name: "InvalidBatchGatewayResponse",
          type: "error"
        },
        {
          inputs: [
            {
              name: "errorData",
              type: "bytes"
            }
          ],
          name: "ResolverError",
          type: "error"
        },
        {
          inputs: [
            {
              name: "name",
              type: "bytes"
            },
            {
              name: "resolver",
              type: "address"
            }
          ],
          name: "ResolverNotContract",
          type: "error"
        },
        {
          inputs: [
            {
              name: "name",
              type: "bytes"
            }
          ],
          name: "ResolverNotFound",
          type: "error"
        },
        {
          inputs: [
            {
              name: "primary",
              type: "string"
            },
            {
              name: "primaryAddress",
              type: "bytes"
            }
          ],
          name: "ReverseAddressMismatch",
          type: "error"
        },
        {
          inputs: [
            {
              internalType: "bytes4",
              name: "selector",
              type: "bytes4"
            }
          ],
          name: "UnsupportedResolverProfile",
          type: "error"
        }
      ];
      universalResolverResolveAbi = [
        ...universalResolverErrors,
        {
          name: "resolveWithGateways",
          type: "function",
          stateMutability: "view",
          inputs: [
            { name: "name", type: "bytes" },
            { name: "data", type: "bytes" },
            { name: "gateways", type: "string[]" }
          ],
          outputs: [
            { name: "", type: "bytes" },
            { name: "address", type: "address" }
          ]
        }
      ];
      universalResolverReverseAbi = [
        ...universalResolverErrors,
        {
          name: "reverseWithGateways",
          type: "function",
          stateMutability: "view",
          inputs: [
            { type: "bytes", name: "reverseName" },
            { type: "uint256", name: "coinType" },
            { type: "string[]", name: "gateways" }
          ],
          outputs: [
            { type: "string", name: "resolvedName" },
            { type: "address", name: "resolver" },
            { type: "address", name: "reverseResolver" }
          ]
        }
      ];
      textResolverAbi = [
        {
          name: "text",
          type: "function",
          stateMutability: "view",
          inputs: [
            { name: "name", type: "bytes32" },
            { name: "key", type: "string" }
          ],
          outputs: [{ name: "", type: "string" }]
        }
      ];
      addressResolverAbi = [
        {
          name: "addr",
          type: "function",
          stateMutability: "view",
          inputs: [{ name: "name", type: "bytes32" }],
          outputs: [{ name: "", type: "address" }]
        },
        {
          name: "addr",
          type: "function",
          stateMutability: "view",
          inputs: [
            { name: "name", type: "bytes32" },
            { name: "coinType", type: "uint256" }
          ],
          outputs: [{ name: "", type: "bytes" }]
        }
      ];
      erc1271Abi = [
        {
          name: "isValidSignature",
          type: "function",
          stateMutability: "view",
          inputs: [
            { name: "hash", type: "bytes32" },
            { name: "signature", type: "bytes" }
          ],
          outputs: [{ name: "", type: "bytes4" }]
        }
      ];
      erc6492SignatureValidatorAbi = [
        {
          inputs: [
            {
              name: "_signer",
              type: "address"
            },
            {
              name: "_hash",
              type: "bytes32"
            },
            {
              name: "_signature",
              type: "bytes"
            }
          ],
          stateMutability: "nonpayable",
          type: "constructor"
        },
        {
          inputs: [
            {
              name: "_signer",
              type: "address"
            },
            {
              name: "_hash",
              type: "bytes32"
            },
            {
              name: "_signature",
              type: "bytes"
            }
          ],
          outputs: [
            {
              type: "bool"
            }
          ],
          stateMutability: "nonpayable",
          type: "function",
          name: "isValidSig"
        }
      ];
      erc20Abi = [
        {
          type: "event",
          name: "Approval",
          inputs: [
            {
              indexed: true,
              name: "owner",
              type: "address"
            },
            {
              indexed: true,
              name: "spender",
              type: "address"
            },
            {
              indexed: false,
              name: "value",
              type: "uint256"
            }
          ]
        },
        {
          type: "event",
          name: "Transfer",
          inputs: [
            {
              indexed: true,
              name: "from",
              type: "address"
            },
            {
              indexed: true,
              name: "to",
              type: "address"
            },
            {
              indexed: false,
              name: "value",
              type: "uint256"
            }
          ]
        },
        {
          type: "function",
          name: "allowance",
          stateMutability: "view",
          inputs: [
            {
              name: "owner",
              type: "address"
            },
            {
              name: "spender",
              type: "address"
            }
          ],
          outputs: [
            {
              type: "uint256"
            }
          ]
        },
        {
          type: "function",
          name: "approve",
          stateMutability: "nonpayable",
          inputs: [
            {
              name: "spender",
              type: "address"
            },
            {
              name: "amount",
              type: "uint256"
            }
          ],
          outputs: [
            {
              type: "bool"
            }
          ]
        },
        {
          type: "function",
          name: "balanceOf",
          stateMutability: "view",
          inputs: [
            {
              name: "account",
              type: "address"
            }
          ],
          outputs: [
            {
              type: "uint256"
            }
          ]
        },
        {
          type: "function",
          name: "decimals",
          stateMutability: "view",
          inputs: [],
          outputs: [
            {
              type: "uint8"
            }
          ]
        },
        {
          type: "function",
          name: "name",
          stateMutability: "view",
          inputs: [],
          outputs: [
            {
              type: "string"
            }
          ]
        },
        {
          type: "function",
          name: "symbol",
          stateMutability: "view",
          inputs: [],
          outputs: [
            {
              type: "string"
            }
          ]
        },
        {
          type: "function",
          name: "totalSupply",
          stateMutability: "view",
          inputs: [],
          outputs: [
            {
              type: "uint256"
            }
          ]
        },
        {
          type: "function",
          name: "transfer",
          stateMutability: "nonpayable",
          inputs: [
            {
              name: "recipient",
              type: "address"
            },
            {
              name: "amount",
              type: "uint256"
            }
          ],
          outputs: [
            {
              type: "bool"
            }
          ]
        },
        {
          type: "function",
          name: "transferFrom",
          stateMutability: "nonpayable",
          inputs: [
            {
              name: "sender",
              type: "address"
            },
            {
              name: "recipient",
              type: "address"
            },
            {
              name: "amount",
              type: "uint256"
            }
          ],
          outputs: [
            {
              type: "bool"
            }
          ]
        }
      ];
    }
  });

  // node_modules/viem/_esm/constants/contract.js
  var aggregate3Signature;
  var init_contract2 = __esm({
    "node_modules/viem/_esm/constants/contract.js"() {
      aggregate3Signature = "0x82ad56cb";
    }
  });

  // node_modules/viem/_esm/constants/contracts.js
  var deploylessCallViaBytecodeBytecode, deploylessCallViaFactoryBytecode, erc6492SignatureValidatorByteCode, multicall3Bytecode;
  var init_contracts = __esm({
    "node_modules/viem/_esm/constants/contracts.js"() {
      deploylessCallViaBytecodeBytecode = "0x608060405234801561001057600080fd5b5060405161018e38038061018e83398101604081905261002f91610124565b6000808351602085016000f59050803b61004857600080fd5b6000808351602085016000855af16040513d6000823e81610067573d81fd5b3d81f35b634e487b7160e01b600052604160045260246000fd5b600082601f83011261009257600080fd5b81516001600160401b038111156100ab576100ab61006b565b604051601f8201601f19908116603f011681016001600160401b03811182821017156100d9576100d961006b565b6040528181528382016020018510156100f157600080fd5b60005b82811015610110576020818601810151838301820152016100f4565b506000918101602001919091529392505050565b6000806040838503121561013757600080fd5b82516001600160401b0381111561014d57600080fd5b61015985828601610081565b602085015190935090506001600160401b0381111561017757600080fd5b61018385828601610081565b915050925092905056fe";
      deploylessCallViaFactoryBytecode = "0x608060405234801561001057600080fd5b506040516102c03803806102c083398101604081905261002f916101e6565b836001600160a01b03163b6000036100e457600080836001600160a01b03168360405161005c9190610270565b6000604051808303816000865af19150503d8060008114610099576040519150601f19603f3d011682016040523d82523d6000602084013e61009e565b606091505b50915091508115806100b857506001600160a01b0386163b155b156100e1578060405163101bb98d60e01b81526004016100d8919061028c565b60405180910390fd5b50505b6000808451602086016000885af16040513d6000823e81610103573d81fd5b3d81f35b80516001600160a01b038116811461011e57600080fd5b919050565b634e487b7160e01b600052604160045260246000fd5b60005b8381101561015457818101518382015260200161013c565b50506000910152565b600082601f83011261016e57600080fd5b81516001600160401b0381111561018757610187610123565b604051601f8201601f19908116603f011681016001600160401b03811182821017156101b5576101b5610123565b6040528181528382016020018510156101cd57600080fd5b6101de826020830160208701610139565b949350505050565b600080600080608085870312156101fc57600080fd5b61020585610107565b60208601519094506001600160401b0381111561022157600080fd5b61022d8782880161015d565b93505061023c60408601610107565b60608601519092506001600160401b0381111561025857600080fd5b6102648782880161015d565b91505092959194509250565b60008251610282818460208701610139565b9190910192915050565b60208152600082518060208401526102ab816040850160208701610139565b601f01601f1916919091016040019291505056fe";
      erc6492SignatureValidatorByteCode = "0x608060405234801561001057600080fd5b5060405161069438038061069483398101604081905261002f9161051e565b600061003c848484610048565b9050806000526001601ff35b60007f64926492649264926492649264926492649264926492649264926492649264926100748361040c565b036101e7576000606080848060200190518101906100929190610577565b60405192955090935091506000906001600160a01b038516906100b69085906105dd565b6000604051808303816000865af19150503d80600081146100f3576040519150601f19603f3d011682016040523d82523d6000602084013e6100f8565b606091505b50509050876001600160a01b03163b60000361016057806101605760405162461bcd60e51b815260206004820152601e60248201527f5369676e617475726556616c696461746f723a206465706c6f796d656e74000060448201526064015b60405180910390fd5b604051630b135d3f60e11b808252906001600160a01b038a1690631626ba7e90610190908b9087906004016105f9565b602060405180830381865afa1580156101ad573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101d19190610633565b6001600160e01b03191614945050505050610405565b6001600160a01b0384163b1561027a57604051630b135d3f60e11b808252906001600160a01b03861690631626ba7e9061022790879087906004016105f9565b602060405180830381865afa158015610244573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102689190610633565b6001600160e01b031916149050610405565b81516041146102df5760405162461bcd60e51b815260206004820152603a602482015260008051602061067483398151915260448201527f3a20696e76616c6964207369676e6174757265206c656e6774680000000000006064820152608401610157565b6102e7610425565b5060208201516040808401518451859392600091859190811061030c5761030c61065d565b016020015160f81c9050601b811480159061032b57508060ff16601c14155b1561038c5760405162461bcd60e51b815260206004820152603b602482015260008051602061067483398151915260448201527f3a20696e76616c6964207369676e617475726520762076616c756500000000006064820152608401610157565b60408051600081526020810180835289905260ff83169181019190915260608101849052608081018390526001600160a01b0389169060019060a0016020604051602081039080840390855afa1580156103ea573d6000803e3d6000fd5b505050602060405103516001600160a01b0316149450505050505b9392505050565b600060208251101561041d57600080fd5b508051015190565b60405180606001604052806003906020820280368337509192915050565b6001600160a01b038116811461045857600080fd5b50565b634e487b7160e01b600052604160045260246000fd5b60005b8381101561048c578181015183820152602001610474565b50506000910152565b600082601f8301126104a657600080fd5b81516001600160401b038111156104bf576104bf61045b565b604051601f8201601f19908116603f011681016001600160401b03811182821017156104ed576104ed61045b565b60405281815283820160200185101561050557600080fd5b610516826020830160208701610471565b949350505050565b60008060006060848603121561053357600080fd5b835161053e81610443565b6020850151604086015191945092506001600160401b0381111561056157600080fd5b61056d86828701610495565b9150509250925092565b60008060006060848603121561058c57600080fd5b835161059781610443565b60208501519093506001600160401b038111156105b357600080fd5b6105bf86828701610495565b604086015190935090506001600160401b0381111561056157600080fd5b600082516105ef818460208701610471565b9190910192915050565b828152604060208201526000825180604084015261061e816060850160208701610471565b601f01601f1916919091016060019392505050565b60006020828403121561064557600080fd5b81516001600160e01b03198116811461040557600080fd5b634e487b7160e01b600052603260045260246000fdfe5369676e617475726556616c696461746f72237265636f7665725369676e6572";
      multicall3Bytecode = "0x608060405234801561001057600080fd5b506115b9806100206000396000f3fe6080604052600436106100f35760003560e01c80634d2301cc1161008a578063a8b0574e11610059578063a8b0574e14610325578063bce38bd714610350578063c3077fa914610380578063ee82ac5e146103b2576100f3565b80634d2301cc1461026257806372425d9d1461029f57806382ad56cb146102ca57806386d516e8146102fa576100f3565b80633408e470116100c65780633408e470146101af578063399542e9146101da5780633e64a6961461020c57806342cbb15c14610237576100f3565b80630f28c97d146100f8578063174dea7114610123578063252dba421461015357806327e86d6e14610184575b600080fd5b34801561010457600080fd5b5061010d6103ef565b60405161011a9190610c0a565b60405180910390f35b61013d60048036038101906101389190610c94565b6103f7565b60405161014a9190610e94565b60405180910390f35b61016d60048036038101906101689190610f0c565b610615565b60405161017b92919061101b565b60405180910390f35b34801561019057600080fd5b506101996107ab565b6040516101a69190611064565b60405180910390f35b3480156101bb57600080fd5b506101c46107b7565b6040516101d19190610c0a565b60405180910390f35b6101f460048036038101906101ef91906110ab565b6107bf565b6040516102039392919061110b565b60405180910390f35b34801561021857600080fd5b506102216107e1565b60405161022e9190610c0a565b60405180910390f35b34801561024357600080fd5b5061024c6107e9565b6040516102599190610c0a565b60405180910390f35b34801561026e57600080fd5b50610289600480360381019061028491906111a7565b6107f1565b6040516102969190610c0a565b60405180910390f35b3480156102ab57600080fd5b506102b4610812565b6040516102c19190610c0a565b60405180910390f35b6102e460048036038101906102df919061122a565b61081a565b6040516102f19190610e94565b60405180910390f35b34801561030657600080fd5b5061030f6109e4565b60405161031c9190610c0a565b60405180910390f35b34801561033157600080fd5b5061033a6109ec565b6040516103479190611286565b60405180910390f35b61036a600480360381019061036591906110ab565b6109f4565b6040516103779190610e94565b60405180910390f35b61039a60048036038101906103959190610f0c565b610ba6565b6040516103a99392919061110b565b60405180910390f35b3480156103be57600080fd5b506103d960048036038101906103d491906112cd565b610bca565b6040516103e69190611064565b60405180910390f35b600042905090565b60606000808484905090508067ffffffffffffffff81111561041c5761041b6112fa565b5b60405190808252806020026020018201604052801561045557816020015b610442610bd5565b81526020019060019003908161043a5790505b5092503660005b828110156105c957600085828151811061047957610478611329565b5b6020026020010151905087878381811061049657610495611329565b5b90506020028101906104a89190611367565b925060008360400135905080860195508360000160208101906104cb91906111a7565b73ffffffffffffffffffffffffffffffffffffffff16818580606001906104f2919061138f565b604051610500929190611431565b60006040518083038185875af1925050503d806000811461053d576040519150601f19603f3d011682016040523d82523d6000602084013e610542565b606091505b5083600001846020018290528215151515815250505081516020850135176105bc577f08c379a000000000000000000000000000000000000000000000000000000000600052602060045260176024527f4d756c746963616c6c333a2063616c6c206661696c656400000000000000000060445260846000fd5b826001019250505061045c565b5082341461060c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610603906114a7565b60405180910390fd5b50505092915050565b6000606043915060008484905090508067ffffffffffffffff81111561063e5761063d6112fa565b5b60405190808252806020026020018201604052801561067157816020015b606081526020019060019003908161065c5790505b5091503660005b828110156107a157600087878381811061069557610694611329565b5b90506020028101906106a791906114c7565b92508260000160208101906106bc91906111a7565b73ffffffffffffffffffffffffffffffffffffffff168380602001906106e2919061138f565b6040516106f0929190611431565b6000604051808303816000865af19150503d806000811461072d576040519150601f19603f3d011682016040523d82523d6000602084013e610732565b606091505b5086848151811061074657610745611329565b5b60200260200101819052819250505080610795576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161078c9061153b565b60405180910390fd5b81600101915050610678565b5050509250929050565b60006001430340905090565b600046905090565b6000806060439250434091506107d68686866109f4565b905093509350939050565b600048905090565b600043905090565b60008173ffffffffffffffffffffffffffffffffffffffff16319050919050565b600044905090565b606060008383905090508067ffffffffffffffff81111561083e5761083d6112fa565b5b60405190808252806020026020018201604052801561087757816020015b610864610bd5565b81526020019060019003908161085c5790505b5091503660005b828110156109db57600084828151811061089b5761089a611329565b5b602002602001015190508686838181106108b8576108b7611329565b5b90506020028101906108ca919061155b565b92508260000160208101906108df91906111a7565b73ffffffffffffffffffffffffffffffffffffffff16838060400190610905919061138f565b604051610913929190611431565b6000604051808303816000865af19150503d8060008114610950576040519150601f19603f3d011682016040523d82523d6000602084013e610955565b606091505b5082600001836020018290528215151515815250505080516020840135176109cf577f08c379a000000000000000000000000000000000000000000000000000000000600052602060045260176024527f4d756c746963616c6c333a2063616c6c206661696c656400000000000000000060445260646000fd5b8160010191505061087e565b50505092915050565b600045905090565b600041905090565b606060008383905090508067ffffffffffffffff811115610a1857610a176112fa565b5b604051908082528060200260200182016040528015610a5157816020015b610a3e610bd5565b815260200190600190039081610a365790505b5091503660005b82811015610b9c576000848281518110610a7557610a74611329565b5b60200260200101519050868683818110610a9257610a91611329565b5b9050602002810190610aa491906114c7565b9250826000016020810190610ab991906111a7565b73ffffffffffffffffffffffffffffffffffffffff16838060200190610adf919061138f565b604051610aed929190611431565b6000604051808303816000865af19150503d8060008114610b2a576040519150601f19603f3d011682016040523d82523d6000602084013e610b2f565b606091505b508260000183602001829052821515151581525050508715610b90578060000151610b8f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b869061153b565b60405180910390fd5b5b81600101915050610a58565b5050509392505050565b6000806060610bb7600186866107bf565b8093508194508295505050509250925092565b600081409050919050565b6040518060400160405280600015158152602001606081525090565b6000819050919050565b610c0481610bf1565b82525050565b6000602082019050610c1f6000830184610bfb565b92915050565b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b60008083601f840112610c5457610c53610c2f565b5b8235905067ffffffffffffffff811115610c7157610c70610c34565b5b602083019150836020820283011115610c8d57610c8c610c39565b5b9250929050565b60008060208385031215610cab57610caa610c25565b5b600083013567ffffffffffffffff811115610cc957610cc8610c2a565b5b610cd585828601610c3e565b92509250509250929050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b60008115159050919050565b610d2281610d0d565b82525050565b600081519050919050565b600082825260208201905092915050565b60005b83811015610d62578082015181840152602081019050610d47565b83811115610d71576000848401525b50505050565b6000601f19601f8301169050919050565b6000610d9382610d28565b610d9d8185610d33565b9350610dad818560208601610d44565b610db681610d77565b840191505092915050565b6000604083016000830151610dd96000860182610d19565b5060208301518482036020860152610df18282610d88565b9150508091505092915050565b6000610e0a8383610dc1565b905092915050565b6000602082019050919050565b6000610e2a82610ce1565b610e348185610cec565b935083602082028501610e4685610cfd565b8060005b85811015610e825784840389528151610e638582610dfe565b9450610e6e83610e12565b925060208a01995050600181019050610e4a565b50829750879550505050505092915050565b60006020820190508181036000830152610eae8184610e1f565b905092915050565b60008083601f840112610ecc57610ecb610c2f565b5b8235905067ffffffffffffffff811115610ee957610ee8610c34565b5b602083019150836020820283011115610f0557610f04610c39565b5b9250929050565b60008060208385031215610f2357610f22610c25565b5b600083013567ffffffffffffffff811115610f4157610f40610c2a565b5b610f4d85828601610eb6565b92509250509250929050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b6000610f918383610d88565b905092915050565b6000602082019050919050565b6000610fb182610f59565b610fbb8185610f64565b935083602082028501610fcd85610f75565b8060005b858110156110095784840389528151610fea8582610f85565b9450610ff583610f99565b925060208a01995050600181019050610fd1565b50829750879550505050505092915050565b60006040820190506110306000830185610bfb565b81810360208301526110428184610fa6565b90509392505050565b6000819050919050565b61105e8161104b565b82525050565b60006020820190506110796000830184611055565b92915050565b61108881610d0d565b811461109357600080fd5b50565b6000813590506110a58161107f565b92915050565b6000806000604084860312156110c4576110c3610c25565b5b60006110d286828701611096565b935050602084013567ffffffffffffffff8111156110f3576110f2610c2a565b5b6110ff86828701610eb6565b92509250509250925092565b60006060820190506111206000830186610bfb565b61112d6020830185611055565b818103604083015261113f8184610e1f565b9050949350505050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061117482611149565b9050919050565b61118481611169565b811461118f57600080fd5b50565b6000813590506111a18161117b565b92915050565b6000602082840312156111bd576111bc610c25565b5b60006111cb84828501611192565b91505092915050565b60008083601f8401126111ea576111e9610c2f565b5b8235905067ffffffffffffffff81111561120757611206610c34565b5b60208301915083602082028301111561122357611222610c39565b5b9250929050565b6000806020838503121561124157611240610c25565b5b600083013567ffffffffffffffff81111561125f5761125e610c2a565b5b61126b858286016111d4565b92509250509250929050565b61128081611169565b82525050565b600060208201905061129b6000830184611277565b92915050565b6112aa81610bf1565b81146112b557600080fd5b50565b6000813590506112c7816112a1565b92915050565b6000602082840312156112e3576112e2610c25565b5b60006112f1848285016112b8565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b600080fd5b600080fd5b600080fd5b60008235600160800383360303811261138357611382611358565b5b80830191505092915050565b600080833560016020038436030381126113ac576113ab611358565b5b80840192508235915067ffffffffffffffff8211156113ce576113cd61135d565b5b6020830192506001820236038313156113ea576113e9611362565b5b509250929050565b600081905092915050565b82818337600083830152505050565b600061141883856113f2565b93506114258385846113fd565b82840190509392505050565b600061143e82848661140c565b91508190509392505050565b600082825260208201905092915050565b7f4d756c746963616c6c333a2076616c7565206d69736d61746368000000000000600082015250565b6000611491601a8361144a565b915061149c8261145b565b602082019050919050565b600060208201905081810360008301526114c081611484565b9050919050565b6000823560016040038336030381126114e3576114e2611358565b5b80830191505092915050565b7f4d756c746963616c6c333a2063616c6c206661696c6564000000000000000000600082015250565b600061152560178361144a565b9150611530826114ef565b602082019050919050565b6000602082019050818103600083015261155481611518565b9050919050565b60008235600160600383360303811261157757611576611358565b5b8083019150509291505056fea264697066735822122020c1bc9aacf8e4a6507193432a895a8e77094f45a1395583f07b24e860ef06cd64736f6c634300080c0033";
    }
  });

  // node_modules/viem/_esm/errors/chain.js
  var ChainDoesNotSupportContract, ClientChainNotConfiguredError, InvalidChainIdError;
  var init_chain = __esm({
    "node_modules/viem/_esm/errors/chain.js"() {
      init_base();
      ChainDoesNotSupportContract = class extends BaseError2 {
        constructor({ blockNumber, chain, contract }) {
          super(`Chain "${chain.name}" does not support contract "${contract.name}".`, {
            metaMessages: [
              "This could be due to any of the following:",
              ...blockNumber && contract.blockCreated && contract.blockCreated > blockNumber ? [
                `- The contract "${contract.name}" was not deployed until block ${contract.blockCreated} (current block ${blockNumber}).`
              ] : [
                `- The chain does not have the contract "${contract.name}" configured.`
              ]
            ],
            name: "ChainDoesNotSupportContract"
          });
        }
      };
      ClientChainNotConfiguredError = class extends BaseError2 {
        constructor() {
          super("No chain was provided to the Client.", {
            name: "ClientChainNotConfiguredError"
          });
        }
      };
      InvalidChainIdError = class extends BaseError2 {
        constructor({ chainId }) {
          super(typeof chainId === "number" ? `Chain ID "${chainId}" is invalid.` : "Chain ID is invalid.", { name: "InvalidChainIdError" });
        }
      };
    }
  });

  // node_modules/viem/_esm/utils/abi/encodeDeployData.js
  function encodeDeployData(parameters) {
    const { abi: abi3, args, bytecode } = parameters;
    if (!args || args.length === 0)
      return bytecode;
    const description = abi3.find((x) => "type" in x && x.type === "constructor");
    if (!description)
      throw new AbiConstructorNotFoundError({ docsPath: docsPath5 });
    if (!("inputs" in description))
      throw new AbiConstructorParamsNotFoundError({ docsPath: docsPath5 });
    if (!description.inputs || description.inputs.length === 0)
      throw new AbiConstructorParamsNotFoundError({ docsPath: docsPath5 });
    const data = encodeAbiParameters(description.inputs, args);
    return concatHex([bytecode, data]);
  }
  var docsPath5;
  var init_encodeDeployData = __esm({
    "node_modules/viem/_esm/utils/abi/encodeDeployData.js"() {
      init_abi();
      init_concat();
      init_encodeAbiParameters();
      docsPath5 = "/docs/contract/encodeDeployData";
    }
  });

  // node_modules/viem/_esm/utils/chain/getChainContractAddress.js
  function getChainContractAddress({ blockNumber, chain, contract: name }) {
    const contract = chain?.contracts?.[name];
    if (!contract)
      throw new ChainDoesNotSupportContract({
        chain,
        contract: { name }
      });
    if (blockNumber && contract.blockCreated && contract.blockCreated > blockNumber)
      throw new ChainDoesNotSupportContract({
        blockNumber,
        chain,
        contract: {
          name,
          blockCreated: contract.blockCreated
        }
      });
    return contract.address;
  }
  var init_getChainContractAddress = __esm({
    "node_modules/viem/_esm/utils/chain/getChainContractAddress.js"() {
      init_chain();
    }
  });

  // node_modules/viem/_esm/utils/errors/getCallError.js
  function getCallError(err, { docsPath: docsPath8, ...args }) {
    const cause = (() => {
      const cause2 = getNodeError(err, args);
      if (cause2 instanceof UnknownNodeError)
        return err;
      return cause2;
    })();
    return new CallExecutionError(cause, {
      docsPath: docsPath8,
      ...args
    });
  }
  var init_getCallError = __esm({
    "node_modules/viem/_esm/utils/errors/getCallError.js"() {
      init_contract();
      init_node();
      init_getNodeError();
    }
  });

  // node_modules/viem/_esm/utils/promise/withResolvers.js
  function withResolvers() {
    let resolve = () => void 0;
    let reject = () => void 0;
    const promise = new Promise((resolve_, reject_) => {
      resolve = resolve_;
      reject = reject_;
    });
    return { promise, resolve, reject };
  }
  var init_withResolvers = __esm({
    "node_modules/viem/_esm/utils/promise/withResolvers.js"() {
    }
  });

  // node_modules/viem/_esm/utils/promise/createBatchScheduler.js
  function createBatchScheduler({ fn, id, shouldSplitBatch, wait: wait2 = 0, sort }) {
    const exec = async () => {
      const scheduler = getScheduler();
      flush();
      const args = scheduler.map(({ args: args2 }) => args2);
      if (args.length === 0)
        return;
      fn(args).then((data) => {
        if (sort && Array.isArray(data))
          data.sort(sort);
        for (let i = 0; i < scheduler.length; i++) {
          const { resolve } = scheduler[i];
          resolve?.([data[i], data]);
        }
      }).catch((err) => {
        for (let i = 0; i < scheduler.length; i++) {
          const { reject } = scheduler[i];
          reject?.(err);
        }
      });
    };
    const flush = () => schedulerCache.delete(id);
    const getBatchedArgs = () => getScheduler().map(({ args }) => args);
    const getScheduler = () => schedulerCache.get(id) || [];
    const setScheduler = (item) => schedulerCache.set(id, [...getScheduler(), item]);
    return {
      flush,
      async schedule(args) {
        const { promise, resolve, reject } = withResolvers();
        const split2 = shouldSplitBatch?.([...getBatchedArgs(), args]);
        if (split2)
          exec();
        const hasActiveScheduler = getScheduler().length > 0;
        if (hasActiveScheduler) {
          setScheduler({ args, resolve, reject });
          return promise;
        }
        setScheduler({ args, resolve, reject });
        setTimeout(exec, wait2);
        return promise;
      }
    };
  }
  var schedulerCache;
  var init_createBatchScheduler = __esm({
    "node_modules/viem/_esm/utils/promise/createBatchScheduler.js"() {
      init_withResolvers();
      schedulerCache = /* @__PURE__ */ new Map();
    }
  });

  // node_modules/viem/_esm/errors/ccip.js
  var OffchainLookupError, OffchainLookupResponseMalformedError, OffchainLookupSenderMismatchError;
  var init_ccip = __esm({
    "node_modules/viem/_esm/errors/ccip.js"() {
      init_stringify();
      init_base();
      init_utils3();
      OffchainLookupError = class extends BaseError2 {
        constructor({ callbackSelector, cause, data, extraData, sender, urls }) {
          super(cause.shortMessage || "An error occurred while fetching for an offchain result.", {
            cause,
            metaMessages: [
              ...cause.metaMessages || [],
              cause.metaMessages?.length ? "" : [],
              "Offchain Gateway Call:",
              urls && [
                "  Gateway URL(s):",
                ...urls.map((url) => `    ${getUrl(url)}`)
              ],
              `  Sender: ${sender}`,
              `  Data: ${data}`,
              `  Callback selector: ${callbackSelector}`,
              `  Extra data: ${extraData}`
            ].flat(),
            name: "OffchainLookupError"
          });
        }
      };
      OffchainLookupResponseMalformedError = class extends BaseError2 {
        constructor({ result, url }) {
          super("Offchain gateway response is malformed. Response data must be a hex value.", {
            metaMessages: [
              `Gateway URL: ${getUrl(url)}`,
              `Response: ${stringify(result)}`
            ],
            name: "OffchainLookupResponseMalformedError"
          });
        }
      };
      OffchainLookupSenderMismatchError = class extends BaseError2 {
        constructor({ sender, to }) {
          super("Reverted sender address does not match target contract address (`to`).", {
            metaMessages: [
              `Contract address: ${to}`,
              `OffchainLookup sender address: ${sender}`
            ],
            name: "OffchainLookupSenderMismatchError"
          });
        }
      };
    }
  });

  // node_modules/viem/_esm/utils/abi/decodeFunctionData.js
  function decodeFunctionData(parameters) {
    const { abi: abi3, data } = parameters;
    const signature = slice(data, 0, 4);
    const description = abi3.find((x) => x.type === "function" && signature === toFunctionSelector(formatAbiItem2(x)));
    if (!description)
      throw new AbiFunctionSignatureNotFoundError(signature, {
        docsPath: "/docs/contract/decodeFunctionData"
      });
    return {
      functionName: description.name,
      args: "inputs" in description && description.inputs && description.inputs.length > 0 ? decodeAbiParameters(description.inputs, slice(data, 4)) : void 0
    };
  }
  var init_decodeFunctionData = __esm({
    "node_modules/viem/_esm/utils/abi/decodeFunctionData.js"() {
      init_abi();
      init_slice();
      init_toFunctionSelector();
      init_decodeAbiParameters();
      init_formatAbiItem2();
    }
  });

  // node_modules/viem/_esm/utils/abi/encodeErrorResult.js
  function encodeErrorResult(parameters) {
    const { abi: abi3, errorName, args } = parameters;
    let abiItem = abi3[0];
    if (errorName) {
      const item = getAbiItem({ abi: abi3, args, name: errorName });
      if (!item)
        throw new AbiErrorNotFoundError(errorName, { docsPath: docsPath6 });
      abiItem = item;
    }
    if (abiItem.type !== "error")
      throw new AbiErrorNotFoundError(void 0, { docsPath: docsPath6 });
    const definition = formatAbiItem2(abiItem);
    const signature = toFunctionSelector(definition);
    let data = "0x";
    if (args && args.length > 0) {
      if (!abiItem.inputs)
        throw new AbiErrorInputsNotFoundError(abiItem.name, { docsPath: docsPath6 });
      data = encodeAbiParameters(abiItem.inputs, args);
    }
    return concatHex([signature, data]);
  }
  var docsPath6;
  var init_encodeErrorResult = __esm({
    "node_modules/viem/_esm/utils/abi/encodeErrorResult.js"() {
      init_abi();
      init_concat();
      init_toFunctionSelector();
      init_encodeAbiParameters();
      init_formatAbiItem2();
      init_getAbiItem();
      docsPath6 = "/docs/contract/encodeErrorResult";
    }
  });

  // node_modules/viem/_esm/utils/abi/encodeFunctionResult.js
  function encodeFunctionResult(parameters) {
    const { abi: abi3, functionName, result } = parameters;
    let abiItem = abi3[0];
    if (functionName) {
      const item = getAbiItem({ abi: abi3, name: functionName });
      if (!item)
        throw new AbiFunctionNotFoundError(functionName, { docsPath: docsPath7 });
      abiItem = item;
    }
    if (abiItem.type !== "function")
      throw new AbiFunctionNotFoundError(void 0, { docsPath: docsPath7 });
    if (!abiItem.outputs)
      throw new AbiFunctionOutputsNotFoundError(abiItem.name, { docsPath: docsPath7 });
    const values = (() => {
      if (abiItem.outputs.length === 0)
        return [];
      if (abiItem.outputs.length === 1)
        return [result];
      if (Array.isArray(result))
        return result;
      throw new InvalidArrayError(result);
    })();
    return encodeAbiParameters(abiItem.outputs, values);
  }
  var docsPath7;
  var init_encodeFunctionResult = __esm({
    "node_modules/viem/_esm/utils/abi/encodeFunctionResult.js"() {
      init_abi();
      init_encodeAbiParameters();
      init_getAbiItem();
      docsPath7 = "/docs/contract/encodeFunctionResult";
    }
  });

  // node_modules/viem/_esm/utils/ens/localBatchGatewayRequest.js
  async function localBatchGatewayRequest(parameters) {
    const { data, ccipRequest: ccipRequest2 } = parameters;
    const { args: [queries] } = decodeFunctionData({ abi: batchGatewayAbi, data });
    const failures = [];
    const responses = [];
    await Promise.all(queries.map(async (query, i) => {
      try {
        responses[i] = query.urls.includes(localBatchGatewayUrl) ? await localBatchGatewayRequest({ data: query.data, ccipRequest: ccipRequest2 }) : await ccipRequest2(query);
        failures[i] = false;
      } catch (err) {
        failures[i] = true;
        responses[i] = encodeError(err);
      }
    }));
    return encodeFunctionResult({
      abi: batchGatewayAbi,
      functionName: "query",
      result: [failures, responses]
    });
  }
  function encodeError(error) {
    if (error.name === "HttpRequestError" && error.status)
      return encodeErrorResult({
        abi: batchGatewayAbi,
        errorName: "HttpError",
        args: [error.status, error.shortMessage]
      });
    return encodeErrorResult({
      abi: [solidityError],
      errorName: "Error",
      args: ["shortMessage" in error ? error.shortMessage : error.message]
    });
  }
  var localBatchGatewayUrl;
  var init_localBatchGatewayRequest = __esm({
    "node_modules/viem/_esm/utils/ens/localBatchGatewayRequest.js"() {
      init_abis();
      init_solidity();
      init_decodeFunctionData();
      init_encodeErrorResult();
      init_encodeFunctionResult();
      localBatchGatewayUrl = "x-batch-gateway:true";
    }
  });

  // node_modules/viem/_esm/utils/ccip.js
  var ccip_exports = {};
  __export(ccip_exports, {
    ccipRequest: () => ccipRequest,
    offchainLookup: () => offchainLookup,
    offchainLookupAbiItem: () => offchainLookupAbiItem,
    offchainLookupSignature: () => offchainLookupSignature
  });
  async function offchainLookup(client, { blockNumber, blockTag, data, to }) {
    const { args } = decodeErrorResult({
      data,
      abi: [offchainLookupAbiItem]
    });
    const [sender, urls, callData, callbackSelector, extraData] = args;
    const { ccipRead } = client;
    const ccipRequest_ = ccipRead && typeof ccipRead?.request === "function" ? ccipRead.request : ccipRequest;
    try {
      if (!isAddressEqual(to, sender))
        throw new OffchainLookupSenderMismatchError({ sender, to });
      const result = urls.includes(localBatchGatewayUrl) ? await localBatchGatewayRequest({
        data: callData,
        ccipRequest: ccipRequest_
      }) : await ccipRequest_({ data: callData, sender, urls });
      const { data: data_ } = await call(client, {
        blockNumber,
        blockTag,
        data: concat([
          callbackSelector,
          encodeAbiParameters([{ type: "bytes" }, { type: "bytes" }], [result, extraData])
        ]),
        to
      });
      return data_;
    } catch (err) {
      throw new OffchainLookupError({
        callbackSelector,
        cause: err,
        data,
        extraData,
        sender,
        urls
      });
    }
  }
  async function ccipRequest({ data, sender, urls }) {
    let error = new Error("An unknown error occurred.");
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const method = url.includes("{data}") ? "GET" : "POST";
      const body = method === "POST" ? { data, sender } : void 0;
      const headers = method === "POST" ? { "Content-Type": "application/json" } : {};
      try {
        const response = await fetch(url.replace("{sender}", sender.toLowerCase()).replace("{data}", data), {
          body: JSON.stringify(body),
          headers,
          method
        });
        let result;
        if (response.headers.get("Content-Type")?.startsWith("application/json")) {
          result = (await response.json()).data;
        } else {
          result = await response.text();
        }
        if (!response.ok) {
          error = new HttpRequestError({
            body,
            details: result?.error ? stringify(result.error) : response.statusText,
            headers: response.headers,
            status: response.status,
            url
          });
          continue;
        }
        if (!isHex(result)) {
          error = new OffchainLookupResponseMalformedError({
            result,
            url
          });
          continue;
        }
        return result;
      } catch (err) {
        error = new HttpRequestError({
          body,
          details: err.message,
          url
        });
      }
    }
    throw error;
  }
  var offchainLookupSignature, offchainLookupAbiItem;
  var init_ccip2 = __esm({
    "node_modules/viem/_esm/utils/ccip.js"() {
      init_call();
      init_ccip();
      init_request();
      init_decodeErrorResult();
      init_encodeAbiParameters();
      init_isAddressEqual();
      init_concat();
      init_isHex();
      init_localBatchGatewayRequest();
      init_stringify();
      offchainLookupSignature = "0x556f1830";
      offchainLookupAbiItem = {
        name: "OffchainLookup",
        type: "error",
        inputs: [
          {
            name: "sender",
            type: "address"
          },
          {
            name: "urls",
            type: "string[]"
          },
          {
            name: "callData",
            type: "bytes"
          },
          {
            name: "callbackFunction",
            type: "bytes4"
          },
          {
            name: "extraData",
            type: "bytes"
          }
        ]
      };
    }
  });

  // node_modules/viem/_esm/actions/public/call.js
  async function call(client, args) {
    const { account: account_ = client.account, authorizationList, batch = Boolean(client.batch?.multicall), blockNumber, blockTag = client.experimental_blockTag ?? "latest", accessList, blobs, blockOverrides, code, data: data_, factory, factoryData, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, nonce, to, value, stateOverride, ...rest } = args;
    const account = account_ ? parseAccount(account_) : void 0;
    if (code && (factory || factoryData))
      throw new BaseError2("Cannot provide both `code` & `factory`/`factoryData` as parameters.");
    if (code && to)
      throw new BaseError2("Cannot provide both `code` & `to` as parameters.");
    const deploylessCallViaBytecode = code && data_;
    const deploylessCallViaFactory = factory && factoryData && to && data_;
    const deploylessCall = deploylessCallViaBytecode || deploylessCallViaFactory;
    const data = (() => {
      if (deploylessCallViaBytecode)
        return toDeploylessCallViaBytecodeData({
          code,
          data: data_
        });
      if (deploylessCallViaFactory)
        return toDeploylessCallViaFactoryData({
          data: data_,
          factory,
          factoryData,
          to
        });
      return data_;
    })();
    try {
      assertRequest(args);
      const blockNumberHex = typeof blockNumber === "bigint" ? numberToHex(blockNumber) : void 0;
      const block = blockNumberHex || blockTag;
      const rpcBlockOverrides = blockOverrides ? toRpc2(blockOverrides) : void 0;
      const rpcStateOverride = serializeStateOverride(stateOverride);
      const chainFormat = client.chain?.formatters?.transactionRequest?.format;
      const format = chainFormat || formatTransactionRequest;
      const request = format({
        // Pick out extra data that might exist on the chain's transaction request type.
        ...extract(rest, { format: chainFormat }),
        from: account?.address,
        accessList,
        authorizationList,
        blobs,
        data,
        gas,
        gasPrice,
        maxFeePerBlobGas,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        to: deploylessCall ? void 0 : to,
        value
      }, "call");
      if (batch && shouldPerformMulticall({ request }) && !rpcStateOverride && !rpcBlockOverrides) {
        try {
          return await scheduleMulticall(client, {
            ...request,
            blockNumber,
            blockTag
          });
        } catch (err) {
          if (!(err instanceof ClientChainNotConfiguredError) && !(err instanceof ChainDoesNotSupportContract))
            throw err;
        }
      }
      const params = (() => {
        const base = [
          request,
          block
        ];
        if (rpcStateOverride && rpcBlockOverrides)
          return [...base, rpcStateOverride, rpcBlockOverrides];
        if (rpcStateOverride)
          return [...base, rpcStateOverride];
        if (rpcBlockOverrides)
          return [...base, {}, rpcBlockOverrides];
        return base;
      })();
      const response = await client.request({
        method: "eth_call",
        params
      });
      if (response === "0x")
        return { data: void 0 };
      return { data: response };
    } catch (err) {
      const data2 = getRevertErrorData(err);
      const { offchainLookup: offchainLookup2, offchainLookupSignature: offchainLookupSignature2 } = await Promise.resolve().then(() => (init_ccip2(), ccip_exports));
      if (client.ccipRead !== false && data2?.slice(0, 10) === offchainLookupSignature2 && to)
        return { data: await offchainLookup2(client, { data: data2, to }) };
      if (deploylessCall && data2?.slice(0, 10) === "0x101bb98d")
        throw new CounterfactualDeploymentFailedError({ factory });
      throw getCallError(err, {
        ...args,
        account,
        chain: client.chain
      });
    }
  }
  function shouldPerformMulticall({ request }) {
    const { data, to, ...request_ } = request;
    if (!data)
      return false;
    if (data.startsWith(aggregate3Signature))
      return false;
    if (!to)
      return false;
    if (Object.values(request_).filter((x) => typeof x !== "undefined").length > 0)
      return false;
    return true;
  }
  async function scheduleMulticall(client, args) {
    const { batchSize = 1024, deployless = false, wait: wait2 = 0 } = typeof client.batch?.multicall === "object" ? client.batch.multicall : {};
    const { blockNumber, blockTag = client.experimental_blockTag ?? "latest", data, to } = args;
    const multicallAddress = (() => {
      if (deployless)
        return null;
      if (args.multicallAddress)
        return args.multicallAddress;
      if (client.chain) {
        return getChainContractAddress({
          blockNumber,
          chain: client.chain,
          contract: "multicall3"
        });
      }
      throw new ClientChainNotConfiguredError();
    })();
    const blockNumberHex = typeof blockNumber === "bigint" ? numberToHex(blockNumber) : void 0;
    const block = blockNumberHex || blockTag;
    const { schedule } = createBatchScheduler({
      id: `${client.uid}.${block}`,
      wait: wait2,
      shouldSplitBatch(args2) {
        const size5 = args2.reduce((size6, { data: data2 }) => size6 + (data2.length - 2), 0);
        return size5 > batchSize * 2;
      },
      fn: async (requests) => {
        const calls = requests.map((request) => ({
          allowFailure: true,
          callData: request.data,
          target: request.to
        }));
        const calldata = encodeFunctionData({
          abi: multicall3Abi,
          args: [calls],
          functionName: "aggregate3"
        });
        const data2 = await client.request({
          method: "eth_call",
          params: [
            {
              ...multicallAddress === null ? {
                data: toDeploylessCallViaBytecodeData({
                  code: multicall3Bytecode,
                  data: calldata
                })
              } : { to: multicallAddress, data: calldata }
            },
            block
          ]
        });
        return decodeFunctionResult({
          abi: multicall3Abi,
          args: [calls],
          functionName: "aggregate3",
          data: data2 || "0x"
        });
      }
    });
    const [{ returnData, success }] = await schedule({ data, to });
    if (!success)
      throw new RawContractError({ data: returnData });
    if (returnData === "0x")
      return { data: void 0 };
    return { data: returnData };
  }
  function toDeploylessCallViaBytecodeData(parameters) {
    const { code, data } = parameters;
    return encodeDeployData({
      abi: parseAbi(["constructor(bytes, bytes)"]),
      bytecode: deploylessCallViaBytecodeBytecode,
      args: [code, data]
    });
  }
  function toDeploylessCallViaFactoryData(parameters) {
    const { data, factory, factoryData, to } = parameters;
    return encodeDeployData({
      abi: parseAbi(["constructor(address, bytes, address, bytes)"]),
      bytecode: deploylessCallViaFactoryBytecode,
      args: [to, data, factory, factoryData]
    });
  }
  function getRevertErrorData(err) {
    if (!(err instanceof BaseError2))
      return void 0;
    const error = err.walk();
    return typeof error?.data === "object" ? error.data?.data : error.data;
  }
  var init_call = __esm({
    "node_modules/viem/_esm/actions/public/call.js"() {
      init_exports();
      init_BlockOverrides();
      init_parseAccount();
      init_abis();
      init_contract2();
      init_contracts();
      init_base();
      init_chain();
      init_contract();
      init_decodeFunctionResult();
      init_encodeDeployData();
      init_encodeFunctionData();
      init_getChainContractAddress();
      init_toHex();
      init_getCallError();
      init_extract();
      init_transactionRequest();
      init_createBatchScheduler();
      init_stateOverride2();
      init_assertRequest();
    }
  });

  // node_modules/viem/_esm/actions/public/readContract.js
  async function readContract(client, parameters) {
    const { abi: abi3, address, args, functionName, ...rest } = parameters;
    const calldata = encodeFunctionData({
      abi: abi3,
      args,
      functionName
    });
    try {
      const { data } = await getAction(client, call, "call")({
        ...rest,
        data: calldata,
        to: address
      });
      return decodeFunctionResult({
        abi: abi3,
        args,
        functionName,
        data: data || "0x"
      });
    } catch (error) {
      throw getContractError(error, {
        abi: abi3,
        address,
        args,
        docsPath: "/docs/contract/readContract",
        functionName
      });
    }
  }
  var init_readContract = __esm({
    "node_modules/viem/_esm/actions/public/readContract.js"() {
      init_decodeFunctionResult();
      init_encodeFunctionData();
      init_getContractError();
      init_getAction();
      init_call();
    }
  });

  // node_modules/viem/_esm/actions/public/simulateContract.js
  async function simulateContract(client, parameters) {
    const { abi: abi3, address, args, dataSuffix, functionName, ...callRequest } = parameters;
    const account = callRequest.account ? parseAccount(callRequest.account) : client.account;
    const calldata = encodeFunctionData({ abi: abi3, args, functionName });
    try {
      const { data } = await getAction(client, call, "call")({
        batch: false,
        data: `${calldata}${dataSuffix ? dataSuffix.replace("0x", "") : ""}`,
        to: address,
        ...callRequest,
        account
      });
      const result = decodeFunctionResult({
        abi: abi3,
        args,
        functionName,
        data: data || "0x"
      });
      const minimizedAbi = abi3.filter((abiItem) => "name" in abiItem && abiItem.name === parameters.functionName);
      return {
        result,
        request: {
          abi: minimizedAbi,
          address,
          args,
          dataSuffix,
          functionName,
          ...callRequest,
          account
        }
      };
    } catch (error) {
      throw getContractError(error, {
        abi: abi3,
        address,
        args,
        docsPath: "/docs/contract/simulateContract",
        functionName,
        sender: account?.address
      });
    }
  }
  var init_simulateContract = __esm({
    "node_modules/viem/_esm/actions/public/simulateContract.js"() {
      init_parseAccount();
      init_decodeFunctionResult();
      init_encodeFunctionData();
      init_getContractError();
      init_getAction();
      init_call();
    }
  });

  // node_modules/viem/_esm/utils/observe.js
  function observe(observerId, callbacks, fn) {
    const callbackId = ++callbackCount;
    const getListeners = () => listenersCache.get(observerId) || [];
    const unsubscribe = () => {
      const listeners2 = getListeners();
      listenersCache.set(observerId, listeners2.filter((cb) => cb.id !== callbackId));
    };
    const unwatch = () => {
      const listeners2 = getListeners();
      if (!listeners2.some((cb) => cb.id === callbackId))
        return;
      const cleanup2 = cleanupCache.get(observerId);
      if (listeners2.length === 1 && cleanup2) {
        const p = cleanup2();
        if (p instanceof Promise)
          p.catch(() => {
          });
      }
      unsubscribe();
    };
    const listeners = getListeners();
    listenersCache.set(observerId, [
      ...listeners,
      { id: callbackId, fns: callbacks }
    ]);
    if (listeners && listeners.length > 0)
      return unwatch;
    const emit = {};
    for (const key in callbacks) {
      emit[key] = ((...args) => {
        const listeners2 = getListeners();
        if (listeners2.length === 0)
          return;
        for (const listener of listeners2)
          listener.fns[key]?.(...args);
      });
    }
    const cleanup = fn(emit);
    if (typeof cleanup === "function")
      cleanupCache.set(observerId, cleanup);
    return unwatch;
  }
  var listenersCache, cleanupCache, callbackCount;
  var init_observe = __esm({
    "node_modules/viem/_esm/utils/observe.js"() {
      listenersCache = /* @__PURE__ */ new Map();
      cleanupCache = /* @__PURE__ */ new Map();
      callbackCount = 0;
    }
  });

  // node_modules/viem/_esm/utils/wait.js
  async function wait(time) {
    return new Promise((res) => setTimeout(res, time));
  }
  var init_wait = __esm({
    "node_modules/viem/_esm/utils/wait.js"() {
    }
  });

  // node_modules/viem/_esm/utils/poll.js
  function poll(fn, { emitOnBegin, initialWaitTime, interval }) {
    let active = true;
    const unwatch = () => active = false;
    const watch = async () => {
      let data;
      if (emitOnBegin)
        data = await fn({ unpoll: unwatch });
      const initialWait = await initialWaitTime?.(data) ?? interval;
      await wait(initialWait);
      const poll2 = async () => {
        if (!active)
          return;
        await fn({ unpoll: unwatch });
        await wait(interval);
        poll2();
      };
      poll2();
    };
    watch();
    return unwatch;
  }
  var init_poll = __esm({
    "node_modules/viem/_esm/utils/poll.js"() {
      init_wait();
    }
  });

  // node_modules/viem/_esm/utils/promise/withCache.js
  function getCache(cacheKey2) {
    const buildCache = (cacheKey3, cache) => ({
      clear: () => cache.delete(cacheKey3),
      get: () => cache.get(cacheKey3),
      set: (data) => cache.set(cacheKey3, data)
    });
    const promise = buildCache(cacheKey2, promiseCache);
    const response = buildCache(cacheKey2, responseCache);
    return {
      clear: () => {
        promise.clear();
        response.clear();
      },
      promise,
      response
    };
  }
  async function withCache(fn, { cacheKey: cacheKey2, cacheTime = Number.POSITIVE_INFINITY }) {
    const cache = getCache(cacheKey2);
    const response = cache.response.get();
    if (response && cacheTime > 0) {
      const age = Date.now() - response.created.getTime();
      if (age < cacheTime)
        return response.data;
    }
    let promise = cache.promise.get();
    if (!promise) {
      promise = fn();
      cache.promise.set(promise);
    }
    try {
      const data = await promise;
      cache.response.set({ created: /* @__PURE__ */ new Date(), data });
      return data;
    } finally {
      cache.promise.clear();
    }
  }
  var promiseCache, responseCache;
  var init_withCache = __esm({
    "node_modules/viem/_esm/utils/promise/withCache.js"() {
      promiseCache = /* @__PURE__ */ new Map();
      responseCache = /* @__PURE__ */ new Map();
    }
  });

  // node_modules/viem/_esm/actions/public/getBlockNumber.js
  async function getBlockNumber(client, { cacheTime = client.cacheTime } = {}) {
    const blockNumberHex = await withCache(() => client.request({
      method: "eth_blockNumber"
    }), { cacheKey: cacheKey(client.uid), cacheTime });
    return BigInt(blockNumberHex);
  }
  var cacheKey;
  var init_getBlockNumber = __esm({
    "node_modules/viem/_esm/actions/public/getBlockNumber.js"() {
      init_withCache();
      cacheKey = (id) => `blockNumber.${id}`;
    }
  });

  // node_modules/viem/_esm/actions/public/getFilterChanges.js
  async function getFilterChanges(_client, { filter }) {
    const strict = "strict" in filter && filter.strict;
    const logs = await filter.request({
      method: "eth_getFilterChanges",
      params: [filter.id]
    });
    if (typeof logs[0] === "string")
      return logs;
    const formattedLogs = logs.map((log) => formatLog(log));
    if (!("abi" in filter) || !filter.abi)
      return formattedLogs;
    return parseEventLogs({
      abi: filter.abi,
      logs: formattedLogs,
      strict
    });
  }
  var init_getFilterChanges = __esm({
    "node_modules/viem/_esm/actions/public/getFilterChanges.js"() {
      init_parseEventLogs();
      init_log2();
    }
  });

  // node_modules/viem/_esm/actions/public/uninstallFilter.js
  async function uninstallFilter(_client, { filter }) {
    return filter.request({
      method: "eth_uninstallFilter",
      params: [filter.id]
    });
  }
  var init_uninstallFilter = __esm({
    "node_modules/viem/_esm/actions/public/uninstallFilter.js"() {
    }
  });

  // node_modules/viem/_esm/actions/public/watchContractEvent.js
  function watchContractEvent(client, parameters) {
    const { abi: abi3, address, args, batch = true, eventName, fromBlock, onError, onLogs, poll: poll_, pollingInterval = client.pollingInterval, strict: strict_ } = parameters;
    const enablePolling = (() => {
      if (typeof poll_ !== "undefined")
        return poll_;
      if (typeof fromBlock === "bigint")
        return true;
      if (client.transport.type === "webSocket" || client.transport.type === "ipc")
        return false;
      if (client.transport.type === "fallback" && (client.transport.transports[0].config.type === "webSocket" || client.transport.transports[0].config.type === "ipc"))
        return false;
      return true;
    })();
    const pollContractEvent = () => {
      const strict = strict_ ?? false;
      const observerId = stringify([
        "watchContractEvent",
        address,
        args,
        batch,
        client.uid,
        eventName,
        pollingInterval,
        strict,
        fromBlock
      ]);
      return observe(observerId, { onLogs, onError }, (emit) => {
        let previousBlockNumber;
        if (fromBlock !== void 0)
          previousBlockNumber = fromBlock - 1n;
        let filter;
        let initialized = false;
        const unwatch = poll(async () => {
          if (!initialized) {
            try {
              filter = await getAction(client, createContractEventFilter, "createContractEventFilter")({
                abi: abi3,
                address,
                args,
                eventName,
                strict,
                fromBlock
              });
            } catch {
            }
            initialized = true;
            return;
          }
          try {
            let logs;
            if (filter) {
              logs = await getAction(client, getFilterChanges, "getFilterChanges")({ filter });
            } else {
              const blockNumber = await getAction(client, getBlockNumber, "getBlockNumber")({});
              if (previousBlockNumber && previousBlockNumber < blockNumber) {
                logs = await getAction(client, getContractEvents, "getContractEvents")({
                  abi: abi3,
                  address,
                  args,
                  eventName,
                  fromBlock: previousBlockNumber + 1n,
                  toBlock: blockNumber,
                  strict
                });
              } else {
                logs = [];
              }
              previousBlockNumber = blockNumber;
            }
            if (logs.length === 0)
              return;
            if (batch)
              emit.onLogs(logs);
            else
              for (const log of logs)
                emit.onLogs([log]);
          } catch (err) {
            if (filter && err instanceof InvalidInputRpcError)
              initialized = false;
            emit.onError?.(err);
          }
        }, {
          emitOnBegin: true,
          interval: pollingInterval
        });
        return async () => {
          if (filter)
            await getAction(client, uninstallFilter, "uninstallFilter")({ filter });
          unwatch();
        };
      });
    };
    const subscribeContractEvent = () => {
      const strict = strict_ ?? false;
      const observerId = stringify([
        "watchContractEvent",
        address,
        args,
        batch,
        client.uid,
        eventName,
        pollingInterval,
        strict
      ]);
      let active = true;
      let unsubscribe = () => active = false;
      return observe(observerId, { onLogs, onError }, (emit) => {
        ;
        (async () => {
          try {
            const transport = (() => {
              if (client.transport.type === "fallback") {
                const transport2 = client.transport.transports.find((transport3) => transport3.config.type === "webSocket" || transport3.config.type === "ipc");
                if (!transport2)
                  return client.transport;
                return transport2.value;
              }
              return client.transport;
            })();
            const topics = eventName ? encodeEventTopics({
              abi: abi3,
              eventName,
              args
            }) : [];
            const { unsubscribe: unsubscribe_ } = await transport.subscribe({
              params: ["logs", { address, topics }],
              onData(data) {
                if (!active)
                  return;
                const log = data.result;
                try {
                  const { eventName: eventName2, args: args2 } = decodeEventLog({
                    abi: abi3,
                    data: log.data,
                    topics: log.topics,
                    strict: strict_
                  });
                  const formatted = formatLog(log, {
                    args: args2,
                    eventName: eventName2
                  });
                  emit.onLogs([formatted]);
                } catch (err) {
                  let eventName2;
                  let isUnnamed;
                  if (err instanceof DecodeLogDataMismatch || err instanceof DecodeLogTopicsMismatch) {
                    if (strict_)
                      return;
                    eventName2 = err.abiItem.name;
                    isUnnamed = err.abiItem.inputs?.some((x) => !("name" in x && x.name));
                  }
                  const formatted = formatLog(log, {
                    args: isUnnamed ? [] : {},
                    eventName: eventName2
                  });
                  emit.onLogs([formatted]);
                }
              },
              onError(error) {
                emit.onError?.(error);
              }
            });
            unsubscribe = unsubscribe_;
            if (!active)
              unsubscribe();
          } catch (err) {
            onError?.(err);
          }
        })();
        return () => unsubscribe();
      });
    };
    return enablePolling ? pollContractEvent() : subscribeContractEvent();
  }
  var init_watchContractEvent = __esm({
    "node_modules/viem/_esm/actions/public/watchContractEvent.js"() {
      init_abi();
      init_rpc();
      init_decodeEventLog();
      init_encodeEventTopics();
      init_log2();
      init_getAction();
      init_observe();
      init_poll();
      init_stringify();
      init_createContractEventFilter();
      init_getBlockNumber();
      init_getContractEvents();
      init_getFilterChanges();
      init_uninstallFilter();
    }
  });

  // node_modules/viem/_esm/errors/account.js
  var AccountNotFoundError;
  var init_account = __esm({
    "node_modules/viem/_esm/errors/account.js"() {
      init_base();
      AccountNotFoundError = class extends BaseError2 {
        constructor({ docsPath: docsPath8 } = {}) {
          super([
            "Could not find an Account to execute with this Action.",
            "Please provide an Account with the `account` argument on the Action, or by supplying an `account` to the Client."
          ].join("\n"), {
            docsPath: docsPath8,
            docsSlug: "account",
            name: "AccountNotFoundError"
          });
        }
      };
    }
  });

  // node_modules/viem/_esm/actions/wallet/sendRawTransaction.js
  async function sendRawTransaction(client, { serializedTransaction }) {
    return client.request({
      method: "eth_sendRawTransaction",
      params: [serializedTransaction]
    }, { retryCount: 0 });
  }
  var init_sendRawTransaction = __esm({
    "node_modules/viem/_esm/actions/wallet/sendRawTransaction.js"() {
    }
  });

  // node_modules/viem/_esm/utils/promise/withRetry.js
  function withRetry(fn, { delay: delay_ = 100, retryCount = 2, shouldRetry: shouldRetry2 = () => true } = {}) {
    return new Promise((resolve, reject) => {
      const attemptRetry = async ({ count = 0 } = {}) => {
        const retry = async ({ error }) => {
          const delay = typeof delay_ === "function" ? delay_({ count, error }) : delay_;
          if (delay)
            await wait(delay);
          attemptRetry({ count: count + 1 });
        };
        try {
          const data = await fn();
          resolve(data);
        } catch (err) {
          if (count < retryCount && await shouldRetry2({ count, error: err }))
            return retry({ error: err });
          reject(err);
        }
      };
      attemptRetry();
    });
  }
  var init_withRetry = __esm({
    "node_modules/viem/_esm/utils/promise/withRetry.js"() {
      init_wait();
    }
  });

  // node_modules/viem/_esm/utils/formatters/transactionReceipt.js
  function formatTransactionReceipt(transactionReceipt, _) {
    const receipt = {
      ...transactionReceipt,
      blockNumber: transactionReceipt.blockNumber ? BigInt(transactionReceipt.blockNumber) : null,
      contractAddress: transactionReceipt.contractAddress ? transactionReceipt.contractAddress : null,
      cumulativeGasUsed: transactionReceipt.cumulativeGasUsed ? BigInt(transactionReceipt.cumulativeGasUsed) : null,
      effectiveGasPrice: transactionReceipt.effectiveGasPrice ? BigInt(transactionReceipt.effectiveGasPrice) : null,
      gasUsed: transactionReceipt.gasUsed ? BigInt(transactionReceipt.gasUsed) : null,
      logs: transactionReceipt.logs ? transactionReceipt.logs.map((log) => formatLog(log)) : null,
      to: transactionReceipt.to ? transactionReceipt.to : null,
      transactionIndex: transactionReceipt.transactionIndex ? hexToNumber(transactionReceipt.transactionIndex) : null,
      status: transactionReceipt.status ? receiptStatuses[transactionReceipt.status] : null,
      type: transactionReceipt.type ? transactionType[transactionReceipt.type] || transactionReceipt.type : null
    };
    if (transactionReceipt.blobGasPrice)
      receipt.blobGasPrice = BigInt(transactionReceipt.blobGasPrice);
    if (transactionReceipt.blobGasUsed)
      receipt.blobGasUsed = BigInt(transactionReceipt.blobGasUsed);
    return receipt;
  }
  var receiptStatuses, defineTransactionReceipt;
  var init_transactionReceipt = __esm({
    "node_modules/viem/_esm/utils/formatters/transactionReceipt.js"() {
      init_fromHex();
      init_formatter();
      init_log2();
      init_transaction2();
      receiptStatuses = {
        "0x0": "reverted",
        "0x1": "success"
      };
      defineTransactionReceipt = /* @__PURE__ */ defineFormatter("transactionReceipt", formatTransactionReceipt);
    }
  });

  // node_modules/viem/_esm/utils/uid.js
  function uid(length = 11) {
    if (!buffer || index + length > size4 * 2) {
      buffer = "";
      index = 0;
      for (let i = 0; i < size4; i++) {
        buffer += (256 + Math.random() * 256 | 0).toString(16).substring(1);
      }
    }
    return buffer.substring(index, index++ + length);
  }
  var size4, index, buffer;
  var init_uid = __esm({
    "node_modules/viem/_esm/utils/uid.js"() {
      size4 = 256;
      index = size4;
    }
  });

  // node_modules/viem/_esm/clients/createClient.js
  function createClient(parameters) {
    const { batch, chain, ccipRead, key = "base", name = "Base Client", type = "base" } = parameters;
    const experimental_blockTag = parameters.experimental_blockTag ?? (typeof chain?.experimental_preconfirmationTime === "number" ? "pending" : void 0);
    const blockTime = chain?.blockTime ?? 12e3;
    const defaultPollingInterval = Math.min(Math.max(Math.floor(blockTime / 2), 500), 4e3);
    const pollingInterval = parameters.pollingInterval ?? defaultPollingInterval;
    const cacheTime = parameters.cacheTime ?? pollingInterval;
    const account = parameters.account ? parseAccount(parameters.account) : void 0;
    const { config, request, value } = parameters.transport({
      chain,
      pollingInterval
    });
    const transport = { ...config, ...value };
    const client = {
      account,
      batch,
      cacheTime,
      ccipRead,
      chain,
      key,
      name,
      pollingInterval,
      request,
      transport,
      type,
      uid: uid(),
      ...experimental_blockTag ? { experimental_blockTag } : {}
    };
    function extend(base) {
      return (extendFn) => {
        const extended = extendFn(base);
        for (const key2 in client)
          delete extended[key2];
        const combined = { ...base, ...extended };
        return Object.assign(combined, { extend: extend(combined) });
      };
    }
    return Object.assign(client, { extend: extend(client) });
  }
  var init_createClient = __esm({
    "node_modules/viem/_esm/clients/createClient.js"() {
      init_parseAccount();
      init_uid();
    }
  });

  // node_modules/viem/_esm/utils/ens/errors.js
  function isNullUniversalResolverError(err) {
    if (!(err instanceof BaseError2))
      return false;
    const cause = err.walk((e) => e instanceof ContractFunctionRevertedError);
    if (!(cause instanceof ContractFunctionRevertedError))
      return false;
    if (cause.data?.errorName === "HttpError")
      return true;
    if (cause.data?.errorName === "ResolverError")
      return true;
    if (cause.data?.errorName === "ResolverNotContract")
      return true;
    if (cause.data?.errorName === "ResolverNotFound")
      return true;
    if (cause.data?.errorName === "ReverseAddressMismatch")
      return true;
    if (cause.data?.errorName === "UnsupportedResolverProfile")
      return true;
    return false;
  }
  var init_errors3 = __esm({
    "node_modules/viem/_esm/utils/ens/errors.js"() {
      init_base();
      init_contract();
    }
  });

  // node_modules/viem/_esm/utils/ens/encodedLabelToLabelhash.js
  function encodedLabelToLabelhash(label) {
    if (label.length !== 66)
      return null;
    if (label.indexOf("[") !== 0)
      return null;
    if (label.indexOf("]") !== 65)
      return null;
    const hash3 = `0x${label.slice(1, 65)}`;
    if (!isHex(hash3))
      return null;
    return hash3;
  }
  var init_encodedLabelToLabelhash = __esm({
    "node_modules/viem/_esm/utils/ens/encodedLabelToLabelhash.js"() {
      init_isHex();
    }
  });

  // node_modules/viem/_esm/utils/ens/namehash.js
  function namehash(name) {
    let result = new Uint8Array(32).fill(0);
    if (!name)
      return bytesToHex(result);
    const labels = name.split(".");
    for (let i = labels.length - 1; i >= 0; i -= 1) {
      const hashFromEncodedLabel = encodedLabelToLabelhash(labels[i]);
      const hashed = hashFromEncodedLabel ? toBytes(hashFromEncodedLabel) : keccak256(stringToBytes(labels[i]), "bytes");
      result = keccak256(concat([result, hashed]), "bytes");
    }
    return bytesToHex(result);
  }
  var init_namehash = __esm({
    "node_modules/viem/_esm/utils/ens/namehash.js"() {
      init_concat();
      init_toBytes();
      init_toHex();
      init_keccak256();
      init_encodedLabelToLabelhash();
    }
  });

  // node_modules/viem/_esm/utils/ens/encodeLabelhash.js
  function encodeLabelhash(hash3) {
    return `[${hash3.slice(2)}]`;
  }
  var init_encodeLabelhash = __esm({
    "node_modules/viem/_esm/utils/ens/encodeLabelhash.js"() {
    }
  });

  // node_modules/viem/_esm/utils/ens/labelhash.js
  function labelhash(label) {
    const result = new Uint8Array(32).fill(0);
    if (!label)
      return bytesToHex(result);
    return encodedLabelToLabelhash(label) || keccak256(stringToBytes(label));
  }
  var init_labelhash = __esm({
    "node_modules/viem/_esm/utils/ens/labelhash.js"() {
      init_toBytes();
      init_toHex();
      init_keccak256();
      init_encodedLabelToLabelhash();
    }
  });

  // node_modules/viem/_esm/utils/ens/packetToBytes.js
  function packetToBytes(packet) {
    const value = packet.replace(/^\.|\.$/gm, "");
    if (value.length === 0)
      return new Uint8Array(1);
    const bytes = new Uint8Array(stringToBytes(value).byteLength + 2);
    let offset = 0;
    const list = value.split(".");
    for (let i = 0; i < list.length; i++) {
      let encoded = stringToBytes(list[i]);
      if (encoded.byteLength > 255)
        encoded = stringToBytes(encodeLabelhash(labelhash(list[i])));
      bytes[offset] = encoded.length;
      bytes.set(encoded, offset + 1);
      offset += encoded.length + 1;
    }
    if (bytes.byteLength !== offset + 1)
      return bytes.slice(0, offset + 1);
    return bytes;
  }
  var init_packetToBytes = __esm({
    "node_modules/viem/_esm/utils/ens/packetToBytes.js"() {
      init_toBytes();
      init_encodeLabelhash();
      init_labelhash();
    }
  });

  // node_modules/viem/_esm/actions/ens/getEnsAddress.js
  async function getEnsAddress(client, parameters) {
    const { blockNumber, blockTag, coinType, name, gatewayUrls, strict } = parameters;
    const { chain } = client;
    const universalResolverAddress = (() => {
      if (parameters.universalResolverAddress)
        return parameters.universalResolverAddress;
      if (!chain)
        throw new Error("client chain not configured. universalResolverAddress is required.");
      return getChainContractAddress({
        blockNumber,
        chain,
        contract: "ensUniversalResolver"
      });
    })();
    const tlds = chain?.ensTlds;
    if (tlds && !tlds.some((tld) => name.endsWith(tld)))
      return null;
    const args = (() => {
      if (coinType != null)
        return [namehash(name), BigInt(coinType)];
      return [namehash(name)];
    })();
    try {
      const functionData = encodeFunctionData({
        abi: addressResolverAbi,
        functionName: "addr",
        args
      });
      const readContractParameters = {
        address: universalResolverAddress,
        abi: universalResolverResolveAbi,
        functionName: "resolveWithGateways",
        args: [
          toHex(packetToBytes(name)),
          functionData,
          gatewayUrls ?? [localBatchGatewayUrl]
        ],
        blockNumber,
        blockTag
      };
      const readContractAction = getAction(client, readContract, "readContract");
      const res = await readContractAction(readContractParameters);
      if (res[0] === "0x")
        return null;
      const address = decodeFunctionResult({
        abi: addressResolverAbi,
        args,
        functionName: "addr",
        data: res[0]
      });
      if (address === "0x")
        return null;
      if (trim(address) === "0x00")
        return null;
      return address;
    } catch (err) {
      if (strict)
        throw err;
      if (isNullUniversalResolverError(err))
        return null;
      throw err;
    }
  }
  var init_getEnsAddress = __esm({
    "node_modules/viem/_esm/actions/ens/getEnsAddress.js"() {
      init_abis();
      init_decodeFunctionResult();
      init_encodeFunctionData();
      init_getChainContractAddress();
      init_trim();
      init_toHex();
      init_errors3();
      init_localBatchGatewayRequest();
      init_namehash();
      init_packetToBytes();
      init_getAction();
      init_readContract();
    }
  });

  // node_modules/viem/_esm/errors/ens.js
  var EnsAvatarInvalidMetadataError, EnsAvatarInvalidNftUriError, EnsAvatarUriResolutionError, EnsAvatarUnsupportedNamespaceError;
  var init_ens = __esm({
    "node_modules/viem/_esm/errors/ens.js"() {
      init_base();
      EnsAvatarInvalidMetadataError = class extends BaseError2 {
        constructor({ data }) {
          super("Unable to extract image from metadata. The metadata may be malformed or invalid.", {
            metaMessages: [
              "- Metadata must be a JSON object with at least an `image`, `image_url` or `image_data` property.",
              "",
              `Provided data: ${JSON.stringify(data)}`
            ],
            name: "EnsAvatarInvalidMetadataError"
          });
        }
      };
      EnsAvatarInvalidNftUriError = class extends BaseError2 {
        constructor({ reason }) {
          super(`ENS NFT avatar URI is invalid. ${reason}`, {
            name: "EnsAvatarInvalidNftUriError"
          });
        }
      };
      EnsAvatarUriResolutionError = class extends BaseError2 {
        constructor({ uri }) {
          super(`Unable to resolve ENS avatar URI "${uri}". The URI may be malformed, invalid, or does not respond with a valid image.`, { name: "EnsAvatarUriResolutionError" });
        }
      };
      EnsAvatarUnsupportedNamespaceError = class extends BaseError2 {
        constructor({ namespace }) {
          super(`ENS NFT avatar namespace "${namespace}" is not supported. Must be "erc721" or "erc1155".`, { name: "EnsAvatarUnsupportedNamespaceError" });
        }
      };
    }
  });

  // node_modules/viem/_esm/utils/ens/avatar/utils.js
  async function isImageUri(uri) {
    try {
      const res = await fetch(uri, { method: "HEAD" });
      if (res.status === 200) {
        const contentType = res.headers.get("content-type");
        return contentType?.startsWith("image/");
      }
      return false;
    } catch (error) {
      if (typeof error === "object" && typeof error.response !== "undefined") {
        return false;
      }
      if (!Object.hasOwn(globalThis, "Image"))
        return false;
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          resolve(true);
        };
        img.onerror = () => {
          resolve(false);
        };
        img.src = uri;
      });
    }
  }
  function getGateway(custom, defaultGateway) {
    if (!custom)
      return defaultGateway;
    if (custom.endsWith("/"))
      return custom.slice(0, -1);
    return custom;
  }
  function resolveAvatarUri({ uri, gatewayUrls }) {
    const isEncoded = base64Regex.test(uri);
    if (isEncoded)
      return { uri, isOnChain: true, isEncoded };
    const ipfsGateway = getGateway(gatewayUrls?.ipfs, "https://ipfs.io");
    const arweaveGateway = getGateway(gatewayUrls?.arweave, "https://arweave.net");
    const networkRegexMatch = uri.match(networkRegex);
    const { protocol, subpath, target, subtarget = "" } = networkRegexMatch?.groups || {};
    const isIPNS = protocol === "ipns:/" || subpath === "ipns/";
    const isIPFS = protocol === "ipfs:/" || subpath === "ipfs/" || ipfsHashRegex.test(uri);
    if (uri.startsWith("http") && !isIPNS && !isIPFS) {
      let replacedUri = uri;
      if (gatewayUrls?.arweave)
        replacedUri = uri.replace(/https:\/\/arweave.net/g, gatewayUrls?.arweave);
      return { uri: replacedUri, isOnChain: false, isEncoded: false };
    }
    if ((isIPNS || isIPFS) && target) {
      return {
        uri: `${ipfsGateway}/${isIPNS ? "ipns" : "ipfs"}/${target}${subtarget}`,
        isOnChain: false,
        isEncoded: false
      };
    }
    if (protocol === "ar:/" && target) {
      return {
        uri: `${arweaveGateway}/${target}${subtarget || ""}`,
        isOnChain: false,
        isEncoded: false
      };
    }
    let parsedUri = uri.replace(dataURIRegex, "");
    if (parsedUri.startsWith("<svg")) {
      parsedUri = `data:image/svg+xml;base64,${btoa(parsedUri)}`;
    }
    if (parsedUri.startsWith("data:") || parsedUri.startsWith("{")) {
      return {
        uri: parsedUri,
        isOnChain: true,
        isEncoded: false
      };
    }
    throw new EnsAvatarUriResolutionError({ uri });
  }
  function getJsonImage(data) {
    if (typeof data !== "object" || !("image" in data) && !("image_url" in data) && !("image_data" in data)) {
      throw new EnsAvatarInvalidMetadataError({ data });
    }
    return data.image || data.image_url || data.image_data;
  }
  async function getMetadataAvatarUri({ gatewayUrls, uri }) {
    try {
      const res = await fetch(uri).then((res2) => res2.json());
      const image = await parseAvatarUri({
        gatewayUrls,
        uri: getJsonImage(res)
      });
      return image;
    } catch {
      throw new EnsAvatarUriResolutionError({ uri });
    }
  }
  async function parseAvatarUri({ gatewayUrls, uri }) {
    const { uri: resolvedURI, isOnChain } = resolveAvatarUri({ uri, gatewayUrls });
    if (isOnChain)
      return resolvedURI;
    const isImage = await isImageUri(resolvedURI);
    if (isImage)
      return resolvedURI;
    throw new EnsAvatarUriResolutionError({ uri });
  }
  function parseNftUri(uri_) {
    let uri = uri_;
    if (uri.startsWith("did:nft:")) {
      uri = uri.replace("did:nft:", "").replace(/_/g, "/");
    }
    const [reference, asset_namespace, tokenID] = uri.split("/");
    const [eip_namespace, chainID] = reference.split(":");
    const [erc_namespace, contractAddress] = asset_namespace.split(":");
    if (!eip_namespace || eip_namespace.toLowerCase() !== "eip155")
      throw new EnsAvatarInvalidNftUriError({ reason: "Only EIP-155 supported" });
    if (!chainID)
      throw new EnsAvatarInvalidNftUriError({ reason: "Chain ID not found" });
    if (!contractAddress)
      throw new EnsAvatarInvalidNftUriError({
        reason: "Contract address not found"
      });
    if (!tokenID)
      throw new EnsAvatarInvalidNftUriError({ reason: "Token ID not found" });
    if (!erc_namespace)
      throw new EnsAvatarInvalidNftUriError({ reason: "ERC namespace not found" });
    return {
      chainID: Number.parseInt(chainID, 10),
      namespace: erc_namespace.toLowerCase(),
      contractAddress,
      tokenID
    };
  }
  async function getNftTokenUri(client, { nft }) {
    if (nft.namespace === "erc721") {
      return readContract(client, {
        address: nft.contractAddress,
        abi: [
          {
            name: "tokenURI",
            type: "function",
            stateMutability: "view",
            inputs: [{ name: "tokenId", type: "uint256" }],
            outputs: [{ name: "", type: "string" }]
          }
        ],
        functionName: "tokenURI",
        args: [BigInt(nft.tokenID)]
      });
    }
    if (nft.namespace === "erc1155") {
      return readContract(client, {
        address: nft.contractAddress,
        abi: [
          {
            name: "uri",
            type: "function",
            stateMutability: "view",
            inputs: [{ name: "_id", type: "uint256" }],
            outputs: [{ name: "", type: "string" }]
          }
        ],
        functionName: "uri",
        args: [BigInt(nft.tokenID)]
      });
    }
    throw new EnsAvatarUnsupportedNamespaceError({ namespace: nft.namespace });
  }
  var networkRegex, ipfsHashRegex, base64Regex, dataURIRegex;
  var init_utils6 = __esm({
    "node_modules/viem/_esm/utils/ens/avatar/utils.js"() {
      init_readContract();
      init_ens();
      networkRegex = /(?<protocol>https?:\/\/[^/]*|ipfs:\/|ipns:\/|ar:\/)?(?<root>\/)?(?<subpath>ipfs\/|ipns\/)?(?<target>[\w\-.]+)(?<subtarget>\/.*)?/;
      ipfsHashRegex = /^(Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})(\/(?<target>[\w\-.]+))?(?<subtarget>\/.*)?$/;
      base64Regex = /^data:([a-zA-Z\-/+]*);base64,([^"].*)/;
      dataURIRegex = /^data:([a-zA-Z\-/+]*)?(;[a-zA-Z0-9].*?)?(,)/;
    }
  });

  // node_modules/viem/_esm/utils/ens/avatar/parseAvatarRecord.js
  async function parseAvatarRecord(client, { gatewayUrls, record }) {
    if (/eip155:/i.test(record))
      return parseNftAvatarUri(client, { gatewayUrls, record });
    return parseAvatarUri({ uri: record, gatewayUrls });
  }
  async function parseNftAvatarUri(client, { gatewayUrls, record }) {
    const nft = parseNftUri(record);
    const nftUri = await getNftTokenUri(client, { nft });
    const { uri: resolvedNftUri, isOnChain, isEncoded } = resolveAvatarUri({ uri: nftUri, gatewayUrls });
    if (isOnChain && (resolvedNftUri.includes("data:application/json;base64,") || resolvedNftUri.startsWith("{"))) {
      const encodedJson = isEncoded ? (
        // if it is encoded, decode it
        atob(resolvedNftUri.replace("data:application/json;base64,", ""))
      ) : (
        // if it isn't encoded assume it is a JSON string, but it could be anything (it will error if it is)
        resolvedNftUri
      );
      const decoded = JSON.parse(encodedJson);
      return parseAvatarUri({ uri: getJsonImage(decoded), gatewayUrls });
    }
    let uriTokenId = nft.tokenID;
    if (nft.namespace === "erc1155")
      uriTokenId = uriTokenId.replace("0x", "").padStart(64, "0");
    return getMetadataAvatarUri({
      gatewayUrls,
      uri: resolvedNftUri.replace(/(?:0x)?{id}/, uriTokenId)
    });
  }
  var init_parseAvatarRecord = __esm({
    "node_modules/viem/_esm/utils/ens/avatar/parseAvatarRecord.js"() {
      init_utils6();
    }
  });

  // node_modules/viem/_esm/actions/ens/getEnsText.js
  async function getEnsText(client, parameters) {
    const { blockNumber, blockTag, key, name, gatewayUrls, strict } = parameters;
    const { chain } = client;
    const universalResolverAddress = (() => {
      if (parameters.universalResolverAddress)
        return parameters.universalResolverAddress;
      if (!chain)
        throw new Error("client chain not configured. universalResolverAddress is required.");
      return getChainContractAddress({
        blockNumber,
        chain,
        contract: "ensUniversalResolver"
      });
    })();
    const tlds = chain?.ensTlds;
    if (tlds && !tlds.some((tld) => name.endsWith(tld)))
      return null;
    try {
      const readContractParameters = {
        address: universalResolverAddress,
        abi: universalResolverResolveAbi,
        args: [
          toHex(packetToBytes(name)),
          encodeFunctionData({
            abi: textResolverAbi,
            functionName: "text",
            args: [namehash(name), key]
          }),
          gatewayUrls ?? [localBatchGatewayUrl]
        ],
        functionName: "resolveWithGateways",
        blockNumber,
        blockTag
      };
      const readContractAction = getAction(client, readContract, "readContract");
      const res = await readContractAction(readContractParameters);
      if (res[0] === "0x")
        return null;
      const record = decodeFunctionResult({
        abi: textResolverAbi,
        functionName: "text",
        data: res[0]
      });
      return record === "" ? null : record;
    } catch (err) {
      if (strict)
        throw err;
      if (isNullUniversalResolverError(err))
        return null;
      throw err;
    }
  }
  var init_getEnsText = __esm({
    "node_modules/viem/_esm/actions/ens/getEnsText.js"() {
      init_abis();
      init_decodeFunctionResult();
      init_encodeFunctionData();
      init_getChainContractAddress();
      init_toHex();
      init_errors3();
      init_localBatchGatewayRequest();
      init_namehash();
      init_packetToBytes();
      init_getAction();
      init_readContract();
    }
  });

  // node_modules/viem/_esm/actions/ens/getEnsAvatar.js
  async function getEnsAvatar(client, { blockNumber, blockTag, assetGatewayUrls, name, gatewayUrls, strict, universalResolverAddress }) {
    const record = await getAction(client, getEnsText, "getEnsText")({
      blockNumber,
      blockTag,
      key: "avatar",
      name,
      universalResolverAddress,
      gatewayUrls,
      strict
    });
    if (!record)
      return null;
    try {
      return await parseAvatarRecord(client, {
        record,
        gatewayUrls: assetGatewayUrls
      });
    } catch {
      return null;
    }
  }
  var init_getEnsAvatar = __esm({
    "node_modules/viem/_esm/actions/ens/getEnsAvatar.js"() {
      init_parseAvatarRecord();
      init_getAction();
      init_getEnsText();
    }
  });

  // node_modules/viem/_esm/actions/ens/getEnsName.js
  async function getEnsName(client, parameters) {
    const { address, blockNumber, blockTag, coinType = 60n, gatewayUrls, strict } = parameters;
    const { chain } = client;
    const universalResolverAddress = (() => {
      if (parameters.universalResolverAddress)
        return parameters.universalResolverAddress;
      if (!chain)
        throw new Error("client chain not configured. universalResolverAddress is required.");
      return getChainContractAddress({
        blockNumber,
        chain,
        contract: "ensUniversalResolver"
      });
    })();
    try {
      const readContractParameters = {
        address: universalResolverAddress,
        abi: universalResolverReverseAbi,
        args: [address, coinType, gatewayUrls ?? [localBatchGatewayUrl]],
        functionName: "reverseWithGateways",
        blockNumber,
        blockTag
      };
      const readContractAction = getAction(client, readContract, "readContract");
      const [name] = await readContractAction(readContractParameters);
      return name || null;
    } catch (err) {
      if (strict)
        throw err;
      if (isNullUniversalResolverError(err))
        return null;
      throw err;
    }
  }
  var init_getEnsName = __esm({
    "node_modules/viem/_esm/actions/ens/getEnsName.js"() {
      init_abis();
      init_getChainContractAddress();
      init_errors3();
      init_localBatchGatewayRequest();
      init_getAction();
      init_readContract();
    }
  });

  // node_modules/viem/_esm/actions/ens/getEnsResolver.js
  async function getEnsResolver(client, parameters) {
    const { blockNumber, blockTag, name } = parameters;
    const { chain } = client;
    const universalResolverAddress = (() => {
      if (parameters.universalResolverAddress)
        return parameters.universalResolverAddress;
      if (!chain)
        throw new Error("client chain not configured. universalResolverAddress is required.");
      return getChainContractAddress({
        blockNumber,
        chain,
        contract: "ensUniversalResolver"
      });
    })();
    const tlds = chain?.ensTlds;
    if (tlds && !tlds.some((tld) => name.endsWith(tld)))
      throw new Error(`${name} is not a valid ENS TLD (${tlds?.join(", ")}) for chain "${chain.name}" (id: ${chain.id}).`);
    const [resolverAddress] = await getAction(client, readContract, "readContract")({
      address: universalResolverAddress,
      abi: [
        {
          inputs: [{ type: "bytes" }],
          name: "findResolver",
          outputs: [
            { type: "address" },
            { type: "bytes32" },
            { type: "uint256" }
          ],
          stateMutability: "view",
          type: "function"
        }
      ],
      functionName: "findResolver",
      args: [toHex(packetToBytes(name))],
      blockNumber,
      blockTag
    });
    return resolverAddress;
  }
  var init_getEnsResolver = __esm({
    "node_modules/viem/_esm/actions/ens/getEnsResolver.js"() {
      init_getChainContractAddress();
      init_toHex();
      init_packetToBytes();
      init_getAction();
      init_readContract();
    }
  });

  // node_modules/viem/_esm/actions/public/createAccessList.js
  async function createAccessList(client, args) {
    const { account: account_ = client.account, blockNumber, blockTag = "latest", blobs, data, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, to, value, ...rest } = args;
    const account = account_ ? parseAccount(account_) : void 0;
    try {
      assertRequest(args);
      const blockNumberHex = typeof blockNumber === "bigint" ? numberToHex(blockNumber) : void 0;
      const block = blockNumberHex || blockTag;
      const chainFormat = client.chain?.formatters?.transactionRequest?.format;
      const format = chainFormat || formatTransactionRequest;
      const request = format({
        // Pick out extra data that might exist on the chain's transaction request type.
        ...extract(rest, { format: chainFormat }),
        from: account?.address,
        blobs,
        data,
        gas,
        gasPrice,
        maxFeePerBlobGas,
        maxFeePerGas,
        maxPriorityFeePerGas,
        to,
        value
      }, "createAccessList");
      const response = await client.request({
        method: "eth_createAccessList",
        params: [request, block]
      });
      return {
        accessList: response.accessList,
        gasUsed: BigInt(response.gasUsed)
      };
    } catch (err) {
      throw getCallError(err, {
        ...args,
        account,
        chain: client.chain
      });
    }
  }
  var init_createAccessList = __esm({
    "node_modules/viem/_esm/actions/public/createAccessList.js"() {
      init_parseAccount();
      init_toHex();
      init_getCallError();
      init_extract();
      init_transactionRequest();
      init_assertRequest();
    }
  });

  // node_modules/viem/_esm/actions/public/createBlockFilter.js
  async function createBlockFilter(client) {
    const getRequest = createFilterRequestScope(client, {
      method: "eth_newBlockFilter"
    });
    const id = await client.request({
      method: "eth_newBlockFilter"
    });
    return { id, request: getRequest(id), type: "block" };
  }
  var init_createBlockFilter = __esm({
    "node_modules/viem/_esm/actions/public/createBlockFilter.js"() {
      init_createFilterRequestScope();
    }
  });

  // node_modules/viem/_esm/actions/public/createEventFilter.js
  async function createEventFilter(client, { address, args, event, events: events_, fromBlock, strict, toBlock } = {}) {
    const events = events_ ?? (event ? [event] : void 0);
    const getRequest = createFilterRequestScope(client, {
      method: "eth_newFilter"
    });
    let topics = [];
    if (events) {
      const encoded = events.flatMap((event2) => encodeEventTopics({
        abi: [event2],
        eventName: event2.name,
        args
      }));
      topics = [encoded];
      if (event)
        topics = topics[0];
    }
    const id = await client.request({
      method: "eth_newFilter",
      params: [
        {
          address,
          fromBlock: typeof fromBlock === "bigint" ? numberToHex(fromBlock) : fromBlock,
          toBlock: typeof toBlock === "bigint" ? numberToHex(toBlock) : toBlock,
          ...topics.length ? { topics } : {}
        }
      ]
    });
    return {
      abi: events,
      args,
      eventName: event ? event.name : void 0,
      fromBlock,
      id,
      request: getRequest(id),
      strict: Boolean(strict),
      toBlock,
      type: "event"
    };
  }
  var init_createEventFilter = __esm({
    "node_modules/viem/_esm/actions/public/createEventFilter.js"() {
      init_encodeEventTopics();
      init_toHex();
      init_createFilterRequestScope();
    }
  });

  // node_modules/viem/_esm/actions/public/createPendingTransactionFilter.js
  async function createPendingTransactionFilter(client) {
    const getRequest = createFilterRequestScope(client, {
      method: "eth_newPendingTransactionFilter"
    });
    const id = await client.request({
      method: "eth_newPendingTransactionFilter"
    });
    return { id, request: getRequest(id), type: "transaction" };
  }
  var init_createPendingTransactionFilter = __esm({
    "node_modules/viem/_esm/actions/public/createPendingTransactionFilter.js"() {
      init_createFilterRequestScope();
    }
  });

  // node_modules/viem/_esm/actions/public/getBalance.js
  async function getBalance(client, { address, blockNumber, blockTag = client.experimental_blockTag ?? "latest" }) {
    const blockNumberHex = typeof blockNumber === "bigint" ? numberToHex(blockNumber) : void 0;
    const balance = await client.request({
      method: "eth_getBalance",
      params: [address, blockNumberHex || blockTag]
    });
    return BigInt(balance);
  }
  var init_getBalance = __esm({
    "node_modules/viem/_esm/actions/public/getBalance.js"() {
      init_toHex();
    }
  });

  // node_modules/viem/_esm/actions/public/getBlobBaseFee.js
  async function getBlobBaseFee(client) {
    const baseFee = await client.request({
      method: "eth_blobBaseFee"
    });
    return BigInt(baseFee);
  }
  var init_getBlobBaseFee = __esm({
    "node_modules/viem/_esm/actions/public/getBlobBaseFee.js"() {
    }
  });

  // node_modules/viem/_esm/actions/public/getBlockTransactionCount.js
  async function getBlockTransactionCount(client, { blockHash, blockNumber, blockTag = "latest" } = {}) {
    const blockNumberHex = blockNumber !== void 0 ? numberToHex(blockNumber) : void 0;
    let count;
    if (blockHash) {
      count = await client.request({
        method: "eth_getBlockTransactionCountByHash",
        params: [blockHash]
      }, { dedupe: true });
    } else {
      count = await client.request({
        method: "eth_getBlockTransactionCountByNumber",
        params: [blockNumberHex || blockTag]
      }, { dedupe: Boolean(blockNumberHex) });
    }
    return hexToNumber(count);
  }
  var init_getBlockTransactionCount = __esm({
    "node_modules/viem/_esm/actions/public/getBlockTransactionCount.js"() {
      init_fromHex();
      init_toHex();
    }
  });

  // node_modules/viem/_esm/actions/public/getCode.js
  async function getCode(client, { address, blockNumber, blockTag = "latest" }) {
    const blockNumberHex = blockNumber !== void 0 ? numberToHex(blockNumber) : void 0;
    const hex = await client.request({
      method: "eth_getCode",
      params: [address, blockNumberHex || blockTag]
    }, { dedupe: Boolean(blockNumberHex) });
    if (hex === "0x")
      return void 0;
    return hex;
  }
  var init_getCode = __esm({
    "node_modules/viem/_esm/actions/public/getCode.js"() {
      init_toHex();
    }
  });

  // node_modules/viem/_esm/errors/eip712.js
  var Eip712DomainNotFoundError;
  var init_eip712 = __esm({
    "node_modules/viem/_esm/errors/eip712.js"() {
      init_base();
      Eip712DomainNotFoundError = class extends BaseError2 {
        constructor({ address }) {
          super(`No EIP-712 domain found on contract "${address}".`, {
            metaMessages: [
              "Ensure that:",
              `- The contract is deployed at the address "${address}".`,
              "- `eip712Domain()` function exists on the contract.",
              "- `eip712Domain()` function matches signature to ERC-5267 specification."
            ],
            name: "Eip712DomainNotFoundError"
          });
        }
      };
    }
  });

  // node_modules/viem/_esm/actions/public/getEip712Domain.js
  async function getEip712Domain(client, parameters) {
    const { address, factory, factoryData } = parameters;
    try {
      const [fields, name, version4, chainId, verifyingContract, salt, extensions] = await getAction(client, readContract, "readContract")({
        abi,
        address,
        functionName: "eip712Domain",
        factory,
        factoryData
      });
      return {
        domain: {
          name,
          version: version4,
          chainId: Number(chainId),
          verifyingContract,
          salt
        },
        extensions,
        fields
      };
    } catch (e) {
      const error = e;
      if (error.name === "ContractFunctionExecutionError" && error.cause.name === "ContractFunctionZeroDataError") {
        throw new Eip712DomainNotFoundError({ address });
      }
      throw error;
    }
  }
  var abi;
  var init_getEip712Domain = __esm({
    "node_modules/viem/_esm/actions/public/getEip712Domain.js"() {
      init_eip712();
      init_getAction();
      init_readContract();
      abi = [
        {
          inputs: [],
          name: "eip712Domain",
          outputs: [
            { name: "fields", type: "bytes1" },
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
            { name: "salt", type: "bytes32" },
            { name: "extensions", type: "uint256[]" }
          ],
          stateMutability: "view",
          type: "function"
        }
      ];
    }
  });

  // node_modules/viem/_esm/utils/formatters/feeHistory.js
  function formatFeeHistory(feeHistory) {
    return {
      baseFeePerGas: feeHistory.baseFeePerGas.map((value) => BigInt(value)),
      gasUsedRatio: feeHistory.gasUsedRatio,
      oldestBlock: BigInt(feeHistory.oldestBlock),
      reward: feeHistory.reward?.map((reward) => reward.map((value) => BigInt(value)))
    };
  }
  var init_feeHistory = __esm({
    "node_modules/viem/_esm/utils/formatters/feeHistory.js"() {
    }
  });

  // node_modules/viem/_esm/actions/public/getFeeHistory.js
  async function getFeeHistory(client, { blockCount, blockNumber, blockTag = "latest", rewardPercentiles }) {
    const blockNumberHex = typeof blockNumber === "bigint" ? numberToHex(blockNumber) : void 0;
    const feeHistory = await client.request({
      method: "eth_feeHistory",
      params: [
        numberToHex(blockCount),
        blockNumberHex || blockTag,
        rewardPercentiles
      ]
    }, { dedupe: Boolean(blockNumberHex) });
    return formatFeeHistory(feeHistory);
  }
  var init_getFeeHistory = __esm({
    "node_modules/viem/_esm/actions/public/getFeeHistory.js"() {
      init_toHex();
      init_feeHistory();
    }
  });

  // node_modules/viem/_esm/actions/public/getFilterLogs.js
  async function getFilterLogs(_client, { filter }) {
    const strict = filter.strict ?? false;
    const logs = await filter.request({
      method: "eth_getFilterLogs",
      params: [filter.id]
    });
    const formattedLogs = logs.map((log) => formatLog(log));
    if (!filter.abi)
      return formattedLogs;
    return parseEventLogs({
      abi: filter.abi,
      logs: formattedLogs,
      strict
    });
  }
  var init_getFilterLogs = __esm({
    "node_modules/viem/_esm/actions/public/getFilterLogs.js"() {
      init_parseEventLogs();
      init_log2();
    }
  });

  // node_modules/viem/_esm/utils/abi/encodePacked.js
  function encodePacked(types2, values) {
    if (types2.length !== values.length)
      throw new AbiEncodingLengthMismatchError({
        expectedLength: types2.length,
        givenLength: values.length
      });
    const data = [];
    for (let i = 0; i < types2.length; i++) {
      const type = types2[i];
      const value = values[i];
      data.push(encode(type, value));
    }
    return concatHex(data);
  }
  function encode(type, value, isArray = false) {
    if (type === "address") {
      const address = value;
      if (!isAddress(address))
        throw new InvalidAddressError({ address });
      return pad(address.toLowerCase(), {
        size: isArray ? 32 : null
      });
    }
    if (type === "string")
      return stringToHex(value);
    if (type === "bytes")
      return value;
    if (type === "bool")
      return pad(boolToHex(value), { size: isArray ? 32 : 1 });
    const intMatch = type.match(integerRegex2);
    if (intMatch) {
      const [_type, baseType, bits = "256"] = intMatch;
      const size5 = Number.parseInt(bits, 10) / 8;
      return numberToHex(value, {
        size: isArray ? 32 : size5,
        signed: baseType === "int"
      });
    }
    const bytesMatch = type.match(bytesRegex2);
    if (bytesMatch) {
      const [_type, size5] = bytesMatch;
      if (Number.parseInt(size5, 10) !== (value.length - 2) / 2)
        throw new BytesSizeMismatchError({
          expectedSize: Number.parseInt(size5, 10),
          givenSize: (value.length - 2) / 2
        });
      return pad(value, { dir: "right", size: isArray ? 32 : null });
    }
    const arrayMatch = type.match(arrayRegex);
    if (arrayMatch && Array.isArray(value)) {
      const [_type, childType] = arrayMatch;
      const data = [];
      for (let i = 0; i < value.length; i++) {
        data.push(encode(childType, value[i], true));
      }
      if (data.length === 0)
        return "0x";
      return concatHex(data);
    }
    throw new UnsupportedPackedAbiType(type);
  }
  var init_encodePacked = __esm({
    "node_modules/viem/_esm/utils/abi/encodePacked.js"() {
      init_abi();
      init_address();
      init_isAddress();
      init_concat();
      init_pad();
      init_toHex();
      init_regex2();
    }
  });

  // node_modules/viem/_esm/utils/transaction/assertTransaction.js
  function assertTransactionEIP7702(transaction) {
    const { authorizationList } = transaction;
    if (authorizationList) {
      for (const authorization of authorizationList) {
        const { chainId } = authorization;
        const address = authorization.address;
        if (!isAddress(address))
          throw new InvalidAddressError({ address });
        if (chainId < 0)
          throw new InvalidChainIdError({ chainId });
      }
    }
    assertTransactionEIP1559(transaction);
  }
  function assertTransactionEIP4844(transaction) {
    const { blobVersionedHashes } = transaction;
    if (blobVersionedHashes) {
      if (blobVersionedHashes.length === 0)
        throw new EmptyBlobError();
      for (const hash3 of blobVersionedHashes) {
        const size_ = size(hash3);
        const version4 = hexToNumber(slice(hash3, 0, 1));
        if (size_ !== 32)
          throw new InvalidVersionedHashSizeError({ hash: hash3, size: size_ });
        if (version4 !== versionedHashVersionKzg)
          throw new InvalidVersionedHashVersionError({
            hash: hash3,
            version: version4
          });
      }
    }
    assertTransactionEIP1559(transaction);
  }
  function assertTransactionEIP1559(transaction) {
    const { chainId, maxPriorityFeePerGas, maxFeePerGas, to } = transaction;
    if (chainId <= 0)
      throw new InvalidChainIdError({ chainId });
    if (to && !isAddress(to))
      throw new InvalidAddressError({ address: to });
    if (maxFeePerGas && maxFeePerGas > maxUint256)
      throw new FeeCapTooHighError({ maxFeePerGas });
    if (maxPriorityFeePerGas && maxFeePerGas && maxPriorityFeePerGas > maxFeePerGas)
      throw new TipAboveFeeCapError({ maxFeePerGas, maxPriorityFeePerGas });
  }
  function assertTransactionEIP2930(transaction) {
    const { chainId, maxPriorityFeePerGas, gasPrice, maxFeePerGas, to } = transaction;
    if (chainId <= 0)
      throw new InvalidChainIdError({ chainId });
    if (to && !isAddress(to))
      throw new InvalidAddressError({ address: to });
    if (maxPriorityFeePerGas || maxFeePerGas)
      throw new BaseError2("`maxFeePerGas`/`maxPriorityFeePerGas` is not a valid EIP-2930 Transaction attribute.");
    if (gasPrice && gasPrice > maxUint256)
      throw new FeeCapTooHighError({ maxFeePerGas: gasPrice });
  }
  function assertTransactionLegacy(transaction) {
    const { chainId, maxPriorityFeePerGas, gasPrice, maxFeePerGas, to } = transaction;
    if (to && !isAddress(to))
      throw new InvalidAddressError({ address: to });
    if (typeof chainId !== "undefined" && chainId <= 0)
      throw new InvalidChainIdError({ chainId });
    if (maxPriorityFeePerGas || maxFeePerGas)
      throw new BaseError2("`maxFeePerGas`/`maxPriorityFeePerGas` is not a valid Legacy Transaction attribute.");
    if (gasPrice && gasPrice > maxUint256)
      throw new FeeCapTooHighError({ maxFeePerGas: gasPrice });
  }
  var init_assertTransaction = __esm({
    "node_modules/viem/_esm/utils/transaction/assertTransaction.js"() {
      init_kzg();
      init_number();
      init_address();
      init_base();
      init_blob2();
      init_chain();
      init_node();
      init_isAddress();
      init_size();
      init_slice();
      init_fromHex();
    }
  });

  // node_modules/viem/_esm/utils/transaction/serializeAccessList.js
  function serializeAccessList(accessList) {
    if (!accessList || accessList.length === 0)
      return [];
    const serializedAccessList = [];
    for (let i = 0; i < accessList.length; i++) {
      const { address, storageKeys } = accessList[i];
      for (let j = 0; j < storageKeys.length; j++) {
        if (storageKeys[j].length - 2 !== 64) {
          throw new InvalidStorageKeySizeError({ storageKey: storageKeys[j] });
        }
      }
      if (!isAddress(address, { strict: false })) {
        throw new InvalidAddressError({ address });
      }
      serializedAccessList.push([address, storageKeys]);
    }
    return serializedAccessList;
  }
  var init_serializeAccessList = __esm({
    "node_modules/viem/_esm/utils/transaction/serializeAccessList.js"() {
      init_address();
      init_transaction();
      init_isAddress();
    }
  });

  // node_modules/viem/_esm/utils/transaction/serializeTransaction.js
  function serializeTransaction(transaction, signature) {
    const type = getTransactionType(transaction);
    if (type === "eip1559")
      return serializeTransactionEIP1559(transaction, signature);
    if (type === "eip2930")
      return serializeTransactionEIP2930(transaction, signature);
    if (type === "eip4844")
      return serializeTransactionEIP4844(transaction, signature);
    if (type === "eip7702")
      return serializeTransactionEIP7702(transaction, signature);
    return serializeTransactionLegacy(transaction, signature);
  }
  function serializeTransactionEIP7702(transaction, signature) {
    const { authorizationList, chainId, gas, nonce, to, value, maxFeePerGas, maxPriorityFeePerGas, accessList, data } = transaction;
    assertTransactionEIP7702(transaction);
    const serializedAccessList = serializeAccessList(accessList);
    const serializedAuthorizationList = serializeAuthorizationList(authorizationList);
    return concatHex([
      "0x04",
      toRlp([
        numberToHex(chainId),
        nonce ? numberToHex(nonce) : "0x",
        maxPriorityFeePerGas ? numberToHex(maxPriorityFeePerGas) : "0x",
        maxFeePerGas ? numberToHex(maxFeePerGas) : "0x",
        gas ? numberToHex(gas) : "0x",
        to ?? "0x",
        value ? numberToHex(value) : "0x",
        data ?? "0x",
        serializedAccessList,
        serializedAuthorizationList,
        ...toYParitySignatureArray(transaction, signature)
      ])
    ]);
  }
  function serializeTransactionEIP4844(transaction, signature) {
    const { chainId, gas, nonce, to, value, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, accessList, data } = transaction;
    assertTransactionEIP4844(transaction);
    let blobVersionedHashes = transaction.blobVersionedHashes;
    let sidecars = transaction.sidecars;
    if (transaction.blobs && (typeof blobVersionedHashes === "undefined" || typeof sidecars === "undefined")) {
      const blobs2 = typeof transaction.blobs[0] === "string" ? transaction.blobs : transaction.blobs.map((x) => bytesToHex(x));
      const kzg = transaction.kzg;
      const commitments2 = blobsToCommitments({
        blobs: blobs2,
        kzg
      });
      if (typeof blobVersionedHashes === "undefined")
        blobVersionedHashes = commitmentsToVersionedHashes({
          commitments: commitments2
        });
      if (typeof sidecars === "undefined") {
        const proofs2 = blobsToProofs({ blobs: blobs2, commitments: commitments2, kzg });
        sidecars = toBlobSidecars({ blobs: blobs2, commitments: commitments2, proofs: proofs2 });
      }
    }
    const serializedAccessList = serializeAccessList(accessList);
    const serializedTransaction = [
      numberToHex(chainId),
      nonce ? numberToHex(nonce) : "0x",
      maxPriorityFeePerGas ? numberToHex(maxPriorityFeePerGas) : "0x",
      maxFeePerGas ? numberToHex(maxFeePerGas) : "0x",
      gas ? numberToHex(gas) : "0x",
      to ?? "0x",
      value ? numberToHex(value) : "0x",
      data ?? "0x",
      serializedAccessList,
      maxFeePerBlobGas ? numberToHex(maxFeePerBlobGas) : "0x",
      blobVersionedHashes ?? [],
      ...toYParitySignatureArray(transaction, signature)
    ];
    const blobs = [];
    const commitments = [];
    const proofs = [];
    if (sidecars)
      for (let i = 0; i < sidecars.length; i++) {
        const { blob, commitment, proof } = sidecars[i];
        blobs.push(blob);
        commitments.push(commitment);
        proofs.push(proof);
      }
    return concatHex([
      "0x03",
      sidecars ? (
        // If sidecars are enabled, envelope turns into a "wrapper":
        toRlp([serializedTransaction, blobs, commitments, proofs])
      ) : (
        // If sidecars are disabled, standard envelope is used:
        toRlp(serializedTransaction)
      )
    ]);
  }
  function serializeTransactionEIP1559(transaction, signature) {
    const { chainId, gas, nonce, to, value, maxFeePerGas, maxPriorityFeePerGas, accessList, data } = transaction;
    assertTransactionEIP1559(transaction);
    const serializedAccessList = serializeAccessList(accessList);
    const serializedTransaction = [
      numberToHex(chainId),
      nonce ? numberToHex(nonce) : "0x",
      maxPriorityFeePerGas ? numberToHex(maxPriorityFeePerGas) : "0x",
      maxFeePerGas ? numberToHex(maxFeePerGas) : "0x",
      gas ? numberToHex(gas) : "0x",
      to ?? "0x",
      value ? numberToHex(value) : "0x",
      data ?? "0x",
      serializedAccessList,
      ...toYParitySignatureArray(transaction, signature)
    ];
    return concatHex([
      "0x02",
      toRlp(serializedTransaction)
    ]);
  }
  function serializeTransactionEIP2930(transaction, signature) {
    const { chainId, gas, data, nonce, to, value, accessList, gasPrice } = transaction;
    assertTransactionEIP2930(transaction);
    const serializedAccessList = serializeAccessList(accessList);
    const serializedTransaction = [
      numberToHex(chainId),
      nonce ? numberToHex(nonce) : "0x",
      gasPrice ? numberToHex(gasPrice) : "0x",
      gas ? numberToHex(gas) : "0x",
      to ?? "0x",
      value ? numberToHex(value) : "0x",
      data ?? "0x",
      serializedAccessList,
      ...toYParitySignatureArray(transaction, signature)
    ];
    return concatHex([
      "0x01",
      toRlp(serializedTransaction)
    ]);
  }
  function serializeTransactionLegacy(transaction, signature) {
    const { chainId = 0, gas, data, nonce, to, value, gasPrice } = transaction;
    assertTransactionLegacy(transaction);
    let serializedTransaction = [
      nonce ? numberToHex(nonce) : "0x",
      gasPrice ? numberToHex(gasPrice) : "0x",
      gas ? numberToHex(gas) : "0x",
      to ?? "0x",
      value ? numberToHex(value) : "0x",
      data ?? "0x"
    ];
    if (signature) {
      const v = (() => {
        if (signature.v >= 35n) {
          const inferredChainId = (signature.v - 35n) / 2n;
          if (inferredChainId > 0)
            return signature.v;
          return 27n + (signature.v === 35n ? 0n : 1n);
        }
        if (chainId > 0)
          return BigInt(chainId * 2) + BigInt(35n + signature.v - 27n);
        const v2 = 27n + (signature.v === 27n ? 0n : 1n);
        if (signature.v !== v2)
          throw new InvalidLegacyVError({ v: signature.v });
        return v2;
      })();
      const r = trim(signature.r);
      const s = trim(signature.s);
      serializedTransaction = [
        ...serializedTransaction,
        numberToHex(v),
        r === "0x00" ? "0x" : r,
        s === "0x00" ? "0x" : s
      ];
    } else if (chainId > 0) {
      serializedTransaction = [
        ...serializedTransaction,
        numberToHex(chainId),
        "0x",
        "0x"
      ];
    }
    return toRlp(serializedTransaction);
  }
  function toYParitySignatureArray(transaction, signature_) {
    const signature = signature_ ?? transaction;
    const { v, yParity } = signature;
    if (typeof signature.r === "undefined")
      return [];
    if (typeof signature.s === "undefined")
      return [];
    if (typeof v === "undefined" && typeof yParity === "undefined")
      return [];
    const r = trim(signature.r);
    const s = trim(signature.s);
    const yParity_ = (() => {
      if (typeof yParity === "number")
        return yParity ? numberToHex(1) : "0x";
      if (v === 0n)
        return "0x";
      if (v === 1n)
        return numberToHex(1);
      return v === 27n ? "0x" : numberToHex(1);
    })();
    return [yParity_, r === "0x00" ? "0x" : r, s === "0x00" ? "0x" : s];
  }
  var init_serializeTransaction = __esm({
    "node_modules/viem/_esm/utils/transaction/serializeTransaction.js"() {
      init_transaction();
      init_serializeAuthorizationList();
      init_blobsToCommitments();
      init_blobsToProofs();
      init_commitmentsToVersionedHashes();
      init_toBlobSidecars();
      init_concat();
      init_trim();
      init_toHex();
      init_toRlp();
      init_assertTransaction();
      init_getTransactionType();
      init_serializeAccessList();
    }
  });

  // node_modules/viem/_esm/utils/authorization/serializeAuthorizationList.js
  function serializeAuthorizationList(authorizationList) {
    if (!authorizationList || authorizationList.length === 0)
      return [];
    const serializedAuthorizationList = [];
    for (const authorization of authorizationList) {
      const { chainId, nonce, ...signature } = authorization;
      const contractAddress = authorization.address;
      serializedAuthorizationList.push([
        chainId ? toHex(chainId) : "0x",
        contractAddress,
        nonce ? toHex(nonce) : "0x",
        ...toYParitySignatureArray({}, signature)
      ]);
    }
    return serializedAuthorizationList;
  }
  var init_serializeAuthorizationList = __esm({
    "node_modules/viem/_esm/utils/authorization/serializeAuthorizationList.js"() {
      init_toHex();
      init_serializeTransaction();
    }
  });

  // node_modules/viem/_esm/utils/authorization/verifyAuthorization.js
  async function verifyAuthorization({ address, authorization, signature }) {
    return isAddressEqual(getAddress(address), await recoverAuthorizationAddress({
      authorization,
      signature
    }));
  }
  var init_verifyAuthorization = __esm({
    "node_modules/viem/_esm/utils/authorization/verifyAuthorization.js"() {
      init_getAddress();
      init_isAddressEqual();
      init_recoverAuthorizationAddress();
    }
  });

  // node_modules/viem/_esm/utils/promise/withDedupe.js
  function withDedupe(fn, { enabled = true, id }) {
    if (!enabled || !id)
      return fn();
    if (promiseCache2.get(id))
      return promiseCache2.get(id);
    const promise = fn().finally(() => promiseCache2.delete(id));
    promiseCache2.set(id, promise);
    return promise;
  }
  var promiseCache2;
  var init_withDedupe = __esm({
    "node_modules/viem/_esm/utils/promise/withDedupe.js"() {
      init_lru();
      promiseCache2 = /* @__PURE__ */ new LruMap(8192);
    }
  });

  // node_modules/viem/_esm/utils/buildRequest.js
  function buildRequest(request, options = {}) {
    return async (args, overrideOptions = {}) => {
      const { dedupe = false, methods, retryDelay = 150, retryCount = 3, uid: uid2 } = {
        ...options,
        ...overrideOptions
      };
      const { method } = args;
      if (methods?.exclude?.includes(method))
        throw new MethodNotSupportedRpcError(new Error("method not supported"), {
          method
        });
      if (methods?.include && !methods.include.includes(method))
        throw new MethodNotSupportedRpcError(new Error("method not supported"), {
          method
        });
      const requestId = dedupe ? stringToHex(`${uid2}.${stringify(args)}`) : void 0;
      return withDedupe(() => withRetry(async () => {
        try {
          return await request(args);
        } catch (err_) {
          const err = err_;
          switch (err.code) {
            // -32700
            case ParseRpcError.code:
              throw new ParseRpcError(err);
            // -32600
            case InvalidRequestRpcError.code:
              throw new InvalidRequestRpcError(err);
            // -32601
            case MethodNotFoundRpcError.code:
              throw new MethodNotFoundRpcError(err, { method: args.method });
            // -32602
            case InvalidParamsRpcError.code:
              throw new InvalidParamsRpcError(err);
            // -32603
            case InternalRpcError.code:
              throw new InternalRpcError(err);
            // -32000
            case InvalidInputRpcError.code:
              throw new InvalidInputRpcError(err);
            // -32001
            case ResourceNotFoundRpcError.code:
              throw new ResourceNotFoundRpcError(err);
            // -32002
            case ResourceUnavailableRpcError.code:
              throw new ResourceUnavailableRpcError(err);
            // -32003
            case TransactionRejectedRpcError.code:
              throw new TransactionRejectedRpcError(err);
            // -32004
            case MethodNotSupportedRpcError.code:
              throw new MethodNotSupportedRpcError(err, {
                method: args.method
              });
            // -32005
            case LimitExceededRpcError.code:
              throw new LimitExceededRpcError(err);
            // -32006
            case JsonRpcVersionUnsupportedError.code:
              throw new JsonRpcVersionUnsupportedError(err);
            // 4001
            case UserRejectedRequestError.code:
              throw new UserRejectedRequestError(err);
            // 4100
            case UnauthorizedProviderError.code:
              throw new UnauthorizedProviderError(err);
            // 4200
            case UnsupportedProviderMethodError.code:
              throw new UnsupportedProviderMethodError(err);
            // 4900
            case ProviderDisconnectedError.code:
              throw new ProviderDisconnectedError(err);
            // 4901
            case ChainDisconnectedError.code:
              throw new ChainDisconnectedError(err);
            // 4902
            case SwitchChainError.code:
              throw new SwitchChainError(err);
            // 5700
            case UnsupportedNonOptionalCapabilityError.code:
              throw new UnsupportedNonOptionalCapabilityError(err);
            // 5710
            case UnsupportedChainIdError.code:
              throw new UnsupportedChainIdError(err);
            // 5720
            case DuplicateIdError.code:
              throw new DuplicateIdError(err);
            // 5730
            case UnknownBundleIdError.code:
              throw new UnknownBundleIdError(err);
            // 5740
            case BundleTooLargeError.code:
              throw new BundleTooLargeError(err);
            // 5750
            case AtomicReadyWalletRejectedUpgradeError.code:
              throw new AtomicReadyWalletRejectedUpgradeError(err);
            // 5760
            case AtomicityNotSupportedError.code:
              throw new AtomicityNotSupportedError(err);
            // CAIP-25: User Rejected Error
            // https://docs.walletconnect.com/2.0/specs/clients/sign/error-codes#rejected-caip-25
            case 5e3:
              throw new UserRejectedRequestError(err);
            default:
              if (err_ instanceof BaseError2)
                throw err_;
              throw new UnknownRpcError(err);
          }
        }
      }, {
        delay: ({ count, error }) => {
          if (error && error instanceof HttpRequestError) {
            const retryAfter = error?.headers?.get("Retry-After");
            if (retryAfter?.match(/\d/))
              return Number.parseInt(retryAfter, 10) * 1e3;
          }
          return ~~(1 << count) * retryDelay;
        },
        retryCount,
        shouldRetry: ({ error }) => shouldRetry(error)
      }), { enabled: dedupe, id: requestId });
    };
  }
  function shouldRetry(error) {
    if ("code" in error && typeof error.code === "number") {
      if (error.code === -1)
        return true;
      if (error.code === LimitExceededRpcError.code)
        return true;
      if (error.code === InternalRpcError.code)
        return true;
      return false;
    }
    if (error instanceof HttpRequestError && error.status) {
      if (error.status === 403)
        return true;
      if (error.status === 408)
        return true;
      if (error.status === 413)
        return true;
      if (error.status === 429)
        return true;
      if (error.status === 500)
        return true;
      if (error.status === 502)
        return true;
      if (error.status === 503)
        return true;
      if (error.status === 504)
        return true;
      return false;
    }
    return true;
  }
  var init_buildRequest = __esm({
    "node_modules/viem/_esm/utils/buildRequest.js"() {
      init_base();
      init_request();
      init_rpc();
      init_toHex();
      init_withDedupe();
      init_withRetry();
      init_stringify();
    }
  });

  // node_modules/viem/_esm/utils/chain/defineChain.js
  function defineChain(chain) {
    return {
      formatters: void 0,
      fees: void 0,
      serializers: void 0,
      ...chain
    };
  }
  var init_defineChain = __esm({
    "node_modules/viem/_esm/utils/chain/defineChain.js"() {
    }
  });

  // node_modules/viem/_esm/utils/nonceManager.js
  function createNonceManager(parameters) {
    const { source } = parameters;
    const deltaMap = /* @__PURE__ */ new Map();
    const nonceMap = new LruMap(8192);
    const promiseMap = /* @__PURE__ */ new Map();
    const getKey = ({ address, chainId }) => `${address}.${chainId}`;
    return {
      async consume({ address, chainId, client }) {
        const key = getKey({ address, chainId });
        const promise = this.get({ address, chainId, client });
        this.increment({ address, chainId });
        const nonce = await promise;
        await source.set({ address, chainId }, nonce);
        nonceMap.set(key, nonce);
        return nonce;
      },
      async increment({ address, chainId }) {
        const key = getKey({ address, chainId });
        const delta = deltaMap.get(key) ?? 0;
        deltaMap.set(key, delta + 1);
      },
      async get({ address, chainId, client }) {
        const key = getKey({ address, chainId });
        let promise = promiseMap.get(key);
        if (!promise) {
          promise = (async () => {
            try {
              const nonce = await source.get({ address, chainId, client });
              const previousNonce = nonceMap.get(key) ?? 0;
              if (previousNonce > 0 && nonce <= previousNonce)
                return previousNonce + 1;
              nonceMap.delete(key);
              return nonce;
            } finally {
              this.reset({ address, chainId });
            }
          })();
          promiseMap.set(key, promise);
        }
        const delta = deltaMap.get(key) ?? 0;
        return delta + await promise;
      },
      reset({ address, chainId }) {
        const key = getKey({ address, chainId });
        deltaMap.delete(key);
        promiseMap.delete(key);
      }
    };
  }
  function jsonRpc() {
    return {
      async get(parameters) {
        const { address, client } = parameters;
        return getTransactionCount(client, {
          address,
          blockTag: "pending"
        });
      },
      set() {
      }
    };
  }
  var nonceManager;
  var init_nonceManager = __esm({
    "node_modules/viem/_esm/utils/nonceManager.js"() {
      init_getTransactionCount();
      init_lru();
      nonceManager = /* @__PURE__ */ createNonceManager({
        source: jsonRpc()
      });
    }
  });

  // node_modules/viem/_esm/utils/promise/withTimeout.js
  function withTimeout(fn, { errorInstance = new Error("timed out"), timeout, signal }) {
    return new Promise((resolve, reject) => {
      ;
      (async () => {
        let timeoutId;
        try {
          const controller = new AbortController();
          if (timeout > 0) {
            timeoutId = setTimeout(() => {
              if (signal) {
                controller.abort();
              } else {
                reject(errorInstance);
              }
            }, timeout);
          }
          resolve(await fn({ signal: controller?.signal || null }));
        } catch (err) {
          if (err?.name === "AbortError")
            reject(errorInstance);
          reject(err);
        } finally {
          clearTimeout(timeoutId);
        }
      })();
    });
  }
  var init_withTimeout = __esm({
    "node_modules/viem/_esm/utils/promise/withTimeout.js"() {
    }
  });

  // node_modules/viem/_esm/utils/rpc/id.js
  function createIdStore() {
    return {
      current: 0,
      take() {
        return this.current++;
      },
      reset() {
        this.current = 0;
      }
    };
  }
  var idCache;
  var init_id = __esm({
    "node_modules/viem/_esm/utils/rpc/id.js"() {
      idCache = /* @__PURE__ */ createIdStore();
    }
  });

  // node_modules/viem/_esm/utils/rpc/http.js
  function getHttpRpcClient(url, options = {}) {
    return {
      async request(params) {
        const { body, fetchFn = options.fetchFn ?? fetch, onRequest = options.onRequest, onResponse = options.onResponse, timeout = options.timeout ?? 1e4 } = params;
        const fetchOptions = {
          ...options.fetchOptions ?? {},
          ...params.fetchOptions ?? {}
        };
        const { headers, method, signal: signal_ } = fetchOptions;
        try {
          const response = await withTimeout(async ({ signal }) => {
            const init = {
              ...fetchOptions,
              body: Array.isArray(body) ? stringify(body.map((body2) => ({
                jsonrpc: "2.0",
                id: body2.id ?? idCache.take(),
                ...body2
              }))) : stringify({
                jsonrpc: "2.0",
                id: body.id ?? idCache.take(),
                ...body
              }),
              headers: {
                "Content-Type": "application/json",
                ...headers
              },
              method: method || "POST",
              signal: signal_ || (timeout > 0 ? signal : null)
            };
            const request = new Request(url, init);
            const args = await onRequest?.(request, init) ?? { ...init, url };
            const response2 = await fetchFn(args.url ?? url, args);
            return response2;
          }, {
            errorInstance: new TimeoutError({ body, url }),
            timeout,
            signal: true
          });
          if (onResponse)
            await onResponse(response);
          let data;
          if (response.headers.get("Content-Type")?.startsWith("application/json"))
            data = await response.json();
          else {
            data = await response.text();
            try {
              data = JSON.parse(data || "{}");
            } catch (err) {
              if (response.ok)
                throw err;
              data = { error: data };
            }
          }
          if (!response.ok) {
            throw new HttpRequestError({
              body,
              details: stringify(data.error) || response.statusText,
              headers: response.headers,
              status: response.status,
              url
            });
          }
          return data;
        } catch (err) {
          if (err instanceof HttpRequestError)
            throw err;
          if (err instanceof TimeoutError)
            throw err;
          throw new HttpRequestError({
            body,
            cause: err,
            url
          });
        }
      }
    };
  }
  var init_http = __esm({
    "node_modules/viem/_esm/utils/rpc/http.js"() {
      init_request();
      init_withTimeout();
      init_stringify();
      init_id();
    }
  });

  // node_modules/viem/_esm/constants/strings.js
  var presignMessagePrefix;
  var init_strings = __esm({
    "node_modules/viem/_esm/constants/strings.js"() {
      presignMessagePrefix = "Ethereum Signed Message:\n";
    }
  });

  // node_modules/viem/_esm/utils/signature/toPrefixedMessage.js
  function toPrefixedMessage(message_) {
    const message = (() => {
      if (typeof message_ === "string")
        return stringToHex(message_);
      if (typeof message_.raw === "string")
        return message_.raw;
      return bytesToHex(message_.raw);
    })();
    const prefix = stringToHex(`${presignMessagePrefix}${size(message)}`);
    return concat([prefix, message]);
  }
  var init_toPrefixedMessage = __esm({
    "node_modules/viem/_esm/utils/signature/toPrefixedMessage.js"() {
      init_strings();
      init_concat();
      init_size();
      init_toHex();
    }
  });

  // node_modules/viem/_esm/utils/signature/hashMessage.js
  function hashMessage(message, to_) {
    return keccak256(toPrefixedMessage(message), to_);
  }
  var init_hashMessage = __esm({
    "node_modules/viem/_esm/utils/signature/hashMessage.js"() {
      init_keccak256();
      init_toPrefixedMessage();
    }
  });

  // node_modules/viem/_esm/errors/typedData.js
  var InvalidDomainError, InvalidPrimaryTypeError, InvalidStructTypeError;
  var init_typedData = __esm({
    "node_modules/viem/_esm/errors/typedData.js"() {
      init_stringify();
      init_base();
      InvalidDomainError = class extends BaseError2 {
        constructor({ domain }) {
          super(`Invalid domain "${stringify(domain)}".`, {
            metaMessages: ["Must be a valid EIP-712 domain."]
          });
        }
      };
      InvalidPrimaryTypeError = class extends BaseError2 {
        constructor({ primaryType, types: types2 }) {
          super(`Invalid primary type \`${primaryType}\` must be one of \`${JSON.stringify(Object.keys(types2))}\`.`, {
            docsPath: "/api/glossary/Errors#typeddatainvalidprimarytypeerror",
            metaMessages: ["Check that the primary type is a key in `types`."]
          });
        }
      };
      InvalidStructTypeError = class extends BaseError2 {
        constructor({ type }) {
          super(`Struct type "${type}" is invalid.`, {
            metaMessages: ["Struct type must not be a Solidity type."],
            name: "InvalidStructTypeError"
          });
        }
      };
    }
  });

  // node_modules/viem/_esm/utils/typedData.js
  function validateTypedData(parameters) {
    const { domain, message, primaryType, types: types2 } = parameters;
    const validateData = (struct, data) => {
      for (const param of struct) {
        const { name, type } = param;
        const value = data[name];
        const integerMatch = type.match(integerRegex2);
        if (integerMatch && (typeof value === "number" || typeof value === "bigint")) {
          const [_type, base, size_] = integerMatch;
          numberToHex(value, {
            signed: base === "int",
            size: Number.parseInt(size_, 10) / 8
          });
        }
        if (type === "address" && typeof value === "string" && !isAddress(value))
          throw new InvalidAddressError({ address: value });
        const bytesMatch = type.match(bytesRegex2);
        if (bytesMatch) {
          const [_type, size_] = bytesMatch;
          if (size_ && size(value) !== Number.parseInt(size_, 10))
            throw new BytesSizeMismatchError({
              expectedSize: Number.parseInt(size_, 10),
              givenSize: size(value)
            });
        }
        const struct2 = types2[type];
        if (struct2) {
          validateReference(type);
          validateData(struct2, value);
        }
      }
    };
    if (types2.EIP712Domain && domain) {
      if (typeof domain !== "object")
        throw new InvalidDomainError({ domain });
      validateData(types2.EIP712Domain, domain);
    }
    if (primaryType !== "EIP712Domain") {
      if (types2[primaryType])
        validateData(types2[primaryType], message);
      else
        throw new InvalidPrimaryTypeError({ primaryType, types: types2 });
    }
  }
  function getTypesForEIP712Domain({ domain }) {
    return [
      typeof domain?.name === "string" && { name: "name", type: "string" },
      domain?.version && { name: "version", type: "string" },
      (typeof domain?.chainId === "number" || typeof domain?.chainId === "bigint") && {
        name: "chainId",
        type: "uint256"
      },
      domain?.verifyingContract && {
        name: "verifyingContract",
        type: "address"
      },
      domain?.salt && { name: "salt", type: "bytes32" }
    ].filter(Boolean);
  }
  function validateReference(type) {
    if (type === "address" || type === "bool" || type === "string" || type.startsWith("bytes") || type.startsWith("uint") || type.startsWith("int"))
      throw new InvalidStructTypeError({ type });
  }
  var init_typedData2 = __esm({
    "node_modules/viem/_esm/utils/typedData.js"() {
      init_abi();
      init_address();
      init_typedData();
      init_isAddress();
      init_size();
      init_toHex();
      init_regex2();
    }
  });

  // node_modules/viem/_esm/utils/signature/hashTypedData.js
  function hashTypedData(parameters) {
    const { domain = {}, message, primaryType } = parameters;
    const types2 = {
      EIP712Domain: getTypesForEIP712Domain({ domain }),
      ...parameters.types
    };
    validateTypedData({
      domain,
      message,
      primaryType,
      types: types2
    });
    const parts = ["0x1901"];
    if (domain)
      parts.push(hashDomain({
        domain,
        types: types2
      }));
    if (primaryType !== "EIP712Domain")
      parts.push(hashStruct({
        data: message,
        primaryType,
        types: types2
      }));
    return keccak256(concat(parts));
  }
  function hashDomain({ domain, types: types2 }) {
    return hashStruct({
      data: domain,
      primaryType: "EIP712Domain",
      types: types2
    });
  }
  function hashStruct({ data, primaryType, types: types2 }) {
    const encoded = encodeData({
      data,
      primaryType,
      types: types2
    });
    return keccak256(encoded);
  }
  function encodeData({ data, primaryType, types: types2 }) {
    const encodedTypes = [{ type: "bytes32" }];
    const encodedValues = [hashType({ primaryType, types: types2 })];
    for (const field of types2[primaryType]) {
      const [type, value] = encodeField({
        types: types2,
        name: field.name,
        type: field.type,
        value: data[field.name]
      });
      encodedTypes.push(type);
      encodedValues.push(value);
    }
    return encodeAbiParameters(encodedTypes, encodedValues);
  }
  function hashType({ primaryType, types: types2 }) {
    const encodedHashType = toHex(encodeType({ primaryType, types: types2 }));
    return keccak256(encodedHashType);
  }
  function encodeType({ primaryType, types: types2 }) {
    let result = "";
    const unsortedDeps = findTypeDependencies({ primaryType, types: types2 });
    unsortedDeps.delete(primaryType);
    const deps = [primaryType, ...Array.from(unsortedDeps).sort()];
    for (const type of deps) {
      result += `${type}(${types2[type].map(({ name, type: t }) => `${t} ${name}`).join(",")})`;
    }
    return result;
  }
  function findTypeDependencies({ primaryType: primaryType_, types: types2 }, results = /* @__PURE__ */ new Set()) {
    const match = primaryType_.match(/^\w*/u);
    const primaryType = match?.[0];
    if (results.has(primaryType) || types2[primaryType] === void 0) {
      return results;
    }
    results.add(primaryType);
    for (const field of types2[primaryType]) {
      findTypeDependencies({ primaryType: field.type, types: types2 }, results);
    }
    return results;
  }
  function encodeField({ types: types2, name, type, value }) {
    if (types2[type] !== void 0) {
      return [
        { type: "bytes32" },
        keccak256(encodeData({ data: value, primaryType: type, types: types2 }))
      ];
    }
    if (type === "bytes") {
      const prepend = value.length % 2 ? "0" : "";
      value = `0x${prepend + value.slice(2)}`;
      return [{ type: "bytes32" }, keccak256(value)];
    }
    if (type === "string")
      return [{ type: "bytes32" }, keccak256(toHex(value))];
    if (type.lastIndexOf("]") === type.length - 1) {
      const parsedType = type.slice(0, type.lastIndexOf("["));
      const typeValuePairs = value.map((item) => encodeField({
        name,
        type: parsedType,
        types: types2,
        value: item
      }));
      return [
        { type: "bytes32" },
        keccak256(encodeAbiParameters(typeValuePairs.map(([t]) => t), typeValuePairs.map(([, v]) => v)))
      ];
    }
    return [{ type }, value];
  }
  var init_hashTypedData = __esm({
    "node_modules/viem/_esm/utils/signature/hashTypedData.js"() {
      init_encodeAbiParameters();
      init_concat();
      init_toHex();
      init_keccak256();
      init_typedData2();
    }
  });

  // node_modules/viem/_esm/constants/bytes.js
  var erc6492MagicBytes;
  var init_bytes2 = __esm({
    "node_modules/viem/_esm/constants/bytes.js"() {
      erc6492MagicBytes = "0x6492649264926492649264926492649264926492649264926492649264926492";
    }
  });

  // node_modules/ox/_esm/core/internal/lru.js
  var LruMap2;
  var init_lru2 = __esm({
    "node_modules/ox/_esm/core/internal/lru.js"() {
      LruMap2 = class extends Map {
        constructor(size5) {
          super();
          Object.defineProperty(this, "maxSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          this.maxSize = size5;
        }
        get(key) {
          const value = super.get(key);
          if (super.has(key) && value !== void 0) {
            this.delete(key);
            super.set(key, value);
          }
          return value;
        }
        set(key, value) {
          super.set(key, value);
          if (this.maxSize && this.size > this.maxSize) {
            const firstKey = this.keys().next().value;
            if (firstKey)
              this.delete(firstKey);
          }
          return this;
        }
      };
    }
  });

  // node_modules/ox/_esm/core/Caches.js
  var caches, checksum;
  var init_Caches = __esm({
    "node_modules/ox/_esm/core/Caches.js"() {
      init_lru2();
      caches = {
        checksum: /* @__PURE__ */ new LruMap2(8192)
      };
      checksum = caches.checksum;
    }
  });

  // node_modules/ox/_esm/core/Hash.js
  function keccak2562(value, options = {}) {
    const { as = typeof value === "string" ? "Hex" : "Bytes" } = options;
    const bytes = keccak_256(from(value));
    if (as === "Bytes")
      return bytes;
    return fromBytes(bytes);
  }
  var init_Hash = __esm({
    "node_modules/ox/_esm/core/Hash.js"() {
      init_sha3();
      init_Bytes();
      init_Hex();
    }
  });

  // node_modules/ox/_esm/core/PublicKey.js
  function assert3(publicKey, options = {}) {
    const { compressed } = options;
    const { prefix, x, y } = publicKey;
    if (compressed === false || typeof x === "bigint" && typeof y === "bigint") {
      if (prefix !== 4)
        throw new InvalidPrefixError({
          prefix,
          cause: new InvalidUncompressedPrefixError()
        });
      return;
    }
    if (compressed === true || typeof x === "bigint" && typeof y === "undefined") {
      if (prefix !== 3 && prefix !== 2)
        throw new InvalidPrefixError({
          prefix,
          cause: new InvalidCompressedPrefixError()
        });
      return;
    }
    throw new InvalidError({ publicKey });
  }
  function from3(value) {
    const publicKey = (() => {
      if (validate2(value))
        return fromHex2(value);
      if (validate(value))
        return fromBytes2(value);
      const { prefix, x, y } = value;
      if (typeof x === "bigint" && typeof y === "bigint")
        return { prefix: prefix ?? 4, x, y };
      return { prefix, x };
    })();
    assert3(publicKey);
    return publicKey;
  }
  function fromBytes2(publicKey) {
    return fromHex2(fromBytes(publicKey));
  }
  function fromHex2(publicKey) {
    if (publicKey.length !== 132 && publicKey.length !== 130 && publicKey.length !== 68)
      throw new InvalidSerializedSizeError({ publicKey });
    if (publicKey.length === 130) {
      const x2 = BigInt(slice3(publicKey, 0, 32));
      const y = BigInt(slice3(publicKey, 32, 64));
      return {
        prefix: 4,
        x: x2,
        y
      };
    }
    if (publicKey.length === 132) {
      const prefix2 = Number(slice3(publicKey, 0, 1));
      const x2 = BigInt(slice3(publicKey, 1, 33));
      const y = BigInt(slice3(publicKey, 33, 65));
      return {
        prefix: prefix2,
        x: x2,
        y
      };
    }
    const prefix = Number(slice3(publicKey, 0, 1));
    const x = BigInt(slice3(publicKey, 1, 33));
    return {
      prefix,
      x
    };
  }
  function toHex2(publicKey, options = {}) {
    assert3(publicKey);
    const { prefix, x, y } = publicKey;
    const { includePrefix = true } = options;
    const publicKey_ = concat2(
      includePrefix ? fromNumber(prefix, { size: 1 }) : "0x",
      fromNumber(x, { size: 32 }),
      // If the public key is not compressed, add the y coordinate.
      typeof y === "bigint" ? fromNumber(y, { size: 32 }) : "0x"
    );
    return publicKey_;
  }
  var InvalidError, InvalidPrefixError, InvalidCompressedPrefixError, InvalidUncompressedPrefixError, InvalidSerializedSizeError;
  var init_PublicKey = __esm({
    "node_modules/ox/_esm/core/PublicKey.js"() {
      init_Bytes();
      init_Errors();
      init_Hex();
      init_Json();
      InvalidError = class extends BaseError3 {
        constructor({ publicKey }) {
          super(`Value \`${stringify2(publicKey)}\` is not a valid public key.`, {
            metaMessages: [
              "Public key must contain:",
              "- an `x` and `prefix` value (compressed)",
              "- an `x`, `y`, and `prefix` value (uncompressed)"
            ]
          });
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "PublicKey.InvalidError"
          });
        }
      };
      InvalidPrefixError = class extends BaseError3 {
        constructor({ prefix, cause }) {
          super(`Prefix "${prefix}" is invalid.`, {
            cause
          });
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "PublicKey.InvalidPrefixError"
          });
        }
      };
      InvalidCompressedPrefixError = class extends BaseError3 {
        constructor() {
          super("Prefix must be 2 or 3 for compressed public keys.");
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "PublicKey.InvalidCompressedPrefixError"
          });
        }
      };
      InvalidUncompressedPrefixError = class extends BaseError3 {
        constructor() {
          super("Prefix must be 4 for uncompressed public keys.");
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "PublicKey.InvalidUncompressedPrefixError"
          });
        }
      };
      InvalidSerializedSizeError = class extends BaseError3 {
        constructor({ publicKey }) {
          super(`Value \`${publicKey}\` is an invalid public key size.`, {
            metaMessages: [
              "Expected: 33 bytes (compressed + prefix), 64 bytes (uncompressed) or 65 bytes (uncompressed + prefix).",
              `Received ${size3(from2(publicKey))} bytes.`
            ]
          });
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "PublicKey.InvalidSerializedSizeError"
          });
        }
      };
    }
  });

  // node_modules/ox/_esm/core/Address.js
  function assert4(value, options = {}) {
    const { strict = true } = options;
    if (!addressRegex2.test(value))
      throw new InvalidAddressError2({
        address: value,
        cause: new InvalidInputError()
      });
    if (strict) {
      if (value.toLowerCase() === value)
        return;
      if (checksum2(value) !== value)
        throw new InvalidAddressError2({
          address: value,
          cause: new InvalidChecksumError()
        });
    }
  }
  function checksum2(address) {
    if (checksum.has(address))
      return checksum.get(address);
    assert4(address, { strict: false });
    const hexAddress = address.substring(2).toLowerCase();
    const hash3 = keccak2562(fromString(hexAddress), { as: "Bytes" });
    const characters = hexAddress.split("");
    for (let i = 0; i < 40; i += 2) {
      if (hash3[i >> 1] >> 4 >= 8 && characters[i]) {
        characters[i] = characters[i].toUpperCase();
      }
      if ((hash3[i >> 1] & 15) >= 8 && characters[i + 1]) {
        characters[i + 1] = characters[i + 1].toUpperCase();
      }
    }
    const result = `0x${characters.join("")}`;
    checksum.set(address, result);
    return result;
  }
  function from4(address, options = {}) {
    const { checksum: checksumVal = false } = options;
    assert4(address);
    if (checksumVal)
      return checksum2(address);
    return address;
  }
  function fromPublicKey(publicKey, options = {}) {
    const address = keccak2562(`0x${toHex2(publicKey).slice(4)}`).substring(26);
    return from4(`0x${address}`, options);
  }
  function validate3(address, options = {}) {
    const { strict = true } = options ?? {};
    try {
      assert4(address, { strict });
      return true;
    } catch {
      return false;
    }
  }
  var addressRegex2, InvalidAddressError2, InvalidInputError, InvalidChecksumError;
  var init_Address = __esm({
    "node_modules/ox/_esm/core/Address.js"() {
      init_Bytes();
      init_Caches();
      init_Errors();
      init_Hash();
      init_PublicKey();
      addressRegex2 = /^0x[a-fA-F0-9]{40}$/;
      InvalidAddressError2 = class extends BaseError3 {
        constructor({ address, cause }) {
          super(`Address "${address}" is invalid.`, {
            cause
          });
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Address.InvalidAddressError"
          });
        }
      };
      InvalidInputError = class extends BaseError3 {
        constructor() {
          super("Address is not a 20 byte (40 hexadecimal character) value.");
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Address.InvalidInputError"
          });
        }
      };
      InvalidChecksumError = class extends BaseError3 {
        constructor() {
          super("Address does not match its checksum counterpart.");
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Address.InvalidChecksumError"
          });
        }
      };
    }
  });

  // node_modules/ox/_esm/core/Solidity.js
  var arrayRegex2, bytesRegex3, integerRegex3, maxInt82, maxInt162, maxInt242, maxInt322, maxInt402, maxInt482, maxInt562, maxInt642, maxInt722, maxInt802, maxInt882, maxInt962, maxInt1042, maxInt1122, maxInt1202, maxInt1282, maxInt1362, maxInt1442, maxInt1522, maxInt1602, maxInt1682, maxInt1762, maxInt1842, maxInt1922, maxInt2002, maxInt2082, maxInt2162, maxInt2242, maxInt2322, maxInt2402, maxInt2482, maxInt2562, minInt82, minInt162, minInt242, minInt322, minInt402, minInt482, minInt562, minInt642, minInt722, minInt802, minInt882, minInt962, minInt1042, minInt1122, minInt1202, minInt1282, minInt1362, minInt1442, minInt1522, minInt1602, minInt1682, minInt1762, minInt1842, minInt1922, minInt2002, minInt2082, minInt2162, minInt2242, minInt2322, minInt2402, minInt2482, minInt2562, maxUint82, maxUint162, maxUint242, maxUint322, maxUint402, maxUint482, maxUint562, maxUint642, maxUint722, maxUint802, maxUint882, maxUint962, maxUint1042, maxUint1122, maxUint1202, maxUint1282, maxUint1362, maxUint1442, maxUint1522, maxUint1602, maxUint1682, maxUint1762, maxUint1842, maxUint1922, maxUint2002, maxUint2082, maxUint2162, maxUint2242, maxUint2322, maxUint2402, maxUint2482, maxUint2562;
  var init_Solidity = __esm({
    "node_modules/ox/_esm/core/Solidity.js"() {
      arrayRegex2 = /^(.*)\[([0-9]*)\]$/;
      bytesRegex3 = /^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/;
      integerRegex3 = /^(u?int)(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/;
      maxInt82 = 2n ** (8n - 1n) - 1n;
      maxInt162 = 2n ** (16n - 1n) - 1n;
      maxInt242 = 2n ** (24n - 1n) - 1n;
      maxInt322 = 2n ** (32n - 1n) - 1n;
      maxInt402 = 2n ** (40n - 1n) - 1n;
      maxInt482 = 2n ** (48n - 1n) - 1n;
      maxInt562 = 2n ** (56n - 1n) - 1n;
      maxInt642 = 2n ** (64n - 1n) - 1n;
      maxInt722 = 2n ** (72n - 1n) - 1n;
      maxInt802 = 2n ** (80n - 1n) - 1n;
      maxInt882 = 2n ** (88n - 1n) - 1n;
      maxInt962 = 2n ** (96n - 1n) - 1n;
      maxInt1042 = 2n ** (104n - 1n) - 1n;
      maxInt1122 = 2n ** (112n - 1n) - 1n;
      maxInt1202 = 2n ** (120n - 1n) - 1n;
      maxInt1282 = 2n ** (128n - 1n) - 1n;
      maxInt1362 = 2n ** (136n - 1n) - 1n;
      maxInt1442 = 2n ** (144n - 1n) - 1n;
      maxInt1522 = 2n ** (152n - 1n) - 1n;
      maxInt1602 = 2n ** (160n - 1n) - 1n;
      maxInt1682 = 2n ** (168n - 1n) - 1n;
      maxInt1762 = 2n ** (176n - 1n) - 1n;
      maxInt1842 = 2n ** (184n - 1n) - 1n;
      maxInt1922 = 2n ** (192n - 1n) - 1n;
      maxInt2002 = 2n ** (200n - 1n) - 1n;
      maxInt2082 = 2n ** (208n - 1n) - 1n;
      maxInt2162 = 2n ** (216n - 1n) - 1n;
      maxInt2242 = 2n ** (224n - 1n) - 1n;
      maxInt2322 = 2n ** (232n - 1n) - 1n;
      maxInt2402 = 2n ** (240n - 1n) - 1n;
      maxInt2482 = 2n ** (248n - 1n) - 1n;
      maxInt2562 = 2n ** (256n - 1n) - 1n;
      minInt82 = -(2n ** (8n - 1n));
      minInt162 = -(2n ** (16n - 1n));
      minInt242 = -(2n ** (24n - 1n));
      minInt322 = -(2n ** (32n - 1n));
      minInt402 = -(2n ** (40n - 1n));
      minInt482 = -(2n ** (48n - 1n));
      minInt562 = -(2n ** (56n - 1n));
      minInt642 = -(2n ** (64n - 1n));
      minInt722 = -(2n ** (72n - 1n));
      minInt802 = -(2n ** (80n - 1n));
      minInt882 = -(2n ** (88n - 1n));
      minInt962 = -(2n ** (96n - 1n));
      minInt1042 = -(2n ** (104n - 1n));
      minInt1122 = -(2n ** (112n - 1n));
      minInt1202 = -(2n ** (120n - 1n));
      minInt1282 = -(2n ** (128n - 1n));
      minInt1362 = -(2n ** (136n - 1n));
      minInt1442 = -(2n ** (144n - 1n));
      minInt1522 = -(2n ** (152n - 1n));
      minInt1602 = -(2n ** (160n - 1n));
      minInt1682 = -(2n ** (168n - 1n));
      minInt1762 = -(2n ** (176n - 1n));
      minInt1842 = -(2n ** (184n - 1n));
      minInt1922 = -(2n ** (192n - 1n));
      minInt2002 = -(2n ** (200n - 1n));
      minInt2082 = -(2n ** (208n - 1n));
      minInt2162 = -(2n ** (216n - 1n));
      minInt2242 = -(2n ** (224n - 1n));
      minInt2322 = -(2n ** (232n - 1n));
      minInt2402 = -(2n ** (240n - 1n));
      minInt2482 = -(2n ** (248n - 1n));
      minInt2562 = -(2n ** (256n - 1n));
      maxUint82 = 2n ** 8n - 1n;
      maxUint162 = 2n ** 16n - 1n;
      maxUint242 = 2n ** 24n - 1n;
      maxUint322 = 2n ** 32n - 1n;
      maxUint402 = 2n ** 40n - 1n;
      maxUint482 = 2n ** 48n - 1n;
      maxUint562 = 2n ** 56n - 1n;
      maxUint642 = 2n ** 64n - 1n;
      maxUint722 = 2n ** 72n - 1n;
      maxUint802 = 2n ** 80n - 1n;
      maxUint882 = 2n ** 88n - 1n;
      maxUint962 = 2n ** 96n - 1n;
      maxUint1042 = 2n ** 104n - 1n;
      maxUint1122 = 2n ** 112n - 1n;
      maxUint1202 = 2n ** 120n - 1n;
      maxUint1282 = 2n ** 128n - 1n;
      maxUint1362 = 2n ** 136n - 1n;
      maxUint1442 = 2n ** 144n - 1n;
      maxUint1522 = 2n ** 152n - 1n;
      maxUint1602 = 2n ** 160n - 1n;
      maxUint1682 = 2n ** 168n - 1n;
      maxUint1762 = 2n ** 176n - 1n;
      maxUint1842 = 2n ** 184n - 1n;
      maxUint1922 = 2n ** 192n - 1n;
      maxUint2002 = 2n ** 200n - 1n;
      maxUint2082 = 2n ** 208n - 1n;
      maxUint2162 = 2n ** 216n - 1n;
      maxUint2242 = 2n ** 224n - 1n;
      maxUint2322 = 2n ** 232n - 1n;
      maxUint2402 = 2n ** 240n - 1n;
      maxUint2482 = 2n ** 248n - 1n;
      maxUint2562 = 2n ** 256n - 1n;
    }
  });

  // node_modules/ox/_esm/core/internal/abiParameters.js
  function decodeParameter2(cursor, param, options) {
    const { checksumAddress: checksumAddress2, staticPosition } = options;
    const arrayComponents = getArrayComponents2(param.type);
    if (arrayComponents) {
      const [length, type] = arrayComponents;
      return decodeArray2(cursor, { ...param, type }, { checksumAddress: checksumAddress2, length, staticPosition });
    }
    if (param.type === "tuple")
      return decodeTuple2(cursor, param, {
        checksumAddress: checksumAddress2,
        staticPosition
      });
    if (param.type === "address")
      return decodeAddress2(cursor, { checksum: checksumAddress2 });
    if (param.type === "bool")
      return decodeBool2(cursor);
    if (param.type.startsWith("bytes"))
      return decodeBytes2(cursor, param, { staticPosition });
    if (param.type.startsWith("uint") || param.type.startsWith("int"))
      return decodeNumber2(cursor, param);
    if (param.type === "string")
      return decodeString2(cursor, { staticPosition });
    throw new InvalidTypeError(param.type);
  }
  function decodeAddress2(cursor, options = {}) {
    const { checksum: checksum3 = false } = options;
    const value = cursor.readBytes(32);
    const wrap3 = (address) => checksum3 ? checksum2(address) : address;
    return [wrap3(fromBytes(slice2(value, -20))), 32];
  }
  function decodeArray2(cursor, param, options) {
    const { checksumAddress: checksumAddress2, length, staticPosition } = options;
    if (!length) {
      const offset = toNumber2(cursor.readBytes(sizeOfOffset2));
      const start = staticPosition + offset;
      const startOfData = start + sizeOfLength2;
      cursor.setPosition(start);
      const length2 = toNumber2(cursor.readBytes(sizeOfLength2));
      const dynamicChild = hasDynamicChild2(param);
      let consumed2 = 0;
      const value2 = [];
      for (let i = 0; i < length2; ++i) {
        cursor.setPosition(startOfData + (dynamicChild ? i * 32 : consumed2));
        const [data, consumed_] = decodeParameter2(cursor, param, {
          checksumAddress: checksumAddress2,
          staticPosition: startOfData
        });
        consumed2 += consumed_;
        value2.push(data);
      }
      cursor.setPosition(staticPosition + 32);
      return [value2, 32];
    }
    if (hasDynamicChild2(param)) {
      const offset = toNumber2(cursor.readBytes(sizeOfOffset2));
      const start = staticPosition + offset;
      const value2 = [];
      for (let i = 0; i < length; ++i) {
        cursor.setPosition(start + i * 32);
        const [data] = decodeParameter2(cursor, param, {
          checksumAddress: checksumAddress2,
          staticPosition: start
        });
        value2.push(data);
      }
      cursor.setPosition(staticPosition + 32);
      return [value2, 32];
    }
    let consumed = 0;
    const value = [];
    for (let i = 0; i < length; ++i) {
      const [data, consumed_] = decodeParameter2(cursor, param, {
        checksumAddress: checksumAddress2,
        staticPosition: staticPosition + consumed
      });
      consumed += consumed_;
      value.push(data);
    }
    return [value, consumed];
  }
  function decodeBool2(cursor) {
    return [toBoolean(cursor.readBytes(32), { size: 32 }), 32];
  }
  function decodeBytes2(cursor, param, { staticPosition }) {
    const [_, size5] = param.type.split("bytes");
    if (!size5) {
      const offset = toNumber2(cursor.readBytes(32));
      cursor.setPosition(staticPosition + offset);
      const length = toNumber2(cursor.readBytes(32));
      if (length === 0) {
        cursor.setPosition(staticPosition + 32);
        return ["0x", 32];
      }
      const data = cursor.readBytes(length);
      cursor.setPosition(staticPosition + 32);
      return [fromBytes(data), 32];
    }
    const value = fromBytes(cursor.readBytes(Number.parseInt(size5, 10), 32));
    return [value, 32];
  }
  function decodeNumber2(cursor, param) {
    const signed = param.type.startsWith("int");
    const size5 = Number.parseInt(param.type.split("int")[1] || "256", 10);
    const value = cursor.readBytes(32);
    return [
      size5 > 48 ? toBigInt2(value, { signed }) : toNumber2(value, { signed }),
      32
    ];
  }
  function decodeTuple2(cursor, param, options) {
    const { checksumAddress: checksumAddress2, staticPosition } = options;
    const hasUnnamedChild = param.components.length === 0 || param.components.some(({ name }) => !name);
    const value = hasUnnamedChild ? [] : {};
    let consumed = 0;
    if (hasDynamicChild2(param)) {
      const offset = toNumber2(cursor.readBytes(sizeOfOffset2));
      const start = staticPosition + offset;
      for (let i = 0; i < param.components.length; ++i) {
        const component = param.components[i];
        cursor.setPosition(start + consumed);
        const [data, consumed_] = decodeParameter2(cursor, component, {
          checksumAddress: checksumAddress2,
          staticPosition: start
        });
        consumed += consumed_;
        value[hasUnnamedChild ? i : component?.name] = data;
      }
      cursor.setPosition(staticPosition + 32);
      return [value, 32];
    }
    for (let i = 0; i < param.components.length; ++i) {
      const component = param.components[i];
      const [data, consumed_] = decodeParameter2(cursor, component, {
        checksumAddress: checksumAddress2,
        staticPosition
      });
      value[hasUnnamedChild ? i : component?.name] = data;
      consumed += consumed_;
    }
    return [value, consumed];
  }
  function decodeString2(cursor, { staticPosition }) {
    const offset = toNumber2(cursor.readBytes(32));
    const start = staticPosition + offset;
    cursor.setPosition(start);
    const length = toNumber2(cursor.readBytes(32));
    if (length === 0) {
      cursor.setPosition(staticPosition + 32);
      return ["", 32];
    }
    const data = cursor.readBytes(length, 32);
    const value = toString(trimLeft(data));
    cursor.setPosition(staticPosition + 32);
    return [value, 32];
  }
  function prepareParameters({ checksumAddress: checksumAddress2, parameters, values }) {
    const preparedParameters = [];
    for (let i = 0; i < parameters.length; i++) {
      preparedParameters.push(prepareParameter({
        checksumAddress: checksumAddress2,
        parameter: parameters[i],
        value: values[i]
      }));
    }
    return preparedParameters;
  }
  function prepareParameter({ checksumAddress: checksumAddress2 = false, parameter: parameter_, value }) {
    const parameter = parameter_;
    const arrayComponents = getArrayComponents2(parameter.type);
    if (arrayComponents) {
      const [length, type] = arrayComponents;
      return encodeArray2(value, {
        checksumAddress: checksumAddress2,
        length,
        parameter: {
          ...parameter,
          type
        }
      });
    }
    if (parameter.type === "tuple") {
      return encodeTuple2(value, {
        checksumAddress: checksumAddress2,
        parameter
      });
    }
    if (parameter.type === "address") {
      return encodeAddress2(value, {
        checksum: checksumAddress2
      });
    }
    if (parameter.type === "bool") {
      return encodeBoolean(value);
    }
    if (parameter.type.startsWith("uint") || parameter.type.startsWith("int")) {
      const signed = parameter.type.startsWith("int");
      const [, , size5 = "256"] = integerRegex3.exec(parameter.type) ?? [];
      return encodeNumber2(value, {
        signed,
        size: Number(size5)
      });
    }
    if (parameter.type.startsWith("bytes")) {
      return encodeBytes2(value, { type: parameter.type });
    }
    if (parameter.type === "string") {
      return encodeString2(value);
    }
    throw new InvalidTypeError(parameter.type);
  }
  function encode2(preparedParameters) {
    let staticSize = 0;
    for (let i = 0; i < preparedParameters.length; i++) {
      const { dynamic, encoded } = preparedParameters[i];
      if (dynamic)
        staticSize += 32;
      else
        staticSize += size3(encoded);
    }
    const staticParameters = [];
    const dynamicParameters = [];
    let dynamicSize = 0;
    for (let i = 0; i < preparedParameters.length; i++) {
      const { dynamic, encoded } = preparedParameters[i];
      if (dynamic) {
        staticParameters.push(fromNumber(staticSize + dynamicSize, { size: 32 }));
        dynamicParameters.push(encoded);
        dynamicSize += size3(encoded);
      } else {
        staticParameters.push(encoded);
      }
    }
    return concat2(...staticParameters, ...dynamicParameters);
  }
  function encodeAddress2(value, options) {
    const { checksum: checksum3 = false } = options;
    assert4(value, { strict: checksum3 });
    return {
      dynamic: false,
      encoded: padLeft(value.toLowerCase())
    };
  }
  function encodeArray2(value, options) {
    const { checksumAddress: checksumAddress2, length, parameter } = options;
    const dynamic = length === null;
    if (!Array.isArray(value))
      throw new InvalidArrayError2(value);
    if (!dynamic && value.length !== length)
      throw new ArrayLengthMismatchError({
        expectedLength: length,
        givenLength: value.length,
        type: `${parameter.type}[${length}]`
      });
    let dynamicChild = false;
    const preparedParameters = [];
    for (let i = 0; i < value.length; i++) {
      const preparedParam = prepareParameter({
        checksumAddress: checksumAddress2,
        parameter,
        value: value[i]
      });
      if (preparedParam.dynamic)
        dynamicChild = true;
      preparedParameters.push(preparedParam);
    }
    if (dynamic || dynamicChild) {
      const data = encode2(preparedParameters);
      if (dynamic) {
        const length2 = fromNumber(preparedParameters.length, { size: 32 });
        return {
          dynamic: true,
          encoded: preparedParameters.length > 0 ? concat2(length2, data) : length2
        };
      }
      if (dynamicChild)
        return { dynamic: true, encoded: data };
    }
    return {
      dynamic: false,
      encoded: concat2(...preparedParameters.map(({ encoded }) => encoded))
    };
  }
  function encodeBytes2(value, { type }) {
    const [, parametersize] = type.split("bytes");
    const bytesSize = size3(value);
    if (!parametersize) {
      let value_ = value;
      if (bytesSize % 32 !== 0)
        value_ = padRight(value_, Math.ceil((value.length - 2) / 2 / 32) * 32);
      return {
        dynamic: true,
        encoded: concat2(padLeft(fromNumber(bytesSize, { size: 32 })), value_)
      };
    }
    if (bytesSize !== Number.parseInt(parametersize, 10))
      throw new BytesSizeMismatchError2({
        expectedSize: Number.parseInt(parametersize, 10),
        value
      });
    return { dynamic: false, encoded: padRight(value) };
  }
  function encodeBoolean(value) {
    if (typeof value !== "boolean")
      throw new BaseError3(`Invalid boolean value: "${value}" (type: ${typeof value}). Expected: \`true\` or \`false\`.`);
    return { dynamic: false, encoded: padLeft(fromBoolean(value)) };
  }
  function encodeNumber2(value, { signed, size: size5 }) {
    if (typeof size5 === "number") {
      const max = 2n ** (BigInt(size5) - (signed ? 1n : 0n)) - 1n;
      const min = signed ? -max - 1n : 0n;
      if (value > max || value < min)
        throw new IntegerOutOfRangeError2({
          max: max.toString(),
          min: min.toString(),
          signed,
          size: size5 / 8,
          value: value.toString()
        });
    }
    return {
      dynamic: false,
      encoded: fromNumber(value, {
        size: 32,
        signed
      })
    };
  }
  function encodeString2(value) {
    const hexValue = fromString2(value);
    const partsLength = Math.ceil(size3(hexValue) / 32);
    const parts = [];
    for (let i = 0; i < partsLength; i++) {
      parts.push(padRight(slice3(hexValue, i * 32, (i + 1) * 32)));
    }
    return {
      dynamic: true,
      encoded: concat2(padRight(fromNumber(size3(hexValue), { size: 32 })), ...parts)
    };
  }
  function encodeTuple2(value, options) {
    const { checksumAddress: checksumAddress2, parameter } = options;
    let dynamic = false;
    const preparedParameters = [];
    for (let i = 0; i < parameter.components.length; i++) {
      const param_ = parameter.components[i];
      const index2 = Array.isArray(value) ? i : param_.name;
      const preparedParam = prepareParameter({
        checksumAddress: checksumAddress2,
        parameter: param_,
        value: value[index2]
      });
      preparedParameters.push(preparedParam);
      if (preparedParam.dynamic)
        dynamic = true;
    }
    return {
      dynamic,
      encoded: dynamic ? encode2(preparedParameters) : concat2(...preparedParameters.map(({ encoded }) => encoded))
    };
  }
  function getArrayComponents2(type) {
    const matches = type.match(/^(.*)\[(\d+)?\]$/);
    return matches ? (
      // Return `null` if the array is dynamic.
      [matches[2] ? Number(matches[2]) : null, matches[1]]
    ) : void 0;
  }
  function hasDynamicChild2(param) {
    const { type } = param;
    if (type === "string")
      return true;
    if (type === "bytes")
      return true;
    if (type.endsWith("[]"))
      return true;
    if (type === "tuple")
      return param.components?.some(hasDynamicChild2);
    const arrayComponents = getArrayComponents2(param.type);
    if (arrayComponents && hasDynamicChild2({
      ...param,
      type: arrayComponents[1]
    }))
      return true;
    return false;
  }
  var sizeOfLength2, sizeOfOffset2;
  var init_abiParameters = __esm({
    "node_modules/ox/_esm/core/internal/abiParameters.js"() {
      init_AbiParameters();
      init_Address();
      init_Bytes();
      init_Errors();
      init_Hex();
      init_Solidity();
      sizeOfLength2 = 32;
      sizeOfOffset2 = 32;
    }
  });

  // node_modules/ox/_esm/core/internal/cursor.js
  function create(bytes, { recursiveReadLimit = 8192 } = {}) {
    const cursor = Object.create(staticCursor2);
    cursor.bytes = bytes;
    cursor.dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    cursor.positionReadCount = /* @__PURE__ */ new Map();
    cursor.recursiveReadLimit = recursiveReadLimit;
    return cursor;
  }
  var staticCursor2, NegativeOffsetError2, PositionOutOfBoundsError2, RecursiveReadLimitExceededError2;
  var init_cursor3 = __esm({
    "node_modules/ox/_esm/core/internal/cursor.js"() {
      init_Errors();
      staticCursor2 = {
        bytes: new Uint8Array(),
        dataView: new DataView(new ArrayBuffer(0)),
        position: 0,
        positionReadCount: /* @__PURE__ */ new Map(),
        recursiveReadCount: 0,
        recursiveReadLimit: Number.POSITIVE_INFINITY,
        assertReadLimit() {
          if (this.recursiveReadCount >= this.recursiveReadLimit)
            throw new RecursiveReadLimitExceededError2({
              count: this.recursiveReadCount + 1,
              limit: this.recursiveReadLimit
            });
        },
        assertPosition(position) {
          if (position < 0 || position > this.bytes.length - 1)
            throw new PositionOutOfBoundsError2({
              length: this.bytes.length,
              position
            });
        },
        decrementPosition(offset) {
          if (offset < 0)
            throw new NegativeOffsetError2({ offset });
          const position = this.position - offset;
          this.assertPosition(position);
          this.position = position;
        },
        getReadCount(position) {
          return this.positionReadCount.get(position || this.position) || 0;
        },
        incrementPosition(offset) {
          if (offset < 0)
            throw new NegativeOffsetError2({ offset });
          const position = this.position + offset;
          this.assertPosition(position);
          this.position = position;
        },
        inspectByte(position_) {
          const position = position_ ?? this.position;
          this.assertPosition(position);
          return this.bytes[position];
        },
        inspectBytes(length, position_) {
          const position = position_ ?? this.position;
          this.assertPosition(position + length - 1);
          return this.bytes.subarray(position, position + length);
        },
        inspectUint8(position_) {
          const position = position_ ?? this.position;
          this.assertPosition(position);
          return this.bytes[position];
        },
        inspectUint16(position_) {
          const position = position_ ?? this.position;
          this.assertPosition(position + 1);
          return this.dataView.getUint16(position);
        },
        inspectUint24(position_) {
          const position = position_ ?? this.position;
          this.assertPosition(position + 2);
          return (this.dataView.getUint16(position) << 8) + this.dataView.getUint8(position + 2);
        },
        inspectUint32(position_) {
          const position = position_ ?? this.position;
          this.assertPosition(position + 3);
          return this.dataView.getUint32(position);
        },
        pushByte(byte) {
          this.assertPosition(this.position);
          this.bytes[this.position] = byte;
          this.position++;
        },
        pushBytes(bytes) {
          this.assertPosition(this.position + bytes.length - 1);
          this.bytes.set(bytes, this.position);
          this.position += bytes.length;
        },
        pushUint8(value) {
          this.assertPosition(this.position);
          this.bytes[this.position] = value;
          this.position++;
        },
        pushUint16(value) {
          this.assertPosition(this.position + 1);
          this.dataView.setUint16(this.position, value);
          this.position += 2;
        },
        pushUint24(value) {
          this.assertPosition(this.position + 2);
          this.dataView.setUint16(this.position, value >> 8);
          this.dataView.setUint8(this.position + 2, value & ~4294967040);
          this.position += 3;
        },
        pushUint32(value) {
          this.assertPosition(this.position + 3);
          this.dataView.setUint32(this.position, value);
          this.position += 4;
        },
        readByte() {
          this.assertReadLimit();
          this._touch();
          const value = this.inspectByte();
          this.position++;
          return value;
        },
        readBytes(length, size5) {
          this.assertReadLimit();
          this._touch();
          const value = this.inspectBytes(length);
          this.position += size5 ?? length;
          return value;
        },
        readUint8() {
          this.assertReadLimit();
          this._touch();
          const value = this.inspectUint8();
          this.position += 1;
          return value;
        },
        readUint16() {
          this.assertReadLimit();
          this._touch();
          const value = this.inspectUint16();
          this.position += 2;
          return value;
        },
        readUint24() {
          this.assertReadLimit();
          this._touch();
          const value = this.inspectUint24();
          this.position += 3;
          return value;
        },
        readUint32() {
          this.assertReadLimit();
          this._touch();
          const value = this.inspectUint32();
          this.position += 4;
          return value;
        },
        get remaining() {
          return this.bytes.length - this.position;
        },
        setPosition(position) {
          const oldPosition = this.position;
          this.assertPosition(position);
          this.position = position;
          return () => this.position = oldPosition;
        },
        _touch() {
          if (this.recursiveReadLimit === Number.POSITIVE_INFINITY)
            return;
          const count = this.getReadCount();
          this.positionReadCount.set(this.position, count + 1);
          if (count > 0)
            this.recursiveReadCount++;
        }
      };
      NegativeOffsetError2 = class extends BaseError3 {
        constructor({ offset }) {
          super(`Offset \`${offset}\` cannot be negative.`);
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Cursor.NegativeOffsetError"
          });
        }
      };
      PositionOutOfBoundsError2 = class extends BaseError3 {
        constructor({ length, position }) {
          super(`Position \`${position}\` is out of bounds (\`0 < position < ${length}\`).`);
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Cursor.PositionOutOfBoundsError"
          });
        }
      };
      RecursiveReadLimitExceededError2 = class extends BaseError3 {
        constructor({ count, limit }) {
          super(`Recursive read limit of \`${limit}\` exceeded (recursive read count: \`${count}\`).`);
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Cursor.RecursiveReadLimitExceededError"
          });
        }
      };
    }
  });

  // node_modules/ox/_esm/core/AbiParameters.js
  function decode(parameters, data, options = {}) {
    const { as = "Array", checksumAddress: checksumAddress2 = false } = options;
    const bytes = typeof data === "string" ? fromHex(data) : data;
    const cursor = create(bytes);
    if (size2(bytes) === 0 && parameters.length > 0)
      throw new ZeroDataError();
    if (size2(bytes) && size2(bytes) < 32)
      throw new DataSizeTooSmallError({
        data: typeof data === "string" ? data : fromBytes(data),
        parameters,
        size: size2(bytes)
      });
    let consumed = 0;
    const values = as === "Array" ? [] : {};
    for (let i = 0; i < parameters.length; ++i) {
      const param = parameters[i];
      cursor.setPosition(consumed);
      const [data2, consumed_] = decodeParameter2(cursor, param, {
        checksumAddress: checksumAddress2,
        staticPosition: 0
      });
      consumed += consumed_;
      if (as === "Array")
        values.push(data2);
      else
        values[param.name ?? i] = data2;
    }
    return values;
  }
  function encode3(parameters, values, options) {
    const { checksumAddress: checksumAddress2 = false } = options ?? {};
    if (parameters.length !== values.length)
      throw new LengthMismatchError({
        expectedLength: parameters.length,
        givenLength: values.length
      });
    const preparedParameters = prepareParameters({
      checksumAddress: checksumAddress2,
      parameters,
      values
    });
    const data = encode2(preparedParameters);
    if (data.length === 0)
      return "0x";
    return data;
  }
  function encodePacked2(types2, values) {
    if (types2.length !== values.length)
      throw new LengthMismatchError({
        expectedLength: types2.length,
        givenLength: values.length
      });
    const data = [];
    for (let i = 0; i < types2.length; i++) {
      const type = types2[i];
      const value = values[i];
      data.push(encodePacked2.encode(type, value));
    }
    return concat2(...data);
  }
  function from5(parameters) {
    if (Array.isArray(parameters) && typeof parameters[0] === "string")
      return parseAbiParameters(parameters);
    if (typeof parameters === "string")
      return parseAbiParameters(parameters);
    return parameters;
  }
  var DataSizeTooSmallError, ZeroDataError, ArrayLengthMismatchError, BytesSizeMismatchError2, LengthMismatchError, InvalidArrayError2, InvalidTypeError;
  var init_AbiParameters = __esm({
    "node_modules/ox/_esm/core/AbiParameters.js"() {
      init_exports();
      init_Address();
      init_Bytes();
      init_Errors();
      init_Hex();
      init_abiParameters();
      init_cursor3();
      init_Solidity();
      (function(encodePacked3) {
        function encode5(type, value, isArray = false) {
          if (type === "address") {
            const address = value;
            assert4(address);
            return padLeft(address.toLowerCase(), isArray ? 32 : 0);
          }
          if (type === "string")
            return fromString2(value);
          if (type === "bytes")
            return value;
          if (type === "bool")
            return padLeft(fromBoolean(value), isArray ? 32 : 1);
          const intMatch = type.match(integerRegex3);
          if (intMatch) {
            const [_type, baseType, bits = "256"] = intMatch;
            const size5 = Number.parseInt(bits, 10) / 8;
            return fromNumber(value, {
              size: isArray ? 32 : size5,
              signed: baseType === "int"
            });
          }
          const bytesMatch = type.match(bytesRegex3);
          if (bytesMatch) {
            const [_type, size5] = bytesMatch;
            if (Number.parseInt(size5, 10) !== (value.length - 2) / 2)
              throw new BytesSizeMismatchError2({
                expectedSize: Number.parseInt(size5, 10),
                value
              });
            return padRight(value, isArray ? 32 : 0);
          }
          const arrayMatch = type.match(arrayRegex2);
          if (arrayMatch && Array.isArray(value)) {
            const [_type, childType] = arrayMatch;
            const data = [];
            for (let i = 0; i < value.length; i++) {
              data.push(encode5(childType, value[i], true));
            }
            if (data.length === 0)
              return "0x";
            return concat2(...data);
          }
          throw new InvalidTypeError(type);
        }
        encodePacked3.encode = encode5;
      })(encodePacked2 || (encodePacked2 = {}));
      DataSizeTooSmallError = class extends BaseError3 {
        constructor({ data, parameters, size: size5 }) {
          super(`Data size of ${size5} bytes is too small for given parameters.`, {
            metaMessages: [
              `Params: (${formatAbiParameters(parameters)})`,
              `Data:   ${data} (${size5} bytes)`
            ]
          });
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "AbiParameters.DataSizeTooSmallError"
          });
        }
      };
      ZeroDataError = class extends BaseError3 {
        constructor() {
          super('Cannot decode zero data ("0x") with ABI parameters.');
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "AbiParameters.ZeroDataError"
          });
        }
      };
      ArrayLengthMismatchError = class extends BaseError3 {
        constructor({ expectedLength, givenLength, type }) {
          super(`Array length mismatch for type \`${type}\`. Expected: \`${expectedLength}\`. Given: \`${givenLength}\`.`);
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "AbiParameters.ArrayLengthMismatchError"
          });
        }
      };
      BytesSizeMismatchError2 = class extends BaseError3 {
        constructor({ expectedSize, value }) {
          super(`Size of bytes "${value}" (bytes${size3(value)}) does not match expected size (bytes${expectedSize}).`);
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "AbiParameters.BytesSizeMismatchError"
          });
        }
      };
      LengthMismatchError = class extends BaseError3 {
        constructor({ expectedLength, givenLength }) {
          super([
            "ABI encoding parameters/values length mismatch.",
            `Expected length (parameters): ${expectedLength}`,
            `Given length (values): ${givenLength}`
          ].join("\n"));
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "AbiParameters.LengthMismatchError"
          });
        }
      };
      InvalidArrayError2 = class extends BaseError3 {
        constructor(value) {
          super(`Value \`${value}\` is not a valid array.`);
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "AbiParameters.InvalidArrayError"
          });
        }
      };
      InvalidTypeError = class extends BaseError3 {
        constructor(type) {
          super(`Type \`${type}\` is not a valid ABI Type.`);
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "AbiParameters.InvalidTypeError"
          });
        }
      };
    }
  });

  // node_modules/ox/_esm/core/Rlp.js
  function from6(value, options) {
    const { as } = options;
    const encodable = getEncodable2(value);
    const cursor = create(new Uint8Array(encodable.length));
    encodable.encode(cursor);
    if (as === "Hex")
      return fromBytes(cursor.bytes);
    return cursor.bytes;
  }
  function fromHex3(hex, options = {}) {
    const { as = "Hex" } = options;
    return from6(hex, { as });
  }
  function getEncodable2(bytes) {
    if (Array.isArray(bytes))
      return getEncodableList2(bytes.map((x) => getEncodable2(x)));
    return getEncodableBytes2(bytes);
  }
  function getEncodableList2(list) {
    const bodyLength = list.reduce((acc, x) => acc + x.length, 0);
    const sizeOfBodyLength = getSizeOfLength2(bodyLength);
    const length = (() => {
      if (bodyLength <= 55)
        return 1 + bodyLength;
      return 1 + sizeOfBodyLength + bodyLength;
    })();
    return {
      length,
      encode(cursor) {
        if (bodyLength <= 55) {
          cursor.pushByte(192 + bodyLength);
        } else {
          cursor.pushByte(192 + 55 + sizeOfBodyLength);
          if (sizeOfBodyLength === 1)
            cursor.pushUint8(bodyLength);
          else if (sizeOfBodyLength === 2)
            cursor.pushUint16(bodyLength);
          else if (sizeOfBodyLength === 3)
            cursor.pushUint24(bodyLength);
          else
            cursor.pushUint32(bodyLength);
        }
        for (const { encode: encode5 } of list) {
          encode5(cursor);
        }
      }
    };
  }
  function getEncodableBytes2(bytesOrHex) {
    const bytes = typeof bytesOrHex === "string" ? fromHex(bytesOrHex) : bytesOrHex;
    const sizeOfBytesLength = getSizeOfLength2(bytes.length);
    const length = (() => {
      if (bytes.length === 1 && bytes[0] < 128)
        return 1;
      if (bytes.length <= 55)
        return 1 + bytes.length;
      return 1 + sizeOfBytesLength + bytes.length;
    })();
    return {
      length,
      encode(cursor) {
        if (bytes.length === 1 && bytes[0] < 128) {
          cursor.pushBytes(bytes);
        } else if (bytes.length <= 55) {
          cursor.pushByte(128 + bytes.length);
          cursor.pushBytes(bytes);
        } else {
          cursor.pushByte(128 + 55 + sizeOfBytesLength);
          if (sizeOfBytesLength === 1)
            cursor.pushUint8(bytes.length);
          else if (sizeOfBytesLength === 2)
            cursor.pushUint16(bytes.length);
          else if (sizeOfBytesLength === 3)
            cursor.pushUint24(bytes.length);
          else
            cursor.pushUint32(bytes.length);
          cursor.pushBytes(bytes);
        }
      }
    };
  }
  function getSizeOfLength2(length) {
    if (length < 2 ** 8)
      return 1;
    if (length < 2 ** 16)
      return 2;
    if (length < 2 ** 24)
      return 3;
    if (length < 2 ** 32)
      return 4;
    throw new BaseError3("Length is too large.");
  }
  var init_Rlp = __esm({
    "node_modules/ox/_esm/core/Rlp.js"() {
      init_Bytes();
      init_Errors();
      init_Hex();
      init_cursor3();
    }
  });

  // node_modules/ox/node_modules/@noble/curves/esm/abstract/modular.js
  function mod2(a, b) {
    const result = a % b;
    return result >= _0n8 ? result : b + result;
  }
  function pow22(x, power, modulo) {
    let res = x;
    while (power-- > _0n8) {
      res *= res;
      res %= modulo;
    }
    return res;
  }
  function invert2(number, modulo) {
    if (number === _0n8)
      throw new Error("invert: expected non-zero number");
    if (modulo <= _0n8)
      throw new Error("invert: expected positive modulus, got " + modulo);
    let a = mod2(number, modulo);
    let b = modulo;
    let x = _0n8, y = _1n8, u = _1n8, v = _0n8;
    while (a !== _0n8) {
      const q = b / a;
      const r = b % a;
      const m = x - u * q;
      const n = y - v * q;
      b = a, a = r, x = u, y = v, u = m, v = n;
    }
    const gcd = b;
    if (gcd !== _1n8)
      throw new Error("invert: does not exist");
    return mod2(x, modulo);
  }
  function sqrt3mod42(Fp, n) {
    const p1div4 = (Fp.ORDER + _1n8) / _4n3;
    const root = Fp.pow(n, p1div4);
    if (!Fp.eql(Fp.sqr(root), n))
      throw new Error("Cannot find square root");
    return root;
  }
  function sqrt5mod82(Fp, n) {
    const p5div8 = (Fp.ORDER - _5n2) / _8n2;
    const n2 = Fp.mul(n, _2n5);
    const v = Fp.pow(n2, p5div8);
    const nv = Fp.mul(n, v);
    const i = Fp.mul(Fp.mul(nv, _2n5), v);
    const root = Fp.mul(nv, Fp.sub(i, Fp.ONE));
    if (!Fp.eql(Fp.sqr(root), n))
      throw new Error("Cannot find square root");
    return root;
  }
  function tonelliShanks2(P) {
    if (P < BigInt(3))
      throw new Error("sqrt is not defined for small field");
    let Q = P - _1n8;
    let S = 0;
    while (Q % _2n5 === _0n8) {
      Q /= _2n5;
      S++;
    }
    let Z = _2n5;
    const _Fp = Field2(P);
    while (FpLegendre2(_Fp, Z) === 1) {
      if (Z++ > 1e3)
        throw new Error("Cannot find square root: probably non-prime P");
    }
    if (S === 1)
      return sqrt3mod42;
    let cc = _Fp.pow(Z, Q);
    const Q1div2 = (Q + _1n8) / _2n5;
    return function tonelliSlow(Fp, n) {
      if (Fp.is0(n))
        return n;
      if (FpLegendre2(Fp, n) !== 1)
        throw new Error("Cannot find square root");
      let M = S;
      let c = Fp.mul(Fp.ONE, cc);
      let t = Fp.pow(n, Q);
      let R = Fp.pow(n, Q1div2);
      while (!Fp.eql(t, Fp.ONE)) {
        if (Fp.is0(t))
          return Fp.ZERO;
        let i = 1;
        let t_tmp = Fp.sqr(t);
        while (!Fp.eql(t_tmp, Fp.ONE)) {
          i++;
          t_tmp = Fp.sqr(t_tmp);
          if (i === M)
            throw new Error("Cannot find square root");
        }
        const exponent = _1n8 << BigInt(M - i - 1);
        const b = Fp.pow(c, exponent);
        M = i;
        c = Fp.sqr(b);
        t = Fp.mul(t, c);
        R = Fp.mul(R, b);
      }
      return R;
    };
  }
  function FpSqrt2(P) {
    if (P % _4n3 === _3n3)
      return sqrt3mod42;
    if (P % _8n2 === _5n2)
      return sqrt5mod82;
    return tonelliShanks2(P);
  }
  function validateField2(field) {
    const initial = {
      ORDER: "bigint",
      MASK: "bigint",
      BYTES: "isSafeInteger",
      BITS: "isSafeInteger"
    };
    const opts = FIELD_FIELDS2.reduce((map, val) => {
      map[val] = "function";
      return map;
    }, initial);
    return validateObject2(field, opts);
  }
  function FpPow2(Fp, num2, power) {
    if (power < _0n8)
      throw new Error("invalid exponent, negatives unsupported");
    if (power === _0n8)
      return Fp.ONE;
    if (power === _1n8)
      return num2;
    let p = Fp.ONE;
    let d = num2;
    while (power > _0n8) {
      if (power & _1n8)
        p = Fp.mul(p, d);
      d = Fp.sqr(d);
      power >>= _1n8;
    }
    return p;
  }
  function FpInvertBatch2(Fp, nums, passZero = false) {
    const inverted = new Array(nums.length).fill(passZero ? Fp.ZERO : void 0);
    const multipliedAcc = nums.reduce((acc, num2, i) => {
      if (Fp.is0(num2))
        return acc;
      inverted[i] = acc;
      return Fp.mul(acc, num2);
    }, Fp.ONE);
    const invertedAcc = Fp.inv(multipliedAcc);
    nums.reduceRight((acc, num2, i) => {
      if (Fp.is0(num2))
        return acc;
      inverted[i] = Fp.mul(acc, inverted[i]);
      return Fp.mul(acc, num2);
    }, invertedAcc);
    return inverted;
  }
  function FpLegendre2(Fp, n) {
    const p1mod2 = (Fp.ORDER - _1n8) / _2n5;
    const powered = Fp.pow(n, p1mod2);
    const yes = Fp.eql(powered, Fp.ONE);
    const zero = Fp.eql(powered, Fp.ZERO);
    const no = Fp.eql(powered, Fp.neg(Fp.ONE));
    if (!yes && !zero && !no)
      throw new Error("invalid Legendre symbol result");
    return yes ? 1 : zero ? 0 : -1;
  }
  function nLength2(n, nBitLength) {
    if (nBitLength !== void 0)
      anumber(nBitLength);
    const _nBitLength = nBitLength !== void 0 ? nBitLength : n.toString(2).length;
    const nByteLength = Math.ceil(_nBitLength / 8);
    return { nBitLength: _nBitLength, nByteLength };
  }
  function Field2(ORDER, bitLen3, isLE2 = false, redef = {}) {
    if (ORDER <= _0n8)
      throw new Error("invalid field: expected ORDER > 0, got " + ORDER);
    const { nBitLength: BITS, nByteLength: BYTES } = nLength2(ORDER, bitLen3);
    if (BYTES > 2048)
      throw new Error("invalid field: expected ORDER of <= 2048 bytes");
    let sqrtP;
    const f = Object.freeze({
      ORDER,
      isLE: isLE2,
      BITS,
      BYTES,
      MASK: bitMask2(BITS),
      ZERO: _0n8,
      ONE: _1n8,
      create: (num2) => mod2(num2, ORDER),
      isValid: (num2) => {
        if (typeof num2 !== "bigint")
          throw new Error("invalid field element: expected bigint, got " + typeof num2);
        return _0n8 <= num2 && num2 < ORDER;
      },
      is0: (num2) => num2 === _0n8,
      isOdd: (num2) => (num2 & _1n8) === _1n8,
      neg: (num2) => mod2(-num2, ORDER),
      eql: (lhs, rhs) => lhs === rhs,
      sqr: (num2) => mod2(num2 * num2, ORDER),
      add: (lhs, rhs) => mod2(lhs + rhs, ORDER),
      sub: (lhs, rhs) => mod2(lhs - rhs, ORDER),
      mul: (lhs, rhs) => mod2(lhs * rhs, ORDER),
      pow: (num2, power) => FpPow2(f, num2, power),
      div: (lhs, rhs) => mod2(lhs * invert2(rhs, ORDER), ORDER),
      // Same as above, but doesn't normalize
      sqrN: (num2) => num2 * num2,
      addN: (lhs, rhs) => lhs + rhs,
      subN: (lhs, rhs) => lhs - rhs,
      mulN: (lhs, rhs) => lhs * rhs,
      inv: (num2) => invert2(num2, ORDER),
      sqrt: redef.sqrt || ((n) => {
        if (!sqrtP)
          sqrtP = FpSqrt2(ORDER);
        return sqrtP(f, n);
      }),
      toBytes: (num2) => isLE2 ? numberToBytesLE2(num2, BYTES) : numberToBytesBE2(num2, BYTES),
      fromBytes: (bytes) => {
        if (bytes.length !== BYTES)
          throw new Error("Field.fromBytes: expected " + BYTES + " bytes, got " + bytes.length);
        return isLE2 ? bytesToNumberLE2(bytes) : bytesToNumberBE2(bytes);
      },
      // TODO: we don't need it here, move out to separate fn
      invertBatch: (lst) => FpInvertBatch2(f, lst),
      // We can't move this out because Fp6, Fp12 implement it
      // and it's unclear what to return in there.
      cmov: (a, b, c) => c ? b : a
    });
    return Object.freeze(f);
  }
  function getFieldBytesLength2(fieldOrder) {
    if (typeof fieldOrder !== "bigint")
      throw new Error("field order must be bigint");
    const bitLength = fieldOrder.toString(2).length;
    return Math.ceil(bitLength / 8);
  }
  function getMinHashLength2(fieldOrder) {
    const length = getFieldBytesLength2(fieldOrder);
    return length + Math.ceil(length / 2);
  }
  function mapHashToField2(key, fieldOrder, isLE2 = false) {
    const len = key.length;
    const fieldLen = getFieldBytesLength2(fieldOrder);
    const minLen = getMinHashLength2(fieldOrder);
    if (len < 16 || len < minLen || len > 1024)
      throw new Error("expected " + minLen + "-1024 bytes of input, got " + len);
    const num2 = isLE2 ? bytesToNumberLE2(key) : bytesToNumberBE2(key);
    const reduced = mod2(num2, fieldOrder - _1n8) + _1n8;
    return isLE2 ? numberToBytesLE2(reduced, fieldLen) : numberToBytesBE2(reduced, fieldLen);
  }
  var _0n8, _1n8, _2n5, _3n3, _4n3, _5n2, _8n2, FIELD_FIELDS2;
  var init_modular2 = __esm({
    "node_modules/ox/node_modules/@noble/curves/esm/abstract/modular.js"() {
      init_utils2();
      init_utils5();
      _0n8 = BigInt(0);
      _1n8 = BigInt(1);
      _2n5 = /* @__PURE__ */ BigInt(2);
      _3n3 = /* @__PURE__ */ BigInt(3);
      _4n3 = /* @__PURE__ */ BigInt(4);
      _5n2 = /* @__PURE__ */ BigInt(5);
      _8n2 = /* @__PURE__ */ BigInt(8);
      FIELD_FIELDS2 = [
        "create",
        "isValid",
        "is0",
        "neg",
        "inv",
        "sqrt",
        "sqr",
        "eql",
        "add",
        "sub",
        "mul",
        "pow",
        "div",
        "addN",
        "subN",
        "mulN",
        "sqrN"
      ];
    }
  });

  // node_modules/ox/node_modules/@noble/curves/esm/abstract/curve.js
  function constTimeNegate2(condition, item) {
    const neg = item.negate();
    return condition ? neg : item;
  }
  function validateW2(W, bits) {
    if (!Number.isSafeInteger(W) || W <= 0 || W > bits)
      throw new Error("invalid window size, expected [1.." + bits + "], got W=" + W);
  }
  function calcWOpts2(W, scalarBits) {
    validateW2(W, scalarBits);
    const windows = Math.ceil(scalarBits / W) + 1;
    const windowSize = 2 ** (W - 1);
    const maxNumber = 2 ** W;
    const mask = bitMask2(W);
    const shiftBy = BigInt(W);
    return { windows, windowSize, mask, maxNumber, shiftBy };
  }
  function calcOffsets2(n, window2, wOpts) {
    const { windowSize, mask, maxNumber, shiftBy } = wOpts;
    let wbits = Number(n & mask);
    let nextN = n >> shiftBy;
    if (wbits > windowSize) {
      wbits -= maxNumber;
      nextN += _1n9;
    }
    const offsetStart = window2 * windowSize;
    const offset = offsetStart + Math.abs(wbits) - 1;
    const isZero = wbits === 0;
    const isNeg = wbits < 0;
    const isNegF = window2 % 2 !== 0;
    const offsetF = offsetStart;
    return { nextN, offset, isZero, isNeg, isNegF, offsetF };
  }
  function validateMSMPoints2(points, c) {
    if (!Array.isArray(points))
      throw new Error("array expected");
    points.forEach((p, i) => {
      if (!(p instanceof c))
        throw new Error("invalid point at index " + i);
    });
  }
  function validateMSMScalars2(scalars, field) {
    if (!Array.isArray(scalars))
      throw new Error("array of scalars expected");
    scalars.forEach((s, i) => {
      if (!field.isValid(s))
        throw new Error("invalid scalar at index " + i);
    });
  }
  function getW2(P) {
    return pointWindowSizes2.get(P) || 1;
  }
  function wNAF2(c, bits) {
    return {
      constTimeNegate: constTimeNegate2,
      hasPrecomputes(elm) {
        return getW2(elm) !== 1;
      },
      // non-const time multiplication ladder
      unsafeLadder(elm, n, p = c.ZERO) {
        let d = elm;
        while (n > _0n9) {
          if (n & _1n9)
            p = p.add(d);
          d = d.double();
          n >>= _1n9;
        }
        return p;
      },
      /**
       * Creates a wNAF precomputation window. Used for caching.
       * Default window size is set by `utils.precompute()` and is equal to 8.
       * Number of precomputed points depends on the curve size:
       * 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
       * - 𝑊 is the window size
       * - 𝑛 is the bitlength of the curve order.
       * For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
       * @param elm Point instance
       * @param W window size
       * @returns precomputed point tables flattened to a single array
       */
      precomputeWindow(elm, W) {
        const { windows, windowSize } = calcWOpts2(W, bits);
        const points = [];
        let p = elm;
        let base = p;
        for (let window2 = 0; window2 < windows; window2++) {
          base = p;
          points.push(base);
          for (let i = 1; i < windowSize; i++) {
            base = base.add(p);
            points.push(base);
          }
          p = base.double();
        }
        return points;
      },
      /**
       * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
       * @param W window size
       * @param precomputes precomputed tables
       * @param n scalar (we don't check here, but should be less than curve order)
       * @returns real and fake (for const-time) points
       */
      wNAF(W, precomputes, n) {
        let p = c.ZERO;
        let f = c.BASE;
        const wo = calcWOpts2(W, bits);
        for (let window2 = 0; window2 < wo.windows; window2++) {
          const { nextN, offset, isZero, isNeg, isNegF, offsetF } = calcOffsets2(n, window2, wo);
          n = nextN;
          if (isZero) {
            f = f.add(constTimeNegate2(isNegF, precomputes[offsetF]));
          } else {
            p = p.add(constTimeNegate2(isNeg, precomputes[offset]));
          }
        }
        return { p, f };
      },
      /**
       * Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
       * @param W window size
       * @param precomputes precomputed tables
       * @param n scalar (we don't check here, but should be less than curve order)
       * @param acc accumulator point to add result of multiplication
       * @returns point
       */
      wNAFUnsafe(W, precomputes, n, acc = c.ZERO) {
        const wo = calcWOpts2(W, bits);
        for (let window2 = 0; window2 < wo.windows; window2++) {
          if (n === _0n9)
            break;
          const { nextN, offset, isZero, isNeg } = calcOffsets2(n, window2, wo);
          n = nextN;
          if (isZero) {
            continue;
          } else {
            const item = precomputes[offset];
            acc = acc.add(isNeg ? item.negate() : item);
          }
        }
        return acc;
      },
      getPrecomputes(W, P, transform) {
        let comp = pointPrecomputes2.get(P);
        if (!comp) {
          comp = this.precomputeWindow(P, W);
          if (W !== 1)
            pointPrecomputes2.set(P, transform(comp));
        }
        return comp;
      },
      wNAFCached(P, n, transform) {
        const W = getW2(P);
        return this.wNAF(W, this.getPrecomputes(W, P, transform), n);
      },
      wNAFCachedUnsafe(P, n, transform, prev) {
        const W = getW2(P);
        if (W === 1)
          return this.unsafeLadder(P, n, prev);
        return this.wNAFUnsafe(W, this.getPrecomputes(W, P, transform), n, prev);
      },
      // We calculate precomputes for elliptic curve point multiplication
      // using windowed method. This specifies window size and
      // stores precomputed values. Usually only base point would be precomputed.
      setWindowSize(P, W) {
        validateW2(W, bits);
        pointWindowSizes2.set(P, W);
        pointPrecomputes2.delete(P);
      }
    };
  }
  function pippenger2(c, fieldN, points, scalars) {
    validateMSMPoints2(points, c);
    validateMSMScalars2(scalars, fieldN);
    const plength = points.length;
    const slength = scalars.length;
    if (plength !== slength)
      throw new Error("arrays of points and scalars must have equal length");
    const zero = c.ZERO;
    const wbits = bitLen2(BigInt(plength));
    let windowSize = 1;
    if (wbits > 12)
      windowSize = wbits - 3;
    else if (wbits > 4)
      windowSize = wbits - 2;
    else if (wbits > 0)
      windowSize = 2;
    const MASK = bitMask2(windowSize);
    const buckets = new Array(Number(MASK) + 1).fill(zero);
    const lastBits = Math.floor((fieldN.BITS - 1) / windowSize) * windowSize;
    let sum = zero;
    for (let i = lastBits; i >= 0; i -= windowSize) {
      buckets.fill(zero);
      for (let j = 0; j < slength; j++) {
        const scalar = scalars[j];
        const wbits2 = Number(scalar >> BigInt(i) & MASK);
        buckets[wbits2] = buckets[wbits2].add(points[j]);
      }
      let resI = zero;
      for (let j = buckets.length - 1, sumI = zero; j > 0; j--) {
        sumI = sumI.add(buckets[j]);
        resI = resI.add(sumI);
      }
      sum = sum.add(resI);
      if (i !== 0)
        for (let j = 0; j < windowSize; j++)
          sum = sum.double();
    }
    return sum;
  }
  function validateBasic2(curve) {
    validateField2(curve.Fp);
    validateObject2(curve, {
      n: "bigint",
      h: "bigint",
      Gx: "field",
      Gy: "field"
    }, {
      nBitLength: "isSafeInteger",
      nByteLength: "isSafeInteger"
    });
    return Object.freeze({
      ...nLength2(curve.n, curve.nBitLength),
      ...curve,
      ...{ p: curve.Fp.ORDER }
    });
  }
  var _0n9, _1n9, pointPrecomputes2, pointWindowSizes2;
  var init_curve2 = __esm({
    "node_modules/ox/node_modules/@noble/curves/esm/abstract/curve.js"() {
      init_modular2();
      init_utils5();
      _0n9 = BigInt(0);
      _1n9 = BigInt(1);
      pointPrecomputes2 = /* @__PURE__ */ new WeakMap();
      pointWindowSizes2 = /* @__PURE__ */ new WeakMap();
    }
  });

  // node_modules/ox/node_modules/@noble/curves/esm/abstract/weierstrass.js
  function validateSigVerOpts2(opts) {
    if (opts.lowS !== void 0)
      abool2("lowS", opts.lowS);
    if (opts.prehash !== void 0)
      abool2("prehash", opts.prehash);
  }
  function validatePointOpts2(curve) {
    const opts = validateBasic2(curve);
    validateObject2(opts, {
      a: "field",
      b: "field"
    }, {
      allowInfinityPoint: "boolean",
      allowedPrivateKeyLengths: "array",
      clearCofactor: "function",
      fromBytes: "function",
      isTorsionFree: "function",
      toBytes: "function",
      wrapPrivateKey: "boolean"
    });
    const { endo, Fp, a } = opts;
    if (endo) {
      if (!Fp.eql(a, Fp.ZERO)) {
        throw new Error("invalid endo: CURVE.a must be 0");
      }
      if (typeof endo !== "object" || typeof endo.beta !== "bigint" || typeof endo.splitScalar !== "function") {
        throw new Error('invalid endo: expected "beta": bigint and "splitScalar": function');
      }
    }
    return Object.freeze({ ...opts });
  }
  function numToSizedHex2(num2, size5) {
    return bytesToHex3(numberToBytesBE2(num2, size5));
  }
  function weierstrassPoints2(opts) {
    const CURVE = validatePointOpts2(opts);
    const { Fp } = CURVE;
    const Fn = Field2(CURVE.n, CURVE.nBitLength);
    const toBytes5 = CURVE.toBytes || ((_c, point, _isCompressed) => {
      const a = point.toAffine();
      return concatBytes4(Uint8Array.from([4]), Fp.toBytes(a.x), Fp.toBytes(a.y));
    });
    const fromBytes4 = CURVE.fromBytes || ((bytes) => {
      const tail = bytes.subarray(1);
      const x = Fp.fromBytes(tail.subarray(0, Fp.BYTES));
      const y = Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES));
      return { x, y };
    });
    function weierstrassEquation(x) {
      const { a, b } = CURVE;
      const x2 = Fp.sqr(x);
      const x3 = Fp.mul(x2, x);
      return Fp.add(Fp.add(x3, Fp.mul(x, a)), b);
    }
    function isValidXY(x, y) {
      const left = Fp.sqr(y);
      const right = weierstrassEquation(x);
      return Fp.eql(left, right);
    }
    if (!isValidXY(CURVE.Gx, CURVE.Gy))
      throw new Error("bad curve params: generator point");
    const _4a3 = Fp.mul(Fp.pow(CURVE.a, _3n4), _4n4);
    const _27b2 = Fp.mul(Fp.sqr(CURVE.b), BigInt(27));
    if (Fp.is0(Fp.add(_4a3, _27b2)))
      throw new Error("bad curve params: a or b");
    function isWithinCurveOrder(num2) {
      return inRange2(num2, _1n10, CURVE.n);
    }
    function normPrivateKeyToScalar(key) {
      const { allowedPrivateKeyLengths: lengths, nByteLength, wrapPrivateKey, n: N } = CURVE;
      if (lengths && typeof key !== "bigint") {
        if (isBytes3(key))
          key = bytesToHex3(key);
        if (typeof key !== "string" || !lengths.includes(key.length))
          throw new Error("invalid private key");
        key = key.padStart(nByteLength * 2, "0");
      }
      let num2;
      try {
        num2 = typeof key === "bigint" ? key : bytesToNumberBE2(ensureBytes2("private key", key, nByteLength));
      } catch (error) {
        throw new Error("invalid private key, expected hex or " + nByteLength + " bytes, got " + typeof key);
      }
      if (wrapPrivateKey)
        num2 = mod2(num2, N);
      aInRange2("private key", num2, _1n10, N);
      return num2;
    }
    function aprjpoint(other) {
      if (!(other instanceof Point2))
        throw new Error("ProjectivePoint expected");
    }
    const toAffineMemo = memoized2((p, iz) => {
      const { px: x, py: y, pz: z } = p;
      if (Fp.eql(z, Fp.ONE))
        return { x, y };
      const is0 = p.is0();
      if (iz == null)
        iz = is0 ? Fp.ONE : Fp.inv(z);
      const ax = Fp.mul(x, iz);
      const ay = Fp.mul(y, iz);
      const zz = Fp.mul(z, iz);
      if (is0)
        return { x: Fp.ZERO, y: Fp.ZERO };
      if (!Fp.eql(zz, Fp.ONE))
        throw new Error("invZ was invalid");
      return { x: ax, y: ay };
    });
    const assertValidMemo = memoized2((p) => {
      if (p.is0()) {
        if (CURVE.allowInfinityPoint && !Fp.is0(p.py))
          return;
        throw new Error("bad point: ZERO");
      }
      const { x, y } = p.toAffine();
      if (!Fp.isValid(x) || !Fp.isValid(y))
        throw new Error("bad point: x or y not FE");
      if (!isValidXY(x, y))
        throw new Error("bad point: equation left != right");
      if (!p.isTorsionFree())
        throw new Error("bad point: not in prime-order subgroup");
      return true;
    });
    class Point2 {
      constructor(px, py, pz) {
        if (px == null || !Fp.isValid(px))
          throw new Error("x required");
        if (py == null || !Fp.isValid(py) || Fp.is0(py))
          throw new Error("y required");
        if (pz == null || !Fp.isValid(pz))
          throw new Error("z required");
        this.px = px;
        this.py = py;
        this.pz = pz;
        Object.freeze(this);
      }
      // Does not validate if the point is on-curve.
      // Use fromHex instead, or call assertValidity() later.
      static fromAffine(p) {
        const { x, y } = p || {};
        if (!p || !Fp.isValid(x) || !Fp.isValid(y))
          throw new Error("invalid affine point");
        if (p instanceof Point2)
          throw new Error("projective point not allowed");
        const is0 = (i) => Fp.eql(i, Fp.ZERO);
        if (is0(x) && is0(y))
          return Point2.ZERO;
        return new Point2(x, y, Fp.ONE);
      }
      get x() {
        return this.toAffine().x;
      }
      get y() {
        return this.toAffine().y;
      }
      /**
       * Takes a bunch of Projective Points but executes only one
       * inversion on all of them. Inversion is very slow operation,
       * so this improves performance massively.
       * Optimization: converts a list of projective points to a list of identical points with Z=1.
       */
      static normalizeZ(points) {
        const toInv = FpInvertBatch2(Fp, points.map((p) => p.pz));
        return points.map((p, i) => p.toAffine(toInv[i])).map(Point2.fromAffine);
      }
      /**
       * Converts hash string or Uint8Array to Point.
       * @param hex short/long ECDSA hex
       */
      static fromHex(hex) {
        const P = Point2.fromAffine(fromBytes4(ensureBytes2("pointHex", hex)));
        P.assertValidity();
        return P;
      }
      // Multiplies generator point by privateKey.
      static fromPrivateKey(privateKey) {
        return Point2.BASE.multiply(normPrivateKeyToScalar(privateKey));
      }
      // Multiscalar Multiplication
      static msm(points, scalars) {
        return pippenger2(Point2, Fn, points, scalars);
      }
      // "Private method", don't use it directly
      _setWindowSize(windowSize) {
        wnaf.setWindowSize(this, windowSize);
      }
      // A point on curve is valid if it conforms to equation.
      assertValidity() {
        assertValidMemo(this);
      }
      hasEvenY() {
        const { y } = this.toAffine();
        if (Fp.isOdd)
          return !Fp.isOdd(y);
        throw new Error("Field doesn't support isOdd");
      }
      /**
       * Compare one point to another.
       */
      equals(other) {
        aprjpoint(other);
        const { px: X1, py: Y1, pz: Z1 } = this;
        const { px: X2, py: Y2, pz: Z2 } = other;
        const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1));
        const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
        return U1 && U2;
      }
      /**
       * Flips point to one corresponding to (x, -y) in Affine coordinates.
       */
      negate() {
        return new Point2(this.px, Fp.neg(this.py), this.pz);
      }
      // Renes-Costello-Batina exception-free doubling formula.
      // There is 30% faster Jacobian formula, but it is not complete.
      // https://eprint.iacr.org/2015/1060, algorithm 3
      // Cost: 8M + 3S + 3*a + 2*b3 + 15add.
      double() {
        const { a, b } = CURVE;
        const b3 = Fp.mul(b, _3n4);
        const { px: X1, py: Y1, pz: Z1 } = this;
        let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
        let t0 = Fp.mul(X1, X1);
        let t1 = Fp.mul(Y1, Y1);
        let t2 = Fp.mul(Z1, Z1);
        let t3 = Fp.mul(X1, Y1);
        t3 = Fp.add(t3, t3);
        Z3 = Fp.mul(X1, Z1);
        Z3 = Fp.add(Z3, Z3);
        X3 = Fp.mul(a, Z3);
        Y3 = Fp.mul(b3, t2);
        Y3 = Fp.add(X3, Y3);
        X3 = Fp.sub(t1, Y3);
        Y3 = Fp.add(t1, Y3);
        Y3 = Fp.mul(X3, Y3);
        X3 = Fp.mul(t3, X3);
        Z3 = Fp.mul(b3, Z3);
        t2 = Fp.mul(a, t2);
        t3 = Fp.sub(t0, t2);
        t3 = Fp.mul(a, t3);
        t3 = Fp.add(t3, Z3);
        Z3 = Fp.add(t0, t0);
        t0 = Fp.add(Z3, t0);
        t0 = Fp.add(t0, t2);
        t0 = Fp.mul(t0, t3);
        Y3 = Fp.add(Y3, t0);
        t2 = Fp.mul(Y1, Z1);
        t2 = Fp.add(t2, t2);
        t0 = Fp.mul(t2, t3);
        X3 = Fp.sub(X3, t0);
        Z3 = Fp.mul(t2, t1);
        Z3 = Fp.add(Z3, Z3);
        Z3 = Fp.add(Z3, Z3);
        return new Point2(X3, Y3, Z3);
      }
      // Renes-Costello-Batina exception-free addition formula.
      // There is 30% faster Jacobian formula, but it is not complete.
      // https://eprint.iacr.org/2015/1060, algorithm 1
      // Cost: 12M + 0S + 3*a + 3*b3 + 23add.
      add(other) {
        aprjpoint(other);
        const { px: X1, py: Y1, pz: Z1 } = this;
        const { px: X2, py: Y2, pz: Z2 } = other;
        let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
        const a = CURVE.a;
        const b3 = Fp.mul(CURVE.b, _3n4);
        let t0 = Fp.mul(X1, X2);
        let t1 = Fp.mul(Y1, Y2);
        let t2 = Fp.mul(Z1, Z2);
        let t3 = Fp.add(X1, Y1);
        let t4 = Fp.add(X2, Y2);
        t3 = Fp.mul(t3, t4);
        t4 = Fp.add(t0, t1);
        t3 = Fp.sub(t3, t4);
        t4 = Fp.add(X1, Z1);
        let t5 = Fp.add(X2, Z2);
        t4 = Fp.mul(t4, t5);
        t5 = Fp.add(t0, t2);
        t4 = Fp.sub(t4, t5);
        t5 = Fp.add(Y1, Z1);
        X3 = Fp.add(Y2, Z2);
        t5 = Fp.mul(t5, X3);
        X3 = Fp.add(t1, t2);
        t5 = Fp.sub(t5, X3);
        Z3 = Fp.mul(a, t4);
        X3 = Fp.mul(b3, t2);
        Z3 = Fp.add(X3, Z3);
        X3 = Fp.sub(t1, Z3);
        Z3 = Fp.add(t1, Z3);
        Y3 = Fp.mul(X3, Z3);
        t1 = Fp.add(t0, t0);
        t1 = Fp.add(t1, t0);
        t2 = Fp.mul(a, t2);
        t4 = Fp.mul(b3, t4);
        t1 = Fp.add(t1, t2);
        t2 = Fp.sub(t0, t2);
        t2 = Fp.mul(a, t2);
        t4 = Fp.add(t4, t2);
        t0 = Fp.mul(t1, t4);
        Y3 = Fp.add(Y3, t0);
        t0 = Fp.mul(t5, t4);
        X3 = Fp.mul(t3, X3);
        X3 = Fp.sub(X3, t0);
        t0 = Fp.mul(t3, t1);
        Z3 = Fp.mul(t5, Z3);
        Z3 = Fp.add(Z3, t0);
        return new Point2(X3, Y3, Z3);
      }
      subtract(other) {
        return this.add(other.negate());
      }
      is0() {
        return this.equals(Point2.ZERO);
      }
      wNAF(n) {
        return wnaf.wNAFCached(this, n, Point2.normalizeZ);
      }
      /**
       * Non-constant-time multiplication. Uses double-and-add algorithm.
       * It's faster, but should only be used when you don't care about
       * an exposed private key e.g. sig verification, which works over *public* keys.
       */
      multiplyUnsafe(sc) {
        const { endo: endo2, n: N } = CURVE;
        aInRange2("scalar", sc, _0n10, N);
        const I = Point2.ZERO;
        if (sc === _0n10)
          return I;
        if (this.is0() || sc === _1n10)
          return this;
        if (!endo2 || wnaf.hasPrecomputes(this))
          return wnaf.wNAFCachedUnsafe(this, sc, Point2.normalizeZ);
        let { k1neg, k1, k2neg, k2 } = endo2.splitScalar(sc);
        let k1p = I;
        let k2p = I;
        let d = this;
        while (k1 > _0n10 || k2 > _0n10) {
          if (k1 & _1n10)
            k1p = k1p.add(d);
          if (k2 & _1n10)
            k2p = k2p.add(d);
          d = d.double();
          k1 >>= _1n10;
          k2 >>= _1n10;
        }
        if (k1neg)
          k1p = k1p.negate();
        if (k2neg)
          k2p = k2p.negate();
        k2p = new Point2(Fp.mul(k2p.px, endo2.beta), k2p.py, k2p.pz);
        return k1p.add(k2p);
      }
      /**
       * Constant time multiplication.
       * Uses wNAF method. Windowed method may be 10% faster,
       * but takes 2x longer to generate and consumes 2x memory.
       * Uses precomputes when available.
       * Uses endomorphism for Koblitz curves.
       * @param scalar by which the point would be multiplied
       * @returns New point
       */
      multiply(scalar) {
        const { endo: endo2, n: N } = CURVE;
        aInRange2("scalar", scalar, _1n10, N);
        let point, fake;
        if (endo2) {
          const { k1neg, k1, k2neg, k2 } = endo2.splitScalar(scalar);
          let { p: k1p, f: f1p } = this.wNAF(k1);
          let { p: k2p, f: f2p } = this.wNAF(k2);
          k1p = wnaf.constTimeNegate(k1neg, k1p);
          k2p = wnaf.constTimeNegate(k2neg, k2p);
          k2p = new Point2(Fp.mul(k2p.px, endo2.beta), k2p.py, k2p.pz);
          point = k1p.add(k2p);
          fake = f1p.add(f2p);
        } else {
          const { p, f } = this.wNAF(scalar);
          point = p;
          fake = f;
        }
        return Point2.normalizeZ([point, fake])[0];
      }
      /**
       * Efficiently calculate `aP + bQ`. Unsafe, can expose private key, if used incorrectly.
       * Not using Strauss-Shamir trick: precomputation tables are faster.
       * The trick could be useful if both P and Q are not G (not in our case).
       * @returns non-zero affine point
       */
      multiplyAndAddUnsafe(Q, a, b) {
        const G = Point2.BASE;
        const mul = (P, a2) => a2 === _0n10 || a2 === _1n10 || !P.equals(G) ? P.multiplyUnsafe(a2) : P.multiply(a2);
        const sum = mul(this, a).add(mul(Q, b));
        return sum.is0() ? void 0 : sum;
      }
      // Converts Projective point to affine (x, y) coordinates.
      // Can accept precomputed Z^-1 - for example, from invertBatch.
      // (x, y, z) ∋ (x=x/z, y=y/z)
      toAffine(iz) {
        return toAffineMemo(this, iz);
      }
      isTorsionFree() {
        const { h: cofactor, isTorsionFree } = CURVE;
        if (cofactor === _1n10)
          return true;
        if (isTorsionFree)
          return isTorsionFree(Point2, this);
        throw new Error("isTorsionFree() has not been declared for the elliptic curve");
      }
      clearCofactor() {
        const { h: cofactor, clearCofactor } = CURVE;
        if (cofactor === _1n10)
          return this;
        if (clearCofactor)
          return clearCofactor(Point2, this);
        return this.multiplyUnsafe(CURVE.h);
      }
      toRawBytes(isCompressed = true) {
        abool2("isCompressed", isCompressed);
        this.assertValidity();
        return toBytes5(Point2, this, isCompressed);
      }
      toHex(isCompressed = true) {
        abool2("isCompressed", isCompressed);
        return bytesToHex3(this.toRawBytes(isCompressed));
      }
    }
    Point2.BASE = new Point2(CURVE.Gx, CURVE.Gy, Fp.ONE);
    Point2.ZERO = new Point2(Fp.ZERO, Fp.ONE, Fp.ZERO);
    const { endo, nBitLength } = CURVE;
    const wnaf = wNAF2(Point2, endo ? Math.ceil(nBitLength / 2) : nBitLength);
    return {
      CURVE,
      ProjectivePoint: Point2,
      normPrivateKeyToScalar,
      weierstrassEquation,
      isWithinCurveOrder
    };
  }
  function validateOpts2(curve) {
    const opts = validateBasic2(curve);
    validateObject2(opts, {
      hash: "hash",
      hmac: "function",
      randomBytes: "function"
    }, {
      bits2int: "function",
      bits2int_modN: "function",
      lowS: "boolean"
    });
    return Object.freeze({ lowS: true, ...opts });
  }
  function weierstrass2(curveDef) {
    const CURVE = validateOpts2(curveDef);
    const { Fp, n: CURVE_ORDER, nByteLength, nBitLength } = CURVE;
    const compressedLen = Fp.BYTES + 1;
    const uncompressedLen = 2 * Fp.BYTES + 1;
    function modN2(a) {
      return mod2(a, CURVE_ORDER);
    }
    function invN(a) {
      return invert2(a, CURVE_ORDER);
    }
    const { ProjectivePoint: Point2, normPrivateKeyToScalar, weierstrassEquation, isWithinCurveOrder } = weierstrassPoints2({
      ...CURVE,
      toBytes(_c, point, isCompressed) {
        const a = point.toAffine();
        const x = Fp.toBytes(a.x);
        const cat = concatBytes4;
        abool2("isCompressed", isCompressed);
        if (isCompressed) {
          return cat(Uint8Array.from([point.hasEvenY() ? 2 : 3]), x);
        } else {
          return cat(Uint8Array.from([4]), x, Fp.toBytes(a.y));
        }
      },
      fromBytes(bytes) {
        const len = bytes.length;
        const head = bytes[0];
        const tail = bytes.subarray(1);
        if (len === compressedLen && (head === 2 || head === 3)) {
          const x = bytesToNumberBE2(tail);
          if (!inRange2(x, _1n10, Fp.ORDER))
            throw new Error("Point is not on curve");
          const y2 = weierstrassEquation(x);
          let y;
          try {
            y = Fp.sqrt(y2);
          } catch (sqrtError) {
            const suffix = sqrtError instanceof Error ? ": " + sqrtError.message : "";
            throw new Error("Point is not on curve" + suffix);
          }
          const isYOdd = (y & _1n10) === _1n10;
          const isHeadOdd = (head & 1) === 1;
          if (isHeadOdd !== isYOdd)
            y = Fp.neg(y);
          return { x, y };
        } else if (len === uncompressedLen && head === 4) {
          const x = Fp.fromBytes(tail.subarray(0, Fp.BYTES));
          const y = Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES));
          return { x, y };
        } else {
          const cl = compressedLen;
          const ul = uncompressedLen;
          throw new Error("invalid Point, expected length of " + cl + ", or uncompressed " + ul + ", got " + len);
        }
      }
    });
    function isBiggerThanHalfOrder(number) {
      const HALF = CURVE_ORDER >> _1n10;
      return number > HALF;
    }
    function normalizeS(s) {
      return isBiggerThanHalfOrder(s) ? modN2(-s) : s;
    }
    const slcNum = (b, from14, to) => bytesToNumberBE2(b.slice(from14, to));
    class Signature {
      constructor(r, s, recovery) {
        aInRange2("r", r, _1n10, CURVE_ORDER);
        aInRange2("s", s, _1n10, CURVE_ORDER);
        this.r = r;
        this.s = s;
        if (recovery != null)
          this.recovery = recovery;
        Object.freeze(this);
      }
      // pair (bytes of r, bytes of s)
      static fromCompact(hex) {
        const l = nByteLength;
        hex = ensureBytes2("compactSignature", hex, l * 2);
        return new Signature(slcNum(hex, 0, l), slcNum(hex, l, 2 * l));
      }
      // DER encoded ECDSA signature
      // https://bitcoin.stackexchange.com/questions/57644/what-are-the-parts-of-a-bitcoin-transaction-input-script
      static fromDER(hex) {
        const { r, s } = DER2.toSig(ensureBytes2("DER", hex));
        return new Signature(r, s);
      }
      /**
       * @todo remove
       * @deprecated
       */
      assertValidity() {
      }
      addRecoveryBit(recovery) {
        return new Signature(this.r, this.s, recovery);
      }
      recoverPublicKey(msgHash) {
        const { r, s, recovery: rec } = this;
        const h = bits2int_modN(ensureBytes2("msgHash", msgHash));
        if (rec == null || ![0, 1, 2, 3].includes(rec))
          throw new Error("recovery id invalid");
        const radj = rec === 2 || rec === 3 ? r + CURVE.n : r;
        if (radj >= Fp.ORDER)
          throw new Error("recovery id 2 or 3 invalid");
        const prefix = (rec & 1) === 0 ? "02" : "03";
        const R = Point2.fromHex(prefix + numToSizedHex2(radj, Fp.BYTES));
        const ir = invN(radj);
        const u1 = modN2(-h * ir);
        const u2 = modN2(s * ir);
        const Q = Point2.BASE.multiplyAndAddUnsafe(R, u1, u2);
        if (!Q)
          throw new Error("point at infinify");
        Q.assertValidity();
        return Q;
      }
      // Signatures should be low-s, to prevent malleability.
      hasHighS() {
        return isBiggerThanHalfOrder(this.s);
      }
      normalizeS() {
        return this.hasHighS() ? new Signature(this.r, modN2(-this.s), this.recovery) : this;
      }
      // DER-encoded
      toDERRawBytes() {
        return hexToBytes3(this.toDERHex());
      }
      toDERHex() {
        return DER2.hexFromSig(this);
      }
      // padded bytes of r, then padded bytes of s
      toCompactRawBytes() {
        return hexToBytes3(this.toCompactHex());
      }
      toCompactHex() {
        const l = nByteLength;
        return numToSizedHex2(this.r, l) + numToSizedHex2(this.s, l);
      }
    }
    const utils = {
      isValidPrivateKey(privateKey) {
        try {
          normPrivateKeyToScalar(privateKey);
          return true;
        } catch (error) {
          return false;
        }
      },
      normPrivateKeyToScalar,
      /**
       * Produces cryptographically secure private key from random of size
       * (groupLen + ceil(groupLen / 2)) with modulo bias being negligible.
       */
      randomPrivateKey: () => {
        const length = getMinHashLength2(CURVE.n);
        return mapHashToField2(CURVE.randomBytes(length), CURVE.n);
      },
      /**
       * Creates precompute table for an arbitrary EC point. Makes point "cached".
       * Allows to massively speed-up `point.multiply(scalar)`.
       * @returns cached point
       * @example
       * const fast = utils.precompute(8, ProjectivePoint.fromHex(someonesPubKey));
       * fast.multiply(privKey); // much faster ECDH now
       */
      precompute(windowSize = 8, point = Point2.BASE) {
        point._setWindowSize(windowSize);
        point.multiply(BigInt(3));
        return point;
      }
    };
    function getPublicKey(privateKey, isCompressed = true) {
      return Point2.fromPrivateKey(privateKey).toRawBytes(isCompressed);
    }
    function isProbPub(item) {
      if (typeof item === "bigint")
        return false;
      if (item instanceof Point2)
        return true;
      const arr = ensureBytes2("key", item);
      const len = arr.length;
      const fpl = Fp.BYTES;
      const compLen = fpl + 1;
      const uncompLen = 2 * fpl + 1;
      if (CURVE.allowedPrivateKeyLengths || nByteLength === compLen) {
        return void 0;
      } else {
        return len === compLen || len === uncompLen;
      }
    }
    function getSharedSecret(privateA, publicB, isCompressed = true) {
      if (isProbPub(privateA) === true)
        throw new Error("first arg must be private key");
      if (isProbPub(publicB) === false)
        throw new Error("second arg must be public key");
      const b = Point2.fromHex(publicB);
      return b.multiply(normPrivateKeyToScalar(privateA)).toRawBytes(isCompressed);
    }
    const bits2int = CURVE.bits2int || function(bytes) {
      if (bytes.length > 8192)
        throw new Error("input is too large");
      const num2 = bytesToNumberBE2(bytes);
      const delta = bytes.length * 8 - nBitLength;
      return delta > 0 ? num2 >> BigInt(delta) : num2;
    };
    const bits2int_modN = CURVE.bits2int_modN || function(bytes) {
      return modN2(bits2int(bytes));
    };
    const ORDER_MASK = bitMask2(nBitLength);
    function int2octets(num2) {
      aInRange2("num < 2^" + nBitLength, num2, _0n10, ORDER_MASK);
      return numberToBytesBE2(num2, nByteLength);
    }
    function prepSig(msgHash, privateKey, opts = defaultSigOpts) {
      if (["recovered", "canonical"].some((k) => k in opts))
        throw new Error("sign() legacy options not supported");
      const { hash: hash3, randomBytes: randomBytes2 } = CURVE;
      let { lowS, prehash, extraEntropy: ent } = opts;
      if (lowS == null)
        lowS = true;
      msgHash = ensureBytes2("msgHash", msgHash);
      validateSigVerOpts2(opts);
      if (prehash)
        msgHash = ensureBytes2("prehashed msgHash", hash3(msgHash));
      const h1int = bits2int_modN(msgHash);
      const d = normPrivateKeyToScalar(privateKey);
      const seedArgs = [int2octets(d), int2octets(h1int)];
      if (ent != null && ent !== false) {
        const e = ent === true ? randomBytes2(Fp.BYTES) : ent;
        seedArgs.push(ensureBytes2("extraEntropy", e));
      }
      const seed = concatBytes4(...seedArgs);
      const m = h1int;
      function k2sig(kBytes) {
        const k = bits2int(kBytes);
        if (!isWithinCurveOrder(k))
          return;
        const ik = invN(k);
        const q = Point2.BASE.multiply(k).toAffine();
        const r = modN2(q.x);
        if (r === _0n10)
          return;
        const s = modN2(ik * modN2(m + r * d));
        if (s === _0n10)
          return;
        let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1n10);
        let normS = s;
        if (lowS && isBiggerThanHalfOrder(s)) {
          normS = normalizeS(s);
          recovery ^= 1;
        }
        return new Signature(r, normS, recovery);
      }
      return { seed, k2sig };
    }
    const defaultSigOpts = { lowS: CURVE.lowS, prehash: false };
    const defaultVerOpts = { lowS: CURVE.lowS, prehash: false };
    function sign3(msgHash, privKey, opts = defaultSigOpts) {
      const { seed, k2sig } = prepSig(msgHash, privKey, opts);
      const C = CURVE;
      const drbg = createHmacDrbg2(C.hash.outputLen, C.nByteLength, C.hmac);
      return drbg(seed, k2sig);
    }
    Point2.BASE._setWindowSize(8);
    function verify(signature, msgHash, publicKey, opts = defaultVerOpts) {
      const sg = signature;
      msgHash = ensureBytes2("msgHash", msgHash);
      publicKey = ensureBytes2("publicKey", publicKey);
      const { lowS, prehash, format } = opts;
      validateSigVerOpts2(opts);
      if ("strict" in opts)
        throw new Error("options.strict was renamed to lowS");
      if (format !== void 0 && format !== "compact" && format !== "der")
        throw new Error("format must be compact or der");
      const isHex2 = typeof sg === "string" || isBytes3(sg);
      const isObj = !isHex2 && !format && typeof sg === "object" && sg !== null && typeof sg.r === "bigint" && typeof sg.s === "bigint";
      if (!isHex2 && !isObj)
        throw new Error("invalid signature, expected Uint8Array, hex string or Signature instance");
      let _sig = void 0;
      let P;
      try {
        if (isObj)
          _sig = new Signature(sg.r, sg.s);
        if (isHex2) {
          try {
            if (format !== "compact")
              _sig = Signature.fromDER(sg);
          } catch (derError) {
            if (!(derError instanceof DER2.Err))
              throw derError;
          }
          if (!_sig && format !== "der")
            _sig = Signature.fromCompact(sg);
        }
        P = Point2.fromHex(publicKey);
      } catch (error) {
        return false;
      }
      if (!_sig)
        return false;
      if (lowS && _sig.hasHighS())
        return false;
      if (prehash)
        msgHash = CURVE.hash(msgHash);
      const { r, s } = _sig;
      const h = bits2int_modN(msgHash);
      const is = invN(s);
      const u1 = modN2(h * is);
      const u2 = modN2(r * is);
      const R = Point2.BASE.multiplyAndAddUnsafe(P, u1, u2)?.toAffine();
      if (!R)
        return false;
      const v = modN2(R.x);
      return v === r;
    }
    return {
      CURVE,
      getPublicKey,
      getSharedSecret,
      sign: sign3,
      verify,
      ProjectivePoint: Point2,
      Signature,
      utils
    };
  }
  var DERErr2, DER2, _0n10, _1n10, _2n6, _3n4, _4n4;
  var init_weierstrass2 = __esm({
    "node_modules/ox/node_modules/@noble/curves/esm/abstract/weierstrass.js"() {
      init_curve2();
      init_modular2();
      init_utils5();
      DERErr2 = class extends Error {
        constructor(m = "") {
          super(m);
        }
      };
      DER2 = {
        // asn.1 DER encoding utils
        Err: DERErr2,
        // Basic building block is TLV (Tag-Length-Value)
        _tlv: {
          encode: (tag, data) => {
            const { Err: E } = DER2;
            if (tag < 0 || tag > 256)
              throw new E("tlv.encode: wrong tag");
            if (data.length & 1)
              throw new E("tlv.encode: unpadded data");
            const dataLen = data.length / 2;
            const len = numberToHexUnpadded2(dataLen);
            if (len.length / 2 & 128)
              throw new E("tlv.encode: long form length too big");
            const lenLen = dataLen > 127 ? numberToHexUnpadded2(len.length / 2 | 128) : "";
            const t = numberToHexUnpadded2(tag);
            return t + lenLen + len + data;
          },
          // v - value, l - left bytes (unparsed)
          decode(tag, data) {
            const { Err: E } = DER2;
            let pos = 0;
            if (tag < 0 || tag > 256)
              throw new E("tlv.encode: wrong tag");
            if (data.length < 2 || data[pos++] !== tag)
              throw new E("tlv.decode: wrong tlv");
            const first = data[pos++];
            const isLong = !!(first & 128);
            let length = 0;
            if (!isLong)
              length = first;
            else {
              const lenLen = first & 127;
              if (!lenLen)
                throw new E("tlv.decode(long): indefinite length not supported");
              if (lenLen > 4)
                throw new E("tlv.decode(long): byte length is too big");
              const lengthBytes = data.subarray(pos, pos + lenLen);
              if (lengthBytes.length !== lenLen)
                throw new E("tlv.decode: length bytes not complete");
              if (lengthBytes[0] === 0)
                throw new E("tlv.decode(long): zero leftmost byte");
              for (const b of lengthBytes)
                length = length << 8 | b;
              pos += lenLen;
              if (length < 128)
                throw new E("tlv.decode(long): not minimal encoding");
            }
            const v = data.subarray(pos, pos + length);
            if (v.length !== length)
              throw new E("tlv.decode: wrong value length");
            return { v, l: data.subarray(pos + length) };
          }
        },
        // https://crypto.stackexchange.com/a/57734 Leftmost bit of first byte is 'negative' flag,
        // since we always use positive integers here. It must always be empty:
        // - add zero byte if exists
        // - if next byte doesn't have a flag, leading zero is not allowed (minimal encoding)
        _int: {
          encode(num2) {
            const { Err: E } = DER2;
            if (num2 < _0n10)
              throw new E("integer: negative integers are not allowed");
            let hex = numberToHexUnpadded2(num2);
            if (Number.parseInt(hex[0], 16) & 8)
              hex = "00" + hex;
            if (hex.length & 1)
              throw new E("unexpected DER parsing assertion: unpadded hex");
            return hex;
          },
          decode(data) {
            const { Err: E } = DER2;
            if (data[0] & 128)
              throw new E("invalid signature integer: negative");
            if (data[0] === 0 && !(data[1] & 128))
              throw new E("invalid signature integer: unnecessary leading zero");
            return bytesToNumberBE2(data);
          }
        },
        toSig(hex) {
          const { Err: E, _int: int, _tlv: tlv } = DER2;
          const data = ensureBytes2("signature", hex);
          const { v: seqBytes, l: seqLeftBytes } = tlv.decode(48, data);
          if (seqLeftBytes.length)
            throw new E("invalid signature: left bytes after parsing");
          const { v: rBytes, l: rLeftBytes } = tlv.decode(2, seqBytes);
          const { v: sBytes, l: sLeftBytes } = tlv.decode(2, rLeftBytes);
          if (sLeftBytes.length)
            throw new E("invalid signature: left bytes after parsing");
          return { r: int.decode(rBytes), s: int.decode(sBytes) };
        },
        hexFromSig(sig) {
          const { _tlv: tlv, _int: int } = DER2;
          const rs = tlv.encode(2, int.encode(sig.r));
          const ss = tlv.encode(2, int.encode(sig.s));
          const seq = rs + ss;
          return tlv.encode(48, seq);
        }
      };
      _0n10 = BigInt(0);
      _1n10 = BigInt(1);
      _2n6 = BigInt(2);
      _3n4 = BigInt(3);
      _4n4 = BigInt(4);
    }
  });

  // node_modules/ox/node_modules/@noble/curves/esm/_shortw_utils.js
  function getHash2(hash3) {
    return {
      hash: hash3,
      hmac: (key, ...msgs) => hmac(hash3, key, concatBytes(...msgs)),
      randomBytes
    };
  }
  function createCurve2(curveDef, defHash) {
    const create2 = (hash3) => weierstrass2({ ...curveDef, ...getHash2(hash3) });
    return { ...create2(defHash), create: create2 };
  }
  var init_shortw_utils2 = __esm({
    "node_modules/ox/node_modules/@noble/curves/esm/_shortw_utils.js"() {
      init_hmac();
      init_utils2();
      init_weierstrass2();
    }
  });

  // node_modules/ox/node_modules/@noble/curves/esm/secp256k1.js
  function sqrtMod2(y) {
    const P = secp256k1P2;
    const _3n5 = BigInt(3), _6n = BigInt(6), _11n = BigInt(11), _22n = BigInt(22);
    const _23n = BigInt(23), _44n = BigInt(44), _88n = BigInt(88);
    const b2 = y * y * y % P;
    const b3 = b2 * b2 * y % P;
    const b6 = pow22(b3, _3n5, P) * b3 % P;
    const b9 = pow22(b6, _3n5, P) * b3 % P;
    const b11 = pow22(b9, _2n7, P) * b2 % P;
    const b22 = pow22(b11, _11n, P) * b11 % P;
    const b44 = pow22(b22, _22n, P) * b22 % P;
    const b88 = pow22(b44, _44n, P) * b44 % P;
    const b176 = pow22(b88, _88n, P) * b88 % P;
    const b220 = pow22(b176, _44n, P) * b44 % P;
    const b223 = pow22(b220, _3n5, P) * b3 % P;
    const t1 = pow22(b223, _23n, P) * b22 % P;
    const t2 = pow22(t1, _6n, P) * b2 % P;
    const root = pow22(t2, _2n7, P);
    if (!Fpk12.eql(Fpk12.sqr(root), y))
      throw new Error("Cannot find square root");
    return root;
  }
  var secp256k1P2, secp256k1N2, _0n11, _1n11, _2n7, divNearest2, Fpk12, secp256k12;
  var init_secp256k12 = __esm({
    "node_modules/ox/node_modules/@noble/curves/esm/secp256k1.js"() {
      init_sha2();
      init_shortw_utils2();
      init_modular2();
      secp256k1P2 = BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f");
      secp256k1N2 = BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141");
      _0n11 = BigInt(0);
      _1n11 = BigInt(1);
      _2n7 = BigInt(2);
      divNearest2 = (a, b) => (a + b / _2n7) / b;
      Fpk12 = Field2(secp256k1P2, void 0, void 0, { sqrt: sqrtMod2 });
      secp256k12 = createCurve2({
        a: _0n11,
        b: BigInt(7),
        Fp: Fpk12,
        n: secp256k1N2,
        Gx: BigInt("55066263022277343669578718895168534326250603453777594175500187360389116729240"),
        Gy: BigInt("32670510020758816978083085130507043184471273380659243275938904335757337482424"),
        h: BigInt(1),
        lowS: true,
        // Allow only low-S signatures by default in sign() and verify()
        endo: {
          // Endomorphism, see above
          beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
          splitScalar: (k) => {
            const n = secp256k1N2;
            const a1 = BigInt("0x3086d221a7d46bcde86c90e49284eb15");
            const b1 = -_1n11 * BigInt("0xe4437ed6010e88286f547fa90abfe4c3");
            const a2 = BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8");
            const b2 = a1;
            const POW_2_128 = BigInt("0x100000000000000000000000000000000");
            const c1 = divNearest2(b2 * k, n);
            const c2 = divNearest2(-b1 * k, n);
            let k1 = mod2(k - c1 * a1 - c2 * a2, n);
            let k2 = mod2(-c1 * b1 - c2 * b2, n);
            const k1neg = k1 > POW_2_128;
            const k2neg = k2 > POW_2_128;
            if (k1neg)
              k1 = n - k1;
            if (k2neg)
              k2 = n - k2;
            if (k1 > POW_2_128 || k2 > POW_2_128) {
              throw new Error("splitScalar: Endomorphism failed, k=" + k);
            }
            return { k1neg, k1, k2neg, k2 };
          }
        }
      }, sha256);
    }
  });

  // node_modules/ox/_esm/core/Signature.js
  function assert5(signature, options = {}) {
    const { recovered } = options;
    if (typeof signature.r === "undefined")
      throw new MissingPropertiesError({ signature });
    if (typeof signature.s === "undefined")
      throw new MissingPropertiesError({ signature });
    if (recovered && typeof signature.yParity === "undefined")
      throw new MissingPropertiesError({ signature });
    if (signature.r < 0n || signature.r > maxUint2562)
      throw new InvalidRError({ value: signature.r });
    if (signature.s < 0n || signature.s > maxUint2562)
      throw new InvalidSError({ value: signature.s });
    if (typeof signature.yParity === "number" && signature.yParity !== 0 && signature.yParity !== 1)
      throw new InvalidYParityError({ value: signature.yParity });
  }
  function fromBytes3(signature) {
    return fromHex4(fromBytes(signature));
  }
  function fromHex4(signature) {
    if (signature.length !== 130 && signature.length !== 132)
      throw new InvalidSerializedSizeError2({ signature });
    const r = BigInt(slice3(signature, 0, 32));
    const s = BigInt(slice3(signature, 32, 64));
    const yParity = (() => {
      const yParity2 = Number(`0x${signature.slice(130)}`);
      if (Number.isNaN(yParity2))
        return void 0;
      try {
        return vToYParity(yParity2);
      } catch {
        throw new InvalidYParityError({ value: yParity2 });
      }
    })();
    if (typeof yParity === "undefined")
      return {
        r,
        s
      };
    return {
      r,
      s,
      yParity
    };
  }
  function extract2(value) {
    if (typeof value.r === "undefined")
      return void 0;
    if (typeof value.s === "undefined")
      return void 0;
    return from7(value);
  }
  function from7(signature) {
    const signature_ = (() => {
      if (typeof signature === "string")
        return fromHex4(signature);
      if (signature instanceof Uint8Array)
        return fromBytes3(signature);
      if (typeof signature.r === "string")
        return fromRpc2(signature);
      if (signature.v)
        return fromLegacy(signature);
      return {
        r: signature.r,
        s: signature.s,
        ...typeof signature.yParity !== "undefined" ? { yParity: signature.yParity } : {}
      };
    })();
    assert5(signature_);
    return signature_;
  }
  function fromLegacy(signature) {
    return {
      r: signature.r,
      s: signature.s,
      yParity: vToYParity(signature.v)
    };
  }
  function fromRpc2(signature) {
    const yParity = (() => {
      const v = signature.v ? Number(signature.v) : void 0;
      let yParity2 = signature.yParity ? Number(signature.yParity) : void 0;
      if (typeof v === "number" && typeof yParity2 !== "number")
        yParity2 = vToYParity(v);
      if (typeof yParity2 !== "number")
        throw new InvalidYParityError({ value: signature.yParity });
      return yParity2;
    })();
    return {
      r: BigInt(signature.r),
      s: BigInt(signature.s),
      yParity
    };
  }
  function toHex3(signature) {
    assert5(signature);
    const r = signature.r;
    const s = signature.s;
    const signature_ = concat2(
      fromNumber(r, { size: 32 }),
      fromNumber(s, { size: 32 }),
      // If the signature is recovered, add the recovery byte to the signature.
      typeof signature.yParity === "number" ? fromNumber(yParityToV(signature.yParity), { size: 1 }) : "0x"
    );
    return signature_;
  }
  function toTuple(signature) {
    const { r, s, yParity } = signature;
    return [
      yParity ? "0x01" : "0x",
      r === 0n ? "0x" : trimLeft2(fromNumber(r)),
      s === 0n ? "0x" : trimLeft2(fromNumber(s))
    ];
  }
  function vToYParity(v) {
    if (v === 0 || v === 27)
      return 0;
    if (v === 1 || v === 28)
      return 1;
    if (v >= 35)
      return v % 2 === 0 ? 1 : 0;
    throw new InvalidVError({ value: v });
  }
  function yParityToV(yParity) {
    if (yParity === 0)
      return 27;
    if (yParity === 1)
      return 28;
    throw new InvalidYParityError({ value: yParity });
  }
  var InvalidSerializedSizeError2, MissingPropertiesError, InvalidRError, InvalidSError, InvalidYParityError, InvalidVError;
  var init_Signature = __esm({
    "node_modules/ox/_esm/core/Signature.js"() {
      init_Errors();
      init_Hex();
      init_Json();
      init_Solidity();
      InvalidSerializedSizeError2 = class extends BaseError3 {
        constructor({ signature }) {
          super(`Value \`${signature}\` is an invalid signature size.`, {
            metaMessages: [
              "Expected: 64 bytes or 65 bytes.",
              `Received ${size3(from2(signature))} bytes.`
            ]
          });
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Signature.InvalidSerializedSizeError"
          });
        }
      };
      MissingPropertiesError = class extends BaseError3 {
        constructor({ signature }) {
          super(`Signature \`${stringify2(signature)}\` is missing either an \`r\`, \`s\`, or \`yParity\` property.`);
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Signature.MissingPropertiesError"
          });
        }
      };
      InvalidRError = class extends BaseError3 {
        constructor({ value }) {
          super(`Value \`${value}\` is an invalid r value. r must be a positive integer less than 2^256.`);
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Signature.InvalidRError"
          });
        }
      };
      InvalidSError = class extends BaseError3 {
        constructor({ value }) {
          super(`Value \`${value}\` is an invalid s value. s must be a positive integer less than 2^256.`);
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Signature.InvalidSError"
          });
        }
      };
      InvalidYParityError = class extends BaseError3 {
        constructor({ value }) {
          super(`Value \`${value}\` is an invalid y-parity value. Y-parity must be 0 or 1.`);
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Signature.InvalidYParityError"
          });
        }
      };
      InvalidVError = class extends BaseError3 {
        constructor({ value }) {
          super(`Value \`${value}\` is an invalid v value. v must be 27, 28 or >=35.`);
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Signature.InvalidVError"
          });
        }
      };
    }
  });

  // node_modules/ox/_esm/core/Authorization.js
  function from8(authorization, options = {}) {
    if (typeof authorization.chainId === "string")
      return fromRpc3(authorization);
    return { ...authorization, ...options.signature };
  }
  function fromRpc3(authorization) {
    const { address, chainId, nonce } = authorization;
    const signature = extract2(authorization);
    return {
      address,
      chainId: Number(chainId),
      nonce: BigInt(nonce),
      ...signature
    };
  }
  function getSignPayload(authorization) {
    return hash2(authorization, { presign: true });
  }
  function hash2(authorization, options = {}) {
    const { presign } = options;
    return keccak2562(concat2("0x05", fromHex3(toTuple2(presign ? {
      address: authorization.address,
      chainId: authorization.chainId,
      nonce: authorization.nonce
    } : authorization))));
  }
  function toTuple2(authorization) {
    const { address, chainId, nonce } = authorization;
    const signature = extract2(authorization);
    return [
      chainId ? fromNumber(chainId) : "0x",
      address,
      nonce ? fromNumber(nonce) : "0x",
      ...signature ? toTuple(signature) : []
    ];
  }
  var init_Authorization = __esm({
    "node_modules/ox/_esm/core/Authorization.js"() {
      init_Hash();
      init_Hex();
      init_Rlp();
      init_Signature();
    }
  });

  // node_modules/ox/_esm/core/Secp256k1.js
  function recoverAddress2(options) {
    return fromPublicKey(recoverPublicKey2(options));
  }
  function recoverPublicKey2(options) {
    const { payload, signature } = options;
    const { r, s, yParity } = signature;
    const signature_ = new secp256k12.Signature(BigInt(r), BigInt(s)).addRecoveryBit(yParity);
    const point = signature_.recoverPublicKey(from2(payload).substring(2));
    return from3(point);
  }
  var init_Secp256k1 = __esm({
    "node_modules/ox/_esm/core/Secp256k1.js"() {
      init_secp256k12();
      init_Address();
      init_Hex();
      init_PublicKey();
    }
  });

  // node_modules/ox/_esm/erc8010/SignatureErc8010.js
  var SignatureErc8010_exports = {};
  __export(SignatureErc8010_exports, {
    InvalidWrappedSignatureError: () => InvalidWrappedSignatureError,
    assert: () => assert6,
    from: () => from9,
    magicBytes: () => magicBytes,
    suffixParameters: () => suffixParameters,
    unwrap: () => unwrap,
    validate: () => validate4,
    wrap: () => wrap
  });
  function assert6(value) {
    if (typeof value === "string") {
      if (slice3(value, -32) !== magicBytes)
        throw new InvalidWrappedSignatureError(value);
    } else
      assert5(value.authorization);
  }
  function from9(value) {
    if (typeof value === "string")
      return unwrap(value);
    return value;
  }
  function unwrap(wrapped) {
    assert6(wrapped);
    const suffixLength = toNumber(slice3(wrapped, -64, -32));
    const suffix = slice3(wrapped, -suffixLength - 64, -64);
    const signature = slice3(wrapped, 0, -suffixLength - 64);
    const [auth, to, data] = decode(suffixParameters, suffix);
    const authorization = from8({
      address: auth.delegation,
      chainId: Number(auth.chainId),
      nonce: auth.nonce,
      yParity: auth.yParity,
      r: auth.r,
      s: auth.s
    });
    return {
      authorization,
      signature,
      ...data && data !== "0x" ? { data, to } : {}
    };
  }
  function wrap(value) {
    const { data, signature } = value;
    assert6(value);
    const self = recoverAddress2({
      payload: getSignPayload(value.authorization),
      signature: from7(value.authorization)
    });
    const suffix = encode3(suffixParameters, [
      {
        ...value.authorization,
        delegation: value.authorization.address,
        chainId: BigInt(value.authorization.chainId)
      },
      value.to ?? self,
      data ?? "0x"
    ]);
    const suffixLength = fromNumber(size3(suffix), { size: 32 });
    return concat2(signature, suffix, suffixLength, magicBytes);
  }
  function validate4(value) {
    try {
      assert6(value);
      return true;
    } catch {
      return false;
    }
  }
  var magicBytes, suffixParameters, InvalidWrappedSignatureError;
  var init_SignatureErc8010 = __esm({
    "node_modules/ox/_esm/erc8010/SignatureErc8010.js"() {
      init_AbiParameters();
      init_Authorization();
      init_Errors();
      init_Hex();
      init_Secp256k1();
      init_Signature();
      magicBytes = "0x8010801080108010801080108010801080108010801080108010801080108010";
      suffixParameters = from5("(uint256 chainId, address delegation, uint256 nonce, uint8 yParity, uint256 r, uint256 s), address to, bytes data");
      InvalidWrappedSignatureError = class extends BaseError3 {
        constructor(wrapped) {
          super(`Value \`${wrapped}\` is an invalid ERC-8010 wrapped signature.`);
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "SignatureErc8010.InvalidWrappedSignatureError"
          });
        }
      };
    }
  });

  // node_modules/ox/_esm/erc8010/index.js
  var init_erc8010 = __esm({
    "node_modules/ox/_esm/erc8010/index.js"() {
      init_SignatureErc8010();
    }
  });

  // node_modules/viem/_esm/utils/signature/serializeErc6492Signature.js
  function serializeErc6492Signature(parameters) {
    const { address, data, signature, to = "hex" } = parameters;
    const signature_ = concatHex([
      encodeAbiParameters([{ type: "address" }, { type: "bytes" }, { type: "bytes" }], [address, data, signature]),
      erc6492MagicBytes
    ]);
    if (to === "hex")
      return signature_;
    return hexToBytes(signature_);
  }
  var init_serializeErc6492Signature = __esm({
    "node_modules/viem/_esm/utils/signature/serializeErc6492Signature.js"() {
      init_bytes2();
      init_encodeAbiParameters();
      init_concat();
      init_toBytes();
    }
  });

  // node_modules/viem/_esm/errors/unit.js
  var InvalidDecimalNumberError;
  var init_unit2 = __esm({
    "node_modules/viem/_esm/errors/unit.js"() {
      init_base();
      InvalidDecimalNumberError = class extends BaseError2 {
        constructor({ value }) {
          super(`Number \`${value}\` is not a valid decimal number.`, {
            name: "InvalidDecimalNumberError"
          });
        }
      };
    }
  });

  // node_modules/viem/_esm/utils/unit/parseUnits.js
  function parseUnits(value, decimals) {
    if (!/^(-?)([0-9]*)\.?([0-9]*)$/.test(value))
      throw new InvalidDecimalNumberError({ value });
    let [integer, fraction = "0"] = value.split(".");
    const negative = integer.startsWith("-");
    if (negative)
      integer = integer.slice(1);
    fraction = fraction.replace(/(0+)$/, "");
    if (decimals === 0) {
      if (Math.round(Number(`.${fraction}`)) === 1)
        integer = `${BigInt(integer) + 1n}`;
      fraction = "";
    } else if (fraction.length > decimals) {
      const [left, unit, right] = [
        fraction.slice(0, decimals - 1),
        fraction.slice(decimals - 1, decimals),
        fraction.slice(decimals)
      ];
      const rounded = Math.round(Number(`${unit}.${right}`));
      if (rounded > 9)
        fraction = `${BigInt(left) + BigInt(1)}0`.padStart(left.length + 1, "0");
      else
        fraction = `${left}${rounded}`;
      if (fraction.length > decimals) {
        fraction = fraction.slice(1);
        integer = `${BigInt(integer) + 1n}`;
      }
      fraction = fraction.slice(0, decimals);
    } else {
      fraction = fraction.padEnd(decimals, "0");
    }
    return BigInt(`${negative ? "-" : ""}${integer}${fraction}`);
  }
  var init_parseUnits = __esm({
    "node_modules/viem/_esm/utils/unit/parseUnits.js"() {
      init_unit2();
    }
  });

  // node_modules/viem/_esm/utils/index.js
  var init_utils7 = __esm({
    "node_modules/viem/_esm/utils/index.js"() {
      init_pad();
      init_fromHex();
      init_toHex();
      init_formatGwei();
    }
  });

  // node_modules/viem/_esm/utils/formatters/proof.js
  function formatStorageProof(storageProof) {
    return storageProof.map((proof) => ({
      ...proof,
      value: BigInt(proof.value)
    }));
  }
  function formatProof(proof) {
    return {
      ...proof,
      balance: proof.balance ? BigInt(proof.balance) : void 0,
      nonce: proof.nonce ? hexToNumber(proof.nonce) : void 0,
      storageProof: proof.storageProof ? formatStorageProof(proof.storageProof) : void 0
    };
  }
  var init_proof = __esm({
    "node_modules/viem/_esm/utils/formatters/proof.js"() {
      init_utils7();
    }
  });

  // node_modules/viem/_esm/actions/public/getProof.js
  async function getProof(client, { address, blockNumber, blockTag: blockTag_, storageKeys }) {
    const blockTag = blockTag_ ?? "latest";
    const blockNumberHex = blockNumber !== void 0 ? numberToHex(blockNumber) : void 0;
    const proof = await client.request({
      method: "eth_getProof",
      params: [address, storageKeys, blockNumberHex || blockTag]
    });
    return formatProof(proof);
  }
  var init_getProof = __esm({
    "node_modules/viem/_esm/actions/public/getProof.js"() {
      init_toHex();
      init_proof();
    }
  });

  // node_modules/viem/_esm/actions/public/getStorageAt.js
  async function getStorageAt(client, { address, blockNumber, blockTag = "latest", slot }) {
    const blockNumberHex = blockNumber !== void 0 ? numberToHex(blockNumber) : void 0;
    const data = await client.request({
      method: "eth_getStorageAt",
      params: [address, slot, blockNumberHex || blockTag]
    });
    return data;
  }
  var init_getStorageAt = __esm({
    "node_modules/viem/_esm/actions/public/getStorageAt.js"() {
      init_toHex();
    }
  });

  // node_modules/viem/_esm/actions/public/getTransaction.js
  async function getTransaction(client, { blockHash, blockNumber, blockTag: blockTag_, hash: hash3, index: index2 }) {
    const blockTag = blockTag_ || "latest";
    const blockNumberHex = blockNumber !== void 0 ? numberToHex(blockNumber) : void 0;
    let transaction = null;
    if (hash3) {
      transaction = await client.request({
        method: "eth_getTransactionByHash",
        params: [hash3]
      }, { dedupe: true });
    } else if (blockHash) {
      transaction = await client.request({
        method: "eth_getTransactionByBlockHashAndIndex",
        params: [blockHash, numberToHex(index2)]
      }, { dedupe: true });
    } else if (blockNumberHex || blockTag) {
      transaction = await client.request({
        method: "eth_getTransactionByBlockNumberAndIndex",
        params: [blockNumberHex || blockTag, numberToHex(index2)]
      }, { dedupe: Boolean(blockNumberHex) });
    }
    if (!transaction)
      throw new TransactionNotFoundError({
        blockHash,
        blockNumber,
        blockTag,
        hash: hash3,
        index: index2
      });
    const format = client.chain?.formatters?.transaction?.format || formatTransaction;
    return format(transaction, "getTransaction");
  }
  var init_getTransaction = __esm({
    "node_modules/viem/_esm/actions/public/getTransaction.js"() {
      init_transaction();
      init_toHex();
      init_transaction2();
    }
  });

  // node_modules/viem/_esm/actions/public/getTransactionConfirmations.js
  async function getTransactionConfirmations(client, { hash: hash3, transactionReceipt }) {
    const [blockNumber, transaction] = await Promise.all([
      getAction(client, getBlockNumber, "getBlockNumber")({}),
      hash3 ? getAction(client, getTransaction, "getTransaction")({ hash: hash3 }) : void 0
    ]);
    const transactionBlockNumber = transactionReceipt?.blockNumber || transaction?.blockNumber;
    if (!transactionBlockNumber)
      return 0n;
    return blockNumber - transactionBlockNumber + 1n;
  }
  var init_getTransactionConfirmations = __esm({
    "node_modules/viem/_esm/actions/public/getTransactionConfirmations.js"() {
      init_getAction();
      init_getBlockNumber();
      init_getTransaction();
    }
  });

  // node_modules/viem/_esm/actions/public/getTransactionReceipt.js
  async function getTransactionReceipt(client, { hash: hash3 }) {
    const receipt = await client.request({
      method: "eth_getTransactionReceipt",
      params: [hash3]
    }, { dedupe: true });
    if (!receipt)
      throw new TransactionReceiptNotFoundError({ hash: hash3 });
    const format = client.chain?.formatters?.transactionReceipt?.format || formatTransactionReceipt;
    return format(receipt, "getTransactionReceipt");
  }
  var init_getTransactionReceipt = __esm({
    "node_modules/viem/_esm/actions/public/getTransactionReceipt.js"() {
      init_transaction();
      init_transactionReceipt();
    }
  });

  // node_modules/viem/_esm/actions/public/multicall.js
  async function multicall(client, parameters) {
    const { account, authorizationList, allowFailure = true, blockNumber, blockOverrides, blockTag, stateOverride } = parameters;
    const contracts2 = parameters.contracts;
    const { batchSize = parameters.batchSize ?? 1024, deployless = parameters.deployless ?? false } = typeof client.batch?.multicall === "object" ? client.batch.multicall : {};
    const multicallAddress = (() => {
      if (parameters.multicallAddress)
        return parameters.multicallAddress;
      if (deployless)
        return null;
      if (client.chain) {
        return getChainContractAddress({
          blockNumber,
          chain: client.chain,
          contract: "multicall3"
        });
      }
      throw new Error("client chain not configured. multicallAddress is required.");
    })();
    const chunkedCalls = [[]];
    let currentChunk = 0;
    let currentChunkSize = 0;
    for (let i = 0; i < contracts2.length; i++) {
      const { abi: abi3, address, args, functionName } = contracts2[i];
      try {
        const callData = encodeFunctionData({ abi: abi3, args, functionName });
        currentChunkSize += (callData.length - 2) / 2;
        if (
          // Check if batching is enabled.
          batchSize > 0 && // Check if the current size of the batch exceeds the size limit.
          currentChunkSize > batchSize && // Check if the current chunk is not already empty.
          chunkedCalls[currentChunk].length > 0
        ) {
          currentChunk++;
          currentChunkSize = (callData.length - 2) / 2;
          chunkedCalls[currentChunk] = [];
        }
        chunkedCalls[currentChunk] = [
          ...chunkedCalls[currentChunk],
          {
            allowFailure: true,
            callData,
            target: address
          }
        ];
      } catch (err) {
        const error = getContractError(err, {
          abi: abi3,
          address,
          args,
          docsPath: "/docs/contract/multicall",
          functionName,
          sender: account
        });
        if (!allowFailure)
          throw error;
        chunkedCalls[currentChunk] = [
          ...chunkedCalls[currentChunk],
          {
            allowFailure: true,
            callData: "0x",
            target: address
          }
        ];
      }
    }
    const aggregate3Results = await Promise.allSettled(chunkedCalls.map((calls) => getAction(client, readContract, "readContract")({
      ...multicallAddress === null ? { code: multicall3Bytecode } : { address: multicallAddress },
      abi: multicall3Abi,
      account,
      args: [calls],
      authorizationList,
      blockNumber,
      blockOverrides,
      blockTag,
      functionName: "aggregate3",
      stateOverride
    })));
    const results = [];
    for (let i = 0; i < aggregate3Results.length; i++) {
      const result = aggregate3Results[i];
      if (result.status === "rejected") {
        if (!allowFailure)
          throw result.reason;
        for (let j = 0; j < chunkedCalls[i].length; j++) {
          results.push({
            status: "failure",
            error: result.reason,
            result: void 0
          });
        }
        continue;
      }
      const aggregate3Result = result.value;
      for (let j = 0; j < aggregate3Result.length; j++) {
        const { returnData, success } = aggregate3Result[j];
        const { callData } = chunkedCalls[i][j];
        const { abi: abi3, address, functionName, args } = contracts2[results.length];
        try {
          if (callData === "0x")
            throw new AbiDecodingZeroDataError();
          if (!success)
            throw new RawContractError({ data: returnData });
          const result2 = decodeFunctionResult({
            abi: abi3,
            args,
            data: returnData,
            functionName
          });
          results.push(allowFailure ? { result: result2, status: "success" } : result2);
        } catch (err) {
          const error = getContractError(err, {
            abi: abi3,
            address,
            args,
            docsPath: "/docs/contract/multicall",
            functionName
          });
          if (!allowFailure)
            throw error;
          results.push({ error, result: void 0, status: "failure" });
        }
      }
    }
    if (results.length !== contracts2.length)
      throw new BaseError2("multicall results mismatch");
    return results;
  }
  var init_multicall = __esm({
    "node_modules/viem/_esm/actions/public/multicall.js"() {
      init_abis();
      init_contracts();
      init_abi();
      init_base();
      init_contract();
      init_decodeFunctionResult();
      init_encodeFunctionData();
      init_getChainContractAddress();
      init_getContractError();
      init_getAction();
      init_readContract();
    }
  });

  // node_modules/viem/_esm/actions/public/simulateBlocks.js
  async function simulateBlocks(client, parameters) {
    const { blockNumber, blockTag = client.experimental_blockTag ?? "latest", blocks, returnFullTransactions, traceTransfers, validation } = parameters;
    try {
      const blockStateCalls = [];
      for (const block2 of blocks) {
        const blockOverrides = block2.blockOverrides ? toRpc2(block2.blockOverrides) : void 0;
        const calls = block2.calls.map((call_) => {
          const call2 = call_;
          const account = call2.account ? parseAccount(call2.account) : void 0;
          const data = call2.abi ? encodeFunctionData(call2) : call2.data;
          const request = {
            ...call2,
            data: call2.dataSuffix ? concat([data || "0x", call2.dataSuffix]) : data,
            from: call2.from ?? account?.address
          };
          assertRequest(request);
          return formatTransactionRequest(request);
        });
        const stateOverrides = block2.stateOverrides ? serializeStateOverride(block2.stateOverrides) : void 0;
        blockStateCalls.push({
          blockOverrides,
          calls,
          stateOverrides
        });
      }
      const blockNumberHex = typeof blockNumber === "bigint" ? numberToHex(blockNumber) : void 0;
      const block = blockNumberHex || blockTag;
      const result = await client.request({
        method: "eth_simulateV1",
        params: [
          { blockStateCalls, returnFullTransactions, traceTransfers, validation },
          block
        ]
      });
      return result.map((block2, i) => ({
        ...formatBlock(block2),
        calls: block2.calls.map((call2, j) => {
          const { abi: abi3, args, functionName, to } = blocks[i].calls[j];
          const data = call2.error?.data ?? call2.returnData;
          const gasUsed = BigInt(call2.gasUsed);
          const logs = call2.logs?.map((log) => formatLog(log));
          const status = call2.status === "0x1" ? "success" : "failure";
          const result2 = abi3 && status === "success" && data !== "0x" ? decodeFunctionResult({
            abi: abi3,
            data,
            functionName
          }) : null;
          const error = (() => {
            if (status === "success")
              return void 0;
            let error2;
            if (call2.error?.data === "0x")
              error2 = new AbiDecodingZeroDataError();
            else if (call2.error)
              error2 = new RawContractError(call2.error);
            if (!error2)
              return void 0;
            return getContractError(error2, {
              abi: abi3 ?? [],
              address: to ?? "0x",
              args,
              functionName: functionName ?? "<unknown>"
            });
          })();
          return {
            data,
            gasUsed,
            logs,
            status,
            ...status === "success" ? {
              result: result2
            } : {
              error
            }
          };
        })
      }));
    } catch (e) {
      const cause = e;
      const error = getNodeError(cause, {});
      if (error instanceof UnknownNodeError)
        throw cause;
      throw error;
    }
  }
  var init_simulateBlocks = __esm({
    "node_modules/viem/_esm/actions/public/simulateBlocks.js"() {
      init_BlockOverrides();
      init_parseAccount();
      init_abi();
      init_contract();
      init_node();
      init_decodeFunctionResult();
      init_encodeFunctionData();
      init_concat();
      init_toHex();
      init_getContractError();
      init_getNodeError();
      init_block2();
      init_log2();
      init_transactionRequest();
      init_stateOverride2();
      init_assertRequest();
    }
  });

  // node_modules/ox/_esm/core/internal/abiItem.js
  function normalizeSignature2(signature) {
    let active = true;
    let current = "";
    let level = 0;
    let result = "";
    let valid = false;
    for (let i = 0; i < signature.length; i++) {
      const char = signature[i];
      if (["(", ")", ","].includes(char))
        active = true;
      if (char === "(")
        level++;
      if (char === ")")
        level--;
      if (!active)
        continue;
      if (level === 0) {
        if (char === " " && ["event", "function", "error", ""].includes(result))
          result = "";
        else {
          result += char;
          if (char === ")") {
            valid = true;
            break;
          }
        }
        continue;
      }
      if (char === " ") {
        if (signature[i - 1] !== "," && current !== "," && current !== ",(") {
          current = "";
          active = false;
        }
        continue;
      }
      result += char;
      current += char;
    }
    if (!valid)
      throw new BaseError3("Unable to normalize signature.");
    return result;
  }
  function isArgOfType2(arg, abiParameter) {
    const argType = typeof arg;
    const abiParameterType = abiParameter.type;
    switch (abiParameterType) {
      case "address":
        return validate3(arg, { strict: false });
      case "bool":
        return argType === "boolean";
      case "function":
        return argType === "string";
      case "string":
        return argType === "string";
      default: {
        if (abiParameterType === "tuple" && "components" in abiParameter)
          return Object.values(abiParameter.components).every((component, index2) => {
            return isArgOfType2(Object.values(arg)[index2], component);
          });
        if (/^u?int(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/.test(abiParameterType))
          return argType === "number" || argType === "bigint";
        if (/^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/.test(abiParameterType))
          return argType === "string" || arg instanceof Uint8Array;
        if (/[a-z]+[1-9]{0,3}(\[[0-9]{0,}\])+$/.test(abiParameterType)) {
          return Array.isArray(arg) && arg.every((x) => isArgOfType2(x, {
            ...abiParameter,
            // Pop off `[]` or `[M]` from end of type
            type: abiParameterType.replace(/(\[[0-9]{0,}\])$/, "")
          }));
        }
        return false;
      }
    }
  }
  function getAmbiguousTypes2(sourceParameters, targetParameters, args) {
    for (const parameterIndex in sourceParameters) {
      const sourceParameter = sourceParameters[parameterIndex];
      const targetParameter = targetParameters[parameterIndex];
      if (sourceParameter.type === "tuple" && targetParameter.type === "tuple" && "components" in sourceParameter && "components" in targetParameter)
        return getAmbiguousTypes2(sourceParameter.components, targetParameter.components, args[parameterIndex]);
      const types2 = [sourceParameter.type, targetParameter.type];
      const ambiguous = (() => {
        if (types2.includes("address") && types2.includes("bytes20"))
          return true;
        if (types2.includes("address") && types2.includes("string"))
          return validate3(args[parameterIndex], {
            strict: false
          });
        if (types2.includes("address") && types2.includes("bytes"))
          return validate3(args[parameterIndex], {
            strict: false
          });
        return false;
      })();
      if (ambiguous)
        return types2;
    }
    return;
  }
  var init_abiItem2 = __esm({
    "node_modules/ox/_esm/core/internal/abiItem.js"() {
      init_Address();
      init_Errors();
    }
  });

  // node_modules/ox/_esm/core/AbiItem.js
  function from10(abiItem, options = {}) {
    const { prepare = true } = options;
    const item = (() => {
      if (Array.isArray(abiItem))
        return parseAbiItem(abiItem);
      if (typeof abiItem === "string")
        return parseAbiItem(abiItem);
      return abiItem;
    })();
    return {
      ...item,
      ...prepare ? { hash: getSignatureHash(item) } : {}
    };
  }
  function fromAbi(abi3, name, options) {
    const { args = [], prepare = true } = options ?? {};
    const isSelector = validate2(name, { strict: false });
    const abiItems = abi3.filter((abiItem2) => {
      if (isSelector) {
        if (abiItem2.type === "function" || abiItem2.type === "error")
          return getSelector(abiItem2) === slice3(name, 0, 4);
        if (abiItem2.type === "event")
          return getSignatureHash(abiItem2) === name;
        return false;
      }
      return "name" in abiItem2 && abiItem2.name === name;
    });
    if (abiItems.length === 0)
      throw new NotFoundError({ name });
    if (abiItems.length === 1)
      return {
        ...abiItems[0],
        ...prepare ? { hash: getSignatureHash(abiItems[0]) } : {}
      };
    let matchedAbiItem;
    for (const abiItem2 of abiItems) {
      if (!("inputs" in abiItem2))
        continue;
      if (!args || args.length === 0) {
        if (!abiItem2.inputs || abiItem2.inputs.length === 0)
          return {
            ...abiItem2,
            ...prepare ? { hash: getSignatureHash(abiItem2) } : {}
          };
        continue;
      }
      if (!abiItem2.inputs)
        continue;
      if (abiItem2.inputs.length === 0)
        continue;
      if (abiItem2.inputs.length !== args.length)
        continue;
      const matched = args.every((arg, index2) => {
        const abiParameter = "inputs" in abiItem2 && abiItem2.inputs[index2];
        if (!abiParameter)
          return false;
        return isArgOfType2(arg, abiParameter);
      });
      if (matched) {
        if (matchedAbiItem && "inputs" in matchedAbiItem && matchedAbiItem.inputs) {
          const ambiguousTypes = getAmbiguousTypes2(abiItem2.inputs, matchedAbiItem.inputs, args);
          if (ambiguousTypes)
            throw new AmbiguityError({
              abiItem: abiItem2,
              type: ambiguousTypes[0]
            }, {
              abiItem: matchedAbiItem,
              type: ambiguousTypes[1]
            });
        }
        matchedAbiItem = abiItem2;
      }
    }
    const abiItem = (() => {
      if (matchedAbiItem)
        return matchedAbiItem;
      const [abiItem2, ...overloads] = abiItems;
      return { ...abiItem2, overloads };
    })();
    if (!abiItem)
      throw new NotFoundError({ name });
    return {
      ...abiItem,
      ...prepare ? { hash: getSignatureHash(abiItem) } : {}
    };
  }
  function getSelector(...parameters) {
    const abiItem = (() => {
      if (Array.isArray(parameters[0])) {
        const [abi3, name] = parameters;
        return fromAbi(abi3, name);
      }
      return parameters[0];
    })();
    return slice3(getSignatureHash(abiItem), 0, 4);
  }
  function getSignature(...parameters) {
    const abiItem = (() => {
      if (Array.isArray(parameters[0])) {
        const [abi3, name] = parameters;
        return fromAbi(abi3, name);
      }
      return parameters[0];
    })();
    const signature = (() => {
      if (typeof abiItem === "string")
        return abiItem;
      return formatAbiItem(abiItem);
    })();
    return normalizeSignature2(signature);
  }
  function getSignatureHash(...parameters) {
    const abiItem = (() => {
      if (Array.isArray(parameters[0])) {
        const [abi3, name] = parameters;
        return fromAbi(abi3, name);
      }
      return parameters[0];
    })();
    if (typeof abiItem !== "string" && "hash" in abiItem && abiItem.hash)
      return abiItem.hash;
    return keccak2562(fromString2(getSignature(abiItem)));
  }
  var AmbiguityError, NotFoundError;
  var init_AbiItem = __esm({
    "node_modules/ox/_esm/core/AbiItem.js"() {
      init_exports();
      init_Errors();
      init_Hash();
      init_Hex();
      init_abiItem2();
      AmbiguityError = class extends BaseError3 {
        constructor(x, y) {
          super("Found ambiguous types in overloaded ABI Items.", {
            metaMessages: [
              // TODO: abitype to add support for signature-formatted ABI items.
              `\`${x.type}\` in \`${normalizeSignature2(formatAbiItem(x.abiItem))}\`, and`,
              `\`${y.type}\` in \`${normalizeSignature2(formatAbiItem(y.abiItem))}\``,
              "",
              "These types encode differently and cannot be distinguished at runtime.",
              "Remove one of the ambiguous items in the ABI."
            ]
          });
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "AbiItem.AmbiguityError"
          });
        }
      };
      NotFoundError = class extends BaseError3 {
        constructor({ name, data, type = "item" }) {
          const selector = (() => {
            if (name)
              return ` with name "${name}"`;
            if (data)
              return ` with data "${data}"`;
            return "";
          })();
          super(`ABI ${type}${selector} not found.`);
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "AbiItem.NotFoundError"
          });
        }
      };
    }
  });

  // node_modules/ox/_esm/core/AbiConstructor.js
  function encode4(...parameters) {
    const [abiConstructor, options] = (() => {
      if (Array.isArray(parameters[0])) {
        const [abi3, options2] = parameters;
        return [fromAbi2(abi3), options2];
      }
      return parameters;
    })();
    const { bytecode, args } = options;
    return concat2(bytecode, abiConstructor.inputs?.length && args?.length ? encode3(abiConstructor.inputs, args) : "0x");
  }
  function from11(abiConstructor) {
    return from10(abiConstructor);
  }
  function fromAbi2(abi3) {
    const item = abi3.find((item2) => item2.type === "constructor");
    if (!item)
      throw new NotFoundError({ name: "constructor" });
    return item;
  }
  var init_AbiConstructor = __esm({
    "node_modules/ox/_esm/core/AbiConstructor.js"() {
      init_AbiItem();
      init_AbiParameters();
      init_Hex();
    }
  });

  // node_modules/ox/_esm/core/AbiFunction.js
  function encodeData2(...parameters) {
    const [abiFunction, args = []] = (() => {
      if (Array.isArray(parameters[0])) {
        const [abi3, name, args3] = parameters;
        return [fromAbi3(abi3, name, { args: args3 }), args3];
      }
      const [abiFunction2, args2] = parameters;
      return [abiFunction2, args2];
    })();
    const { overloads } = abiFunction;
    const item = overloads ? fromAbi3([abiFunction, ...overloads], abiFunction.name, {
      args
    }) : abiFunction;
    const selector = getSelector2(item);
    const data = args.length > 0 ? encode3(item.inputs, args) : void 0;
    return data ? concat2(selector, data) : selector;
  }
  function from12(abiFunction, options = {}) {
    return from10(abiFunction, options);
  }
  function fromAbi3(abi3, name, options) {
    const item = fromAbi(abi3, name, options);
    if (item.type !== "function")
      throw new NotFoundError({ name, type: "function" });
    return item;
  }
  function getSelector2(abiItem) {
    return getSelector(abiItem);
  }
  var init_AbiFunction = __esm({
    "node_modules/ox/_esm/core/AbiFunction.js"() {
      init_AbiItem();
      init_AbiParameters();
      init_Hex();
    }
  });

  // node_modules/viem/_esm/constants/address.js
  var entryPoint06Address, ethAddress, zeroAddress;
  var init_address2 = __esm({
    "node_modules/viem/_esm/constants/address.js"() {
      entryPoint06Address = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
      ethAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
      zeroAddress = "0x0000000000000000000000000000000000000000";
    }
  });

  // node_modules/viem/_esm/actions/public/simulateCalls.js
  async function simulateCalls(client, parameters) {
    const { blockNumber, blockTag, calls, stateOverrides, traceAssetChanges, traceTransfers, validation } = parameters;
    const account = parameters.account ? parseAccount(parameters.account) : void 0;
    if (traceAssetChanges && !account)
      throw new BaseError2("`account` is required when `traceAssetChanges` is true");
    const getBalanceData = account ? encode4(from11("constructor(bytes, bytes)"), {
      bytecode: deploylessCallViaBytecodeBytecode,
      args: [
        getBalanceCode,
        encodeData2(from12("function getBalance(address)"), [account.address])
      ]
    }) : void 0;
    const assetAddresses = traceAssetChanges ? await Promise.all(parameters.calls.map(async (call2) => {
      if (!call2.data && !call2.abi)
        return;
      const { accessList } = await createAccessList(client, {
        account: account.address,
        ...call2,
        data: call2.abi ? encodeFunctionData(call2) : call2.data
      });
      return accessList.map(({ address, storageKeys }) => storageKeys.length > 0 ? address : null);
    })).then((x) => x.flat().filter(Boolean)) : [];
    const blocks = await simulateBlocks(client, {
      blockNumber,
      blockTag,
      blocks: [
        ...traceAssetChanges ? [
          // ETH pre balances
          {
            calls: [{ data: getBalanceData }],
            stateOverrides
          },
          // Asset pre balances
          {
            calls: assetAddresses.map((address, i) => ({
              abi: [
                from12("function balanceOf(address) returns (uint256)")
              ],
              functionName: "balanceOf",
              args: [account.address],
              to: address,
              from: zeroAddress,
              nonce: i
            })),
            stateOverrides: [
              {
                address: zeroAddress,
                nonce: 0
              }
            ]
          }
        ] : [],
        {
          calls: [...calls, {}].map((call2) => ({
            ...call2,
            from: account?.address
          })),
          stateOverrides
        },
        ...traceAssetChanges ? [
          // ETH post balances
          {
            calls: [{ data: getBalanceData }]
          },
          // Asset post balances
          {
            calls: assetAddresses.map((address, i) => ({
              abi: [
                from12("function balanceOf(address) returns (uint256)")
              ],
              functionName: "balanceOf",
              args: [account.address],
              to: address,
              from: zeroAddress,
              nonce: i
            })),
            stateOverrides: [
              {
                address: zeroAddress,
                nonce: 0
              }
            ]
          },
          // Decimals
          {
            calls: assetAddresses.map((address, i) => ({
              to: address,
              abi: [
                from12("function decimals() returns (uint256)")
              ],
              functionName: "decimals",
              from: zeroAddress,
              nonce: i
            })),
            stateOverrides: [
              {
                address: zeroAddress,
                nonce: 0
              }
            ]
          },
          // Token URI
          {
            calls: assetAddresses.map((address, i) => ({
              to: address,
              abi: [
                from12("function tokenURI(uint256) returns (string)")
              ],
              functionName: "tokenURI",
              args: [0n],
              from: zeroAddress,
              nonce: i
            })),
            stateOverrides: [
              {
                address: zeroAddress,
                nonce: 0
              }
            ]
          },
          // Symbols
          {
            calls: assetAddresses.map((address, i) => ({
              to: address,
              abi: [from12("function symbol() returns (string)")],
              functionName: "symbol",
              from: zeroAddress,
              nonce: i
            })),
            stateOverrides: [
              {
                address: zeroAddress,
                nonce: 0
              }
            ]
          }
        ] : []
      ],
      traceTransfers,
      validation
    });
    const block_results = traceAssetChanges ? blocks[2] : blocks[0];
    const [block_ethPre, block_assetsPre, , block_ethPost, block_assetsPost, block_decimals, block_tokenURI, block_symbols] = traceAssetChanges ? blocks : [];
    const { calls: block_calls, ...block } = block_results;
    const results = block_calls.slice(0, -1) ?? [];
    const ethPre = block_ethPre?.calls ?? [];
    const assetsPre = block_assetsPre?.calls ?? [];
    const balancesPre = [...ethPre, ...assetsPre].map((call2) => call2.status === "success" ? hexToBigInt(call2.data) : null);
    const ethPost = block_ethPost?.calls ?? [];
    const assetsPost = block_assetsPost?.calls ?? [];
    const balancesPost = [...ethPost, ...assetsPost].map((call2) => call2.status === "success" ? hexToBigInt(call2.data) : null);
    const decimals = (block_decimals?.calls ?? []).map((x) => x.status === "success" ? x.result : null);
    const symbols = (block_symbols?.calls ?? []).map((x) => x.status === "success" ? x.result : null);
    const tokenURI = (block_tokenURI?.calls ?? []).map((x) => x.status === "success" ? x.result : null);
    const changes = [];
    for (const [i, balancePost] of balancesPost.entries()) {
      const balancePre = balancesPre[i];
      if (typeof balancePost !== "bigint")
        continue;
      if (typeof balancePre !== "bigint")
        continue;
      const decimals_ = decimals[i - 1];
      const symbol_ = symbols[i - 1];
      const tokenURI_ = tokenURI[i - 1];
      const token = (() => {
        if (i === 0)
          return {
            address: ethAddress,
            decimals: 18,
            symbol: "ETH"
          };
        return {
          address: assetAddresses[i - 1],
          decimals: tokenURI_ || decimals_ ? Number(decimals_ ?? 1) : void 0,
          symbol: symbol_ ?? void 0
        };
      })();
      if (changes.some((change) => change.token.address === token.address))
        continue;
      changes.push({
        token,
        value: {
          pre: balancePre,
          post: balancePost,
          diff: balancePost - balancePre
        }
      });
    }
    return {
      assetChanges: changes,
      block,
      results
    };
  }
  var getBalanceCode;
  var init_simulateCalls = __esm({
    "node_modules/viem/_esm/actions/public/simulateCalls.js"() {
      init_AbiConstructor();
      init_AbiFunction();
      init_parseAccount();
      init_address2();
      init_contracts();
      init_base();
      init_encodeFunctionData();
      init_utils7();
      init_createAccessList();
      init_simulateBlocks();
      getBalanceCode = "0x6080604052348015600e575f80fd5b5061016d8061001c5f395ff3fe608060405234801561000f575f80fd5b5060043610610029575f3560e01c8063f8b2cb4f1461002d575b5f80fd5b610047600480360381019061004291906100db565b61005d565b604051610054919061011e565b60405180910390f35b5f8173ffffffffffffffffffffffffffffffffffffffff16319050919050565b5f80fd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f6100aa82610081565b9050919050565b6100ba816100a0565b81146100c4575f80fd5b50565b5f813590506100d5816100b1565b92915050565b5f602082840312156100f0576100ef61007d565b5b5f6100fd848285016100c7565b91505092915050565b5f819050919050565b61011881610106565b82525050565b5f6020820190506101315f83018461010f565b9291505056fea26469706673582212203b9fe929fe995c7cf9887f0bdba8a36dd78e8b73f149b17d2d9ad7cd09d2dc6264736f6c634300081a0033";
    }
  });

  // node_modules/ox/_esm/erc6492/SignatureErc6492.js
  var SignatureErc6492_exports = {};
  __export(SignatureErc6492_exports, {
    InvalidWrappedSignatureError: () => InvalidWrappedSignatureError2,
    assert: () => assert7,
    from: () => from13,
    magicBytes: () => magicBytes2,
    universalSignatureValidatorAbi: () => universalSignatureValidatorAbi,
    universalSignatureValidatorBytecode: () => universalSignatureValidatorBytecode,
    unwrap: () => unwrap2,
    validate: () => validate5,
    wrap: () => wrap2
  });
  function assert7(wrapped) {
    if (slice3(wrapped, -32) !== magicBytes2)
      throw new InvalidWrappedSignatureError2(wrapped);
  }
  function from13(wrapped) {
    if (typeof wrapped === "string")
      return unwrap2(wrapped);
    return wrapped;
  }
  function unwrap2(wrapped) {
    assert7(wrapped);
    const [to, data, signature] = decode(from5("address, bytes, bytes"), wrapped);
    return { data, signature, to };
  }
  function wrap2(value) {
    const { data, signature, to } = value;
    return concat2(encode3(from5("address, bytes, bytes"), [
      to,
      data,
      signature
    ]), magicBytes2);
  }
  function validate5(wrapped) {
    try {
      assert7(wrapped);
      return true;
    } catch {
      return false;
    }
  }
  var magicBytes2, universalSignatureValidatorBytecode, universalSignatureValidatorAbi, InvalidWrappedSignatureError2;
  var init_SignatureErc6492 = __esm({
    "node_modules/ox/_esm/erc6492/SignatureErc6492.js"() {
      init_AbiParameters();
      init_Errors();
      init_Hex();
      magicBytes2 = "0x6492649264926492649264926492649264926492649264926492649264926492";
      universalSignatureValidatorBytecode = "0x608060405234801561001057600080fd5b5060405161069438038061069483398101604081905261002f9161051e565b600061003c848484610048565b9050806000526001601ff35b60007f64926492649264926492649264926492649264926492649264926492649264926100748361040c565b036101e7576000606080848060200190518101906100929190610577565b60405192955090935091506000906001600160a01b038516906100b69085906105dd565b6000604051808303816000865af19150503d80600081146100f3576040519150601f19603f3d011682016040523d82523d6000602084013e6100f8565b606091505b50509050876001600160a01b03163b60000361016057806101605760405162461bcd60e51b815260206004820152601e60248201527f5369676e617475726556616c696461746f723a206465706c6f796d656e74000060448201526064015b60405180910390fd5b604051630b135d3f60e11b808252906001600160a01b038a1690631626ba7e90610190908b9087906004016105f9565b602060405180830381865afa1580156101ad573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101d19190610633565b6001600160e01b03191614945050505050610405565b6001600160a01b0384163b1561027a57604051630b135d3f60e11b808252906001600160a01b03861690631626ba7e9061022790879087906004016105f9565b602060405180830381865afa158015610244573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102689190610633565b6001600160e01b031916149050610405565b81516041146102df5760405162461bcd60e51b815260206004820152603a602482015260008051602061067483398151915260448201527f3a20696e76616c6964207369676e6174757265206c656e6774680000000000006064820152608401610157565b6102e7610425565b5060208201516040808401518451859392600091859190811061030c5761030c61065d565b016020015160f81c9050601b811480159061032b57508060ff16601c14155b1561038c5760405162461bcd60e51b815260206004820152603b602482015260008051602061067483398151915260448201527f3a20696e76616c6964207369676e617475726520762076616c756500000000006064820152608401610157565b60408051600081526020810180835289905260ff83169181019190915260608101849052608081018390526001600160a01b0389169060019060a0016020604051602081039080840390855afa1580156103ea573d6000803e3d6000fd5b505050602060405103516001600160a01b0316149450505050505b9392505050565b600060208251101561041d57600080fd5b508051015190565b60405180606001604052806003906020820280368337509192915050565b6001600160a01b038116811461045857600080fd5b50565b634e487b7160e01b600052604160045260246000fd5b60005b8381101561048c578181015183820152602001610474565b50506000910152565b600082601f8301126104a657600080fd5b81516001600160401b038111156104bf576104bf61045b565b604051601f8201601f19908116603f011681016001600160401b03811182821017156104ed576104ed61045b565b60405281815283820160200185101561050557600080fd5b610516826020830160208701610471565b949350505050565b60008060006060848603121561053357600080fd5b835161053e81610443565b6020850151604086015191945092506001600160401b0381111561056157600080fd5b61056d86828701610495565b9150509250925092565b60008060006060848603121561058c57600080fd5b835161059781610443565b60208501519093506001600160401b038111156105b357600080fd5b6105bf86828701610495565b604086015190935090506001600160401b0381111561056157600080fd5b600082516105ef818460208701610471565b9190910192915050565b828152604060208201526000825180604084015261061e816060850160208701610471565b601f01601f1916919091016060019392505050565b60006020828403121561064557600080fd5b81516001600160e01b03198116811461040557600080fd5b634e487b7160e01b600052603260045260246000fdfe5369676e617475726556616c696461746f72237265636f7665725369676e6572";
      universalSignatureValidatorAbi = [
        {
          inputs: [
            {
              name: "_signer",
              type: "address"
            },
            {
              name: "_hash",
              type: "bytes32"
            },
            {
              name: "_signature",
              type: "bytes"
            }
          ],
          stateMutability: "nonpayable",
          type: "constructor"
        },
        {
          inputs: [
            {
              name: "_signer",
              type: "address"
            },
            {
              name: "_hash",
              type: "bytes32"
            },
            {
              name: "_signature",
              type: "bytes"
            }
          ],
          outputs: [
            {
              type: "bool"
            }
          ],
          stateMutability: "nonpayable",
          type: "function",
          name: "isValidSig"
        }
      ];
      InvalidWrappedSignatureError2 = class extends BaseError3 {
        constructor(wrapped) {
          super(`Value \`${wrapped}\` is an invalid ERC-6492 wrapped signature.`);
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "SignatureErc6492.InvalidWrappedSignatureError"
          });
        }
      };
    }
  });

  // node_modules/ox/_esm/erc6492/index.js
  var init_erc6492 = __esm({
    "node_modules/ox/_esm/erc6492/index.js"() {
      init_SignatureErc6492();
    }
  });

  // node_modules/viem/_esm/utils/signature/serializeSignature.js
  function serializeSignature({ r, s, to = "hex", v, yParity }) {
    const yParity_ = (() => {
      if (yParity === 0 || yParity === 1)
        return yParity;
      if (v && (v === 27n || v === 28n || v >= 35n))
        return v % 2n === 0n ? 1 : 0;
      throw new Error("Invalid `v` or `yParity` value");
    })();
    const signature = `0x${new secp256k1.Signature(hexToBigInt(r), hexToBigInt(s)).toCompactHex()}${yParity_ === 0 ? "1b" : "1c"}`;
    if (to === "hex")
      return signature;
    return hexToBytes(signature);
  }
  var init_serializeSignature = __esm({
    "node_modules/viem/_esm/utils/signature/serializeSignature.js"() {
      init_secp256k1();
      init_fromHex();
      init_toBytes();
    }
  });

  // node_modules/viem/_esm/actions/public/verifyHash.js
  async function verifyHash(client, parameters) {
    const { address, hash: hash3, erc6492VerifierAddress: verifierAddress = parameters.universalSignatureVerifierAddress ?? client.chain?.contracts?.erc6492Verifier?.address, multicallAddress = parameters.multicallAddress ?? client.chain?.contracts?.multicall3?.address } = parameters;
    const signature = (() => {
      const signature2 = parameters.signature;
      if (isHex(signature2))
        return signature2;
      if (typeof signature2 === "object" && "r" in signature2 && "s" in signature2)
        return serializeSignature(signature2);
      return bytesToHex(signature2);
    })();
    try {
      if (SignatureErc8010_exports.validate(signature))
        return await verifyErc8010(client, {
          ...parameters,
          multicallAddress,
          signature
        });
      return await verifyErc6492(client, {
        ...parameters,
        verifierAddress,
        signature
      });
    } catch (error) {
      try {
        const verified = isAddressEqual(getAddress(address), await recoverAddress({ hash: hash3, signature }));
        if (verified)
          return true;
      } catch {
      }
      if (error instanceof VerificationError) {
        return false;
      }
      throw error;
    }
  }
  async function verifyErc8010(client, parameters) {
    const { address, blockNumber, blockTag, hash: hash3, multicallAddress } = parameters;
    const { authorization: authorization_ox, data: initData, signature, to } = SignatureErc8010_exports.unwrap(parameters.signature);
    const code = await getCode(client, {
      address,
      blockNumber,
      blockTag
    });
    if (code === concatHex(["0xef0100", authorization_ox.address]))
      return await verifyErc1271(client, {
        address,
        blockNumber,
        blockTag,
        hash: hash3,
        signature
      });
    const authorization = {
      address: authorization_ox.address,
      chainId: Number(authorization_ox.chainId),
      nonce: Number(authorization_ox.nonce),
      r: numberToHex(authorization_ox.r, { size: 32 }),
      s: numberToHex(authorization_ox.s, { size: 32 }),
      yParity: authorization_ox.yParity
    };
    const valid = await verifyAuthorization({
      address,
      authorization
    });
    if (!valid)
      throw new VerificationError();
    const results = await getAction(client, readContract, "readContract")({
      ...multicallAddress ? { address: multicallAddress } : { code: multicall3Bytecode },
      authorizationList: [authorization],
      abi: multicall3Abi,
      blockNumber,
      blockTag: "pending",
      functionName: "aggregate3",
      args: [
        [
          ...initData ? [
            {
              allowFailure: true,
              target: to ?? address,
              callData: initData
            }
          ] : [],
          {
            allowFailure: true,
            target: address,
            callData: encodeFunctionData({
              abi: erc1271Abi,
              functionName: "isValidSignature",
              args: [hash3, signature]
            })
          }
        ]
      ]
    });
    const data = results[results.length - 1]?.returnData;
    if (data?.startsWith("0x1626ba7e"))
      return true;
    throw new VerificationError();
  }
  async function verifyErc6492(client, parameters) {
    const { address, factory, factoryData, hash: hash3, signature, verifierAddress, ...rest } = parameters;
    const wrappedSignature = await (async () => {
      if (!factory && !factoryData)
        return signature;
      if (SignatureErc6492_exports.validate(signature))
        return signature;
      return SignatureErc6492_exports.wrap({
        data: factoryData,
        signature,
        to: factory
      });
    })();
    const args = verifierAddress ? {
      to: verifierAddress,
      data: encodeFunctionData({
        abi: erc6492SignatureValidatorAbi,
        functionName: "isValidSig",
        args: [address, hash3, wrappedSignature]
      }),
      ...rest
    } : {
      data: encodeDeployData({
        abi: erc6492SignatureValidatorAbi,
        args: [address, hash3, wrappedSignature],
        bytecode: erc6492SignatureValidatorByteCode
      }),
      ...rest
    };
    const { data } = await getAction(client, call, "call")(args).catch((error) => {
      if (error instanceof CallExecutionError)
        throw new VerificationError();
      throw error;
    });
    if (hexToBool(data ?? "0x0"))
      return true;
    throw new VerificationError();
  }
  async function verifyErc1271(client, parameters) {
    const { address, blockNumber, blockTag, hash: hash3, signature } = parameters;
    const result = await getAction(client, readContract, "readContract")({
      address,
      abi: erc1271Abi,
      args: [hash3, signature],
      blockNumber,
      blockTag,
      functionName: "isValidSignature"
    }).catch((error) => {
      if (error instanceof ContractFunctionExecutionError)
        throw new VerificationError();
      throw error;
    });
    if (result.startsWith("0x1626ba7e"))
      return true;
    throw new VerificationError();
  }
  var VerificationError;
  var init_verifyHash = __esm({
    "node_modules/viem/_esm/actions/public/verifyHash.js"() {
      init_erc6492();
      init_erc8010();
      init_abis();
      init_contracts();
      init_contract();
      init_encodeDeployData();
      init_encodeFunctionData();
      init_getAddress();
      init_isAddressEqual();
      init_verifyAuthorization();
      init_concat();
      init_isHex();
      init_fromHex();
      init_toHex();
      init_getAction();
      init_recoverAddress();
      init_serializeSignature();
      init_call();
      init_getCode();
      init_readContract();
      VerificationError = class extends Error {
      };
    }
  });

  // node_modules/viem/_esm/actions/public/verifyMessage.js
  async function verifyMessage(client, { address, message, factory, factoryData, signature, ...callRequest }) {
    const hash3 = hashMessage(message);
    return verifyHash(client, {
      address,
      factory,
      factoryData,
      hash: hash3,
      signature,
      ...callRequest
    });
  }
  var init_verifyMessage = __esm({
    "node_modules/viem/_esm/actions/public/verifyMessage.js"() {
      init_hashMessage();
      init_verifyHash();
    }
  });

  // node_modules/viem/_esm/actions/public/verifyTypedData.js
  async function verifyTypedData(client, parameters) {
    const { address, factory, factoryData, signature, message, primaryType, types: types2, domain, ...callRequest } = parameters;
    const hash3 = hashTypedData({ message, primaryType, types: types2, domain });
    return verifyHash(client, {
      address,
      factory,
      factoryData,
      hash: hash3,
      signature,
      ...callRequest
    });
  }
  var init_verifyTypedData = __esm({
    "node_modules/viem/_esm/actions/public/verifyTypedData.js"() {
      init_hashTypedData();
      init_verifyHash();
    }
  });

  // node_modules/viem/_esm/actions/public/watchBlockNumber.js
  function watchBlockNumber(client, { emitOnBegin = false, emitMissed = false, onBlockNumber, onError, poll: poll_, pollingInterval = client.pollingInterval }) {
    const enablePolling = (() => {
      if (typeof poll_ !== "undefined")
        return poll_;
      if (client.transport.type === "webSocket" || client.transport.type === "ipc")
        return false;
      if (client.transport.type === "fallback" && (client.transport.transports[0].config.type === "webSocket" || client.transport.transports[0].config.type === "ipc"))
        return false;
      return true;
    })();
    let prevBlockNumber;
    const pollBlockNumber = () => {
      const observerId = stringify([
        "watchBlockNumber",
        client.uid,
        emitOnBegin,
        emitMissed,
        pollingInterval
      ]);
      return observe(observerId, { onBlockNumber, onError }, (emit) => poll(async () => {
        try {
          const blockNumber = await getAction(client, getBlockNumber, "getBlockNumber")({ cacheTime: 0 });
          if (prevBlockNumber !== void 0) {
            if (blockNumber === prevBlockNumber)
              return;
            if (blockNumber - prevBlockNumber > 1 && emitMissed) {
              for (let i = prevBlockNumber + 1n; i < blockNumber; i++) {
                emit.onBlockNumber(i, prevBlockNumber);
                prevBlockNumber = i;
              }
            }
          }
          if (prevBlockNumber === void 0 || blockNumber > prevBlockNumber) {
            emit.onBlockNumber(blockNumber, prevBlockNumber);
            prevBlockNumber = blockNumber;
          }
        } catch (err) {
          emit.onError?.(err);
        }
      }, {
        emitOnBegin,
        interval: pollingInterval
      }));
    };
    const subscribeBlockNumber = () => {
      const observerId = stringify([
        "watchBlockNumber",
        client.uid,
        emitOnBegin,
        emitMissed
      ]);
      return observe(observerId, { onBlockNumber, onError }, (emit) => {
        let active = true;
        let unsubscribe = () => active = false;
        (async () => {
          try {
            const transport = (() => {
              if (client.transport.type === "fallback") {
                const transport2 = client.transport.transports.find((transport3) => transport3.config.type === "webSocket" || transport3.config.type === "ipc");
                if (!transport2)
                  return client.transport;
                return transport2.value;
              }
              return client.transport;
            })();
            const { unsubscribe: unsubscribe_ } = await transport.subscribe({
              params: ["newHeads"],
              onData(data) {
                if (!active)
                  return;
                const blockNumber = hexToBigInt(data.result?.number);
                emit.onBlockNumber(blockNumber, prevBlockNumber);
                prevBlockNumber = blockNumber;
              },
              onError(error) {
                emit.onError?.(error);
              }
            });
            unsubscribe = unsubscribe_;
            if (!active)
              unsubscribe();
          } catch (err) {
            onError?.(err);
          }
        })();
        return () => unsubscribe();
      });
    };
    return enablePolling ? pollBlockNumber() : subscribeBlockNumber();
  }
  var init_watchBlockNumber = __esm({
    "node_modules/viem/_esm/actions/public/watchBlockNumber.js"() {
      init_fromHex();
      init_getAction();
      init_observe();
      init_poll();
      init_stringify();
      init_getBlockNumber();
    }
  });

  // node_modules/viem/_esm/actions/public/waitForTransactionReceipt.js
  async function waitForTransactionReceipt(client, parameters) {
    const {
      checkReplacement = true,
      confirmations = 1,
      hash: hash3,
      onReplaced,
      retryCount = 6,
      retryDelay = ({ count }) => ~~(1 << count) * 200,
      // exponential backoff
      timeout = 18e4
    } = parameters;
    const observerId = stringify(["waitForTransactionReceipt", client.uid, hash3]);
    const pollingInterval = (() => {
      if (parameters.pollingInterval)
        return parameters.pollingInterval;
      if (client.chain?.experimental_preconfirmationTime)
        return client.chain.experimental_preconfirmationTime;
      return client.pollingInterval;
    })();
    let transaction;
    let replacedTransaction;
    let receipt;
    let retrying = false;
    let _unobserve;
    let _unwatch;
    const { promise, resolve, reject } = withResolvers();
    const timer = timeout ? setTimeout(() => {
      _unwatch?.();
      _unobserve?.();
      reject(new WaitForTransactionReceiptTimeoutError({ hash: hash3 }));
    }, timeout) : void 0;
    _unobserve = observe(observerId, { onReplaced, resolve, reject }, async (emit) => {
      receipt = await getAction(client, getTransactionReceipt, "getTransactionReceipt")({ hash: hash3 }).catch(() => void 0);
      if (receipt && confirmations <= 1) {
        clearTimeout(timer);
        emit.resolve(receipt);
        _unobserve?.();
        return;
      }
      _unwatch = getAction(client, watchBlockNumber, "watchBlockNumber")({
        emitMissed: true,
        emitOnBegin: true,
        poll: true,
        pollingInterval,
        async onBlockNumber(blockNumber_) {
          const done = (fn) => {
            clearTimeout(timer);
            _unwatch?.();
            fn();
            _unobserve?.();
          };
          let blockNumber = blockNumber_;
          if (retrying)
            return;
          try {
            if (receipt) {
              if (confirmations > 1 && (!receipt.blockNumber || blockNumber - receipt.blockNumber + 1n < confirmations))
                return;
              done(() => emit.resolve(receipt));
              return;
            }
            if (checkReplacement && !transaction) {
              retrying = true;
              await withRetry(async () => {
                transaction = await getAction(client, getTransaction, "getTransaction")({ hash: hash3 });
                if (transaction.blockNumber)
                  blockNumber = transaction.blockNumber;
              }, {
                delay: retryDelay,
                retryCount
              });
              retrying = false;
            }
            receipt = await getAction(client, getTransactionReceipt, "getTransactionReceipt")({ hash: hash3 });
            if (confirmations > 1 && (!receipt.blockNumber || blockNumber - receipt.blockNumber + 1n < confirmations))
              return;
            done(() => emit.resolve(receipt));
          } catch (err) {
            if (err instanceof TransactionNotFoundError || err instanceof TransactionReceiptNotFoundError) {
              if (!transaction) {
                retrying = false;
                return;
              }
              try {
                replacedTransaction = transaction;
                retrying = true;
                const block = await withRetry(() => getAction(client, getBlock, "getBlock")({
                  blockNumber,
                  includeTransactions: true
                }), {
                  delay: retryDelay,
                  retryCount,
                  shouldRetry: ({ error }) => error instanceof BlockNotFoundError
                });
                retrying = false;
                const replacementTransaction = block.transactions.find(({ from: from14, nonce }) => from14 === replacedTransaction.from && nonce === replacedTransaction.nonce);
                if (!replacementTransaction)
                  return;
                receipt = await getAction(client, getTransactionReceipt, "getTransactionReceipt")({
                  hash: replacementTransaction.hash
                });
                if (confirmations > 1 && (!receipt.blockNumber || blockNumber - receipt.blockNumber + 1n < confirmations))
                  return;
                let reason = "replaced";
                if (replacementTransaction.to === replacedTransaction.to && replacementTransaction.value === replacedTransaction.value && replacementTransaction.input === replacedTransaction.input) {
                  reason = "repriced";
                } else if (replacementTransaction.from === replacementTransaction.to && replacementTransaction.value === 0n) {
                  reason = "cancelled";
                }
                done(() => {
                  emit.onReplaced?.({
                    reason,
                    replacedTransaction,
                    transaction: replacementTransaction,
                    transactionReceipt: receipt
                  });
                  emit.resolve(receipt);
                });
              } catch (err_) {
                done(() => emit.reject(err_));
              }
            } else {
              done(() => emit.reject(err));
            }
          }
        }
      });
    });
    return promise;
  }
  var init_waitForTransactionReceipt = __esm({
    "node_modules/viem/_esm/actions/public/waitForTransactionReceipt.js"() {
      init_block();
      init_transaction();
      init_getAction();
      init_observe();
      init_withResolvers();
      init_withRetry();
      init_stringify();
      init_getBlock();
      init_getTransaction();
      init_getTransactionReceipt();
      init_watchBlockNumber();
    }
  });

  // node_modules/viem/_esm/actions/public/watchBlocks.js
  function watchBlocks(client, { blockTag = client.experimental_blockTag ?? "latest", emitMissed = false, emitOnBegin = false, onBlock, onError, includeTransactions: includeTransactions_, poll: poll_, pollingInterval = client.pollingInterval }) {
    const enablePolling = (() => {
      if (typeof poll_ !== "undefined")
        return poll_;
      if (client.transport.type === "webSocket" || client.transport.type === "ipc")
        return false;
      if (client.transport.type === "fallback" && (client.transport.transports[0].config.type === "webSocket" || client.transport.transports[0].config.type === "ipc"))
        return false;
      return true;
    })();
    const includeTransactions = includeTransactions_ ?? false;
    let prevBlock;
    const pollBlocks = () => {
      const observerId = stringify([
        "watchBlocks",
        client.uid,
        blockTag,
        emitMissed,
        emitOnBegin,
        includeTransactions,
        pollingInterval
      ]);
      return observe(observerId, { onBlock, onError }, (emit) => poll(async () => {
        try {
          const block = await getAction(client, getBlock, "getBlock")({
            blockTag,
            includeTransactions
          });
          if (block.number !== null && prevBlock?.number != null) {
            if (block.number === prevBlock.number)
              return;
            if (block.number - prevBlock.number > 1 && emitMissed) {
              for (let i = prevBlock?.number + 1n; i < block.number; i++) {
                const block2 = await getAction(client, getBlock, "getBlock")({
                  blockNumber: i,
                  includeTransactions
                });
                emit.onBlock(block2, prevBlock);
                prevBlock = block2;
              }
            }
          }
          if (
            // If no previous block exists, emit.
            prevBlock?.number == null || // If the block tag is "pending" with no block number, emit.
            blockTag === "pending" && block?.number == null || // If the next block number is greater than the previous block number, emit.
            // We don't want to emit blocks in the past.
            block.number !== null && block.number > prevBlock.number
          ) {
            emit.onBlock(block, prevBlock);
            prevBlock = block;
          }
        } catch (err) {
          emit.onError?.(err);
        }
      }, {
        emitOnBegin,
        interval: pollingInterval
      }));
    };
    const subscribeBlocks = () => {
      let active = true;
      let emitFetched = true;
      let unsubscribe = () => active = false;
      (async () => {
        try {
          if (emitOnBegin) {
            getAction(client, getBlock, "getBlock")({
              blockTag,
              includeTransactions
            }).then((block) => {
              if (!active)
                return;
              if (!emitFetched)
                return;
              onBlock(block, void 0);
              emitFetched = false;
            }).catch(onError);
          }
          const transport = (() => {
            if (client.transport.type === "fallback") {
              const transport2 = client.transport.transports.find((transport3) => transport3.config.type === "webSocket" || transport3.config.type === "ipc");
              if (!transport2)
                return client.transport;
              return transport2.value;
            }
            return client.transport;
          })();
          const { unsubscribe: unsubscribe_ } = await transport.subscribe({
            params: ["newHeads"],
            async onData(data) {
              if (!active)
                return;
              const block = await getAction(client, getBlock, "getBlock")({
                blockNumber: data.result?.number,
                includeTransactions
              }).catch(() => {
              });
              if (!active)
                return;
              onBlock(block, prevBlock);
              emitFetched = false;
              prevBlock = block;
            },
            onError(error) {
              onError?.(error);
            }
          });
          unsubscribe = unsubscribe_;
          if (!active)
            unsubscribe();
        } catch (err) {
          onError?.(err);
        }
      })();
      return () => unsubscribe();
    };
    return enablePolling ? pollBlocks() : subscribeBlocks();
  }
  var init_watchBlocks = __esm({
    "node_modules/viem/_esm/actions/public/watchBlocks.js"() {
      init_getAction();
      init_observe();
      init_poll();
      init_stringify();
      init_getBlock();
    }
  });

  // node_modules/viem/_esm/actions/public/watchEvent.js
  function watchEvent(client, { address, args, batch = true, event, events, fromBlock, onError, onLogs, poll: poll_, pollingInterval = client.pollingInterval, strict: strict_ }) {
    const enablePolling = (() => {
      if (typeof poll_ !== "undefined")
        return poll_;
      if (typeof fromBlock === "bigint")
        return true;
      if (client.transport.type === "webSocket" || client.transport.type === "ipc")
        return false;
      if (client.transport.type === "fallback" && (client.transport.transports[0].config.type === "webSocket" || client.transport.transports[0].config.type === "ipc"))
        return false;
      return true;
    })();
    const strict = strict_ ?? false;
    const pollEvent = () => {
      const observerId = stringify([
        "watchEvent",
        address,
        args,
        batch,
        client.uid,
        event,
        pollingInterval,
        fromBlock
      ]);
      return observe(observerId, { onLogs, onError }, (emit) => {
        let previousBlockNumber;
        if (fromBlock !== void 0)
          previousBlockNumber = fromBlock - 1n;
        let filter;
        let initialized = false;
        const unwatch = poll(async () => {
          if (!initialized) {
            try {
              filter = await getAction(client, createEventFilter, "createEventFilter")({
                address,
                args,
                event,
                events,
                strict,
                fromBlock
              });
            } catch {
            }
            initialized = true;
            return;
          }
          try {
            let logs;
            if (filter) {
              logs = await getAction(client, getFilterChanges, "getFilterChanges")({ filter });
            } else {
              const blockNumber = await getAction(client, getBlockNumber, "getBlockNumber")({});
              if (previousBlockNumber && previousBlockNumber !== blockNumber) {
                logs = await getAction(client, getLogs, "getLogs")({
                  address,
                  args,
                  event,
                  events,
                  fromBlock: previousBlockNumber + 1n,
                  toBlock: blockNumber
                });
              } else {
                logs = [];
              }
              previousBlockNumber = blockNumber;
            }
            if (logs.length === 0)
              return;
            if (batch)
              emit.onLogs(logs);
            else
              for (const log of logs)
                emit.onLogs([log]);
          } catch (err) {
            if (filter && err instanceof InvalidInputRpcError)
              initialized = false;
            emit.onError?.(err);
          }
        }, {
          emitOnBegin: true,
          interval: pollingInterval
        });
        return async () => {
          if (filter)
            await getAction(client, uninstallFilter, "uninstallFilter")({ filter });
          unwatch();
        };
      });
    };
    const subscribeEvent = () => {
      let active = true;
      let unsubscribe = () => active = false;
      (async () => {
        try {
          const transport = (() => {
            if (client.transport.type === "fallback") {
              const transport2 = client.transport.transports.find((transport3) => transport3.config.type === "webSocket" || transport3.config.type === "ipc");
              if (!transport2)
                return client.transport;
              return transport2.value;
            }
            return client.transport;
          })();
          const events_ = events ?? (event ? [event] : void 0);
          let topics = [];
          if (events_) {
            const encoded = events_.flatMap((event2) => encodeEventTopics({
              abi: [event2],
              eventName: event2.name,
              args
            }));
            topics = [encoded];
            if (event)
              topics = topics[0];
          }
          const { unsubscribe: unsubscribe_ } = await transport.subscribe({
            params: ["logs", { address, topics }],
            onData(data) {
              if (!active)
                return;
              const log = data.result;
              try {
                const { eventName, args: args2 } = decodeEventLog({
                  abi: events_ ?? [],
                  data: log.data,
                  topics: log.topics,
                  strict
                });
                const formatted = formatLog(log, { args: args2, eventName });
                onLogs([formatted]);
              } catch (err) {
                let eventName;
                let isUnnamed;
                if (err instanceof DecodeLogDataMismatch || err instanceof DecodeLogTopicsMismatch) {
                  if (strict_)
                    return;
                  eventName = err.abiItem.name;
                  isUnnamed = err.abiItem.inputs?.some((x) => !("name" in x && x.name));
                }
                const formatted = formatLog(log, {
                  args: isUnnamed ? [] : {},
                  eventName
                });
                onLogs([formatted]);
              }
            },
            onError(error) {
              onError?.(error);
            }
          });
          unsubscribe = unsubscribe_;
          if (!active)
            unsubscribe();
        } catch (err) {
          onError?.(err);
        }
      })();
      return () => unsubscribe();
    };
    return enablePolling ? pollEvent() : subscribeEvent();
  }
  var init_watchEvent = __esm({
    "node_modules/viem/_esm/actions/public/watchEvent.js"() {
      init_abi();
      init_rpc();
      init_decodeEventLog();
      init_encodeEventTopics();
      init_log2();
      init_getAction();
      init_observe();
      init_poll();
      init_stringify();
      init_createEventFilter();
      init_getBlockNumber();
      init_getFilterChanges();
      init_getLogs();
      init_uninstallFilter();
    }
  });

  // node_modules/viem/_esm/actions/public/watchPendingTransactions.js
  function watchPendingTransactions(client, { batch = true, onError, onTransactions, poll: poll_, pollingInterval = client.pollingInterval }) {
    const enablePolling = typeof poll_ !== "undefined" ? poll_ : client.transport.type !== "webSocket" && client.transport.type !== "ipc";
    const pollPendingTransactions = () => {
      const observerId = stringify([
        "watchPendingTransactions",
        client.uid,
        batch,
        pollingInterval
      ]);
      return observe(observerId, { onTransactions, onError }, (emit) => {
        let filter;
        const unwatch = poll(async () => {
          try {
            if (!filter) {
              try {
                filter = await getAction(client, createPendingTransactionFilter, "createPendingTransactionFilter")({});
                return;
              } catch (err) {
                unwatch();
                throw err;
              }
            }
            const hashes = await getAction(client, getFilterChanges, "getFilterChanges")({ filter });
            if (hashes.length === 0)
              return;
            if (batch)
              emit.onTransactions(hashes);
            else
              for (const hash3 of hashes)
                emit.onTransactions([hash3]);
          } catch (err) {
            emit.onError?.(err);
          }
        }, {
          emitOnBegin: true,
          interval: pollingInterval
        });
        return async () => {
          if (filter)
            await getAction(client, uninstallFilter, "uninstallFilter")({ filter });
          unwatch();
        };
      });
    };
    const subscribePendingTransactions = () => {
      let active = true;
      let unsubscribe = () => active = false;
      (async () => {
        try {
          const { unsubscribe: unsubscribe_ } = await client.transport.subscribe({
            params: ["newPendingTransactions"],
            onData(data) {
              if (!active)
                return;
              const transaction = data.result;
              onTransactions([transaction]);
            },
            onError(error) {
              onError?.(error);
            }
          });
          unsubscribe = unsubscribe_;
          if (!active)
            unsubscribe();
        } catch (err) {
          onError?.(err);
        }
      })();
      return () => unsubscribe();
    };
    return enablePolling ? pollPendingTransactions() : subscribePendingTransactions();
  }
  var init_watchPendingTransactions = __esm({
    "node_modules/viem/_esm/actions/public/watchPendingTransactions.js"() {
      init_getAction();
      init_observe();
      init_poll();
      init_stringify();
      init_createPendingTransactionFilter();
      init_getFilterChanges();
      init_uninstallFilter();
    }
  });

  // node_modules/viem/_esm/utils/siwe/parseSiweMessage.js
  function parseSiweMessage(message) {
    const { scheme, statement, ...prefix } = message.match(prefixRegex)?.groups ?? {};
    const { chainId, expirationTime, issuedAt, notBefore, requestId, ...suffix } = message.match(suffixRegex)?.groups ?? {};
    const resources = message.split("Resources:")[1]?.split("\n- ").slice(1);
    return {
      ...prefix,
      ...suffix,
      ...chainId ? { chainId: Number(chainId) } : {},
      ...expirationTime ? { expirationTime: new Date(expirationTime) } : {},
      ...issuedAt ? { issuedAt: new Date(issuedAt) } : {},
      ...notBefore ? { notBefore: new Date(notBefore) } : {},
      ...requestId ? { requestId } : {},
      ...resources ? { resources } : {},
      ...scheme ? { scheme } : {},
      ...statement ? { statement } : {}
    };
  }
  var prefixRegex, suffixRegex;
  var init_parseSiweMessage = __esm({
    "node_modules/viem/_esm/utils/siwe/parseSiweMessage.js"() {
      prefixRegex = /^(?:(?<scheme>[a-zA-Z][a-zA-Z0-9+-.]*):\/\/)?(?<domain>[a-zA-Z0-9+-.]*(?::[0-9]{1,5})?) (?:wants you to sign in with your Ethereum account:\n)(?<address>0x[a-fA-F0-9]{40})\n\n(?:(?<statement>.*)\n\n)?/;
      suffixRegex = /(?:URI: (?<uri>.+))\n(?:Version: (?<version>.+))\n(?:Chain ID: (?<chainId>\d+))\n(?:Nonce: (?<nonce>[a-zA-Z0-9]+))\n(?:Issued At: (?<issuedAt>.+))(?:\nExpiration Time: (?<expirationTime>.+))?(?:\nNot Before: (?<notBefore>.+))?(?:\nRequest ID: (?<requestId>.+))?/;
    }
  });

  // node_modules/viem/_esm/utils/siwe/validateSiweMessage.js
  function validateSiweMessage(parameters) {
    const { address, domain, message, nonce, scheme, time = /* @__PURE__ */ new Date() } = parameters;
    if (domain && message.domain !== domain)
      return false;
    if (nonce && message.nonce !== nonce)
      return false;
    if (scheme && message.scheme !== scheme)
      return false;
    if (message.expirationTime && time >= message.expirationTime)
      return false;
    if (message.notBefore && time < message.notBefore)
      return false;
    try {
      if (!message.address)
        return false;
      if (!isAddress(message.address, { strict: false }))
        return false;
      if (address && !isAddressEqual(message.address, address))
        return false;
    } catch {
      return false;
    }
    return true;
  }
  var init_validateSiweMessage = __esm({
    "node_modules/viem/_esm/utils/siwe/validateSiweMessage.js"() {
      init_isAddress();
      init_isAddressEqual();
    }
  });

  // node_modules/viem/_esm/actions/siwe/verifySiweMessage.js
  async function verifySiweMessage(client, parameters) {
    const { address, domain, message, nonce, scheme, signature, time = /* @__PURE__ */ new Date(), ...callRequest } = parameters;
    const parsed = parseSiweMessage(message);
    if (!parsed.address)
      return false;
    const isValid = validateSiweMessage({
      address,
      domain,
      message: parsed,
      nonce,
      scheme,
      time
    });
    if (!isValid)
      return false;
    const hash3 = hashMessage(message);
    return verifyHash(client, {
      address: parsed.address,
      hash: hash3,
      signature,
      ...callRequest
    });
  }
  var init_verifySiweMessage = __esm({
    "node_modules/viem/_esm/actions/siwe/verifySiweMessage.js"() {
      init_hashMessage();
      init_parseSiweMessage();
      init_validateSiweMessage();
      init_verifyHash();
    }
  });

  // node_modules/viem/_esm/actions/wallet/sendRawTransactionSync.js
  async function sendRawTransactionSync(client, { serializedTransaction, throwOnReceiptRevert, timeout }) {
    const receipt = await client.request({
      method: "eth_sendRawTransactionSync",
      params: timeout ? [serializedTransaction, numberToHex(timeout)] : [serializedTransaction]
    }, { retryCount: 0 });
    const format = client.chain?.formatters?.transactionReceipt?.format || formatTransactionReceipt;
    const formatted = format(receipt);
    if (formatted.status === "reverted" && throwOnReceiptRevert)
      throw new TransactionReceiptRevertedError({ receipt: formatted });
    return formatted;
  }
  var init_sendRawTransactionSync = __esm({
    "node_modules/viem/_esm/actions/wallet/sendRawTransactionSync.js"() {
      init_transaction();
      init_transactionReceipt();
      init_utils7();
    }
  });

  // node_modules/viem/_esm/clients/decorators/public.js
  function publicActions(client) {
    return {
      call: (args) => call(client, args),
      createAccessList: (args) => createAccessList(client, args),
      createBlockFilter: () => createBlockFilter(client),
      createContractEventFilter: (args) => createContractEventFilter(client, args),
      createEventFilter: (args) => createEventFilter(client, args),
      createPendingTransactionFilter: () => createPendingTransactionFilter(client),
      estimateContractGas: (args) => estimateContractGas(client, args),
      estimateGas: (args) => estimateGas(client, args),
      getBalance: (args) => getBalance(client, args),
      getBlobBaseFee: () => getBlobBaseFee(client),
      getBlock: (args) => getBlock(client, args),
      getBlockNumber: (args) => getBlockNumber(client, args),
      getBlockTransactionCount: (args) => getBlockTransactionCount(client, args),
      getBytecode: (args) => getCode(client, args),
      getChainId: () => getChainId(client),
      getCode: (args) => getCode(client, args),
      getContractEvents: (args) => getContractEvents(client, args),
      getEip712Domain: (args) => getEip712Domain(client, args),
      getEnsAddress: (args) => getEnsAddress(client, args),
      getEnsAvatar: (args) => getEnsAvatar(client, args),
      getEnsName: (args) => getEnsName(client, args),
      getEnsResolver: (args) => getEnsResolver(client, args),
      getEnsText: (args) => getEnsText(client, args),
      getFeeHistory: (args) => getFeeHistory(client, args),
      estimateFeesPerGas: (args) => estimateFeesPerGas(client, args),
      getFilterChanges: (args) => getFilterChanges(client, args),
      getFilterLogs: (args) => getFilterLogs(client, args),
      getGasPrice: () => getGasPrice(client),
      getLogs: (args) => getLogs(client, args),
      getProof: (args) => getProof(client, args),
      estimateMaxPriorityFeePerGas: (args) => estimateMaxPriorityFeePerGas(client, args),
      getStorageAt: (args) => getStorageAt(client, args),
      getTransaction: (args) => getTransaction(client, args),
      getTransactionConfirmations: (args) => getTransactionConfirmations(client, args),
      getTransactionCount: (args) => getTransactionCount(client, args),
      getTransactionReceipt: (args) => getTransactionReceipt(client, args),
      multicall: (args) => multicall(client, args),
      prepareTransactionRequest: (args) => prepareTransactionRequest(client, args),
      readContract: (args) => readContract(client, args),
      sendRawTransaction: (args) => sendRawTransaction(client, args),
      sendRawTransactionSync: (args) => sendRawTransactionSync(client, args),
      simulate: (args) => simulateBlocks(client, args),
      simulateBlocks: (args) => simulateBlocks(client, args),
      simulateCalls: (args) => simulateCalls(client, args),
      simulateContract: (args) => simulateContract(client, args),
      verifyHash: (args) => verifyHash(client, args),
      verifyMessage: (args) => verifyMessage(client, args),
      verifySiweMessage: (args) => verifySiweMessage(client, args),
      verifyTypedData: (args) => verifyTypedData(client, args),
      uninstallFilter: (args) => uninstallFilter(client, args),
      waitForTransactionReceipt: (args) => waitForTransactionReceipt(client, args),
      watchBlocks: (args) => watchBlocks(client, args),
      watchBlockNumber: (args) => watchBlockNumber(client, args),
      watchContractEvent: (args) => watchContractEvent(client, args),
      watchEvent: (args) => watchEvent(client, args),
      watchPendingTransactions: (args) => watchPendingTransactions(client, args)
    };
  }
  var init_public = __esm({
    "node_modules/viem/_esm/clients/decorators/public.js"() {
      init_getEnsAddress();
      init_getEnsAvatar();
      init_getEnsName();
      init_getEnsResolver();
      init_getEnsText();
      init_call();
      init_createAccessList();
      init_createBlockFilter();
      init_createContractEventFilter();
      init_createEventFilter();
      init_createPendingTransactionFilter();
      init_estimateContractGas();
      init_estimateFeesPerGas();
      init_estimateGas2();
      init_estimateMaxPriorityFeePerGas();
      init_getBalance();
      init_getBlobBaseFee();
      init_getBlock();
      init_getBlockNumber();
      init_getBlockTransactionCount();
      init_getChainId();
      init_getCode();
      init_getContractEvents();
      init_getEip712Domain();
      init_getFeeHistory();
      init_getFilterChanges();
      init_getFilterLogs();
      init_getGasPrice();
      init_getLogs();
      init_getProof();
      init_getStorageAt();
      init_getTransaction();
      init_getTransactionConfirmations();
      init_getTransactionCount();
      init_getTransactionReceipt();
      init_multicall();
      init_readContract();
      init_simulateBlocks();
      init_simulateCalls();
      init_simulateContract();
      init_uninstallFilter();
      init_verifyHash();
      init_verifyMessage();
      init_verifyTypedData();
      init_waitForTransactionReceipt();
      init_watchBlockNumber();
      init_watchBlocks();
      init_watchContractEvent();
      init_watchEvent();
      init_watchPendingTransactions();
      init_verifySiweMessage();
      init_prepareTransactionRequest();
      init_sendRawTransaction();
      init_sendRawTransactionSync();
    }
  });

  // node_modules/viem/_esm/clients/createPublicClient.js
  function createPublicClient(parameters) {
    const { key = "public", name = "Public Client" } = parameters;
    const client = createClient({
      ...parameters,
      key,
      name,
      type: "publicClient"
    });
    return client.extend(publicActions);
  }
  var init_createPublicClient = __esm({
    "node_modules/viem/_esm/clients/createPublicClient.js"() {
      init_createClient();
      init_public();
    }
  });

  // node_modules/viem/_esm/actions/wallet/prepareAuthorization.js
  async function prepareAuthorization(client, parameters) {
    const { account: account_ = client.account, chainId, nonce } = parameters;
    if (!account_)
      throw new AccountNotFoundError({
        docsPath: "/docs/eip7702/prepareAuthorization"
      });
    const account = parseAccount(account_);
    const executor = (() => {
      if (!parameters.executor)
        return void 0;
      if (parameters.executor === "self")
        return parameters.executor;
      return parseAccount(parameters.executor);
    })();
    const authorization = {
      address: parameters.contractAddress ?? parameters.address,
      chainId,
      nonce
    };
    if (typeof authorization.chainId === "undefined")
      authorization.chainId = client.chain?.id ?? await getAction(client, getChainId, "getChainId")({});
    if (typeof authorization.nonce === "undefined") {
      authorization.nonce = await getAction(client, getTransactionCount, "getTransactionCount")({
        address: account.address,
        blockTag: "pending"
      });
      if (executor === "self" || executor?.address && isAddressEqual(executor.address, account.address))
        authorization.nonce += 1;
    }
    return authorization;
  }
  var init_prepareAuthorization = __esm({
    "node_modules/viem/_esm/actions/wallet/prepareAuthorization.js"() {
      init_parseAccount();
      init_account();
      init_isAddressEqual();
      init_getAction();
      init_getChainId();
      init_getTransactionCount();
    }
  });

  // node_modules/viem/_esm/clients/transports/createTransport.js
  function createTransport({ key, methods, name, request, retryCount = 3, retryDelay = 150, timeout, type }, value) {
    const uid2 = uid();
    return {
      config: {
        key,
        methods,
        name,
        request,
        retryCount,
        retryDelay,
        timeout,
        type
      },
      request: buildRequest(request, { methods, retryCount, retryDelay, uid: uid2 }),
      value
    };
  }
  var init_createTransport = __esm({
    "node_modules/viem/_esm/clients/transports/createTransport.js"() {
      init_buildRequest();
      init_uid();
    }
  });

  // node_modules/viem/_esm/errors/transport.js
  var UrlRequiredError;
  var init_transport = __esm({
    "node_modules/viem/_esm/errors/transport.js"() {
      init_base();
      UrlRequiredError = class extends BaseError2 {
        constructor() {
          super("No URL was provided to the Transport. Please provide a valid RPC URL to the Transport.", {
            docsPath: "/docs/clients/intro",
            name: "UrlRequiredError"
          });
        }
      };
    }
  });

  // node_modules/viem/_esm/clients/transports/http.js
  function http(url, config = {}) {
    const { batch, fetchFn, fetchOptions, key = "http", methods, name = "HTTP JSON-RPC", onFetchRequest, onFetchResponse, retryDelay, raw } = config;
    return ({ chain, retryCount: retryCount_, timeout: timeout_ }) => {
      const { batchSize = 1e3, wait: wait2 = 0 } = typeof batch === "object" ? batch : {};
      const retryCount = config.retryCount ?? retryCount_;
      const timeout = timeout_ ?? config.timeout ?? 1e4;
      const url_ = url || chain?.rpcUrls.default.http[0];
      if (!url_)
        throw new UrlRequiredError();
      const rpcClient = getHttpRpcClient(url_, {
        fetchFn,
        fetchOptions,
        onRequest: onFetchRequest,
        onResponse: onFetchResponse,
        timeout
      });
      return createTransport({
        key,
        methods,
        name,
        async request({ method, params }) {
          const body = { method, params };
          const { schedule } = createBatchScheduler({
            id: url_,
            wait: wait2,
            shouldSplitBatch(requests) {
              return requests.length > batchSize;
            },
            fn: (body2) => rpcClient.request({
              body: body2
            }),
            sort: (a, b) => a.id - b.id
          });
          const fn = async (body2) => batch ? schedule(body2) : [
            await rpcClient.request({
              body: body2
            })
          ];
          const [{ error, result }] = await fn(body);
          if (raw)
            return { error, result };
          if (error)
            throw new RpcRequestError({
              body,
              error,
              url: url_
            });
          return result;
        },
        retryCount,
        retryDelay,
        timeout,
        type: "http"
      }, {
        fetchOptions,
        url: url_
      });
    };
  }
  var init_http2 = __esm({
    "node_modules/viem/_esm/clients/transports/http.js"() {
      init_request();
      init_transport();
      init_createBatchScheduler();
      init_http();
      init_createTransport();
    }
  });

  // node_modules/viem/_esm/utils/signature/parseSignature.js
  function parseSignature2(signatureHex) {
    const { r, s } = secp256k1.Signature.fromCompact(signatureHex.slice(2, 130));
    const yParityOrV = Number(`0x${signatureHex.slice(130)}`);
    const [v, yParity] = (() => {
      if (yParityOrV === 0 || yParityOrV === 1)
        return [void 0, yParityOrV];
      if (yParityOrV === 27)
        return [BigInt(yParityOrV), 0];
      if (yParityOrV === 28)
        return [BigInt(yParityOrV), 1];
      throw new Error("Invalid yParityOrV value");
    })();
    if (typeof v !== "undefined")
      return {
        r: numberToHex(r, { size: 32 }),
        s: numberToHex(s, { size: 32 }),
        v,
        yParity
      };
    return {
      r: numberToHex(r, { size: 32 }),
      s: numberToHex(s, { size: 32 }),
      yParity
    };
  }
  var init_parseSignature = __esm({
    "node_modules/viem/_esm/utils/signature/parseSignature.js"() {
      init_secp256k1();
      init_toHex();
    }
  });

  // node_modules/viem/_esm/index.js
  var init_esm = __esm({
    "node_modules/viem/_esm/index.js"() {
      init_createPublicClient();
      init_http2();
      init_abis();
      init_encodeFunctionData();
      init_toBytes();
      init_keccak256();
      init_formatEther();
      init_formatUnits();
      init_parseUnits();
    }
  });

  // node_modules/viem/_esm/op-stack/contracts.js
  var contracts;
  var init_contracts2 = __esm({
    "node_modules/viem/_esm/op-stack/contracts.js"() {
      contracts = {
        gasPriceOracle: { address: "0x420000000000000000000000000000000000000F" },
        l1Block: { address: "0x4200000000000000000000000000000000000015" },
        l2CrossDomainMessenger: {
          address: "0x4200000000000000000000000000000000000007"
        },
        l2Erc721Bridge: { address: "0x4200000000000000000000000000000000000014" },
        l2StandardBridge: { address: "0x4200000000000000000000000000000000000010" },
        l2ToL1MessagePasser: {
          address: "0x4200000000000000000000000000000000000016"
        }
      };
    }
  });

  // node_modules/viem/_esm/op-stack/formatters.js
  var formatters;
  var init_formatters = __esm({
    "node_modules/viem/_esm/op-stack/formatters.js"() {
      init_fromHex();
      init_block2();
      init_transaction2();
      init_transactionReceipt();
      formatters = {
        block: /* @__PURE__ */ defineBlock({
          format(args) {
            const transactions = args.transactions?.map((transaction) => {
              if (typeof transaction === "string")
                return transaction;
              const formatted = formatTransaction(transaction);
              if (formatted.typeHex === "0x7e") {
                formatted.isSystemTx = transaction.isSystemTx;
                formatted.mint = transaction.mint ? hexToBigInt(transaction.mint) : void 0;
                formatted.sourceHash = transaction.sourceHash;
                formatted.type = "deposit";
              }
              return formatted;
            });
            return {
              transactions,
              stateRoot: args.stateRoot
            };
          }
        }),
        transaction: /* @__PURE__ */ defineTransaction({
          format(args) {
            const transaction = {};
            if (args.type === "0x7e") {
              transaction.isSystemTx = args.isSystemTx;
              transaction.mint = args.mint ? hexToBigInt(args.mint) : void 0;
              transaction.sourceHash = args.sourceHash;
              transaction.type = "deposit";
            }
            return transaction;
          }
        }),
        transactionReceipt: /* @__PURE__ */ defineTransactionReceipt({
          format(args) {
            return {
              l1GasPrice: args.l1GasPrice ? hexToBigInt(args.l1GasPrice) : null,
              l1GasUsed: args.l1GasUsed ? hexToBigInt(args.l1GasUsed) : null,
              l1Fee: args.l1Fee ? hexToBigInt(args.l1Fee) : null,
              l1FeeScalar: args.l1FeeScalar ? Number(args.l1FeeScalar) : null
            };
          }
        })
      };
    }
  });

  // node_modules/viem/_esm/op-stack/serializers.js
  function serializeTransaction2(transaction, signature) {
    if (isDeposit(transaction))
      return serializeTransactionDeposit(transaction);
    return serializeTransaction(transaction, signature);
  }
  function serializeTransactionDeposit(transaction) {
    assertTransactionDeposit(transaction);
    const { sourceHash, data, from: from14, gas, isSystemTx, mint, to, value } = transaction;
    const serializedTransaction = [
      sourceHash,
      from14,
      to ?? "0x",
      mint ? toHex(mint) : "0x",
      value ? toHex(value) : "0x",
      gas ? toHex(gas) : "0x",
      isSystemTx ? "0x1" : "0x",
      data ?? "0x"
    ];
    return concatHex([
      "0x7e",
      toRlp(serializedTransaction)
    ]);
  }
  function isDeposit(transaction) {
    if (transaction.type === "deposit")
      return true;
    if (typeof transaction.sourceHash !== "undefined")
      return true;
    return false;
  }
  function assertTransactionDeposit(transaction) {
    const { from: from14, to } = transaction;
    if (from14 && !isAddress(from14))
      throw new InvalidAddressError({ address: from14 });
    if (to && !isAddress(to))
      throw new InvalidAddressError({ address: to });
  }
  var serializers;
  var init_serializers = __esm({
    "node_modules/viem/_esm/op-stack/serializers.js"() {
      init_address();
      init_isAddress();
      init_concat();
      init_toHex();
      init_toRlp();
      init_serializeTransaction();
      serializers = {
        transaction: serializeTransaction2
      };
    }
  });

  // node_modules/viem/_esm/op-stack/chainConfig.js
  var chainConfig;
  var init_chainConfig = __esm({
    "node_modules/viem/_esm/op-stack/chainConfig.js"() {
      init_contracts2();
      init_formatters();
      init_serializers();
      chainConfig = {
        blockTime: 2e3,
        contracts,
        formatters,
        serializers
      };
    }
  });

  // node_modules/viem/_esm/chains/definitions/baseSepolia.js
  var sourceId, baseSepolia, baseSepoliaPreconf;
  var init_baseSepolia = __esm({
    "node_modules/viem/_esm/chains/definitions/baseSepolia.js"() {
      init_chainConfig();
      init_defineChain();
      sourceId = 11155111;
      baseSepolia = /* @__PURE__ */ defineChain({
        ...chainConfig,
        id: 84532,
        network: "base-sepolia",
        name: "Base Sepolia",
        nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
        rpcUrls: {
          default: {
            http: ["https://sepolia.base.org"]
          }
        },
        blockExplorers: {
          default: {
            name: "Basescan",
            url: "https://sepolia.basescan.org",
            apiUrl: "https://api-sepolia.basescan.org/api"
          }
        },
        contracts: {
          ...chainConfig.contracts,
          disputeGameFactory: {
            [sourceId]: {
              address: "0xd6E6dBf4F7EA0ac412fD8b65ED297e64BB7a06E1"
            }
          },
          l2OutputOracle: {
            [sourceId]: {
              address: "0x84457ca9D0163FbC4bbfe4Dfbb20ba46e48DF254"
            }
          },
          portal: {
            [sourceId]: {
              address: "0x49f53e41452c74589e85ca1677426ba426459e85",
              blockCreated: 4446677
            }
          },
          l1StandardBridge: {
            [sourceId]: {
              address: "0xfd0Bf71F60660E2f608ed56e1659C450eB113120",
              blockCreated: 4446677
            }
          },
          multicall3: {
            address: "0xca11bde05977b3631167028862be2a173976ca11",
            blockCreated: 1059647
          }
        },
        testnet: true,
        sourceId
      });
      baseSepoliaPreconf = /* @__PURE__ */ defineChain({
        ...baseSepolia,
        experimental_preconfirmationTime: 200,
        rpcUrls: {
          default: {
            http: ["https://sepolia-preconf.base.org"]
          }
        }
      });
    }
  });

  // node_modules/viem/_esm/chains/index.js
  var init_chains = __esm({
    "node_modules/viem/_esm/chains/index.js"() {
      init_baseSepolia();
    }
  });

  // node_modules/ox/_esm/core/Base64.js
  function toBytes4(value) {
    const base64 = value.replace(/=+$/, "");
    const size5 = base64.length;
    const decoded = new Uint8Array(size5 + 3);
    encoder5.encodeInto(base64 + "===", decoded);
    for (let i = 0, j = 0; i < base64.length; i += 4, j += 3) {
      const x = (characterToInteger[decoded[i]] << 18) + (characterToInteger[decoded[i + 1]] << 12) + (characterToInteger[decoded[i + 2]] << 6) + characterToInteger[decoded[i + 3]];
      decoded[j] = x >> 16;
      decoded[j + 1] = x >> 8 & 255;
      decoded[j + 2] = x & 255;
    }
    const decodedSize = (size5 >> 2) * 3 + (size5 % 4 && size5 % 4 - 1);
    return new Uint8Array(decoded.buffer, 0, decodedSize);
  }
  var encoder5, integerToCharacter, characterToInteger;
  var init_Base64 = __esm({
    "node_modules/ox/_esm/core/Base64.js"() {
      encoder5 = /* @__PURE__ */ new TextEncoder();
      integerToCharacter = /* @__PURE__ */ Object.fromEntries(Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/").map((a, i) => [i, a.charCodeAt(0)]));
      characterToInteger = {
        ...Object.fromEntries(Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/").map((a, i) => [a.charCodeAt(0), i])),
        ["=".charCodeAt(0)]: 0,
        ["-".charCodeAt(0)]: 62,
        ["_".charCodeAt(0)]: 63
      };
    }
  });

  // node_modules/ox/node_modules/@noble/curves/esm/nist.js
  var Fp256, p256_a, p256_b, p256, Fp384, p384_a, p384_b, p384, Fp521, p521_a, p521_b, p521;
  var init_nist = __esm({
    "node_modules/ox/node_modules/@noble/curves/esm/nist.js"() {
      init_sha2();
      init_shortw_utils2();
      init_modular2();
      Fp256 = Field2(BigInt("0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff"));
      p256_a = Fp256.create(BigInt("-3"));
      p256_b = BigInt("0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b");
      p256 = createCurve2({
        a: p256_a,
        b: p256_b,
        Fp: Fp256,
        n: BigInt("0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551"),
        Gx: BigInt("0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296"),
        Gy: BigInt("0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5"),
        h: BigInt(1),
        lowS: false
      }, sha256);
      Fp384 = Field2(BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffeffffffff0000000000000000ffffffff"));
      p384_a = Fp384.create(BigInt("-3"));
      p384_b = BigInt("0xb3312fa7e23ee7e4988e056be3f82d19181d9c6efe8141120314088f5013875ac656398d8a2ed19d2a85c8edd3ec2aef");
      p384 = createCurve2({
        a: p384_a,
        b: p384_b,
        Fp: Fp384,
        n: BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffc7634d81f4372ddf581a0db248b0a77aecec196accc52973"),
        Gx: BigInt("0xaa87ca22be8b05378eb1c71ef320ad746e1d3b628ba79b9859f741e082542a385502f25dbf55296c3a545e3872760ab7"),
        Gy: BigInt("0x3617de4a96262c6f5d9e98bf9292dc29f8f41dbd289a147ce9da3113b5f0b8c00a60b1ce1d7e819d7a431d7c90ea0e5f"),
        h: BigInt(1),
        lowS: false
      }, sha384);
      Fp521 = Field2(BigInt("0x1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"));
      p521_a = Fp521.create(BigInt("-3"));
      p521_b = BigInt("0x0051953eb9618e1c9a1f929a21a0b68540eea2da725b99b315f3b8b489918ef109e156193951ec7e937b1652c0bd3bb1bf073573df883d2c34f1ef451fd46b503f00");
      p521 = createCurve2({
        a: p521_a,
        b: p521_b,
        Fp: Fp521,
        n: BigInt("0x01fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa51868783bf2f966b7fcc0148f709a5d03bb5c9b8899c47aebb6fb71e91386409"),
        Gx: BigInt("0x00c6858e06b70404e9cd9e3ecb662395b4429c648139053fb521f828af606b4d3dbaa14b5e77efe75928fe1dc127a2ffa8de3348b3c1856a429bf97e7e31c2e5bd66"),
        Gy: BigInt("0x011839296a789a3bc0045c8a5fb42c7d1bd998f54449579b446817afbd17273e662c97ee72995ef42640c550b9013fad0761353c7086a272c24088be94769fd16650"),
        h: BigInt(1),
        lowS: false,
        allowedPrivateKeyLengths: [130, 131, 132]
        // P521 keys are variable-length. Normalize to 132b
      }, sha512);
    }
  });

  // node_modules/ox/node_modules/@noble/curves/esm/p256.js
  var p2562;
  var init_p256 = __esm({
    "node_modules/ox/node_modules/@noble/curves/esm/p256.js"() {
      init_nist();
      p2562 = p256;
    }
  });

  // node_modules/ox/_esm/core/internal/webauthn.js
  function parseAsn1Signature(bytes) {
    const r_start = bytes[4] === 0 ? 5 : 4;
    const r_end = r_start + 32;
    const s_start = bytes[r_end + 2] === 0 ? r_end + 3 : r_end + 2;
    const r = BigInt(fromBytes(bytes.slice(r_start, r_end)));
    const s = BigInt(fromBytes(bytes.slice(s_start)));
    return {
      r,
      s: s > p2562.CURVE.n / 2n ? p2562.CURVE.n - s : s
    };
  }
  async function parseCredentialPublicKey(response) {
    try {
      const publicKeyBuffer = response.getPublicKey();
      if (!publicKeyBuffer)
        throw new CredentialCreationFailedError();
      const publicKeyBytes = new Uint8Array(publicKeyBuffer);
      const cryptoKey = await crypto.subtle.importKey("spki", new Uint8Array(publicKeyBytes), {
        name: "ECDSA",
        namedCurve: "P-256",
        hash: "SHA-256"
      }, true, ["verify"]);
      const publicKey = new Uint8Array(await crypto.subtle.exportKey("raw", cryptoKey));
      return from3(publicKey);
    } catch (error) {
      if (error.message !== "Permission denied to access object")
        throw error;
      const data = new Uint8Array(response.attestationObject);
      const coordinateLength = 32;
      const cborPrefix = 88;
      const findStart = (key) => {
        const coordinate = new Uint8Array([key, cborPrefix, coordinateLength]);
        for (let i = 0; i < data.length - coordinate.length; i++)
          if (coordinate.every((byte, j) => data[i + j] === byte))
            return i + coordinate.length;
        throw new CredentialCreationFailedError();
      };
      const xStart = findStart(33);
      const yStart = findStart(34);
      return from3(new Uint8Array([
        4,
        ...data.slice(xStart, xStart + coordinateLength),
        ...data.slice(yStart, yStart + coordinateLength)
      ]));
    }
  }
  var init_webauthn = __esm({
    "node_modules/ox/_esm/core/internal/webauthn.js"() {
      init_p256();
      init_Hex();
      init_PublicKey();
      init_WebAuthnP256();
    }
  });

  // node_modules/ox/_esm/core/WebAuthnP256.js
  async function createCredential(options) {
    const { createFn = window.navigator.credentials.create.bind(window.navigator.credentials), ...rest } = options;
    const creationOptions = getCredentialCreationOptions(rest);
    try {
      const credential = await createFn(creationOptions);
      if (!credential)
        throw new CredentialCreationFailedError();
      const response = credential.response;
      const publicKey = await parseCredentialPublicKey(response);
      return {
        id: credential.id,
        publicKey,
        raw: credential
      };
    } catch (error) {
      throw new CredentialCreationFailedError({
        cause: error
      });
    }
  }
  function getCredentialCreationOptions(options) {
    const { attestation = "none", authenticatorSelection = {
      residentKey: "preferred",
      requireResidentKey: false,
      userVerification: "required"
    }, challenge: challenge2 = createChallenge, excludeCredentialIds, extensions, name: name_, rp = {
      id: window.location.hostname,
      name: window.document.title
    }, user } = options;
    const name = user?.name ?? name_;
    return {
      publicKey: {
        attestation,
        authenticatorSelection,
        challenge: challenge2,
        ...excludeCredentialIds ? {
          excludeCredentials: excludeCredentialIds?.map((id) => ({
            id: toBytes4(id),
            type: "public-key"
          }))
        } : {},
        pubKeyCredParams: [
          {
            type: "public-key",
            alg: -7
            // p256
          }
        ],
        ...extensions && { extensions },
        rp,
        user: {
          id: user?.id ?? keccak2562(fromString(name), { as: "Bytes" }),
          name,
          displayName: user?.displayName ?? name
        }
      }
    };
  }
  function getCredentialRequestOptions(options) {
    const { credentialId, challenge: challenge2, extensions, rpId = window.location.hostname, userVerification = "required" } = options;
    return {
      publicKey: {
        ...credentialId ? {
          allowCredentials: Array.isArray(credentialId) ? credentialId.map((id) => ({
            id: toBytes4(id),
            type: "public-key"
          })) : [
            {
              id: toBytes4(credentialId),
              type: "public-key"
            }
          ]
        } : {},
        challenge: fromHex(challenge2),
        ...extensions && { extensions },
        rpId,
        userVerification
      }
    };
  }
  async function sign(options) {
    const { getFn = window.navigator.credentials.get.bind(window.navigator.credentials), ...rest } = options;
    const requestOptions = getCredentialRequestOptions(rest);
    try {
      const credential = await getFn(requestOptions);
      if (!credential)
        throw new CredentialRequestFailedError();
      const response = credential.response;
      const clientDataJSON = String.fromCharCode(...new Uint8Array(response.clientDataJSON));
      const challengeIndex = clientDataJSON.indexOf('"challenge"');
      const typeIndex = clientDataJSON.indexOf('"type"');
      const signature = parseAsn1Signature(new Uint8Array(response.signature));
      return {
        metadata: {
          authenticatorData: fromBytes(new Uint8Array(response.authenticatorData)),
          clientDataJSON,
          challengeIndex,
          typeIndex,
          userVerificationRequired: requestOptions.publicKey.userVerification === "required"
        },
        signature,
        raw: credential
      };
    } catch (error) {
      throw new CredentialRequestFailedError({
        cause: error
      });
    }
  }
  var createChallenge, CredentialCreationFailedError, CredentialRequestFailedError;
  var init_WebAuthnP256 = __esm({
    "node_modules/ox/_esm/core/WebAuthnP256.js"() {
      init_Base64();
      init_Bytes();
      init_Errors();
      init_Hash();
      init_Hex();
      init_webauthn();
      createChallenge = Uint8Array.from([
        105,
        171,
        180,
        181,
        160,
        222,
        75,
        198,
        42,
        42,
        32,
        31,
        141,
        37,
        186,
        233
      ]);
      CredentialCreationFailedError = class extends BaseError3 {
        constructor({ cause } = {}) {
          super("Failed to create credential.", {
            cause
          });
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "WebAuthnP256.CredentialCreationFailedError"
          });
        }
      };
      CredentialRequestFailedError = class extends BaseError3 {
        constructor({ cause } = {}) {
          super("Failed to request credential.", {
            cause
          });
          Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "WebAuthnP256.CredentialRequestFailedError"
          });
        }
      };
    }
  });

  // node_modules/viem/_esm/account-abstraction/accounts/createWebAuthnCredential.js
  async function createWebAuthnCredential(parameters) {
    const credential = await createCredential(parameters);
    return {
      id: credential.id,
      publicKey: toHex2(credential.publicKey, { includePrefix: false }),
      raw: credential.raw
    };
  }
  var init_createWebAuthnCredential = __esm({
    "node_modules/viem/_esm/account-abstraction/accounts/createWebAuthnCredential.js"() {
      init_PublicKey();
      init_WebAuthnP256();
    }
  });

  // node_modules/viem/_esm/account-abstraction/constants/abis.js
  var entryPoint06Abi;
  var init_abis2 = __esm({
    "node_modules/viem/_esm/account-abstraction/constants/abis.js"() {
      entryPoint06Abi = [
        {
          inputs: [
            { name: "preOpGas", type: "uint256" },
            { name: "paid", type: "uint256" },
            { name: "validAfter", type: "uint48" },
            { name: "validUntil", type: "uint48" },
            { name: "targetSuccess", type: "bool" },
            { name: "targetResult", type: "bytes" }
          ],
          name: "ExecutionResult",
          type: "error"
        },
        {
          inputs: [
            { name: "opIndex", type: "uint256" },
            { name: "reason", type: "string" }
          ],
          name: "FailedOp",
          type: "error"
        },
        {
          inputs: [{ name: "sender", type: "address" }],
          name: "SenderAddressResult",
          type: "error"
        },
        {
          inputs: [{ name: "aggregator", type: "address" }],
          name: "SignatureValidationFailed",
          type: "error"
        },
        {
          inputs: [
            {
              components: [
                { name: "preOpGas", type: "uint256" },
                { name: "prefund", type: "uint256" },
                { name: "sigFailed", type: "bool" },
                { name: "validAfter", type: "uint48" },
                { name: "validUntil", type: "uint48" },
                { name: "paymasterContext", type: "bytes" }
              ],
              name: "returnInfo",
              type: "tuple"
            },
            {
              components: [
                { name: "stake", type: "uint256" },
                { name: "unstakeDelaySec", type: "uint256" }
              ],
              name: "senderInfo",
              type: "tuple"
            },
            {
              components: [
                { name: "stake", type: "uint256" },
                { name: "unstakeDelaySec", type: "uint256" }
              ],
              name: "factoryInfo",
              type: "tuple"
            },
            {
              components: [
                { name: "stake", type: "uint256" },
                { name: "unstakeDelaySec", type: "uint256" }
              ],
              name: "paymasterInfo",
              type: "tuple"
            }
          ],
          name: "ValidationResult",
          type: "error"
        },
        {
          inputs: [
            {
              components: [
                { name: "preOpGas", type: "uint256" },
                { name: "prefund", type: "uint256" },
                { name: "sigFailed", type: "bool" },
                { name: "validAfter", type: "uint48" },
                { name: "validUntil", type: "uint48" },
                { name: "paymasterContext", type: "bytes" }
              ],
              name: "returnInfo",
              type: "tuple"
            },
            {
              components: [
                { name: "stake", type: "uint256" },
                { name: "unstakeDelaySec", type: "uint256" }
              ],
              name: "senderInfo",
              type: "tuple"
            },
            {
              components: [
                { name: "stake", type: "uint256" },
                { name: "unstakeDelaySec", type: "uint256" }
              ],
              name: "factoryInfo",
              type: "tuple"
            },
            {
              components: [
                { name: "stake", type: "uint256" },
                { name: "unstakeDelaySec", type: "uint256" }
              ],
              name: "paymasterInfo",
              type: "tuple"
            },
            {
              components: [
                { name: "aggregator", type: "address" },
                {
                  components: [
                    { name: "stake", type: "uint256" },
                    {
                      name: "unstakeDelaySec",
                      type: "uint256"
                    }
                  ],
                  name: "stakeInfo",
                  type: "tuple"
                }
              ],
              name: "aggregatorInfo",
              type: "tuple"
            }
          ],
          name: "ValidationResultWithAggregation",
          type: "error"
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              name: "userOpHash",
              type: "bytes32"
            },
            {
              indexed: true,
              name: "sender",
              type: "address"
            },
            {
              indexed: false,
              name: "factory",
              type: "address"
            },
            {
              indexed: false,
              name: "paymaster",
              type: "address"
            }
          ],
          name: "AccountDeployed",
          type: "event"
        },
        { anonymous: false, inputs: [], name: "BeforeExecution", type: "event" },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              name: "account",
              type: "address"
            },
            {
              indexed: false,
              name: "totalDeposit",
              type: "uint256"
            }
          ],
          name: "Deposited",
          type: "event"
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              name: "aggregator",
              type: "address"
            }
          ],
          name: "SignatureAggregatorChanged",
          type: "event"
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              name: "account",
              type: "address"
            },
            {
              indexed: false,
              name: "totalStaked",
              type: "uint256"
            },
            {
              indexed: false,
              name: "unstakeDelaySec",
              type: "uint256"
            }
          ],
          name: "StakeLocked",
          type: "event"
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              name: "account",
              type: "address"
            },
            {
              indexed: false,
              name: "withdrawTime",
              type: "uint256"
            }
          ],
          name: "StakeUnlocked",
          type: "event"
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              name: "account",
              type: "address"
            },
            {
              indexed: false,
              name: "withdrawAddress",
              type: "address"
            },
            {
              indexed: false,
              name: "amount",
              type: "uint256"
            }
          ],
          name: "StakeWithdrawn",
          type: "event"
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              name: "userOpHash",
              type: "bytes32"
            },
            {
              indexed: true,
              name: "sender",
              type: "address"
            },
            {
              indexed: true,
              name: "paymaster",
              type: "address"
            },
            {
              indexed: false,
              name: "nonce",
              type: "uint256"
            },
            { indexed: false, name: "success", type: "bool" },
            {
              indexed: false,
              name: "actualGasCost",
              type: "uint256"
            },
            {
              indexed: false,
              name: "actualGasUsed",
              type: "uint256"
            }
          ],
          name: "UserOperationEvent",
          type: "event"
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              name: "userOpHash",
              type: "bytes32"
            },
            {
              indexed: true,
              name: "sender",
              type: "address"
            },
            {
              indexed: false,
              name: "nonce",
              type: "uint256"
            },
            {
              indexed: false,
              name: "revertReason",
              type: "bytes"
            }
          ],
          name: "UserOperationRevertReason",
          type: "event"
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              name: "account",
              type: "address"
            },
            {
              indexed: false,
              name: "withdrawAddress",
              type: "address"
            },
            {
              indexed: false,
              name: "amount",
              type: "uint256"
            }
          ],
          name: "Withdrawn",
          type: "event"
        },
        {
          inputs: [],
          name: "SIG_VALIDATION_FAILED",
          outputs: [{ name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [
            { name: "initCode", type: "bytes" },
            { name: "sender", type: "address" },
            { name: "paymasterAndData", type: "bytes" }
          ],
          name: "_validateSenderAndPaymaster",
          outputs: [],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [{ name: "unstakeDelaySec", type: "uint32" }],
          name: "addStake",
          outputs: [],
          stateMutability: "payable",
          type: "function"
        },
        {
          inputs: [{ name: "account", type: "address" }],
          name: "balanceOf",
          outputs: [{ name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [{ name: "account", type: "address" }],
          name: "depositTo",
          outputs: [],
          stateMutability: "payable",
          type: "function"
        },
        {
          inputs: [{ name: "", type: "address" }],
          name: "deposits",
          outputs: [
            { name: "deposit", type: "uint112" },
            { name: "staked", type: "bool" },
            { name: "stake", type: "uint112" },
            { name: "unstakeDelaySec", type: "uint32" },
            { name: "withdrawTime", type: "uint48" }
          ],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [{ name: "account", type: "address" }],
          name: "getDepositInfo",
          outputs: [
            {
              components: [
                { name: "deposit", type: "uint112" },
                { name: "staked", type: "bool" },
                { name: "stake", type: "uint112" },
                { name: "unstakeDelaySec", type: "uint32" },
                { name: "withdrawTime", type: "uint48" }
              ],
              name: "info",
              type: "tuple"
            }
          ],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [
            { name: "sender", type: "address" },
            { name: "key", type: "uint192" }
          ],
          name: "getNonce",
          outputs: [{ name: "nonce", type: "uint256" }],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [{ name: "initCode", type: "bytes" }],
          name: "getSenderAddress",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function"
        },
        {
          inputs: [
            {
              components: [
                { name: "sender", type: "address" },
                { name: "nonce", type: "uint256" },
                { name: "initCode", type: "bytes" },
                { name: "callData", type: "bytes" },
                { name: "callGasLimit", type: "uint256" },
                {
                  name: "verificationGasLimit",
                  type: "uint256"
                },
                {
                  name: "preVerificationGas",
                  type: "uint256"
                },
                { name: "maxFeePerGas", type: "uint256" },
                {
                  name: "maxPriorityFeePerGas",
                  type: "uint256"
                },
                { name: "paymasterAndData", type: "bytes" },
                { name: "signature", type: "bytes" }
              ],
              name: "userOp",
              type: "tuple"
            }
          ],
          name: "getUserOpHash",
          outputs: [{ name: "", type: "bytes32" }],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [
            {
              components: [
                {
                  components: [
                    { name: "sender", type: "address" },
                    { name: "nonce", type: "uint256" },
                    { name: "initCode", type: "bytes" },
                    { name: "callData", type: "bytes" },
                    {
                      name: "callGasLimit",
                      type: "uint256"
                    },
                    {
                      name: "verificationGasLimit",
                      type: "uint256"
                    },
                    {
                      name: "preVerificationGas",
                      type: "uint256"
                    },
                    {
                      name: "maxFeePerGas",
                      type: "uint256"
                    },
                    {
                      name: "maxPriorityFeePerGas",
                      type: "uint256"
                    },
                    {
                      name: "paymasterAndData",
                      type: "bytes"
                    },
                    { name: "signature", type: "bytes" }
                  ],
                  name: "userOps",
                  type: "tuple[]"
                },
                {
                  name: "aggregator",
                  type: "address"
                },
                { name: "signature", type: "bytes" }
              ],
              name: "opsPerAggregator",
              type: "tuple[]"
            },
            { name: "beneficiary", type: "address" }
          ],
          name: "handleAggregatedOps",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function"
        },
        {
          inputs: [
            {
              components: [
                { name: "sender", type: "address" },
                { name: "nonce", type: "uint256" },
                { name: "initCode", type: "bytes" },
                { name: "callData", type: "bytes" },
                { name: "callGasLimit", type: "uint256" },
                {
                  name: "verificationGasLimit",
                  type: "uint256"
                },
                {
                  name: "preVerificationGas",
                  type: "uint256"
                },
                { name: "maxFeePerGas", type: "uint256" },
                {
                  name: "maxPriorityFeePerGas",
                  type: "uint256"
                },
                { name: "paymasterAndData", type: "bytes" },
                { name: "signature", type: "bytes" }
              ],
              name: "ops",
              type: "tuple[]"
            },
            { name: "beneficiary", type: "address" }
          ],
          name: "handleOps",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function"
        },
        {
          inputs: [{ name: "key", type: "uint192" }],
          name: "incrementNonce",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function"
        },
        {
          inputs: [
            { name: "callData", type: "bytes" },
            {
              components: [
                {
                  components: [
                    { name: "sender", type: "address" },
                    { name: "nonce", type: "uint256" },
                    {
                      name: "callGasLimit",
                      type: "uint256"
                    },
                    {
                      name: "verificationGasLimit",
                      type: "uint256"
                    },
                    {
                      name: "preVerificationGas",
                      type: "uint256"
                    },
                    { name: "paymaster", type: "address" },
                    {
                      name: "maxFeePerGas",
                      type: "uint256"
                    },
                    {
                      name: "maxPriorityFeePerGas",
                      type: "uint256"
                    }
                  ],
                  name: "mUserOp",
                  type: "tuple"
                },
                { name: "userOpHash", type: "bytes32" },
                { name: "prefund", type: "uint256" },
                { name: "contextOffset", type: "uint256" },
                { name: "preOpGas", type: "uint256" }
              ],
              name: "opInfo",
              type: "tuple"
            },
            { name: "context", type: "bytes" }
          ],
          name: "innerHandleOp",
          outputs: [{ name: "actualGasCost", type: "uint256" }],
          stateMutability: "nonpayable",
          type: "function"
        },
        {
          inputs: [
            { name: "", type: "address" },
            { name: "", type: "uint192" }
          ],
          name: "nonceSequenceNumber",
          outputs: [{ name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [
            {
              components: [
                { name: "sender", type: "address" },
                { name: "nonce", type: "uint256" },
                { name: "initCode", type: "bytes" },
                { name: "callData", type: "bytes" },
                { name: "callGasLimit", type: "uint256" },
                {
                  name: "verificationGasLimit",
                  type: "uint256"
                },
                {
                  name: "preVerificationGas",
                  type: "uint256"
                },
                { name: "maxFeePerGas", type: "uint256" },
                {
                  name: "maxPriorityFeePerGas",
                  type: "uint256"
                },
                { name: "paymasterAndData", type: "bytes" },
                { name: "signature", type: "bytes" }
              ],
              name: "op",
              type: "tuple"
            },
            { name: "target", type: "address" },
            { name: "targetCallData", type: "bytes" }
          ],
          name: "simulateHandleOp",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function"
        },
        {
          inputs: [
            {
              components: [
                { name: "sender", type: "address" },
                { name: "nonce", type: "uint256" },
                { name: "initCode", type: "bytes" },
                { name: "callData", type: "bytes" },
                { name: "callGasLimit", type: "uint256" },
                {
                  name: "verificationGasLimit",
                  type: "uint256"
                },
                {
                  name: "preVerificationGas",
                  type: "uint256"
                },
                { name: "maxFeePerGas", type: "uint256" },
                {
                  name: "maxPriorityFeePerGas",
                  type: "uint256"
                },
                { name: "paymasterAndData", type: "bytes" },
                { name: "signature", type: "bytes" }
              ],
              name: "userOp",
              type: "tuple"
            }
          ],
          name: "simulateValidation",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function"
        },
        {
          inputs: [],
          name: "unlockStake",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function"
        },
        {
          inputs: [
            {
              name: "withdrawAddress",
              type: "address"
            }
          ],
          name: "withdrawStake",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function"
        },
        {
          inputs: [
            {
              name: "withdrawAddress",
              type: "address"
            },
            { name: "withdrawAmount", type: "uint256" }
          ],
          name: "withdrawTo",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function"
        },
        { stateMutability: "payable", type: "receive" }
      ];
    }
  });

  // node_modules/viem/_esm/account-abstraction/utils/userOperation/getInitCode.js
  function getInitCode(userOperation) {
    const { authorization, factory, factoryData } = userOperation;
    if (factory === "0x7702" || factory === "0x7702000000000000000000000000000000000000") {
      if (!authorization)
        return "0x7702000000000000000000000000000000000000";
      const delegation = authorization.address;
      return concat([delegation, factoryData ?? "0x"]);
    }
    if (!factory)
      return "0x";
    return concat([factory, factoryData ?? "0x"]);
  }
  var init_getInitCode = __esm({
    "node_modules/viem/_esm/account-abstraction/utils/userOperation/getInitCode.js"() {
      init_concat();
    }
  });

  // node_modules/viem/_esm/account-abstraction/utils/userOperation/toPackedUserOperation.js
  function toPackedUserOperation(userOperation) {
    const { callGasLimit, callData, maxPriorityFeePerGas, maxFeePerGas, paymaster, paymasterData, paymasterPostOpGasLimit, paymasterVerificationGasLimit, sender, signature = "0x", verificationGasLimit } = userOperation;
    const accountGasLimits = concat([
      pad(numberToHex(verificationGasLimit || 0n), { size: 16 }),
      pad(numberToHex(callGasLimit || 0n), { size: 16 })
    ]);
    const initCode = getInitCode(userOperation);
    const gasFees = concat([
      pad(numberToHex(maxPriorityFeePerGas || 0n), { size: 16 }),
      pad(numberToHex(maxFeePerGas || 0n), { size: 16 })
    ]);
    const nonce = userOperation.nonce ?? 0n;
    const paymasterAndData = paymaster ? concat([
      paymaster,
      pad(numberToHex(paymasterVerificationGasLimit || 0n), {
        size: 16
      }),
      pad(numberToHex(paymasterPostOpGasLimit || 0n), {
        size: 16
      }),
      paymasterData || "0x"
    ]) : "0x";
    const preVerificationGas = userOperation.preVerificationGas ?? 0n;
    return {
      accountGasLimits,
      callData,
      initCode,
      gasFees,
      nonce,
      paymasterAndData,
      preVerificationGas,
      sender,
      signature
    };
  }
  var init_toPackedUserOperation = __esm({
    "node_modules/viem/_esm/account-abstraction/utils/userOperation/toPackedUserOperation.js"() {
      init_concat();
      init_pad();
      init_utils7();
      init_getInitCode();
    }
  });

  // node_modules/viem/_esm/account-abstraction/utils/userOperation/getUserOperationTypedData.js
  function getUserOperationTypedData(parameters) {
    const { chainId, entryPointAddress, userOperation } = parameters;
    const packedUserOp = toPackedUserOperation(userOperation);
    return {
      types,
      primaryType: "PackedUserOperation",
      domain: {
        name: "ERC4337",
        version: "1",
        chainId,
        verifyingContract: entryPointAddress
      },
      message: packedUserOp
    };
  }
  var types;
  var init_getUserOperationTypedData = __esm({
    "node_modules/viem/_esm/account-abstraction/utils/userOperation/getUserOperationTypedData.js"() {
      init_toPackedUserOperation();
      types = {
        PackedUserOperation: [
          { type: "address", name: "sender" },
          { type: "uint256", name: "nonce" },
          { type: "bytes", name: "initCode" },
          { type: "bytes", name: "callData" },
          { type: "bytes32", name: "accountGasLimits" },
          { type: "uint256", name: "preVerificationGas" },
          { type: "bytes32", name: "gasFees" },
          { type: "bytes", name: "paymasterAndData" }
        ]
      };
    }
  });

  // node_modules/viem/_esm/account-abstraction/utils/userOperation/getUserOperationHash.js
  function getUserOperationHash(parameters) {
    const { chainId, entryPointAddress, entryPointVersion } = parameters;
    const userOperation = parameters.userOperation;
    const { authorization, callData = "0x", callGasLimit, maxFeePerGas, maxPriorityFeePerGas, nonce, paymasterAndData = "0x", preVerificationGas, sender, verificationGasLimit } = userOperation;
    if (entryPointVersion === "0.8")
      return hashTypedData(getUserOperationTypedData({
        chainId,
        entryPointAddress,
        userOperation
      }));
    const packedUserOp = (() => {
      if (entryPointVersion === "0.6") {
        const factory = userOperation.initCode?.slice(0, 42);
        const factoryData = userOperation.initCode?.slice(42);
        const initCode = getInitCode({
          authorization,
          factory,
          factoryData
        });
        return encodeAbiParameters([
          { type: "address" },
          { type: "uint256" },
          { type: "bytes32" },
          { type: "bytes32" },
          { type: "uint256" },
          { type: "uint256" },
          { type: "uint256" },
          { type: "uint256" },
          { type: "uint256" },
          { type: "bytes32" }
        ], [
          sender,
          nonce,
          keccak256(initCode),
          keccak256(callData),
          callGasLimit,
          verificationGasLimit,
          preVerificationGas,
          maxFeePerGas,
          maxPriorityFeePerGas,
          keccak256(paymasterAndData)
        ]);
      }
      if (entryPointVersion === "0.7") {
        const packedUserOp2 = toPackedUserOperation(userOperation);
        return encodeAbiParameters([
          { type: "address" },
          { type: "uint256" },
          { type: "bytes32" },
          { type: "bytes32" },
          { type: "bytes32" },
          { type: "uint256" },
          { type: "bytes32" },
          { type: "bytes32" }
        ], [
          packedUserOp2.sender,
          packedUserOp2.nonce,
          keccak256(packedUserOp2.initCode),
          keccak256(packedUserOp2.callData),
          packedUserOp2.accountGasLimits,
          packedUserOp2.preVerificationGas,
          packedUserOp2.gasFees,
          keccak256(packedUserOp2.paymasterAndData)
        ]);
      }
      throw new Error(`entryPointVersion "${entryPointVersion}" not supported.`);
    })();
    return keccak256(encodeAbiParameters([{ type: "bytes32" }, { type: "address" }, { type: "uint256" }], [keccak256(packedUserOp), entryPointAddress, BigInt(chainId)]));
  }
  var init_getUserOperationHash = __esm({
    "node_modules/viem/_esm/account-abstraction/utils/userOperation/getUserOperationHash.js"() {
      init_encodeAbiParameters();
      init_keccak256();
      init_hashTypedData();
      init_getInitCode();
      init_getUserOperationTypedData();
      init_toPackedUserOperation();
    }
  });

  // node_modules/viem/_esm/account-abstraction/accounts/toSmartAccount.js
  async function toSmartAccount(implementation) {
    const { extend, nonceKeyManager = createNonceManager({
      source: {
        get() {
          return Date.now();
        },
        set() {
        }
      }
    }), ...rest } = implementation;
    let deployed = false;
    const address = await implementation.getAddress();
    return {
      ...extend,
      ...rest,
      address,
      async getFactoryArgs() {
        if ("isDeployed" in this && await this.isDeployed())
          return { factory: void 0, factoryData: void 0 };
        return implementation.getFactoryArgs();
      },
      async getNonce(parameters) {
        const key = parameters?.key ?? BigInt(await nonceKeyManager.consume({
          address,
          chainId: implementation.client.chain.id,
          client: implementation.client
        }));
        if (implementation.getNonce)
          return await implementation.getNonce({ ...parameters, key });
        const nonce = await readContract(implementation.client, {
          abi: parseAbi([
            "function getNonce(address, uint192) pure returns (uint256)"
          ]),
          address: implementation.entryPoint.address,
          functionName: "getNonce",
          args: [address, key]
        });
        return nonce;
      },
      async isDeployed() {
        if (deployed)
          return true;
        const code = await getAction(implementation.client, getCode, "getCode")({
          address
        });
        deployed = Boolean(code);
        return deployed;
      },
      ...implementation.sign ? {
        async sign(parameters) {
          const [{ factory, factoryData }, signature] = await Promise.all([
            this.getFactoryArgs(),
            implementation.sign(parameters)
          ]);
          if (factory && factoryData)
            return serializeErc6492Signature({
              address: factory,
              data: factoryData,
              signature
            });
          return signature;
        }
      } : {},
      async signMessage(parameters) {
        const [{ factory, factoryData }, signature] = await Promise.all([
          this.getFactoryArgs(),
          implementation.signMessage(parameters)
        ]);
        if (factory && factoryData && factory !== "0x7702")
          return serializeErc6492Signature({
            address: factory,
            data: factoryData,
            signature
          });
        return signature;
      },
      async signTypedData(parameters) {
        const [{ factory, factoryData }, signature] = await Promise.all([
          this.getFactoryArgs(),
          implementation.signTypedData(parameters)
        ]);
        if (factory && factoryData && factory !== "0x7702")
          return serializeErc6492Signature({
            address: factory,
            data: factoryData,
            signature
          });
        return signature;
      },
      type: "smart"
    };
  }
  var init_toSmartAccount = __esm({
    "node_modules/viem/_esm/account-abstraction/accounts/toSmartAccount.js"() {
      init_exports();
      init_getCode();
      init_readContract();
      init_getAction();
      init_nonceManager();
      init_serializeErc6492Signature();
    }
  });

  // node_modules/viem/_esm/account-abstraction/accounts/implementations/toCoinbaseSmartAccount.js
  async function toCoinbaseSmartAccount(parameters) {
    const { client, ownerIndex = 0, owners, nonce = 0n, version: version4 = "1" } = parameters;
    let address = parameters.address;
    const entryPoint = {
      abi: entryPoint06Abi,
      address: entryPoint06Address,
      version: "0.6"
    };
    const factory = {
      abi: factoryAbi,
      address: factoryAddress[version4]
    };
    const owners_bytes = owners.map((owner2) => {
      if (typeof owner2 === "string")
        return pad(owner2);
      if (owner2.type === "webAuthn")
        return owner2.publicKey;
      if (owner2.type === "local")
        return pad(owner2.address);
      throw new BaseError2("invalid owner type");
    });
    const owner = (() => {
      const owner2 = owners[ownerIndex] ?? owners[0];
      if (typeof owner2 === "string")
        return { address: owner2, type: "address" };
      return owner2;
    })();
    return toSmartAccount({
      client,
      entryPoint,
      extend: { abi: abi2, factory },
      async decodeCalls(data) {
        const result = decodeFunctionData({
          abi: abi2,
          data
        });
        if (result.functionName === "execute")
          return [
            { to: result.args[0], value: result.args[1], data: result.args[2] }
          ];
        if (result.functionName === "executeBatch")
          return result.args[0].map((arg) => ({
            to: arg.target,
            value: arg.value,
            data: arg.data
          }));
        throw new BaseError2(`unable to decode calls for "${result.functionName}"`);
      },
      async encodeCalls(calls) {
        if (calls.length === 1)
          return encodeFunctionData({
            abi: abi2,
            functionName: "execute",
            args: [calls[0].to, calls[0].value ?? 0n, calls[0].data ?? "0x"]
          });
        return encodeFunctionData({
          abi: abi2,
          functionName: "executeBatch",
          args: [
            calls.map((call2) => ({
              data: call2.data ?? "0x",
              target: call2.to,
              value: call2.value ?? 0n
            }))
          ]
        });
      },
      async getAddress() {
        address ??= await readContract(client, {
          ...factory,
          functionName: "getAddress",
          args: [owners_bytes, nonce]
        });
        return address;
      },
      async getFactoryArgs() {
        const factoryData = encodeFunctionData({
          abi: factory.abi,
          functionName: "createAccount",
          args: [owners_bytes, nonce]
        });
        return { factory: factory.address, factoryData };
      },
      async getStubSignature() {
        if (owner.type === "webAuthn")
          return "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000000170000000000000000000000000000000000000000000000000000000000000001949fc7c88032b9fcb5f6efc7a7b8c63668eae9871b765e23123bb473ff57aa831a7c0d9276168ebcc29f2875a0239cffdf2a9cd1c2007c5c77c071db9264df1d000000000000000000000000000000000000000000000000000000000000002549960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d97630500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008a7b2274797065223a22776562617574686e2e676574222c226368616c6c656e6765223a2273496a396e6164474850596759334b7156384f7a4a666c726275504b474f716d59576f4d57516869467773222c226f726967696e223a2268747470733a2f2f7369676e2e636f696e626173652e636f6d222c2263726f73734f726967696e223a66616c73657d00000000000000000000000000000000000000000000";
        return wrapSignature({
          ownerIndex,
          signature: "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c"
        });
      },
      async sign(parameters2) {
        const address2 = await this.getAddress();
        const typedData = toReplaySafeTypedData({
          address: address2,
          chainId: client.chain.id,
          hash: parameters2.hash
        });
        if (owner.type === "address")
          throw new Error("owner cannot sign");
        const signature = await signTypedData({ owner, typedData });
        return wrapSignature({
          ownerIndex,
          signature
        });
      },
      async signMessage(parameters2) {
        const { message } = parameters2;
        const address2 = await this.getAddress();
        const typedData = toReplaySafeTypedData({
          address: address2,
          chainId: client.chain.id,
          hash: hashMessage(message)
        });
        if (owner.type === "address")
          throw new Error("owner cannot sign");
        const signature = await signTypedData({ owner, typedData });
        return wrapSignature({
          ownerIndex,
          signature
        });
      },
      async signTypedData(parameters2) {
        const { domain, types: types2, primaryType, message } = parameters2;
        const address2 = await this.getAddress();
        const typedData = toReplaySafeTypedData({
          address: address2,
          chainId: client.chain.id,
          hash: hashTypedData({
            domain,
            message,
            primaryType,
            types: types2
          })
        });
        if (owner.type === "address")
          throw new Error("owner cannot sign");
        const signature = await signTypedData({ owner, typedData });
        return wrapSignature({
          ownerIndex,
          signature
        });
      },
      async signUserOperation(parameters2) {
        const { chainId = client.chain.id, ...userOperation } = parameters2;
        const address2 = await this.getAddress();
        const hash3 = getUserOperationHash({
          chainId,
          entryPointAddress: entryPoint.address,
          entryPointVersion: entryPoint.version,
          userOperation: {
            ...userOperation,
            sender: address2
          }
        });
        if (owner.type === "address")
          throw new Error("owner cannot sign");
        const signature = await sign2({ hash: hash3, owner });
        return wrapSignature({
          ownerIndex,
          signature
        });
      },
      userOperation: {
        async estimateGas(userOperation) {
          if (owner.type !== "webAuthn")
            return;
          return {
            verificationGasLimit: BigInt(Math.max(Number(userOperation.verificationGasLimit ?? 0n), 8e5))
          };
        }
      }
    });
  }
  async function signTypedData({ typedData, owner }) {
    if (owner.type === "local" && owner.signTypedData)
      return owner.signTypedData(typedData);
    const hash3 = hashTypedData(typedData);
    return sign2({ hash: hash3, owner });
  }
  async function sign2({ hash: hash3, owner }) {
    if (owner.type === "webAuthn") {
      const { signature, webauthn } = await owner.sign({
        hash: hash3
      });
      return toWebAuthnSignature({ signature, webauthn });
    }
    if (owner.sign)
      return owner.sign({ hash: hash3 });
    throw new BaseError2("`owner` does not support raw sign.");
  }
  function toReplaySafeTypedData({ address, chainId, hash: hash3 }) {
    return {
      domain: {
        chainId,
        name: "Coinbase Smart Wallet",
        verifyingContract: address,
        version: "1"
      },
      types: {
        CoinbaseSmartWalletMessage: [
          {
            name: "hash",
            type: "bytes32"
          }
        ]
      },
      primaryType: "CoinbaseSmartWalletMessage",
      message: {
        hash: hash3
      }
    };
  }
  function toWebAuthnSignature({ webauthn, signature }) {
    const { r, s } = fromHex4(signature);
    return encodeAbiParameters([
      {
        components: [
          {
            name: "authenticatorData",
            type: "bytes"
          },
          { name: "clientDataJSON", type: "bytes" },
          { name: "challengeIndex", type: "uint256" },
          { name: "typeIndex", type: "uint256" },
          {
            name: "r",
            type: "uint256"
          },
          {
            name: "s",
            type: "uint256"
          }
        ],
        type: "tuple"
      }
    ], [
      {
        authenticatorData: webauthn.authenticatorData,
        clientDataJSON: stringToHex(webauthn.clientDataJSON),
        challengeIndex: BigInt(webauthn.challengeIndex),
        typeIndex: BigInt(webauthn.typeIndex),
        r,
        s
      }
    ]);
  }
  function wrapSignature(parameters) {
    const { ownerIndex = 0 } = parameters;
    const signatureData = (() => {
      if (size(parameters.signature) !== 65)
        return parameters.signature;
      const signature = parseSignature2(parameters.signature);
      return encodePacked(["bytes32", "bytes32", "uint8"], [signature.r, signature.s, signature.yParity === 0 ? 27 : 28]);
    })();
    return encodeAbiParameters([
      {
        components: [
          {
            name: "ownerIndex",
            type: "uint8"
          },
          {
            name: "signatureData",
            type: "bytes"
          }
        ],
        type: "tuple"
      }
    ], [
      {
        ownerIndex,
        signatureData
      }
    ]);
  }
  var factoryAddress, abi2, factoryAbi;
  var init_toCoinbaseSmartAccount = __esm({
    "node_modules/viem/_esm/account-abstraction/accounts/implementations/toCoinbaseSmartAccount.js"() {
      init_Signature();
      init_readContract();
      init_address2();
      init_base();
      init_decodeFunctionData();
      init_encodeAbiParameters();
      init_encodeFunctionData();
      init_encodePacked();
      init_pad();
      init_size();
      init_toHex();
      init_hashMessage();
      init_hashTypedData();
      init_parseSignature();
      init_abis2();
      init_getUserOperationHash();
      init_toSmartAccount();
      factoryAddress = {
        "1.1": "0xba5ed110efdba3d005bfc882d75358acbbb85842",
        "1": "0x0ba5ed0c6aa8c49038f819e587e2633c4a9f428a"
      };
      abi2 = [
        { inputs: [], stateMutability: "nonpayable", type: "constructor" },
        {
          inputs: [{ name: "owner", type: "bytes" }],
          name: "AlreadyOwner",
          type: "error"
        },
        { inputs: [], name: "Initialized", type: "error" },
        {
          inputs: [{ name: "owner", type: "bytes" }],
          name: "InvalidEthereumAddressOwner",
          type: "error"
        },
        {
          inputs: [{ name: "key", type: "uint256" }],
          name: "InvalidNonceKey",
          type: "error"
        },
        {
          inputs: [{ name: "owner", type: "bytes" }],
          name: "InvalidOwnerBytesLength",
          type: "error"
        },
        { inputs: [], name: "LastOwner", type: "error" },
        {
          inputs: [{ name: "index", type: "uint256" }],
          name: "NoOwnerAtIndex",
          type: "error"
        },
        {
          inputs: [{ name: "ownersRemaining", type: "uint256" }],
          name: "NotLastOwner",
          type: "error"
        },
        {
          inputs: [{ name: "selector", type: "bytes4" }],
          name: "SelectorNotAllowed",
          type: "error"
        },
        { inputs: [], name: "Unauthorized", type: "error" },
        { inputs: [], name: "UnauthorizedCallContext", type: "error" },
        { inputs: [], name: "UpgradeFailed", type: "error" },
        {
          inputs: [
            { name: "index", type: "uint256" },
            { name: "expectedOwner", type: "bytes" },
            { name: "actualOwner", type: "bytes" }
          ],
          name: "WrongOwnerAtIndex",
          type: "error"
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              name: "index",
              type: "uint256"
            },
            { indexed: false, name: "owner", type: "bytes" }
          ],
          name: "AddOwner",
          type: "event"
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              name: "index",
              type: "uint256"
            },
            { indexed: false, name: "owner", type: "bytes" }
          ],
          name: "RemoveOwner",
          type: "event"
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              name: "implementation",
              type: "address"
            }
          ],
          name: "Upgraded",
          type: "event"
        },
        { stateMutability: "payable", type: "fallback" },
        {
          inputs: [],
          name: "REPLAYABLE_NONCE_KEY",
          outputs: [{ name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [{ name: "owner", type: "address" }],
          name: "addOwnerAddress",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function"
        },
        {
          inputs: [
            { name: "x", type: "bytes32" },
            { name: "y", type: "bytes32" }
          ],
          name: "addOwnerPublicKey",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function"
        },
        {
          inputs: [{ name: "functionSelector", type: "bytes4" }],
          name: "canSkipChainIdValidation",
          outputs: [{ name: "", type: "bool" }],
          stateMutability: "pure",
          type: "function"
        },
        {
          inputs: [],
          name: "domainSeparator",
          outputs: [{ name: "", type: "bytes32" }],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [],
          name: "eip712Domain",
          outputs: [
            { name: "fields", type: "bytes1" },
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
            { name: "salt", type: "bytes32" },
            { name: "extensions", type: "uint256[]" }
          ],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [],
          name: "entryPoint",
          outputs: [{ name: "", type: "address" }],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [
            { name: "target", type: "address" },
            { name: "value", type: "uint256" },
            { name: "data", type: "bytes" }
          ],
          name: "execute",
          outputs: [],
          stateMutability: "payable",
          type: "function"
        },
        {
          inputs: [
            {
              components: [
                { name: "target", type: "address" },
                { name: "value", type: "uint256" },
                { name: "data", type: "bytes" }
              ],
              name: "calls",
              type: "tuple[]"
            }
          ],
          name: "executeBatch",
          outputs: [],
          stateMutability: "payable",
          type: "function"
        },
        {
          inputs: [{ name: "calls", type: "bytes[]" }],
          name: "executeWithoutChainIdValidation",
          outputs: [],
          stateMutability: "payable",
          type: "function"
        },
        {
          inputs: [
            {
              components: [
                { name: "sender", type: "address" },
                { name: "nonce", type: "uint256" },
                { name: "initCode", type: "bytes" },
                { name: "callData", type: "bytes" },
                { name: "callGasLimit", type: "uint256" },
                {
                  name: "verificationGasLimit",
                  type: "uint256"
                },
                {
                  name: "preVerificationGas",
                  type: "uint256"
                },
                { name: "maxFeePerGas", type: "uint256" },
                {
                  name: "maxPriorityFeePerGas",
                  type: "uint256"
                },
                { name: "paymasterAndData", type: "bytes" },
                { name: "signature", type: "bytes" }
              ],
              name: "userOp",
              type: "tuple"
            }
          ],
          name: "getUserOpHashWithoutChainId",
          outputs: [{ name: "", type: "bytes32" }],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [],
          name: "implementation",
          outputs: [{ name: "$", type: "address" }],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [{ name: "owners", type: "bytes[]" }],
          name: "initialize",
          outputs: [],
          stateMutability: "payable",
          type: "function"
        },
        {
          inputs: [{ name: "account", type: "address" }],
          name: "isOwnerAddress",
          outputs: [{ name: "", type: "bool" }],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [{ name: "account", type: "bytes" }],
          name: "isOwnerBytes",
          outputs: [{ name: "", type: "bool" }],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [
            { name: "x", type: "bytes32" },
            { name: "y", type: "bytes32" }
          ],
          name: "isOwnerPublicKey",
          outputs: [{ name: "", type: "bool" }],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [
            { name: "hash", type: "bytes32" },
            { name: "signature", type: "bytes" }
          ],
          name: "isValidSignature",
          outputs: [{ name: "result", type: "bytes4" }],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [],
          name: "nextOwnerIndex",
          outputs: [{ name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [{ name: "index", type: "uint256" }],
          name: "ownerAtIndex",
          outputs: [{ name: "", type: "bytes" }],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [],
          name: "ownerCount",
          outputs: [{ name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [],
          name: "proxiableUUID",
          outputs: [{ name: "", type: "bytes32" }],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [
            { name: "index", type: "uint256" },
            { name: "owner", type: "bytes" }
          ],
          name: "removeLastOwner",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function"
        },
        {
          inputs: [
            { name: "index", type: "uint256" },
            { name: "owner", type: "bytes" }
          ],
          name: "removeOwnerAtIndex",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function"
        },
        {
          inputs: [],
          name: "removedOwnersCount",
          outputs: [{ name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [{ name: "hash", type: "bytes32" }],
          name: "replaySafeHash",
          outputs: [{ name: "", type: "bytes32" }],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [
            { name: "newImplementation", type: "address" },
            { name: "data", type: "bytes" }
          ],
          name: "upgradeToAndCall",
          outputs: [],
          stateMutability: "payable",
          type: "function"
        },
        {
          inputs: [
            {
              components: [
                { name: "sender", type: "address" },
                { name: "nonce", type: "uint256" },
                { name: "initCode", type: "bytes" },
                { name: "callData", type: "bytes" },
                { name: "callGasLimit", type: "uint256" },
                {
                  name: "verificationGasLimit",
                  type: "uint256"
                },
                {
                  name: "preVerificationGas",
                  type: "uint256"
                },
                { name: "maxFeePerGas", type: "uint256" },
                {
                  name: "maxPriorityFeePerGas",
                  type: "uint256"
                },
                { name: "paymasterAndData", type: "bytes" },
                { name: "signature", type: "bytes" }
              ],
              name: "userOp",
              type: "tuple"
            },
            { name: "userOpHash", type: "bytes32" },
            { name: "missingAccountFunds", type: "uint256" }
          ],
          name: "validateUserOp",
          outputs: [{ name: "validationData", type: "uint256" }],
          stateMutability: "nonpayable",
          type: "function"
        },
        { stateMutability: "payable", type: "receive" }
      ];
      factoryAbi = [
        {
          inputs: [{ name: "implementation_", type: "address" }],
          stateMutability: "payable",
          type: "constructor"
        },
        { inputs: [], name: "OwnerRequired", type: "error" },
        {
          inputs: [
            { name: "owners", type: "bytes[]" },
            { name: "nonce", type: "uint256" }
          ],
          name: "createAccount",
          outputs: [
            {
              name: "account",
              type: "address"
            }
          ],
          stateMutability: "payable",
          type: "function"
        },
        {
          inputs: [
            { name: "owners", type: "bytes[]" },
            { name: "nonce", type: "uint256" }
          ],
          name: "getAddress",
          outputs: [{ name: "", type: "address" }],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [],
          name: "implementation",
          outputs: [{ name: "", type: "address" }],
          stateMutability: "view",
          type: "function"
        },
        {
          inputs: [],
          name: "initCodeHash",
          outputs: [{ name: "", type: "bytes32" }],
          stateMutability: "view",
          type: "function"
        }
      ];
    }
  });

  // node_modules/viem/_esm/account-abstraction/accounts/toWebAuthnAccount.js
  function toWebAuthnAccount(parameters) {
    const { getFn, rpId } = parameters;
    const { id, publicKey } = parameters.credential;
    return {
      id,
      publicKey,
      async sign({ hash: hash3 }) {
        const { metadata, raw, signature } = await sign({
          credentialId: id,
          getFn,
          challenge: hash3,
          rpId
        });
        return {
          signature: toHex3(signature),
          raw,
          webauthn: metadata
        };
      },
      async signMessage({ message }) {
        return this.sign({ hash: hashMessage(message) });
      },
      async signTypedData(parameters2) {
        return this.sign({ hash: hashTypedData(parameters2) });
      },
      type: "webAuthn"
    };
  }
  var init_toWebAuthnAccount = __esm({
    "node_modules/viem/_esm/account-abstraction/accounts/toWebAuthnAccount.js"() {
      init_Signature();
      init_WebAuthnP256();
      init_hashMessage();
      init_hashTypedData();
    }
  });

  // node_modules/viem/_esm/account-abstraction/errors/bundler.js
  var AccountNotDeployedError, ExecutionRevertedError2, FailedToSendToBeneficiaryError, GasValuesOverflowError, HandleOpsOutOfGasError, InitCodeFailedError, InitCodeMustCreateSenderError, InitCodeMustReturnSenderError, InsufficientPrefundError, InternalCallOnlyError, InvalidAggregatorError, InvalidAccountNonceError, InvalidBeneficiaryError, InvalidFieldsError, InvalidPaymasterAndDataError, PaymasterDepositTooLowError, PaymasterFunctionRevertedError, PaymasterNotDeployedError, PaymasterRateLimitError, PaymasterStakeTooLowError, PaymasterPostOpFunctionRevertedError, SenderAlreadyConstructedError, SignatureCheckFailedError, SmartAccountFunctionRevertedError, UnsupportedSignatureAggregatorError, UserOperationExpiredError, UserOperationPaymasterExpiredError, UserOperationSignatureError, UserOperationPaymasterSignatureError, UserOperationRejectedByEntryPointError, UserOperationRejectedByPaymasterError, UserOperationRejectedByOpCodeError, UserOperationOutOfTimeRangeError, UnknownBundlerError, VerificationGasLimitExceededError, VerificationGasLimitTooLowError;
  var init_bundler = __esm({
    "node_modules/viem/_esm/account-abstraction/errors/bundler.js"() {
      init_base();
      AccountNotDeployedError = class extends BaseError2 {
        constructor({ cause }) {
          super("Smart Account is not deployed.", {
            cause,
            metaMessages: [
              "This could arise when:",
              "- No `factory`/`factoryData` or `initCode` properties are provided for Smart Account deployment.",
              "- An incorrect `sender` address is provided."
            ],
            name: "AccountNotDeployedError"
          });
        }
      };
      Object.defineProperty(AccountNotDeployedError, "message", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /aa20/
      });
      ExecutionRevertedError2 = class extends BaseError2 {
        constructor({ cause, data, message } = {}) {
          const reason = message?.replace("execution reverted: ", "")?.replace("execution reverted", "");
          super(`Execution reverted ${reason ? `with reason: ${reason}` : "for an unknown reason"}.`, {
            cause,
            name: "ExecutionRevertedError"
          });
          Object.defineProperty(this, "data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          this.data = data;
        }
      };
      Object.defineProperty(ExecutionRevertedError2, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: -32521
      });
      Object.defineProperty(ExecutionRevertedError2, "message", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /execution reverted/
      });
      FailedToSendToBeneficiaryError = class extends BaseError2 {
        constructor({ cause }) {
          super("Failed to send funds to beneficiary.", {
            cause,
            name: "FailedToSendToBeneficiaryError"
          });
        }
      };
      Object.defineProperty(FailedToSendToBeneficiaryError, "message", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /aa91/
      });
      GasValuesOverflowError = class extends BaseError2 {
        constructor({ cause }) {
          super("Gas value overflowed.", {
            cause,
            metaMessages: [
              "This could arise when:",
              "- one of the gas values exceeded 2**120 (uint120)"
            ].filter(Boolean),
            name: "GasValuesOverflowError"
          });
        }
      };
      Object.defineProperty(GasValuesOverflowError, "message", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /aa94/
      });
      HandleOpsOutOfGasError = class extends BaseError2 {
        constructor({ cause }) {
          super("The `handleOps` function was called by the Bundler with a gas limit too low.", {
            cause,
            name: "HandleOpsOutOfGasError"
          });
        }
      };
      Object.defineProperty(HandleOpsOutOfGasError, "message", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /aa95/
      });
      InitCodeFailedError = class extends BaseError2 {
        constructor({ cause, factory, factoryData, initCode }) {
          super("Failed to simulate deployment for Smart Account.", {
            cause,
            metaMessages: [
              "This could arise when:",
              "- Invalid `factory`/`factoryData` or `initCode` properties are present",
              "- Smart Account deployment execution ran out of gas (low `verificationGasLimit` value)",
              "- Smart Account deployment execution reverted with an error\n",
              factory && `factory: ${factory}`,
              factoryData && `factoryData: ${factoryData}`,
              initCode && `initCode: ${initCode}`
            ].filter(Boolean),
            name: "InitCodeFailedError"
          });
        }
      };
      Object.defineProperty(InitCodeFailedError, "message", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /aa13/
      });
      InitCodeMustCreateSenderError = class extends BaseError2 {
        constructor({ cause, factory, factoryData, initCode }) {
          super("Smart Account initialization implementation did not create an account.", {
            cause,
            metaMessages: [
              "This could arise when:",
              "- `factory`/`factoryData` or `initCode` properties are invalid",
              "- Smart Account initialization implementation is incorrect\n",
              factory && `factory: ${factory}`,
              factoryData && `factoryData: ${factoryData}`,
              initCode && `initCode: ${initCode}`
            ].filter(Boolean),
            name: "InitCodeMustCreateSenderError"
          });
        }
      };
      Object.defineProperty(InitCodeMustCreateSenderError, "message", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /aa15/
      });
      InitCodeMustReturnSenderError = class extends BaseError2 {
        constructor({ cause, factory, factoryData, initCode, sender }) {
          super("Smart Account initialization implementation does not return the expected sender.", {
            cause,
            metaMessages: [
              "This could arise when:",
              "Smart Account initialization implementation does not return a sender address\n",
              factory && `factory: ${factory}`,
              factoryData && `factoryData: ${factoryData}`,
              initCode && `initCode: ${initCode}`,
              sender && `sender: ${sender}`
            ].filter(Boolean),
            name: "InitCodeMustReturnSenderError"
          });
        }
      };
      Object.defineProperty(InitCodeMustReturnSenderError, "message", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /aa14/
      });
      InsufficientPrefundError = class extends BaseError2 {
        constructor({ cause }) {
          super("Smart Account does not have sufficient funds to execute the User Operation.", {
            cause,
            metaMessages: [
              "This could arise when:",
              "- the Smart Account does not have sufficient funds to cover the required prefund, or",
              "- a Paymaster was not provided"
            ].filter(Boolean),
            name: "InsufficientPrefundError"
          });
        }
      };
      Object.defineProperty(InsufficientPrefundError, "message", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /aa21/
      });
      InternalCallOnlyError = class extends BaseError2 {
        constructor({ cause }) {
          super("Bundler attempted to call an invalid function on the EntryPoint.", {
            cause,
            name: "InternalCallOnlyError"
          });
        }
      };
      Object.defineProperty(InternalCallOnlyError, "message", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /aa92/
      });
      InvalidAggregatorError = class extends BaseError2 {
        constructor({ cause }) {
          super("Bundler used an invalid aggregator for handling aggregated User Operations.", {
            cause,
            name: "InvalidAggregatorError"
          });
        }
      };
      Object.defineProperty(InvalidAggregatorError, "message", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /aa96/
      });
      InvalidAccountNonceError = class extends BaseError2 {
        constructor({ cause, nonce }) {
          super("Invalid Smart Account nonce used for User Operation.", {
            cause,
            metaMessages: [nonce && `nonce: ${nonce}`].filter(Boolean),
            name: "InvalidAccountNonceError"
          });
        }
      };
      Object.defineProperty(InvalidAccountNonceError, "message", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /aa25/
      });
      InvalidBeneficiaryError = class extends BaseError2 {
        constructor({ cause }) {
          super("Bundler has not set a beneficiary address.", {
            cause,
            name: "InvalidBeneficiaryError"
          });
        }
      };
      Object.defineProperty(InvalidBeneficiaryError, "message", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /aa90/
      });
      InvalidFieldsError = class extends BaseError2 {
        constructor({ cause }) {
          super("Invalid fields set on User Operation.", {
            cause,
            name: "InvalidFieldsError"
          });
        }
      };
      Object.defineProperty(InvalidFieldsError, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: -32602
      });
      InvalidPaymasterAndDataError = class extends BaseError2 {
        constructor({ cause, paymasterAndData }) {
          super("Paymaster properties provided are invalid.", {
            cause,
            metaMessages: [
              "This could arise when:",
              "- the `paymasterAndData` property is of an incorrect length\n",
              paymasterAndData && `paymasterAndData: ${paymasterAndData}`
            ].filter(Boolean),
            name: "InvalidPaymasterAndDataError"
          });
        }
      };
      Object.defineProperty(InvalidPaymasterAndDataError, "message", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /aa93/
      });
      PaymasterDepositTooLowError = class extends BaseError2 {
        constructor({ cause }) {
          super("Paymaster deposit for the User Operation is too low.", {
            cause,
            metaMessages: [
              "This could arise when:",
              "- the Paymaster has deposited less than the expected amount via the `deposit` function"
            ].filter(Boolean),
            name: "PaymasterDepositTooLowError"
          });
        }
      };
      Object.defineProperty(PaymasterDepositTooLowError, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: -32508
      });
      Object.defineProperty(PaymasterDepositTooLowError, "message", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /aa31/
      });
      PaymasterFunctionRevertedError = class extends BaseError2 {
        constructor({ cause }) {
          super("The `validatePaymasterUserOp` function on the Paymaster reverted.", {
            cause,
            name: "PaymasterFunctionRevertedError"
          });
        }
      };
      Object.defineProperty(PaymasterFunctionRevertedError, "message", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /aa33/
      });
      PaymasterNotDeployedError = class extends BaseError2 {
        constructor({ cause }) {
          super("The Paymaster contract has not been deployed.", {
            cause,
            name: "PaymasterNotDeployedError"
          });
        }
      };
      Object.defineProperty(PaymasterNotDeployedError, "message", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /aa30/
      });
      PaymasterRateLimitError = class extends BaseError2 {
        constructor({ cause }) {
          super("UserOperation rejected because paymaster (or signature aggregator) is throttled/banned.", {
            cause,
            name: "PaymasterRateLimitError"
          });
        }
      };
      Object.defineProperty(PaymasterRateLimitError, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: -32504
      });
      PaymasterStakeTooLowError = class extends BaseError2 {
        constructor({ cause }) {
          super("UserOperation rejected because paymaster (or signature aggregator) is throttled/banned.", {
            cause,
            name: "PaymasterStakeTooLowError"
          });
        }
      };
      Object.defineProperty(PaymasterStakeTooLowError, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: -32505
      });
      PaymasterPostOpFunctionRevertedError = class extends BaseError2 {
        constructor({ cause }) {
          super("Paymaster `postOp` function reverted.", {
            cause,
            name: "PaymasterPostOpFunctionRevertedError"
          });
        }
      };
      Object.defineProperty(PaymasterPostOpFunctionRevertedError, "message", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /aa50/
      });
      SenderAlreadyConstructedError = class extends BaseError2 {
        constructor({ cause, factory, factoryData, initCode }) {
          super("Smart Account has already been deployed.", {
            cause,
            metaMessages: [
              "Remove the following properties and try again:",
              factory && "`factory`",
              factoryData && "`factoryData`",
              initCode && "`initCode`"
            ].filter(Boolean),
            name: "SenderAlreadyConstructedError"
          });
        }
      };
      Object.defineProperty(SenderAlreadyConstructedError, "message", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /aa10/
      });
      SignatureCheckFailedError = class extends BaseError2 {
        constructor({ cause }) {
          super("UserOperation rejected because account signature check failed (or paymaster signature, if the paymaster uses its data as signature).", {
            cause,
            name: "SignatureCheckFailedError"
          });
        }
      };
      Object.defineProperty(SignatureCheckFailedError, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: -32507
      });
      SmartAccountFunctionRevertedError = class extends BaseError2 {
        constructor({ cause }) {
          super("The `validateUserOp` function on the Smart Account reverted.", {
            cause,
            name: "SmartAccountFunctionRevertedError"
          });
        }
      };
      Object.defineProperty(SmartAccountFunctionRevertedError, "message", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /aa23/
      });
      UnsupportedSignatureAggregatorError = class extends BaseError2 {
        constructor({ cause }) {
          super("UserOperation rejected because account specified unsupported signature aggregator.", {
            cause,
            name: "UnsupportedSignatureAggregatorError"
          });
        }
      };
      Object.defineProperty(UnsupportedSignatureAggregatorError, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: -32506
      });
      UserOperationExpiredError = class extends BaseError2 {
        constructor({ cause }) {
          super("User Operation expired.", {
            cause,
            metaMessages: [
              "This could arise when:",
              "- the `validAfter` or `validUntil` values returned from `validateUserOp` on the Smart Account are not satisfied"
            ].filter(Boolean),
            name: "UserOperationExpiredError"
          });
        }
      };
      Object.defineProperty(UserOperationExpiredError, "message", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /aa22/
      });
      UserOperationPaymasterExpiredError = class extends BaseError2 {
        constructor({ cause }) {
          super("Paymaster for User Operation expired.", {
            cause,
            metaMessages: [
              "This could arise when:",
              "- the `validAfter` or `validUntil` values returned from `validatePaymasterUserOp` on the Paymaster are not satisfied"
            ].filter(Boolean),
            name: "UserOperationPaymasterExpiredError"
          });
        }
      };
      Object.defineProperty(UserOperationPaymasterExpiredError, "message", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /aa32/
      });
      UserOperationSignatureError = class extends BaseError2 {
        constructor({ cause }) {
          super("Signature provided for the User Operation is invalid.", {
            cause,
            metaMessages: [
              "This could arise when:",
              "- the `signature` for the User Operation is incorrectly computed, and unable to be verified by the Smart Account"
            ].filter(Boolean),
            name: "UserOperationSignatureError"
          });
        }
      };
      Object.defineProperty(UserOperationSignatureError, "message", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /aa24/
      });
      UserOperationPaymasterSignatureError = class extends BaseError2 {
        constructor({ cause }) {
          super("Signature provided for the User Operation is invalid.", {
            cause,
            metaMessages: [
              "This could arise when:",
              "- the `signature` for the User Operation is incorrectly computed, and unable to be verified by the Paymaster"
            ].filter(Boolean),
            name: "UserOperationPaymasterSignatureError"
          });
        }
      };
      Object.defineProperty(UserOperationPaymasterSignatureError, "message", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /aa34/
      });
      UserOperationRejectedByEntryPointError = class extends BaseError2 {
        constructor({ cause }) {
          super("User Operation rejected by EntryPoint's `simulateValidation` during account creation or validation.", {
            cause,
            name: "UserOperationRejectedByEntryPointError"
          });
        }
      };
      Object.defineProperty(UserOperationRejectedByEntryPointError, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: -32500
      });
      UserOperationRejectedByPaymasterError = class extends BaseError2 {
        constructor({ cause }) {
          super("User Operation rejected by Paymaster's `validatePaymasterUserOp`.", {
            cause,
            name: "UserOperationRejectedByPaymasterError"
          });
        }
      };
      Object.defineProperty(UserOperationRejectedByPaymasterError, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: -32501
      });
      UserOperationRejectedByOpCodeError = class extends BaseError2 {
        constructor({ cause }) {
          super("User Operation rejected with op code validation error.", {
            cause,
            name: "UserOperationRejectedByOpCodeError"
          });
        }
      };
      Object.defineProperty(UserOperationRejectedByOpCodeError, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: -32502
      });
      UserOperationOutOfTimeRangeError = class extends BaseError2 {
        constructor({ cause }) {
          super("UserOperation out of time-range: either wallet or paymaster returned a time-range, and it is already expired (or will expire soon).", {
            cause,
            name: "UserOperationOutOfTimeRangeError"
          });
        }
      };
      Object.defineProperty(UserOperationOutOfTimeRangeError, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: -32503
      });
      UnknownBundlerError = class extends BaseError2 {
        constructor({ cause }) {
          super(`An error occurred while executing user operation: ${cause?.shortMessage}`, {
            cause,
            name: "UnknownBundlerError"
          });
        }
      };
      VerificationGasLimitExceededError = class extends BaseError2 {
        constructor({ cause }) {
          super("User Operation verification gas limit exceeded.", {
            cause,
            metaMessages: [
              "This could arise when:",
              "- the gas used for verification exceeded the `verificationGasLimit`"
            ].filter(Boolean),
            name: "VerificationGasLimitExceededError"
          });
        }
      };
      Object.defineProperty(VerificationGasLimitExceededError, "message", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /aa40/
      });
      VerificationGasLimitTooLowError = class extends BaseError2 {
        constructor({ cause }) {
          super("User Operation verification gas limit is too low.", {
            cause,
            metaMessages: [
              "This could arise when:",
              "- the `verificationGasLimit` is too low to verify the User Operation"
            ].filter(Boolean),
            name: "VerificationGasLimitTooLowError"
          });
        }
      };
      Object.defineProperty(VerificationGasLimitTooLowError, "message", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: /aa41/
      });
    }
  });

  // node_modules/viem/_esm/account-abstraction/errors/userOperation.js
  var UserOperationExecutionError, UserOperationReceiptNotFoundError, UserOperationNotFoundError, WaitForUserOperationReceiptTimeoutError;
  var init_userOperation = __esm({
    "node_modules/viem/_esm/account-abstraction/errors/userOperation.js"() {
      init_base();
      init_transaction();
      init_utils7();
      UserOperationExecutionError = class extends BaseError2 {
        constructor(cause, { callData, callGasLimit, docsPath: docsPath8, factory, factoryData, initCode, maxFeePerGas, maxPriorityFeePerGas, nonce, paymaster, paymasterAndData, paymasterData, paymasterPostOpGasLimit, paymasterVerificationGasLimit, preVerificationGas, sender, signature, verificationGasLimit }) {
          const prettyArgs = prettyPrint({
            callData,
            callGasLimit,
            factory,
            factoryData,
            initCode,
            maxFeePerGas: typeof maxFeePerGas !== "undefined" && `${formatGwei(maxFeePerGas)} gwei`,
            maxPriorityFeePerGas: typeof maxPriorityFeePerGas !== "undefined" && `${formatGwei(maxPriorityFeePerGas)} gwei`,
            nonce,
            paymaster,
            paymasterAndData,
            paymasterData,
            paymasterPostOpGasLimit,
            paymasterVerificationGasLimit,
            preVerificationGas,
            sender,
            signature,
            verificationGasLimit
          });
          super(cause.shortMessage, {
            cause,
            docsPath: docsPath8,
            metaMessages: [
              ...cause.metaMessages ? [...cause.metaMessages, " "] : [],
              "Request Arguments:",
              prettyArgs
            ].filter(Boolean),
            name: "UserOperationExecutionError"
          });
          Object.defineProperty(this, "cause", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
          });
          this.cause = cause;
        }
      };
      UserOperationReceiptNotFoundError = class extends BaseError2 {
        constructor({ hash: hash3 }) {
          super(`User Operation receipt with hash "${hash3}" could not be found. The User Operation may not have been processed yet.`, { name: "UserOperationReceiptNotFoundError" });
        }
      };
      UserOperationNotFoundError = class extends BaseError2 {
        constructor({ hash: hash3 }) {
          super(`User Operation with hash "${hash3}" could not be found.`, {
            name: "UserOperationNotFoundError"
          });
        }
      };
      WaitForUserOperationReceiptTimeoutError = class extends BaseError2 {
        constructor({ hash: hash3 }) {
          super(`Timed out while waiting for User Operation with hash "${hash3}" to be confirmed.`, { name: "WaitForUserOperationReceiptTimeoutError" });
        }
      };
    }
  });

  // node_modules/viem/_esm/account-abstraction/utils/errors/getBundlerError.js
  function getBundlerError(err, args) {
    const message = (err.details || "").toLowerCase();
    if (AccountNotDeployedError.message.test(message))
      return new AccountNotDeployedError({
        cause: err
      });
    if (FailedToSendToBeneficiaryError.message.test(message))
      return new FailedToSendToBeneficiaryError({
        cause: err
      });
    if (GasValuesOverflowError.message.test(message))
      return new GasValuesOverflowError({
        cause: err
      });
    if (HandleOpsOutOfGasError.message.test(message))
      return new HandleOpsOutOfGasError({
        cause: err
      });
    if (InitCodeFailedError.message.test(message))
      return new InitCodeFailedError({
        cause: err,
        factory: args.factory,
        factoryData: args.factoryData,
        initCode: args.initCode
      });
    if (InitCodeMustCreateSenderError.message.test(message))
      return new InitCodeMustCreateSenderError({
        cause: err,
        factory: args.factory,
        factoryData: args.factoryData,
        initCode: args.initCode
      });
    if (InitCodeMustReturnSenderError.message.test(message))
      return new InitCodeMustReturnSenderError({
        cause: err,
        factory: args.factory,
        factoryData: args.factoryData,
        initCode: args.initCode,
        sender: args.sender
      });
    if (InsufficientPrefundError.message.test(message))
      return new InsufficientPrefundError({
        cause: err
      });
    if (InternalCallOnlyError.message.test(message))
      return new InternalCallOnlyError({
        cause: err
      });
    if (InvalidAccountNonceError.message.test(message))
      return new InvalidAccountNonceError({
        cause: err,
        nonce: args.nonce
      });
    if (InvalidAggregatorError.message.test(message))
      return new InvalidAggregatorError({
        cause: err
      });
    if (InvalidBeneficiaryError.message.test(message))
      return new InvalidBeneficiaryError({
        cause: err
      });
    if (InvalidPaymasterAndDataError.message.test(message))
      return new InvalidPaymasterAndDataError({
        cause: err
      });
    if (PaymasterDepositTooLowError.message.test(message))
      return new PaymasterDepositTooLowError({
        cause: err
      });
    if (PaymasterFunctionRevertedError.message.test(message))
      return new PaymasterFunctionRevertedError({
        cause: err
      });
    if (PaymasterNotDeployedError.message.test(message))
      return new PaymasterNotDeployedError({
        cause: err
      });
    if (PaymasterPostOpFunctionRevertedError.message.test(message))
      return new PaymasterPostOpFunctionRevertedError({
        cause: err
      });
    if (SmartAccountFunctionRevertedError.message.test(message))
      return new SmartAccountFunctionRevertedError({
        cause: err
      });
    if (SenderAlreadyConstructedError.message.test(message))
      return new SenderAlreadyConstructedError({
        cause: err,
        factory: args.factory,
        factoryData: args.factoryData,
        initCode: args.initCode
      });
    if (UserOperationExpiredError.message.test(message))
      return new UserOperationExpiredError({
        cause: err
      });
    if (UserOperationPaymasterExpiredError.message.test(message))
      return new UserOperationPaymasterExpiredError({
        cause: err
      });
    if (UserOperationPaymasterSignatureError.message.test(message))
      return new UserOperationPaymasterSignatureError({
        cause: err
      });
    if (UserOperationSignatureError.message.test(message))
      return new UserOperationSignatureError({
        cause: err
      });
    if (VerificationGasLimitExceededError.message.test(message))
      return new VerificationGasLimitExceededError({
        cause: err
      });
    if (VerificationGasLimitTooLowError.message.test(message))
      return new VerificationGasLimitTooLowError({
        cause: err
      });
    const error = err.walk((e) => bundlerErrors.some((error2) => error2.code === e.code));
    if (error) {
      if (error.code === ExecutionRevertedError2.code)
        return new ExecutionRevertedError2({
          cause: err,
          data: error.data,
          message: error.details
        });
      if (error.code === InvalidFieldsError.code)
        return new InvalidFieldsError({
          cause: err
        });
      if (error.code === PaymasterDepositTooLowError.code)
        return new PaymasterDepositTooLowError({
          cause: err
        });
      if (error.code === PaymasterRateLimitError.code)
        return new PaymasterRateLimitError({
          cause: err
        });
      if (error.code === PaymasterStakeTooLowError.code)
        return new PaymasterStakeTooLowError({
          cause: err
        });
      if (error.code === SignatureCheckFailedError.code)
        return new SignatureCheckFailedError({
          cause: err
        });
      if (error.code === UnsupportedSignatureAggregatorError.code)
        return new UnsupportedSignatureAggregatorError({
          cause: err
        });
      if (error.code === UserOperationOutOfTimeRangeError.code)
        return new UserOperationOutOfTimeRangeError({
          cause: err
        });
      if (error.code === UserOperationRejectedByEntryPointError.code)
        return new UserOperationRejectedByEntryPointError({
          cause: err
        });
      if (error.code === UserOperationRejectedByPaymasterError.code)
        return new UserOperationRejectedByPaymasterError({
          cause: err
        });
      if (error.code === UserOperationRejectedByOpCodeError.code)
        return new UserOperationRejectedByOpCodeError({
          cause: err
        });
    }
    return new UnknownBundlerError({
      cause: err
    });
  }
  var bundlerErrors;
  var init_getBundlerError = __esm({
    "node_modules/viem/_esm/account-abstraction/utils/errors/getBundlerError.js"() {
      init_bundler();
      bundlerErrors = [
        ExecutionRevertedError2,
        InvalidFieldsError,
        PaymasterDepositTooLowError,
        PaymasterRateLimitError,
        PaymasterStakeTooLowError,
        SignatureCheckFailedError,
        UnsupportedSignatureAggregatorError,
        UserOperationOutOfTimeRangeError,
        UserOperationRejectedByEntryPointError,
        UserOperationRejectedByPaymasterError,
        UserOperationRejectedByOpCodeError
      ];
    }
  });

  // node_modules/viem/_esm/account-abstraction/utils/errors/getUserOperationError.js
  function getUserOperationError(err, { calls, docsPath: docsPath8, ...args }) {
    const cause = (() => {
      const cause2 = getBundlerError(err, args);
      if (calls && cause2 instanceof ExecutionRevertedError2) {
        const revertData = getRevertData(cause2);
        const contractCalls = calls?.filter((call2) => call2.abi);
        if (revertData && contractCalls.length > 0)
          return getContractError2({ calls: contractCalls, revertData });
      }
      return cause2;
    })();
    return new UserOperationExecutionError(cause, {
      docsPath: docsPath8,
      ...args
    });
  }
  function getRevertData(error) {
    let revertData;
    error.walk((e) => {
      const error2 = e;
      if (typeof error2.data === "string" || typeof error2.data?.revertData === "string" || !(error2 instanceof BaseError2) && typeof error2.message === "string") {
        const match = (error2.data?.revertData || error2.data || error2.message).match?.(/(0x[A-Za-z0-9]*)/);
        if (match) {
          revertData = match[1];
          return true;
        }
      }
      return false;
    });
    return revertData;
  }
  function getContractError2(parameters) {
    const { calls, revertData } = parameters;
    const { abi: abi3, functionName, args, to } = (() => {
      const contractCalls = calls?.filter((call2) => Boolean(call2.abi));
      if (contractCalls.length === 1)
        return contractCalls[0];
      const compatContractCalls = contractCalls.filter((call2) => {
        try {
          return Boolean(decodeErrorResult({
            abi: call2.abi,
            data: revertData
          }));
        } catch {
          return false;
        }
      });
      if (compatContractCalls.length === 1)
        return compatContractCalls[0];
      return {
        abi: [],
        functionName: contractCalls.reduce((acc, call2) => `${acc ? `${acc} | ` : ""}${call2.functionName}`, ""),
        args: void 0,
        to: void 0
      };
    })();
    const cause = (() => {
      if (revertData === "0x")
        return new ContractFunctionZeroDataError({ functionName });
      return new ContractFunctionRevertedError({
        abi: abi3,
        data: revertData,
        functionName
      });
    })();
    return new ContractFunctionExecutionError(cause, {
      abi: abi3,
      args,
      contractAddress: to,
      functionName
    });
  }
  var init_getUserOperationError = __esm({
    "node_modules/viem/_esm/account-abstraction/utils/errors/getUserOperationError.js"() {
      init_base();
      init_contract();
      init_decodeErrorResult();
      init_bundler();
      init_userOperation();
      init_getBundlerError();
    }
  });

  // node_modules/viem/_esm/account-abstraction/utils/formatters/userOperationGas.js
  function formatUserOperationGas(parameters) {
    const gas = {};
    if (parameters.callGasLimit)
      gas.callGasLimit = BigInt(parameters.callGasLimit);
    if (parameters.preVerificationGas)
      gas.preVerificationGas = BigInt(parameters.preVerificationGas);
    if (parameters.verificationGasLimit)
      gas.verificationGasLimit = BigInt(parameters.verificationGasLimit);
    if (parameters.paymasterPostOpGasLimit)
      gas.paymasterPostOpGasLimit = BigInt(parameters.paymasterPostOpGasLimit);
    if (parameters.paymasterVerificationGasLimit)
      gas.paymasterVerificationGasLimit = BigInt(parameters.paymasterVerificationGasLimit);
    return gas;
  }
  var init_userOperationGas = __esm({
    "node_modules/viem/_esm/account-abstraction/utils/formatters/userOperationGas.js"() {
    }
  });

  // node_modules/viem/_esm/account-abstraction/utils/formatters/userOperationRequest.js
  function formatUserOperationRequest(request) {
    const rpcRequest = {};
    if (typeof request.callData !== "undefined")
      rpcRequest.callData = request.callData;
    if (typeof request.callGasLimit !== "undefined")
      rpcRequest.callGasLimit = numberToHex(request.callGasLimit);
    if (typeof request.factory !== "undefined")
      rpcRequest.factory = request.factory;
    if (typeof request.factoryData !== "undefined")
      rpcRequest.factoryData = request.factoryData;
    if (typeof request.initCode !== "undefined")
      rpcRequest.initCode = request.initCode;
    if (typeof request.maxFeePerGas !== "undefined")
      rpcRequest.maxFeePerGas = numberToHex(request.maxFeePerGas);
    if (typeof request.maxPriorityFeePerGas !== "undefined")
      rpcRequest.maxPriorityFeePerGas = numberToHex(request.maxPriorityFeePerGas);
    if (typeof request.nonce !== "undefined")
      rpcRequest.nonce = numberToHex(request.nonce);
    if (typeof request.paymaster !== "undefined")
      rpcRequest.paymaster = request.paymaster;
    if (typeof request.paymasterAndData !== "undefined")
      rpcRequest.paymasterAndData = request.paymasterAndData || "0x";
    if (typeof request.paymasterData !== "undefined")
      rpcRequest.paymasterData = request.paymasterData;
    if (typeof request.paymasterPostOpGasLimit !== "undefined")
      rpcRequest.paymasterPostOpGasLimit = numberToHex(request.paymasterPostOpGasLimit);
    if (typeof request.paymasterVerificationGasLimit !== "undefined")
      rpcRequest.paymasterVerificationGasLimit = numberToHex(request.paymasterVerificationGasLimit);
    if (typeof request.preVerificationGas !== "undefined")
      rpcRequest.preVerificationGas = numberToHex(request.preVerificationGas);
    if (typeof request.sender !== "undefined")
      rpcRequest.sender = request.sender;
    if (typeof request.signature !== "undefined")
      rpcRequest.signature = request.signature;
    if (typeof request.verificationGasLimit !== "undefined")
      rpcRequest.verificationGasLimit = numberToHex(request.verificationGasLimit);
    if (typeof request.authorization !== "undefined")
      rpcRequest.eip7702Auth = formatAuthorization(request.authorization);
    return rpcRequest;
  }
  function formatAuthorization(authorization) {
    return {
      address: authorization.address,
      chainId: numberToHex(authorization.chainId),
      nonce: numberToHex(authorization.nonce),
      r: authorization.r ? numberToHex(BigInt(authorization.r), { size: 32 }) : pad("0x", { size: 32 }),
      s: authorization.s ? numberToHex(BigInt(authorization.s), { size: 32 }) : pad("0x", { size: 32 }),
      yParity: authorization.yParity ? numberToHex(authorization.yParity, { size: 1 }) : pad("0x", { size: 32 })
    };
  }
  var init_userOperationRequest = __esm({
    "node_modules/viem/_esm/account-abstraction/utils/formatters/userOperationRequest.js"() {
      init_toHex();
      init_utils7();
    }
  });

  // node_modules/viem/_esm/actions/index.js
  var init_actions = __esm({
    "node_modules/viem/_esm/actions/index.js"() {
      init_prepareAuthorization();
    }
  });

  // node_modules/viem/_esm/account-abstraction/actions/paymaster/getPaymasterData.js
  async function getPaymasterData(client, parameters) {
    const { chainId, entryPointAddress, context, ...userOperation } = parameters;
    const request = formatUserOperationRequest(userOperation);
    const { paymasterPostOpGasLimit, paymasterVerificationGasLimit, ...rest } = await client.request({
      method: "pm_getPaymasterData",
      params: [
        {
          ...request,
          callGasLimit: request.callGasLimit ?? "0x0",
          verificationGasLimit: request.verificationGasLimit ?? "0x0",
          preVerificationGas: request.preVerificationGas ?? "0x0"
        },
        entryPointAddress,
        numberToHex(chainId),
        context
      ]
    });
    return {
      ...rest,
      ...paymasterPostOpGasLimit && {
        paymasterPostOpGasLimit: hexToBigInt(paymasterPostOpGasLimit)
      },
      ...paymasterVerificationGasLimit && {
        paymasterVerificationGasLimit: hexToBigInt(paymasterVerificationGasLimit)
      }
    };
  }
  var init_getPaymasterData = __esm({
    "node_modules/viem/_esm/account-abstraction/actions/paymaster/getPaymasterData.js"() {
      init_fromHex();
      init_toHex();
      init_userOperationRequest();
    }
  });

  // node_modules/viem/_esm/account-abstraction/actions/paymaster/getPaymasterStubData.js
  async function getPaymasterStubData(client, parameters) {
    const { chainId, entryPointAddress, context, ...userOperation } = parameters;
    const request = formatUserOperationRequest(userOperation);
    const { paymasterPostOpGasLimit, paymasterVerificationGasLimit, ...rest } = await client.request({
      method: "pm_getPaymasterStubData",
      params: [
        {
          ...request,
          callGasLimit: request.callGasLimit ?? "0x0",
          verificationGasLimit: request.verificationGasLimit ?? "0x0",
          preVerificationGas: request.preVerificationGas ?? "0x0"
        },
        entryPointAddress,
        numberToHex(chainId),
        context
      ]
    });
    return {
      ...rest,
      ...paymasterPostOpGasLimit && {
        paymasterPostOpGasLimit: hexToBigInt(paymasterPostOpGasLimit)
      },
      ...paymasterVerificationGasLimit && {
        paymasterVerificationGasLimit: hexToBigInt(paymasterVerificationGasLimit)
      }
    };
  }
  var init_getPaymasterStubData = __esm({
    "node_modules/viem/_esm/account-abstraction/actions/paymaster/getPaymasterStubData.js"() {
      init_fromHex();
      init_toHex();
      init_userOperationRequest();
    }
  });

  // node_modules/viem/_esm/account-abstraction/actions/bundler/prepareUserOperation.js
  async function prepareUserOperation(client, parameters_) {
    const parameters = parameters_;
    const { account: account_ = client.account, parameters: properties = defaultParameters2, stateOverride } = parameters;
    if (!account_)
      throw new AccountNotFoundError();
    const account = parseAccount(account_);
    const bundlerClient = client;
    const paymaster = parameters.paymaster ?? bundlerClient?.paymaster;
    const paymasterAddress = typeof paymaster === "string" ? paymaster : void 0;
    const { getPaymasterStubData: getPaymasterStubData2, getPaymasterData: getPaymasterData2 } = (() => {
      if (paymaster === true)
        return {
          getPaymasterStubData: (parameters2) => getAction(bundlerClient, getPaymasterStubData, "getPaymasterStubData")(parameters2),
          getPaymasterData: (parameters2) => getAction(bundlerClient, getPaymasterData, "getPaymasterData")(parameters2)
        };
      if (typeof paymaster === "object") {
        const { getPaymasterStubData: getPaymasterStubData3, getPaymasterData: getPaymasterData3 } = paymaster;
        return {
          getPaymasterStubData: getPaymasterData3 && getPaymasterStubData3 ? getPaymasterStubData3 : getPaymasterData3,
          getPaymasterData: getPaymasterData3 && getPaymasterStubData3 ? getPaymasterData3 : void 0
        };
      }
      return {
        getPaymasterStubData: void 0,
        getPaymasterData: void 0
      };
    })();
    const paymasterContext = parameters.paymasterContext ? parameters.paymasterContext : bundlerClient?.paymasterContext;
    let request = {
      ...parameters,
      paymaster: paymasterAddress,
      sender: account.address
    };
    const [callData, factory, fees, nonce, authorization] = await Promise.all([
      (async () => {
        if (parameters.calls)
          return account.encodeCalls(parameters.calls.map((call_) => {
            const call2 = call_;
            if (call2.abi)
              return {
                data: encodeFunctionData(call2),
                to: call2.to,
                value: call2.value
              };
            return call2;
          }));
        return parameters.callData;
      })(),
      (async () => {
        if (!properties.includes("factory"))
          return void 0;
        if (parameters.initCode)
          return { initCode: parameters.initCode };
        if (parameters.factory && parameters.factoryData) {
          return {
            factory: parameters.factory,
            factoryData: parameters.factoryData
          };
        }
        const { factory: factory2, factoryData } = await account.getFactoryArgs();
        if (account.entryPoint.version === "0.6")
          return {
            initCode: factory2 && factoryData ? concat([factory2, factoryData]) : void 0
          };
        return {
          factory: factory2,
          factoryData
        };
      })(),
      (async () => {
        if (!properties.includes("fees"))
          return void 0;
        if (typeof parameters.maxFeePerGas === "bigint" && typeof parameters.maxPriorityFeePerGas === "bigint")
          return request;
        if (bundlerClient?.userOperation?.estimateFeesPerGas) {
          const fees2 = await bundlerClient.userOperation.estimateFeesPerGas({
            account,
            bundlerClient,
            userOperation: request
          });
          return {
            ...request,
            ...fees2
          };
        }
        try {
          const client_ = bundlerClient.client ?? client;
          const fees2 = await getAction(client_, estimateFeesPerGas, "estimateFeesPerGas")({
            chain: client_.chain,
            type: "eip1559"
          });
          return {
            maxFeePerGas: typeof parameters.maxFeePerGas === "bigint" ? parameters.maxFeePerGas : BigInt(
              // Bundlers unfortunately have strict rules on fee prechecks – we will need to set a generous buffer.
              2n * fees2.maxFeePerGas
            ),
            maxPriorityFeePerGas: typeof parameters.maxPriorityFeePerGas === "bigint" ? parameters.maxPriorityFeePerGas : BigInt(
              // Bundlers unfortunately have strict rules on fee prechecks – we will need to set a generous buffer.
              2n * fees2.maxPriorityFeePerGas
            )
          };
        } catch {
          return void 0;
        }
      })(),
      (async () => {
        if (!properties.includes("nonce"))
          return void 0;
        if (typeof parameters.nonce === "bigint")
          return parameters.nonce;
        return account.getNonce();
      })(),
      (async () => {
        if (!properties.includes("authorization"))
          return void 0;
        if (typeof parameters.authorization === "object")
          return parameters.authorization;
        if (account.authorization && !await account.isDeployed()) {
          const authorization2 = await prepareAuthorization(account.client, account.authorization);
          return {
            ...authorization2,
            r: "0xfffffffffffffffffffffffffffffff000000000000000000000000000000000",
            s: "0x7aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            yParity: 1
          };
        }
        return void 0;
      })()
    ]);
    if (typeof callData !== "undefined")
      request.callData = callData;
    if (typeof factory !== "undefined")
      request = { ...request, ...factory };
    if (typeof fees !== "undefined")
      request = { ...request, ...fees };
    if (typeof nonce !== "undefined")
      request.nonce = nonce;
    if (typeof authorization !== "undefined")
      request.authorization = authorization;
    if (properties.includes("signature")) {
      if (typeof parameters.signature !== "undefined")
        request.signature = parameters.signature;
      else
        request.signature = await account.getStubSignature(request);
    }
    if (account.entryPoint.version === "0.6" && !request.initCode)
      request.initCode = "0x";
    let chainId;
    async function getChainId2() {
      if (chainId)
        return chainId;
      if (client.chain)
        return client.chain.id;
      const chainId_ = await getAction(client, getChainId, "getChainId")({});
      chainId = chainId_;
      return chainId;
    }
    let isPaymasterPopulated = false;
    if (properties.includes("paymaster") && getPaymasterStubData2 && !paymasterAddress && !parameters.paymasterAndData) {
      const { isFinal = false, sponsor: _, ...paymasterArgs } = await getPaymasterStubData2({
        chainId: await getChainId2(),
        entryPointAddress: account.entryPoint.address,
        context: paymasterContext,
        ...request
      });
      isPaymasterPopulated = isFinal;
      request = {
        ...request,
        ...paymasterArgs
      };
    }
    if (account.entryPoint.version === "0.6" && !request.paymasterAndData)
      request.paymasterAndData = "0x";
    if (properties.includes("gas")) {
      if (account.userOperation?.estimateGas) {
        const gas = await account.userOperation.estimateGas(request);
        request = {
          ...request,
          ...gas
        };
      }
      if (typeof request.callGasLimit === "undefined" || typeof request.preVerificationGas === "undefined" || typeof request.verificationGasLimit === "undefined" || request.paymaster && typeof request.paymasterPostOpGasLimit === "undefined" || request.paymaster && typeof request.paymasterVerificationGasLimit === "undefined") {
        const gas = await getAction(bundlerClient, estimateUserOperationGas, "estimateUserOperationGas")({
          account,
          // Some Bundlers fail if nullish gas values are provided for gas estimation :') –
          // so we will need to set a default zeroish value.
          callGasLimit: 0n,
          preVerificationGas: 0n,
          verificationGasLimit: 0n,
          stateOverride,
          ...request.paymaster ? {
            paymasterPostOpGasLimit: 0n,
            paymasterVerificationGasLimit: 0n
          } : {},
          ...request
        });
        request = {
          ...request,
          callGasLimit: request.callGasLimit ?? gas.callGasLimit,
          preVerificationGas: request.preVerificationGas ?? gas.preVerificationGas,
          verificationGasLimit: request.verificationGasLimit ?? gas.verificationGasLimit,
          paymasterPostOpGasLimit: request.paymasterPostOpGasLimit ?? gas.paymasterPostOpGasLimit,
          paymasterVerificationGasLimit: request.paymasterVerificationGasLimit ?? gas.paymasterVerificationGasLimit
        };
      }
    }
    if (properties.includes("paymaster") && getPaymasterData2 && !paymasterAddress && !parameters.paymasterAndData && !isPaymasterPopulated) {
      const paymaster2 = await getPaymasterData2({
        chainId: await getChainId2(),
        entryPointAddress: account.entryPoint.address,
        context: paymasterContext,
        ...request
      });
      request = {
        ...request,
        ...paymaster2
      };
    }
    delete request.calls;
    delete request.parameters;
    delete request.paymasterContext;
    if (typeof request.paymaster !== "string")
      delete request.paymaster;
    return request;
  }
  var defaultParameters2;
  var init_prepareUserOperation = __esm({
    "node_modules/viem/_esm/account-abstraction/actions/bundler/prepareUserOperation.js"() {
      init_parseAccount();
      init_actions();
      init_estimateFeesPerGas();
      init_getChainId();
      init_account();
      init_encodeFunctionData();
      init_concat();
      init_getAction();
      init_getPaymasterData();
      init_getPaymasterStubData();
      init_estimateUserOperationGas();
      defaultParameters2 = [
        "factory",
        "fees",
        "gas",
        "paymaster",
        "nonce",
        "signature",
        "authorization"
      ];
    }
  });

  // node_modules/viem/_esm/account-abstraction/actions/bundler/estimateUserOperationGas.js
  async function estimateUserOperationGas(client, parameters) {
    const { account: account_ = client.account, entryPointAddress, stateOverride } = parameters;
    if (!account_ && !parameters.sender)
      throw new AccountNotFoundError();
    const account = account_ ? parseAccount(account_) : void 0;
    const rpcStateOverride = serializeStateOverride(stateOverride);
    const request = account ? await getAction(client, prepareUserOperation, "prepareUserOperation")({
      ...parameters,
      parameters: [
        "authorization",
        "factory",
        "nonce",
        "paymaster",
        "signature"
      ]
    }) : parameters;
    try {
      const params = [
        formatUserOperationRequest(request),
        entryPointAddress ?? account?.entryPoint?.address
      ];
      const result = await client.request({
        method: "eth_estimateUserOperationGas",
        params: rpcStateOverride ? [...params, rpcStateOverride] : [...params]
      });
      return formatUserOperationGas(result);
    } catch (error) {
      const calls = parameters.calls;
      throw getUserOperationError(error, {
        ...request,
        ...calls ? { calls } : {}
      });
    }
  }
  var init_estimateUserOperationGas = __esm({
    "node_modules/viem/_esm/account-abstraction/actions/bundler/estimateUserOperationGas.js"() {
      init_parseAccount();
      init_account();
      init_getAction();
      init_stateOverride2();
      init_getUserOperationError();
      init_userOperationGas();
      init_userOperationRequest();
      init_prepareUserOperation();
    }
  });

  // node_modules/viem/_esm/account-abstraction/actions/bundler/getSupportedEntryPoints.js
  function getSupportedEntryPoints(client) {
    return client.request({ method: "eth_supportedEntryPoints" });
  }
  var init_getSupportedEntryPoints = __esm({
    "node_modules/viem/_esm/account-abstraction/actions/bundler/getSupportedEntryPoints.js"() {
    }
  });

  // node_modules/viem/_esm/account-abstraction/utils/formatters/userOperation.js
  function formatUserOperation(parameters) {
    const userOperation = { ...parameters };
    if (parameters.callGasLimit)
      userOperation.callGasLimit = BigInt(parameters.callGasLimit);
    if (parameters.maxFeePerGas)
      userOperation.maxFeePerGas = BigInt(parameters.maxFeePerGas);
    if (parameters.maxPriorityFeePerGas)
      userOperation.maxPriorityFeePerGas = BigInt(parameters.maxPriorityFeePerGas);
    if (parameters.nonce)
      userOperation.nonce = BigInt(parameters.nonce);
    if (parameters.paymasterPostOpGasLimit)
      userOperation.paymasterPostOpGasLimit = BigInt(parameters.paymasterPostOpGasLimit);
    if (parameters.paymasterVerificationGasLimit)
      userOperation.paymasterVerificationGasLimit = BigInt(parameters.paymasterVerificationGasLimit);
    if (parameters.preVerificationGas)
      userOperation.preVerificationGas = BigInt(parameters.preVerificationGas);
    if (parameters.verificationGasLimit)
      userOperation.verificationGasLimit = BigInt(parameters.verificationGasLimit);
    return userOperation;
  }
  var init_userOperation2 = __esm({
    "node_modules/viem/_esm/account-abstraction/utils/formatters/userOperation.js"() {
    }
  });

  // node_modules/viem/_esm/account-abstraction/actions/bundler/getUserOperation.js
  async function getUserOperation(client, { hash: hash3 }) {
    const result = await client.request({
      method: "eth_getUserOperationByHash",
      params: [hash3]
    }, { dedupe: true });
    if (!result)
      throw new UserOperationNotFoundError({ hash: hash3 });
    const { blockHash, blockNumber, entryPoint, transactionHash, userOperation } = result;
    return {
      blockHash,
      blockNumber: BigInt(blockNumber),
      entryPoint,
      transactionHash,
      userOperation: formatUserOperation(userOperation)
    };
  }
  var init_getUserOperation = __esm({
    "node_modules/viem/_esm/account-abstraction/actions/bundler/getUserOperation.js"() {
      init_userOperation();
      init_userOperation2();
    }
  });

  // node_modules/viem/_esm/account-abstraction/utils/formatters/userOperationReceipt.js
  function formatUserOperationReceipt(parameters) {
    const receipt = { ...parameters };
    if (parameters.actualGasCost)
      receipt.actualGasCost = BigInt(parameters.actualGasCost);
    if (parameters.actualGasUsed)
      receipt.actualGasUsed = BigInt(parameters.actualGasUsed);
    if (parameters.logs)
      receipt.logs = parameters.logs.map((log) => formatLog(log));
    if (parameters.receipt)
      receipt.receipt = formatTransactionReceipt(receipt.receipt);
    return receipt;
  }
  var init_userOperationReceipt = __esm({
    "node_modules/viem/_esm/account-abstraction/utils/formatters/userOperationReceipt.js"() {
      init_log2();
      init_transactionReceipt();
    }
  });

  // node_modules/viem/_esm/account-abstraction/actions/bundler/getUserOperationReceipt.js
  async function getUserOperationReceipt(client, { hash: hash3 }) {
    const receipt = await client.request({
      method: "eth_getUserOperationReceipt",
      params: [hash3]
    }, { dedupe: true });
    if (!receipt)
      throw new UserOperationReceiptNotFoundError({ hash: hash3 });
    return formatUserOperationReceipt(receipt);
  }
  var init_getUserOperationReceipt = __esm({
    "node_modules/viem/_esm/account-abstraction/actions/bundler/getUserOperationReceipt.js"() {
      init_userOperation();
      init_userOperationReceipt();
    }
  });

  // node_modules/viem/_esm/account-abstraction/actions/bundler/sendUserOperation.js
  async function sendUserOperation(client, parameters) {
    const { account: account_ = client.account, entryPointAddress } = parameters;
    if (!account_ && !parameters.sender)
      throw new AccountNotFoundError();
    const account = account_ ? parseAccount(account_) : void 0;
    const request = account ? await getAction(client, prepareUserOperation, "prepareUserOperation")(parameters) : parameters;
    const signature = parameters.signature || await account?.signUserOperation?.(request);
    const rpcParameters = formatUserOperationRequest({
      ...request,
      signature
    });
    try {
      return await client.request({
        method: "eth_sendUserOperation",
        params: [
          rpcParameters,
          entryPointAddress ?? account?.entryPoint?.address
        ]
      }, { retryCount: 0 });
    } catch (error) {
      const calls = parameters.calls;
      throw getUserOperationError(error, {
        ...request,
        ...calls ? { calls } : {},
        signature
      });
    }
  }
  var init_sendUserOperation = __esm({
    "node_modules/viem/_esm/account-abstraction/actions/bundler/sendUserOperation.js"() {
      init_parseAccount();
      init_account();
      init_getAction();
      init_getUserOperationError();
      init_userOperationRequest();
      init_prepareUserOperation();
    }
  });

  // node_modules/viem/_esm/account-abstraction/actions/bundler/waitForUserOperationReceipt.js
  function waitForUserOperationReceipt(client, parameters) {
    const { hash: hash3, pollingInterval = client.pollingInterval, retryCount, timeout = 12e4 } = parameters;
    let count = 0;
    const observerId = stringify([
      "waitForUserOperationReceipt",
      client.uid,
      hash3
    ]);
    return new Promise((resolve, reject) => {
      const unobserve = observe(observerId, { resolve, reject }, (emit) => {
        const done = (fn) => {
          unpoll();
          fn();
          unobserve();
        };
        const unpoll = poll(async () => {
          if (retryCount && count >= retryCount)
            done(() => emit.reject(new WaitForUserOperationReceiptTimeoutError({ hash: hash3 })));
          try {
            const receipt = await getAction(client, getUserOperationReceipt, "getUserOperationReceipt")({ hash: hash3 });
            done(() => emit.resolve(receipt));
          } catch (err) {
            const error = err;
            if (error.name !== "UserOperationReceiptNotFoundError")
              done(() => emit.reject(error));
          }
          count++;
        }, {
          emitOnBegin: true,
          interval: pollingInterval
        });
        if (timeout)
          setTimeout(() => done(() => emit.reject(new WaitForUserOperationReceiptTimeoutError({ hash: hash3 }))), timeout);
        return unpoll;
      });
    });
  }
  var init_waitForUserOperationReceipt = __esm({
    "node_modules/viem/_esm/account-abstraction/actions/bundler/waitForUserOperationReceipt.js"() {
      init_getAction();
      init_observe();
      init_poll();
      init_stringify();
      init_userOperation();
      init_getUserOperationReceipt();
    }
  });

  // node_modules/viem/_esm/account-abstraction/clients/decorators/bundler.js
  function bundlerActions(client) {
    return {
      estimateUserOperationGas: (parameters) => estimateUserOperationGas(client, parameters),
      getChainId: () => getChainId(client),
      getSupportedEntryPoints: () => getSupportedEntryPoints(client),
      getUserOperation: (parameters) => getUserOperation(client, parameters),
      getUserOperationReceipt: (parameters) => getUserOperationReceipt(client, parameters),
      prepareUserOperation: (parameters) => prepareUserOperation(client, parameters),
      sendUserOperation: (parameters) => sendUserOperation(client, parameters),
      waitForUserOperationReceipt: (parameters) => waitForUserOperationReceipt(client, parameters)
    };
  }
  var init_bundler2 = __esm({
    "node_modules/viem/_esm/account-abstraction/clients/decorators/bundler.js"() {
      init_getChainId();
      init_estimateUserOperationGas();
      init_getSupportedEntryPoints();
      init_getUserOperation();
      init_getUserOperationReceipt();
      init_prepareUserOperation();
      init_sendUserOperation();
      init_waitForUserOperationReceipt();
    }
  });

  // node_modules/viem/_esm/account-abstraction/clients/createBundlerClient.js
  function createBundlerClient(parameters) {
    const { client: client_, key = "bundler", name = "Bundler Client", paymaster, paymasterContext, transport, userOperation } = parameters;
    const client = Object.assign(createClient({
      ...parameters,
      chain: parameters.chain ?? client_?.chain,
      key,
      name,
      transport,
      type: "bundlerClient"
    }), { client: client_, paymaster, paymasterContext, userOperation });
    return client.extend(bundlerActions);
  }
  var init_createBundlerClient = __esm({
    "node_modules/viem/_esm/account-abstraction/clients/createBundlerClient.js"() {
      init_createClient();
      init_bundler2();
    }
  });

  // node_modules/viem/_esm/account-abstraction/index.js
  var init_account_abstraction = __esm({
    "node_modules/viem/_esm/account-abstraction/index.js"() {
      init_createWebAuthnCredential();
      init_toCoinbaseSmartAccount();
      init_toWebAuthnAccount();
      init_createBundlerClient();
    }
  });

  // node_modules/qrcode/lib/can-promise.js
  var require_can_promise = __commonJS({
    "node_modules/qrcode/lib/can-promise.js"(exports, module) {
      module.exports = function() {
        return typeof Promise === "function" && Promise.prototype && Promise.prototype.then;
      };
    }
  });

  // node_modules/qrcode/lib/core/utils.js
  var require_utils = __commonJS({
    "node_modules/qrcode/lib/core/utils.js"(exports) {
      var toSJISFunction;
      var CODEWORDS_COUNT = [
        0,
        // Not used
        26,
        44,
        70,
        100,
        134,
        172,
        196,
        242,
        292,
        346,
        404,
        466,
        532,
        581,
        655,
        733,
        815,
        901,
        991,
        1085,
        1156,
        1258,
        1364,
        1474,
        1588,
        1706,
        1828,
        1921,
        2051,
        2185,
        2323,
        2465,
        2611,
        2761,
        2876,
        3034,
        3196,
        3362,
        3532,
        3706
      ];
      exports.getSymbolSize = function getSymbolSize(version4) {
        if (!version4) throw new Error('"version" cannot be null or undefined');
        if (version4 < 1 || version4 > 40) throw new Error('"version" should be in range from 1 to 40');
        return version4 * 4 + 17;
      };
      exports.getSymbolTotalCodewords = function getSymbolTotalCodewords(version4) {
        return CODEWORDS_COUNT[version4];
      };
      exports.getBCHDigit = function(data) {
        let digit = 0;
        while (data !== 0) {
          digit++;
          data >>>= 1;
        }
        return digit;
      };
      exports.setToSJISFunction = function setToSJISFunction(f) {
        if (typeof f !== "function") {
          throw new Error('"toSJISFunc" is not a valid function.');
        }
        toSJISFunction = f;
      };
      exports.isKanjiModeEnabled = function() {
        return typeof toSJISFunction !== "undefined";
      };
      exports.toSJIS = function toSJIS(kanji) {
        return toSJISFunction(kanji);
      };
    }
  });

  // node_modules/qrcode/lib/core/error-correction-level.js
  var require_error_correction_level = __commonJS({
    "node_modules/qrcode/lib/core/error-correction-level.js"(exports) {
      exports.L = { bit: 1 };
      exports.M = { bit: 0 };
      exports.Q = { bit: 3 };
      exports.H = { bit: 2 };
      function fromString3(string) {
        if (typeof string !== "string") {
          throw new Error("Param is not a string");
        }
        const lcStr = string.toLowerCase();
        switch (lcStr) {
          case "l":
          case "low":
            return exports.L;
          case "m":
          case "medium":
            return exports.M;
          case "q":
          case "quartile":
            return exports.Q;
          case "h":
          case "high":
            return exports.H;
          default:
            throw new Error("Unknown EC Level: " + string);
        }
      }
      exports.isValid = function isValid(level) {
        return level && typeof level.bit !== "undefined" && level.bit >= 0 && level.bit < 4;
      };
      exports.from = function from14(value, defaultValue) {
        if (exports.isValid(value)) {
          return value;
        }
        try {
          return fromString3(value);
        } catch (e) {
          return defaultValue;
        }
      };
    }
  });

  // node_modules/qrcode/lib/core/bit-buffer.js
  var require_bit_buffer = __commonJS({
    "node_modules/qrcode/lib/core/bit-buffer.js"(exports, module) {
      function BitBuffer() {
        this.buffer = [];
        this.length = 0;
      }
      BitBuffer.prototype = {
        get: function(index2) {
          const bufIndex = Math.floor(index2 / 8);
          return (this.buffer[bufIndex] >>> 7 - index2 % 8 & 1) === 1;
        },
        put: function(num2, length) {
          for (let i = 0; i < length; i++) {
            this.putBit((num2 >>> length - i - 1 & 1) === 1);
          }
        },
        getLengthInBits: function() {
          return this.length;
        },
        putBit: function(bit) {
          const bufIndex = Math.floor(this.length / 8);
          if (this.buffer.length <= bufIndex) {
            this.buffer.push(0);
          }
          if (bit) {
            this.buffer[bufIndex] |= 128 >>> this.length % 8;
          }
          this.length++;
        }
      };
      module.exports = BitBuffer;
    }
  });

  // node_modules/qrcode/lib/core/bit-matrix.js
  var require_bit_matrix = __commonJS({
    "node_modules/qrcode/lib/core/bit-matrix.js"(exports, module) {
      function BitMatrix(size5) {
        if (!size5 || size5 < 1) {
          throw new Error("BitMatrix size must be defined and greater than 0");
        }
        this.size = size5;
        this.data = new Uint8Array(size5 * size5);
        this.reservedBit = new Uint8Array(size5 * size5);
      }
      BitMatrix.prototype.set = function(row, col, value, reserved) {
        const index2 = row * this.size + col;
        this.data[index2] = value;
        if (reserved) this.reservedBit[index2] = true;
      };
      BitMatrix.prototype.get = function(row, col) {
        return this.data[row * this.size + col];
      };
      BitMatrix.prototype.xor = function(row, col, value) {
        this.data[row * this.size + col] ^= value;
      };
      BitMatrix.prototype.isReserved = function(row, col) {
        return this.reservedBit[row * this.size + col];
      };
      module.exports = BitMatrix;
    }
  });

  // node_modules/qrcode/lib/core/alignment-pattern.js
  var require_alignment_pattern = __commonJS({
    "node_modules/qrcode/lib/core/alignment-pattern.js"(exports) {
      var getSymbolSize = require_utils().getSymbolSize;
      exports.getRowColCoords = function getRowColCoords(version4) {
        if (version4 === 1) return [];
        const posCount = Math.floor(version4 / 7) + 2;
        const size5 = getSymbolSize(version4);
        const intervals = size5 === 145 ? 26 : Math.ceil((size5 - 13) / (2 * posCount - 2)) * 2;
        const positions = [size5 - 7];
        for (let i = 1; i < posCount - 1; i++) {
          positions[i] = positions[i - 1] - intervals;
        }
        positions.push(6);
        return positions.reverse();
      };
      exports.getPositions = function getPositions(version4) {
        const coords = [];
        const pos = exports.getRowColCoords(version4);
        const posLength = pos.length;
        for (let i = 0; i < posLength; i++) {
          for (let j = 0; j < posLength; j++) {
            if (i === 0 && j === 0 || // top-left
            i === 0 && j === posLength - 1 || // bottom-left
            i === posLength - 1 && j === 0) {
              continue;
            }
            coords.push([pos[i], pos[j]]);
          }
        }
        return coords;
      };
    }
  });

  // node_modules/qrcode/lib/core/finder-pattern.js
  var require_finder_pattern = __commonJS({
    "node_modules/qrcode/lib/core/finder-pattern.js"(exports) {
      var getSymbolSize = require_utils().getSymbolSize;
      var FINDER_PATTERN_SIZE = 7;
      exports.getPositions = function getPositions(version4) {
        const size5 = getSymbolSize(version4);
        return [
          // top-left
          [0, 0],
          // top-right
          [size5 - FINDER_PATTERN_SIZE, 0],
          // bottom-left
          [0, size5 - FINDER_PATTERN_SIZE]
        ];
      };
    }
  });

  // node_modules/qrcode/lib/core/mask-pattern.js
  var require_mask_pattern = __commonJS({
    "node_modules/qrcode/lib/core/mask-pattern.js"(exports) {
      exports.Patterns = {
        PATTERN000: 0,
        PATTERN001: 1,
        PATTERN010: 2,
        PATTERN011: 3,
        PATTERN100: 4,
        PATTERN101: 5,
        PATTERN110: 6,
        PATTERN111: 7
      };
      var PenaltyScores = {
        N1: 3,
        N2: 3,
        N3: 40,
        N4: 10
      };
      exports.isValid = function isValid(mask) {
        return mask != null && mask !== "" && !isNaN(mask) && mask >= 0 && mask <= 7;
      };
      exports.from = function from14(value) {
        return exports.isValid(value) ? parseInt(value, 10) : void 0;
      };
      exports.getPenaltyN1 = function getPenaltyN1(data) {
        const size5 = data.size;
        let points = 0;
        let sameCountCol = 0;
        let sameCountRow = 0;
        let lastCol = null;
        let lastRow = null;
        for (let row = 0; row < size5; row++) {
          sameCountCol = sameCountRow = 0;
          lastCol = lastRow = null;
          for (let col = 0; col < size5; col++) {
            let module2 = data.get(row, col);
            if (module2 === lastCol) {
              sameCountCol++;
            } else {
              if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5);
              lastCol = module2;
              sameCountCol = 1;
            }
            module2 = data.get(col, row);
            if (module2 === lastRow) {
              sameCountRow++;
            } else {
              if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5);
              lastRow = module2;
              sameCountRow = 1;
            }
          }
          if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5);
          if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5);
        }
        return points;
      };
      exports.getPenaltyN2 = function getPenaltyN2(data) {
        const size5 = data.size;
        let points = 0;
        for (let row = 0; row < size5 - 1; row++) {
          for (let col = 0; col < size5 - 1; col++) {
            const last = data.get(row, col) + data.get(row, col + 1) + data.get(row + 1, col) + data.get(row + 1, col + 1);
            if (last === 4 || last === 0) points++;
          }
        }
        return points * PenaltyScores.N2;
      };
      exports.getPenaltyN3 = function getPenaltyN3(data) {
        const size5 = data.size;
        let points = 0;
        let bitsCol = 0;
        let bitsRow = 0;
        for (let row = 0; row < size5; row++) {
          bitsCol = bitsRow = 0;
          for (let col = 0; col < size5; col++) {
            bitsCol = bitsCol << 1 & 2047 | data.get(row, col);
            if (col >= 10 && (bitsCol === 1488 || bitsCol === 93)) points++;
            bitsRow = bitsRow << 1 & 2047 | data.get(col, row);
            if (col >= 10 && (bitsRow === 1488 || bitsRow === 93)) points++;
          }
        }
        return points * PenaltyScores.N3;
      };
      exports.getPenaltyN4 = function getPenaltyN4(data) {
        let darkCount = 0;
        const modulesCount = data.data.length;
        for (let i = 0; i < modulesCount; i++) darkCount += data.data[i];
        const k = Math.abs(Math.ceil(darkCount * 100 / modulesCount / 5) - 10);
        return k * PenaltyScores.N4;
      };
      function getMaskAt(maskPattern, i, j) {
        switch (maskPattern) {
          case exports.Patterns.PATTERN000:
            return (i + j) % 2 === 0;
          case exports.Patterns.PATTERN001:
            return i % 2 === 0;
          case exports.Patterns.PATTERN010:
            return j % 3 === 0;
          case exports.Patterns.PATTERN011:
            return (i + j) % 3 === 0;
          case exports.Patterns.PATTERN100:
            return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
          case exports.Patterns.PATTERN101:
            return i * j % 2 + i * j % 3 === 0;
          case exports.Patterns.PATTERN110:
            return (i * j % 2 + i * j % 3) % 2 === 0;
          case exports.Patterns.PATTERN111:
            return (i * j % 3 + (i + j) % 2) % 2 === 0;
          default:
            throw new Error("bad maskPattern:" + maskPattern);
        }
      }
      exports.applyMask = function applyMask(pattern, data) {
        const size5 = data.size;
        for (let col = 0; col < size5; col++) {
          for (let row = 0; row < size5; row++) {
            if (data.isReserved(row, col)) continue;
            data.xor(row, col, getMaskAt(pattern, row, col));
          }
        }
      };
      exports.getBestMask = function getBestMask(data, setupFormatFunc) {
        const numPatterns = Object.keys(exports.Patterns).length;
        let bestPattern = 0;
        let lowerPenalty = Infinity;
        for (let p = 0; p < numPatterns; p++) {
          setupFormatFunc(p);
          exports.applyMask(p, data);
          const penalty = exports.getPenaltyN1(data) + exports.getPenaltyN2(data) + exports.getPenaltyN3(data) + exports.getPenaltyN4(data);
          exports.applyMask(p, data);
          if (penalty < lowerPenalty) {
            lowerPenalty = penalty;
            bestPattern = p;
          }
        }
        return bestPattern;
      };
    }
  });

  // node_modules/qrcode/lib/core/error-correction-code.js
  var require_error_correction_code = __commonJS({
    "node_modules/qrcode/lib/core/error-correction-code.js"(exports) {
      var ECLevel = require_error_correction_level();
      var EC_BLOCKS_TABLE = [
        // L  M  Q  H
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        2,
        2,
        1,
        2,
        2,
        4,
        1,
        2,
        4,
        4,
        2,
        4,
        4,
        4,
        2,
        4,
        6,
        5,
        2,
        4,
        6,
        6,
        2,
        5,
        8,
        8,
        4,
        5,
        8,
        8,
        4,
        5,
        8,
        11,
        4,
        8,
        10,
        11,
        4,
        9,
        12,
        16,
        4,
        9,
        16,
        16,
        6,
        10,
        12,
        18,
        6,
        10,
        17,
        16,
        6,
        11,
        16,
        19,
        6,
        13,
        18,
        21,
        7,
        14,
        21,
        25,
        8,
        16,
        20,
        25,
        8,
        17,
        23,
        25,
        9,
        17,
        23,
        34,
        9,
        18,
        25,
        30,
        10,
        20,
        27,
        32,
        12,
        21,
        29,
        35,
        12,
        23,
        34,
        37,
        12,
        25,
        34,
        40,
        13,
        26,
        35,
        42,
        14,
        28,
        38,
        45,
        15,
        29,
        40,
        48,
        16,
        31,
        43,
        51,
        17,
        33,
        45,
        54,
        18,
        35,
        48,
        57,
        19,
        37,
        51,
        60,
        19,
        38,
        53,
        63,
        20,
        40,
        56,
        66,
        21,
        43,
        59,
        70,
        22,
        45,
        62,
        74,
        24,
        47,
        65,
        77,
        25,
        49,
        68,
        81
      ];
      var EC_CODEWORDS_TABLE = [
        // L  M  Q  H
        7,
        10,
        13,
        17,
        10,
        16,
        22,
        28,
        15,
        26,
        36,
        44,
        20,
        36,
        52,
        64,
        26,
        48,
        72,
        88,
        36,
        64,
        96,
        112,
        40,
        72,
        108,
        130,
        48,
        88,
        132,
        156,
        60,
        110,
        160,
        192,
        72,
        130,
        192,
        224,
        80,
        150,
        224,
        264,
        96,
        176,
        260,
        308,
        104,
        198,
        288,
        352,
        120,
        216,
        320,
        384,
        132,
        240,
        360,
        432,
        144,
        280,
        408,
        480,
        168,
        308,
        448,
        532,
        180,
        338,
        504,
        588,
        196,
        364,
        546,
        650,
        224,
        416,
        600,
        700,
        224,
        442,
        644,
        750,
        252,
        476,
        690,
        816,
        270,
        504,
        750,
        900,
        300,
        560,
        810,
        960,
        312,
        588,
        870,
        1050,
        336,
        644,
        952,
        1110,
        360,
        700,
        1020,
        1200,
        390,
        728,
        1050,
        1260,
        420,
        784,
        1140,
        1350,
        450,
        812,
        1200,
        1440,
        480,
        868,
        1290,
        1530,
        510,
        924,
        1350,
        1620,
        540,
        980,
        1440,
        1710,
        570,
        1036,
        1530,
        1800,
        570,
        1064,
        1590,
        1890,
        600,
        1120,
        1680,
        1980,
        630,
        1204,
        1770,
        2100,
        660,
        1260,
        1860,
        2220,
        720,
        1316,
        1950,
        2310,
        750,
        1372,
        2040,
        2430
      ];
      exports.getBlocksCount = function getBlocksCount(version4, errorCorrectionLevel) {
        switch (errorCorrectionLevel) {
          case ECLevel.L:
            return EC_BLOCKS_TABLE[(version4 - 1) * 4 + 0];
          case ECLevel.M:
            return EC_BLOCKS_TABLE[(version4 - 1) * 4 + 1];
          case ECLevel.Q:
            return EC_BLOCKS_TABLE[(version4 - 1) * 4 + 2];
          case ECLevel.H:
            return EC_BLOCKS_TABLE[(version4 - 1) * 4 + 3];
          default:
            return void 0;
        }
      };
      exports.getTotalCodewordsCount = function getTotalCodewordsCount(version4, errorCorrectionLevel) {
        switch (errorCorrectionLevel) {
          case ECLevel.L:
            return EC_CODEWORDS_TABLE[(version4 - 1) * 4 + 0];
          case ECLevel.M:
            return EC_CODEWORDS_TABLE[(version4 - 1) * 4 + 1];
          case ECLevel.Q:
            return EC_CODEWORDS_TABLE[(version4 - 1) * 4 + 2];
          case ECLevel.H:
            return EC_CODEWORDS_TABLE[(version4 - 1) * 4 + 3];
          default:
            return void 0;
        }
      };
    }
  });

  // node_modules/qrcode/lib/core/galois-field.js
  var require_galois_field = __commonJS({
    "node_modules/qrcode/lib/core/galois-field.js"(exports) {
      var EXP_TABLE = new Uint8Array(512);
      var LOG_TABLE = new Uint8Array(256);
      (function initTables() {
        let x = 1;
        for (let i = 0; i < 255; i++) {
          EXP_TABLE[i] = x;
          LOG_TABLE[x] = i;
          x <<= 1;
          if (x & 256) {
            x ^= 285;
          }
        }
        for (let i = 255; i < 512; i++) {
          EXP_TABLE[i] = EXP_TABLE[i - 255];
        }
      })();
      exports.log = function log(n) {
        if (n < 1) throw new Error("log(" + n + ")");
        return LOG_TABLE[n];
      };
      exports.exp = function exp(n) {
        return EXP_TABLE[n];
      };
      exports.mul = function mul(x, y) {
        if (x === 0 || y === 0) return 0;
        return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]];
      };
    }
  });

  // node_modules/qrcode/lib/core/polynomial.js
  var require_polynomial = __commonJS({
    "node_modules/qrcode/lib/core/polynomial.js"(exports) {
      var GF = require_galois_field();
      exports.mul = function mul(p1, p2) {
        const coeff = new Uint8Array(p1.length + p2.length - 1);
        for (let i = 0; i < p1.length; i++) {
          for (let j = 0; j < p2.length; j++) {
            coeff[i + j] ^= GF.mul(p1[i], p2[j]);
          }
        }
        return coeff;
      };
      exports.mod = function mod3(divident, divisor) {
        let result = new Uint8Array(divident);
        while (result.length - divisor.length >= 0) {
          const coeff = result[0];
          for (let i = 0; i < divisor.length; i++) {
            result[i] ^= GF.mul(divisor[i], coeff);
          }
          let offset = 0;
          while (offset < result.length && result[offset] === 0) offset++;
          result = result.slice(offset);
        }
        return result;
      };
      exports.generateECPolynomial = function generateECPolynomial(degree) {
        let poly = new Uint8Array([1]);
        for (let i = 0; i < degree; i++) {
          poly = exports.mul(poly, new Uint8Array([1, GF.exp(i)]));
        }
        return poly;
      };
    }
  });

  // node_modules/qrcode/lib/core/reed-solomon-encoder.js
  var require_reed_solomon_encoder = __commonJS({
    "node_modules/qrcode/lib/core/reed-solomon-encoder.js"(exports, module) {
      var Polynomial = require_polynomial();
      function ReedSolomonEncoder(degree) {
        this.genPoly = void 0;
        this.degree = degree;
        if (this.degree) this.initialize(this.degree);
      }
      ReedSolomonEncoder.prototype.initialize = function initialize(degree) {
        this.degree = degree;
        this.genPoly = Polynomial.generateECPolynomial(this.degree);
      };
      ReedSolomonEncoder.prototype.encode = function encode5(data) {
        if (!this.genPoly) {
          throw new Error("Encoder not initialized");
        }
        const paddedData = new Uint8Array(data.length + this.degree);
        paddedData.set(data);
        const remainder = Polynomial.mod(paddedData, this.genPoly);
        const start = this.degree - remainder.length;
        if (start > 0) {
          const buff = new Uint8Array(this.degree);
          buff.set(remainder, start);
          return buff;
        }
        return remainder;
      };
      module.exports = ReedSolomonEncoder;
    }
  });

  // node_modules/qrcode/lib/core/version-check.js
  var require_version_check = __commonJS({
    "node_modules/qrcode/lib/core/version-check.js"(exports) {
      exports.isValid = function isValid(version4) {
        return !isNaN(version4) && version4 >= 1 && version4 <= 40;
      };
    }
  });

  // node_modules/qrcode/lib/core/regex.js
  var require_regex = __commonJS({
    "node_modules/qrcode/lib/core/regex.js"(exports) {
      var numeric = "[0-9]+";
      var alphanumeric = "[A-Z $%*+\\-./:]+";
      var kanji = "(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";
      kanji = kanji.replace(/u/g, "\\u");
      var byte = "(?:(?![A-Z0-9 $%*+\\-./:]|" + kanji + ")(?:.|[\r\n]))+";
      exports.KANJI = new RegExp(kanji, "g");
      exports.BYTE_KANJI = new RegExp("[^A-Z0-9 $%*+\\-./:]+", "g");
      exports.BYTE = new RegExp(byte, "g");
      exports.NUMERIC = new RegExp(numeric, "g");
      exports.ALPHANUMERIC = new RegExp(alphanumeric, "g");
      var TEST_KANJI = new RegExp("^" + kanji + "$");
      var TEST_NUMERIC = new RegExp("^" + numeric + "$");
      var TEST_ALPHANUMERIC = new RegExp("^[A-Z0-9 $%*+\\-./:]+$");
      exports.testKanji = function testKanji(str) {
        return TEST_KANJI.test(str);
      };
      exports.testNumeric = function testNumeric(str) {
        return TEST_NUMERIC.test(str);
      };
      exports.testAlphanumeric = function testAlphanumeric(str) {
        return TEST_ALPHANUMERIC.test(str);
      };
    }
  });

  // node_modules/qrcode/lib/core/mode.js
  var require_mode = __commonJS({
    "node_modules/qrcode/lib/core/mode.js"(exports) {
      var VersionCheck = require_version_check();
      var Regex = require_regex();
      exports.NUMERIC = {
        id: "Numeric",
        bit: 1 << 0,
        ccBits: [10, 12, 14]
      };
      exports.ALPHANUMERIC = {
        id: "Alphanumeric",
        bit: 1 << 1,
        ccBits: [9, 11, 13]
      };
      exports.BYTE = {
        id: "Byte",
        bit: 1 << 2,
        ccBits: [8, 16, 16]
      };
      exports.KANJI = {
        id: "Kanji",
        bit: 1 << 3,
        ccBits: [8, 10, 12]
      };
      exports.MIXED = {
        bit: -1
      };
      exports.getCharCountIndicator = function getCharCountIndicator(mode, version4) {
        if (!mode.ccBits) throw new Error("Invalid mode: " + mode);
        if (!VersionCheck.isValid(version4)) {
          throw new Error("Invalid version: " + version4);
        }
        if (version4 >= 1 && version4 < 10) return mode.ccBits[0];
        else if (version4 < 27) return mode.ccBits[1];
        return mode.ccBits[2];
      };
      exports.getBestModeForData = function getBestModeForData(dataStr) {
        if (Regex.testNumeric(dataStr)) return exports.NUMERIC;
        else if (Regex.testAlphanumeric(dataStr)) return exports.ALPHANUMERIC;
        else if (Regex.testKanji(dataStr)) return exports.KANJI;
        else return exports.BYTE;
      };
      exports.toString = function toString2(mode) {
        if (mode && mode.id) return mode.id;
        throw new Error("Invalid mode");
      };
      exports.isValid = function isValid(mode) {
        return mode && mode.bit && mode.ccBits;
      };
      function fromString3(string) {
        if (typeof string !== "string") {
          throw new Error("Param is not a string");
        }
        const lcStr = string.toLowerCase();
        switch (lcStr) {
          case "numeric":
            return exports.NUMERIC;
          case "alphanumeric":
            return exports.ALPHANUMERIC;
          case "kanji":
            return exports.KANJI;
          case "byte":
            return exports.BYTE;
          default:
            throw new Error("Unknown mode: " + string);
        }
      }
      exports.from = function from14(value, defaultValue) {
        if (exports.isValid(value)) {
          return value;
        }
        try {
          return fromString3(value);
        } catch (e) {
          return defaultValue;
        }
      };
    }
  });

  // node_modules/qrcode/lib/core/version.js
  var require_version = __commonJS({
    "node_modules/qrcode/lib/core/version.js"(exports) {
      var Utils = require_utils();
      var ECCode = require_error_correction_code();
      var ECLevel = require_error_correction_level();
      var Mode = require_mode();
      var VersionCheck = require_version_check();
      var G18 = 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0;
      var G18_BCH = Utils.getBCHDigit(G18);
      function getBestVersionForDataLength(mode, length, errorCorrectionLevel) {
        for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
          if (length <= exports.getCapacity(currentVersion, errorCorrectionLevel, mode)) {
            return currentVersion;
          }
        }
        return void 0;
      }
      function getReservedBitsCount(mode, version4) {
        return Mode.getCharCountIndicator(mode, version4) + 4;
      }
      function getTotalBitsFromDataArray(segments, version4) {
        let totalBits = 0;
        segments.forEach(function(data) {
          const reservedBits = getReservedBitsCount(data.mode, version4);
          totalBits += reservedBits + data.getBitsLength();
        });
        return totalBits;
      }
      function getBestVersionForMixedData(segments, errorCorrectionLevel) {
        for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
          const length = getTotalBitsFromDataArray(segments, currentVersion);
          if (length <= exports.getCapacity(currentVersion, errorCorrectionLevel, Mode.MIXED)) {
            return currentVersion;
          }
        }
        return void 0;
      }
      exports.from = function from14(value, defaultValue) {
        if (VersionCheck.isValid(value)) {
          return parseInt(value, 10);
        }
        return defaultValue;
      };
      exports.getCapacity = function getCapacity(version4, errorCorrectionLevel, mode) {
        if (!VersionCheck.isValid(version4)) {
          throw new Error("Invalid QR Code version");
        }
        if (typeof mode === "undefined") mode = Mode.BYTE;
        const totalCodewords = Utils.getSymbolTotalCodewords(version4);
        const ecTotalCodewords = ECCode.getTotalCodewordsCount(version4, errorCorrectionLevel);
        const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;
        if (mode === Mode.MIXED) return dataTotalCodewordsBits;
        const usableBits = dataTotalCodewordsBits - getReservedBitsCount(mode, version4);
        switch (mode) {
          case Mode.NUMERIC:
            return Math.floor(usableBits / 10 * 3);
          case Mode.ALPHANUMERIC:
            return Math.floor(usableBits / 11 * 2);
          case Mode.KANJI:
            return Math.floor(usableBits / 13);
          case Mode.BYTE:
          default:
            return Math.floor(usableBits / 8);
        }
      };
      exports.getBestVersionForData = function getBestVersionForData(data, errorCorrectionLevel) {
        let seg;
        const ecl = ECLevel.from(errorCorrectionLevel, ECLevel.M);
        if (Array.isArray(data)) {
          if (data.length > 1) {
            return getBestVersionForMixedData(data, ecl);
          }
          if (data.length === 0) {
            return 1;
          }
          seg = data[0];
        } else {
          seg = data;
        }
        return getBestVersionForDataLength(seg.mode, seg.getLength(), ecl);
      };
      exports.getEncodedBits = function getEncodedBits(version4) {
        if (!VersionCheck.isValid(version4) || version4 < 7) {
          throw new Error("Invalid QR Code version");
        }
        let d = version4 << 12;
        while (Utils.getBCHDigit(d) - G18_BCH >= 0) {
          d ^= G18 << Utils.getBCHDigit(d) - G18_BCH;
        }
        return version4 << 12 | d;
      };
    }
  });

  // node_modules/qrcode/lib/core/format-info.js
  var require_format_info = __commonJS({
    "node_modules/qrcode/lib/core/format-info.js"(exports) {
      var Utils = require_utils();
      var G15 = 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0;
      var G15_MASK = 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1;
      var G15_BCH = Utils.getBCHDigit(G15);
      exports.getEncodedBits = function getEncodedBits(errorCorrectionLevel, mask) {
        const data = errorCorrectionLevel.bit << 3 | mask;
        let d = data << 10;
        while (Utils.getBCHDigit(d) - G15_BCH >= 0) {
          d ^= G15 << Utils.getBCHDigit(d) - G15_BCH;
        }
        return (data << 10 | d) ^ G15_MASK;
      };
    }
  });

  // node_modules/qrcode/lib/core/numeric-data.js
  var require_numeric_data = __commonJS({
    "node_modules/qrcode/lib/core/numeric-data.js"(exports, module) {
      var Mode = require_mode();
      function NumericData(data) {
        this.mode = Mode.NUMERIC;
        this.data = data.toString();
      }
      NumericData.getBitsLength = function getBitsLength(length) {
        return 10 * Math.floor(length / 3) + (length % 3 ? length % 3 * 3 + 1 : 0);
      };
      NumericData.prototype.getLength = function getLength() {
        return this.data.length;
      };
      NumericData.prototype.getBitsLength = function getBitsLength() {
        return NumericData.getBitsLength(this.data.length);
      };
      NumericData.prototype.write = function write(bitBuffer) {
        let i, group, value;
        for (i = 0; i + 3 <= this.data.length; i += 3) {
          group = this.data.substr(i, 3);
          value = parseInt(group, 10);
          bitBuffer.put(value, 10);
        }
        const remainingNum = this.data.length - i;
        if (remainingNum > 0) {
          group = this.data.substr(i);
          value = parseInt(group, 10);
          bitBuffer.put(value, remainingNum * 3 + 1);
        }
      };
      module.exports = NumericData;
    }
  });

  // node_modules/qrcode/lib/core/alphanumeric-data.js
  var require_alphanumeric_data = __commonJS({
    "node_modules/qrcode/lib/core/alphanumeric-data.js"(exports, module) {
      var Mode = require_mode();
      var ALPHA_NUM_CHARS = [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z",
        " ",
        "$",
        "%",
        "*",
        "+",
        "-",
        ".",
        "/",
        ":"
      ];
      function AlphanumericData(data) {
        this.mode = Mode.ALPHANUMERIC;
        this.data = data;
      }
      AlphanumericData.getBitsLength = function getBitsLength(length) {
        return 11 * Math.floor(length / 2) + 6 * (length % 2);
      };
      AlphanumericData.prototype.getLength = function getLength() {
        return this.data.length;
      };
      AlphanumericData.prototype.getBitsLength = function getBitsLength() {
        return AlphanumericData.getBitsLength(this.data.length);
      };
      AlphanumericData.prototype.write = function write(bitBuffer) {
        let i;
        for (i = 0; i + 2 <= this.data.length; i += 2) {
          let value = ALPHA_NUM_CHARS.indexOf(this.data[i]) * 45;
          value += ALPHA_NUM_CHARS.indexOf(this.data[i + 1]);
          bitBuffer.put(value, 11);
        }
        if (this.data.length % 2) {
          bitBuffer.put(ALPHA_NUM_CHARS.indexOf(this.data[i]), 6);
        }
      };
      module.exports = AlphanumericData;
    }
  });

  // node_modules/qrcode/lib/core/byte-data.js
  var require_byte_data = __commonJS({
    "node_modules/qrcode/lib/core/byte-data.js"(exports, module) {
      var Mode = require_mode();
      function ByteData(data) {
        this.mode = Mode.BYTE;
        if (typeof data === "string") {
          this.data = new TextEncoder().encode(data);
        } else {
          this.data = new Uint8Array(data);
        }
      }
      ByteData.getBitsLength = function getBitsLength(length) {
        return length * 8;
      };
      ByteData.prototype.getLength = function getLength() {
        return this.data.length;
      };
      ByteData.prototype.getBitsLength = function getBitsLength() {
        return ByteData.getBitsLength(this.data.length);
      };
      ByteData.prototype.write = function(bitBuffer) {
        for (let i = 0, l = this.data.length; i < l; i++) {
          bitBuffer.put(this.data[i], 8);
        }
      };
      module.exports = ByteData;
    }
  });

  // node_modules/qrcode/lib/core/kanji-data.js
  var require_kanji_data = __commonJS({
    "node_modules/qrcode/lib/core/kanji-data.js"(exports, module) {
      var Mode = require_mode();
      var Utils = require_utils();
      function KanjiData(data) {
        this.mode = Mode.KANJI;
        this.data = data;
      }
      KanjiData.getBitsLength = function getBitsLength(length) {
        return length * 13;
      };
      KanjiData.prototype.getLength = function getLength() {
        return this.data.length;
      };
      KanjiData.prototype.getBitsLength = function getBitsLength() {
        return KanjiData.getBitsLength(this.data.length);
      };
      KanjiData.prototype.write = function(bitBuffer) {
        let i;
        for (i = 0; i < this.data.length; i++) {
          let value = Utils.toSJIS(this.data[i]);
          if (value >= 33088 && value <= 40956) {
            value -= 33088;
          } else if (value >= 57408 && value <= 60351) {
            value -= 49472;
          } else {
            throw new Error(
              "Invalid SJIS character: " + this.data[i] + "\nMake sure your charset is UTF-8"
            );
          }
          value = (value >>> 8 & 255) * 192 + (value & 255);
          bitBuffer.put(value, 13);
        }
      };
      module.exports = KanjiData;
    }
  });

  // node_modules/dijkstrajs/dijkstra.js
  var require_dijkstra = __commonJS({
    "node_modules/dijkstrajs/dijkstra.js"(exports, module) {
      "use strict";
      var dijkstra = {
        single_source_shortest_paths: function(graph, s, d) {
          var predecessors = {};
          var costs = {};
          costs[s] = 0;
          var open = dijkstra.PriorityQueue.make();
          open.push(s, 0);
          var closest, u, v, cost_of_s_to_u, adjacent_nodes, cost_of_e, cost_of_s_to_u_plus_cost_of_e, cost_of_s_to_v, first_visit;
          while (!open.empty()) {
            closest = open.pop();
            u = closest.value;
            cost_of_s_to_u = closest.cost;
            adjacent_nodes = graph[u] || {};
            for (v in adjacent_nodes) {
              if (adjacent_nodes.hasOwnProperty(v)) {
                cost_of_e = adjacent_nodes[v];
                cost_of_s_to_u_plus_cost_of_e = cost_of_s_to_u + cost_of_e;
                cost_of_s_to_v = costs[v];
                first_visit = typeof costs[v] === "undefined";
                if (first_visit || cost_of_s_to_v > cost_of_s_to_u_plus_cost_of_e) {
                  costs[v] = cost_of_s_to_u_plus_cost_of_e;
                  open.push(v, cost_of_s_to_u_plus_cost_of_e);
                  predecessors[v] = u;
                }
              }
            }
          }
          if (typeof d !== "undefined" && typeof costs[d] === "undefined") {
            var msg = ["Could not find a path from ", s, " to ", d, "."].join("");
            throw new Error(msg);
          }
          return predecessors;
        },
        extract_shortest_path_from_predecessor_list: function(predecessors, d) {
          var nodes = [];
          var u = d;
          var predecessor;
          while (u) {
            nodes.push(u);
            predecessor = predecessors[u];
            u = predecessors[u];
          }
          nodes.reverse();
          return nodes;
        },
        find_path: function(graph, s, d) {
          var predecessors = dijkstra.single_source_shortest_paths(graph, s, d);
          return dijkstra.extract_shortest_path_from_predecessor_list(
            predecessors,
            d
          );
        },
        /**
         * A very naive priority queue implementation.
         */
        PriorityQueue: {
          make: function(opts) {
            var T = dijkstra.PriorityQueue, t = {}, key;
            opts = opts || {};
            for (key in T) {
              if (T.hasOwnProperty(key)) {
                t[key] = T[key];
              }
            }
            t.queue = [];
            t.sorter = opts.sorter || T.default_sorter;
            return t;
          },
          default_sorter: function(a, b) {
            return a.cost - b.cost;
          },
          /**
           * Add a new item to the queue and ensure the highest priority element
           * is at the front of the queue.
           */
          push: function(value, cost) {
            var item = { value, cost };
            this.queue.push(item);
            this.queue.sort(this.sorter);
          },
          /**
           * Return the highest priority element in the queue.
           */
          pop: function() {
            return this.queue.shift();
          },
          empty: function() {
            return this.queue.length === 0;
          }
        }
      };
      if (typeof module !== "undefined") {
        module.exports = dijkstra;
      }
    }
  });

  // node_modules/qrcode/lib/core/segments.js
  var require_segments = __commonJS({
    "node_modules/qrcode/lib/core/segments.js"(exports) {
      var Mode = require_mode();
      var NumericData = require_numeric_data();
      var AlphanumericData = require_alphanumeric_data();
      var ByteData = require_byte_data();
      var KanjiData = require_kanji_data();
      var Regex = require_regex();
      var Utils = require_utils();
      var dijkstra = require_dijkstra();
      function getStringByteLength(str) {
        return unescape(encodeURIComponent(str)).length;
      }
      function getSegments(regex, mode, str) {
        const segments = [];
        let result;
        while ((result = regex.exec(str)) !== null) {
          segments.push({
            data: result[0],
            index: result.index,
            mode,
            length: result[0].length
          });
        }
        return segments;
      }
      function getSegmentsFromString(dataStr) {
        const numSegs = getSegments(Regex.NUMERIC, Mode.NUMERIC, dataStr);
        const alphaNumSegs = getSegments(Regex.ALPHANUMERIC, Mode.ALPHANUMERIC, dataStr);
        let byteSegs;
        let kanjiSegs;
        if (Utils.isKanjiModeEnabled()) {
          byteSegs = getSegments(Regex.BYTE, Mode.BYTE, dataStr);
          kanjiSegs = getSegments(Regex.KANJI, Mode.KANJI, dataStr);
        } else {
          byteSegs = getSegments(Regex.BYTE_KANJI, Mode.BYTE, dataStr);
          kanjiSegs = [];
        }
        const segs = numSegs.concat(alphaNumSegs, byteSegs, kanjiSegs);
        return segs.sort(function(s1, s2) {
          return s1.index - s2.index;
        }).map(function(obj) {
          return {
            data: obj.data,
            mode: obj.mode,
            length: obj.length
          };
        });
      }
      function getSegmentBitsLength(length, mode) {
        switch (mode) {
          case Mode.NUMERIC:
            return NumericData.getBitsLength(length);
          case Mode.ALPHANUMERIC:
            return AlphanumericData.getBitsLength(length);
          case Mode.KANJI:
            return KanjiData.getBitsLength(length);
          case Mode.BYTE:
            return ByteData.getBitsLength(length);
        }
      }
      function mergeSegments(segs) {
        return segs.reduce(function(acc, curr) {
          const prevSeg = acc.length - 1 >= 0 ? acc[acc.length - 1] : null;
          if (prevSeg && prevSeg.mode === curr.mode) {
            acc[acc.length - 1].data += curr.data;
            return acc;
          }
          acc.push(curr);
          return acc;
        }, []);
      }
      function buildNodes(segs) {
        const nodes = [];
        for (let i = 0; i < segs.length; i++) {
          const seg = segs[i];
          switch (seg.mode) {
            case Mode.NUMERIC:
              nodes.push([
                seg,
                { data: seg.data, mode: Mode.ALPHANUMERIC, length: seg.length },
                { data: seg.data, mode: Mode.BYTE, length: seg.length }
              ]);
              break;
            case Mode.ALPHANUMERIC:
              nodes.push([
                seg,
                { data: seg.data, mode: Mode.BYTE, length: seg.length }
              ]);
              break;
            case Mode.KANJI:
              nodes.push([
                seg,
                { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }
              ]);
              break;
            case Mode.BYTE:
              nodes.push([
                { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }
              ]);
          }
        }
        return nodes;
      }
      function buildGraph(nodes, version4) {
        const table = {};
        const graph = { start: {} };
        let prevNodeIds = ["start"];
        for (let i = 0; i < nodes.length; i++) {
          const nodeGroup = nodes[i];
          const currentNodeIds = [];
          for (let j = 0; j < nodeGroup.length; j++) {
            const node = nodeGroup[j];
            const key = "" + i + j;
            currentNodeIds.push(key);
            table[key] = { node, lastCount: 0 };
            graph[key] = {};
            for (let n = 0; n < prevNodeIds.length; n++) {
              const prevNodeId = prevNodeIds[n];
              if (table[prevNodeId] && table[prevNodeId].node.mode === node.mode) {
                graph[prevNodeId][key] = getSegmentBitsLength(table[prevNodeId].lastCount + node.length, node.mode) - getSegmentBitsLength(table[prevNodeId].lastCount, node.mode);
                table[prevNodeId].lastCount += node.length;
              } else {
                if (table[prevNodeId]) table[prevNodeId].lastCount = node.length;
                graph[prevNodeId][key] = getSegmentBitsLength(node.length, node.mode) + 4 + Mode.getCharCountIndicator(node.mode, version4);
              }
            }
          }
          prevNodeIds = currentNodeIds;
        }
        for (let n = 0; n < prevNodeIds.length; n++) {
          graph[prevNodeIds[n]].end = 0;
        }
        return { map: graph, table };
      }
      function buildSingleSegment(data, modesHint) {
        let mode;
        const bestMode = Mode.getBestModeForData(data);
        mode = Mode.from(modesHint, bestMode);
        if (mode !== Mode.BYTE && mode.bit < bestMode.bit) {
          throw new Error('"' + data + '" cannot be encoded with mode ' + Mode.toString(mode) + ".\n Suggested mode is: " + Mode.toString(bestMode));
        }
        if (mode === Mode.KANJI && !Utils.isKanjiModeEnabled()) {
          mode = Mode.BYTE;
        }
        switch (mode) {
          case Mode.NUMERIC:
            return new NumericData(data);
          case Mode.ALPHANUMERIC:
            return new AlphanumericData(data);
          case Mode.KANJI:
            return new KanjiData(data);
          case Mode.BYTE:
            return new ByteData(data);
        }
      }
      exports.fromArray = function fromArray2(array) {
        return array.reduce(function(acc, seg) {
          if (typeof seg === "string") {
            acc.push(buildSingleSegment(seg, null));
          } else if (seg.data) {
            acc.push(buildSingleSegment(seg.data, seg.mode));
          }
          return acc;
        }, []);
      };
      exports.fromString = function fromString3(data, version4) {
        const segs = getSegmentsFromString(data, Utils.isKanjiModeEnabled());
        const nodes = buildNodes(segs);
        const graph = buildGraph(nodes, version4);
        const path = dijkstra.find_path(graph.map, "start", "end");
        const optimizedSegs = [];
        for (let i = 1; i < path.length - 1; i++) {
          optimizedSegs.push(graph.table[path[i]].node);
        }
        return exports.fromArray(mergeSegments(optimizedSegs));
      };
      exports.rawSplit = function rawSplit(data) {
        return exports.fromArray(
          getSegmentsFromString(data, Utils.isKanjiModeEnabled())
        );
      };
    }
  });

  // node_modules/qrcode/lib/core/qrcode.js
  var require_qrcode = __commonJS({
    "node_modules/qrcode/lib/core/qrcode.js"(exports) {
      var Utils = require_utils();
      var ECLevel = require_error_correction_level();
      var BitBuffer = require_bit_buffer();
      var BitMatrix = require_bit_matrix();
      var AlignmentPattern = require_alignment_pattern();
      var FinderPattern = require_finder_pattern();
      var MaskPattern = require_mask_pattern();
      var ECCode = require_error_correction_code();
      var ReedSolomonEncoder = require_reed_solomon_encoder();
      var Version = require_version();
      var FormatInfo = require_format_info();
      var Mode = require_mode();
      var Segments = require_segments();
      function setupFinderPattern(matrix, version4) {
        const size5 = matrix.size;
        const pos = FinderPattern.getPositions(version4);
        for (let i = 0; i < pos.length; i++) {
          const row = pos[i][0];
          const col = pos[i][1];
          for (let r = -1; r <= 7; r++) {
            if (row + r <= -1 || size5 <= row + r) continue;
            for (let c = -1; c <= 7; c++) {
              if (col + c <= -1 || size5 <= col + c) continue;
              if (r >= 0 && r <= 6 && (c === 0 || c === 6) || c >= 0 && c <= 6 && (r === 0 || r === 6) || r >= 2 && r <= 4 && c >= 2 && c <= 4) {
                matrix.set(row + r, col + c, true, true);
              } else {
                matrix.set(row + r, col + c, false, true);
              }
            }
          }
        }
      }
      function setupTimingPattern(matrix) {
        const size5 = matrix.size;
        for (let r = 8; r < size5 - 8; r++) {
          const value = r % 2 === 0;
          matrix.set(r, 6, value, true);
          matrix.set(6, r, value, true);
        }
      }
      function setupAlignmentPattern(matrix, version4) {
        const pos = AlignmentPattern.getPositions(version4);
        for (let i = 0; i < pos.length; i++) {
          const row = pos[i][0];
          const col = pos[i][1];
          for (let r = -2; r <= 2; r++) {
            for (let c = -2; c <= 2; c++) {
              if (r === -2 || r === 2 || c === -2 || c === 2 || r === 0 && c === 0) {
                matrix.set(row + r, col + c, true, true);
              } else {
                matrix.set(row + r, col + c, false, true);
              }
            }
          }
        }
      }
      function setupVersionInfo(matrix, version4) {
        const size5 = matrix.size;
        const bits = Version.getEncodedBits(version4);
        let row, col, mod3;
        for (let i = 0; i < 18; i++) {
          row = Math.floor(i / 3);
          col = i % 3 + size5 - 8 - 3;
          mod3 = (bits >> i & 1) === 1;
          matrix.set(row, col, mod3, true);
          matrix.set(col, row, mod3, true);
        }
      }
      function setupFormatInfo(matrix, errorCorrectionLevel, maskPattern) {
        const size5 = matrix.size;
        const bits = FormatInfo.getEncodedBits(errorCorrectionLevel, maskPattern);
        let i, mod3;
        for (i = 0; i < 15; i++) {
          mod3 = (bits >> i & 1) === 1;
          if (i < 6) {
            matrix.set(i, 8, mod3, true);
          } else if (i < 8) {
            matrix.set(i + 1, 8, mod3, true);
          } else {
            matrix.set(size5 - 15 + i, 8, mod3, true);
          }
          if (i < 8) {
            matrix.set(8, size5 - i - 1, mod3, true);
          } else if (i < 9) {
            matrix.set(8, 15 - i - 1 + 1, mod3, true);
          } else {
            matrix.set(8, 15 - i - 1, mod3, true);
          }
        }
        matrix.set(size5 - 8, 8, 1, true);
      }
      function setupData(matrix, data) {
        const size5 = matrix.size;
        let inc = -1;
        let row = size5 - 1;
        let bitIndex = 7;
        let byteIndex = 0;
        for (let col = size5 - 1; col > 0; col -= 2) {
          if (col === 6) col--;
          while (true) {
            for (let c = 0; c < 2; c++) {
              if (!matrix.isReserved(row, col - c)) {
                let dark = false;
                if (byteIndex < data.length) {
                  dark = (data[byteIndex] >>> bitIndex & 1) === 1;
                }
                matrix.set(row, col - c, dark);
                bitIndex--;
                if (bitIndex === -1) {
                  byteIndex++;
                  bitIndex = 7;
                }
              }
            }
            row += inc;
            if (row < 0 || size5 <= row) {
              row -= inc;
              inc = -inc;
              break;
            }
          }
        }
      }
      function createData(version4, errorCorrectionLevel, segments) {
        const buffer2 = new BitBuffer();
        segments.forEach(function(data) {
          buffer2.put(data.mode.bit, 4);
          buffer2.put(data.getLength(), Mode.getCharCountIndicator(data.mode, version4));
          data.write(buffer2);
        });
        const totalCodewords = Utils.getSymbolTotalCodewords(version4);
        const ecTotalCodewords = ECCode.getTotalCodewordsCount(version4, errorCorrectionLevel);
        const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;
        if (buffer2.getLengthInBits() + 4 <= dataTotalCodewordsBits) {
          buffer2.put(0, 4);
        }
        while (buffer2.getLengthInBits() % 8 !== 0) {
          buffer2.putBit(0);
        }
        const remainingByte = (dataTotalCodewordsBits - buffer2.getLengthInBits()) / 8;
        for (let i = 0; i < remainingByte; i++) {
          buffer2.put(i % 2 ? 17 : 236, 8);
        }
        return createCodewords(buffer2, version4, errorCorrectionLevel);
      }
      function createCodewords(bitBuffer, version4, errorCorrectionLevel) {
        const totalCodewords = Utils.getSymbolTotalCodewords(version4);
        const ecTotalCodewords = ECCode.getTotalCodewordsCount(version4, errorCorrectionLevel);
        const dataTotalCodewords = totalCodewords - ecTotalCodewords;
        const ecTotalBlocks = ECCode.getBlocksCount(version4, errorCorrectionLevel);
        const blocksInGroup2 = totalCodewords % ecTotalBlocks;
        const blocksInGroup1 = ecTotalBlocks - blocksInGroup2;
        const totalCodewordsInGroup1 = Math.floor(totalCodewords / ecTotalBlocks);
        const dataCodewordsInGroup1 = Math.floor(dataTotalCodewords / ecTotalBlocks);
        const dataCodewordsInGroup2 = dataCodewordsInGroup1 + 1;
        const ecCount = totalCodewordsInGroup1 - dataCodewordsInGroup1;
        const rs = new ReedSolomonEncoder(ecCount);
        let offset = 0;
        const dcData = new Array(ecTotalBlocks);
        const ecData = new Array(ecTotalBlocks);
        let maxDataSize = 0;
        const buffer2 = new Uint8Array(bitBuffer.buffer);
        for (let b = 0; b < ecTotalBlocks; b++) {
          const dataSize = b < blocksInGroup1 ? dataCodewordsInGroup1 : dataCodewordsInGroup2;
          dcData[b] = buffer2.slice(offset, offset + dataSize);
          ecData[b] = rs.encode(dcData[b]);
          offset += dataSize;
          maxDataSize = Math.max(maxDataSize, dataSize);
        }
        const data = new Uint8Array(totalCodewords);
        let index2 = 0;
        let i, r;
        for (i = 0; i < maxDataSize; i++) {
          for (r = 0; r < ecTotalBlocks; r++) {
            if (i < dcData[r].length) {
              data[index2++] = dcData[r][i];
            }
          }
        }
        for (i = 0; i < ecCount; i++) {
          for (r = 0; r < ecTotalBlocks; r++) {
            data[index2++] = ecData[r][i];
          }
        }
        return data;
      }
      function createSymbol(data, version4, errorCorrectionLevel, maskPattern) {
        let segments;
        if (Array.isArray(data)) {
          segments = Segments.fromArray(data);
        } else if (typeof data === "string") {
          let estimatedVersion = version4;
          if (!estimatedVersion) {
            const rawSegments = Segments.rawSplit(data);
            estimatedVersion = Version.getBestVersionForData(rawSegments, errorCorrectionLevel);
          }
          segments = Segments.fromString(data, estimatedVersion || 40);
        } else {
          throw new Error("Invalid data");
        }
        const bestVersion = Version.getBestVersionForData(segments, errorCorrectionLevel);
        if (!bestVersion) {
          throw new Error("The amount of data is too big to be stored in a QR Code");
        }
        if (!version4) {
          version4 = bestVersion;
        } else if (version4 < bestVersion) {
          throw new Error(
            "\nThe chosen QR Code version cannot contain this amount of data.\nMinimum version required to store current data is: " + bestVersion + ".\n"
          );
        }
        const dataBits = createData(version4, errorCorrectionLevel, segments);
        const moduleCount = Utils.getSymbolSize(version4);
        const modules = new BitMatrix(moduleCount);
        setupFinderPattern(modules, version4);
        setupTimingPattern(modules);
        setupAlignmentPattern(modules, version4);
        setupFormatInfo(modules, errorCorrectionLevel, 0);
        if (version4 >= 7) {
          setupVersionInfo(modules, version4);
        }
        setupData(modules, dataBits);
        if (isNaN(maskPattern)) {
          maskPattern = MaskPattern.getBestMask(
            modules,
            setupFormatInfo.bind(null, modules, errorCorrectionLevel)
          );
        }
        MaskPattern.applyMask(maskPattern, modules);
        setupFormatInfo(modules, errorCorrectionLevel, maskPattern);
        return {
          modules,
          version: version4,
          errorCorrectionLevel,
          maskPattern,
          segments
        };
      }
      exports.create = function create2(data, options) {
        if (typeof data === "undefined" || data === "") {
          throw new Error("No input text");
        }
        let errorCorrectionLevel = ECLevel.M;
        let version4;
        let mask;
        if (typeof options !== "undefined") {
          errorCorrectionLevel = ECLevel.from(options.errorCorrectionLevel, ECLevel.M);
          version4 = Version.from(options.version);
          mask = MaskPattern.from(options.maskPattern);
          if (options.toSJISFunc) {
            Utils.setToSJISFunction(options.toSJISFunc);
          }
        }
        return createSymbol(data, version4, errorCorrectionLevel, mask);
      };
    }
  });

  // node_modules/qrcode/lib/renderer/utils.js
  var require_utils2 = __commonJS({
    "node_modules/qrcode/lib/renderer/utils.js"(exports) {
      function hex2rgba(hex) {
        if (typeof hex === "number") {
          hex = hex.toString();
        }
        if (typeof hex !== "string") {
          throw new Error("Color should be defined as hex string");
        }
        let hexCode = hex.slice().replace("#", "").split("");
        if (hexCode.length < 3 || hexCode.length === 5 || hexCode.length > 8) {
          throw new Error("Invalid hex color: " + hex);
        }
        if (hexCode.length === 3 || hexCode.length === 4) {
          hexCode = Array.prototype.concat.apply([], hexCode.map(function(c) {
            return [c, c];
          }));
        }
        if (hexCode.length === 6) hexCode.push("F", "F");
        const hexValue = parseInt(hexCode.join(""), 16);
        return {
          r: hexValue >> 24 & 255,
          g: hexValue >> 16 & 255,
          b: hexValue >> 8 & 255,
          a: hexValue & 255,
          hex: "#" + hexCode.slice(0, 6).join("")
        };
      }
      exports.getOptions = function getOptions(options) {
        if (!options) options = {};
        if (!options.color) options.color = {};
        const margin = typeof options.margin === "undefined" || options.margin === null || options.margin < 0 ? 4 : options.margin;
        const width = options.width && options.width >= 21 ? options.width : void 0;
        const scale = options.scale || 4;
        return {
          width,
          scale: width ? 4 : scale,
          margin,
          color: {
            dark: hex2rgba(options.color.dark || "#000000ff"),
            light: hex2rgba(options.color.light || "#ffffffff")
          },
          type: options.type,
          rendererOpts: options.rendererOpts || {}
        };
      };
      exports.getScale = function getScale(qrSize, opts) {
        return opts.width && opts.width >= qrSize + opts.margin * 2 ? opts.width / (qrSize + opts.margin * 2) : opts.scale;
      };
      exports.getImageWidth = function getImageWidth(qrSize, opts) {
        const scale = exports.getScale(qrSize, opts);
        return Math.floor((qrSize + opts.margin * 2) * scale);
      };
      exports.qrToImageData = function qrToImageData(imgData, qr, opts) {
        const size5 = qr.modules.size;
        const data = qr.modules.data;
        const scale = exports.getScale(size5, opts);
        const symbolSize = Math.floor((size5 + opts.margin * 2) * scale);
        const scaledMargin = opts.margin * scale;
        const palette = [opts.color.light, opts.color.dark];
        for (let i = 0; i < symbolSize; i++) {
          for (let j = 0; j < symbolSize; j++) {
            let posDst = (i * symbolSize + j) * 4;
            let pxColor = opts.color.light;
            if (i >= scaledMargin && j >= scaledMargin && i < symbolSize - scaledMargin && j < symbolSize - scaledMargin) {
              const iSrc = Math.floor((i - scaledMargin) / scale);
              const jSrc = Math.floor((j - scaledMargin) / scale);
              pxColor = palette[data[iSrc * size5 + jSrc] ? 1 : 0];
            }
            imgData[posDst++] = pxColor.r;
            imgData[posDst++] = pxColor.g;
            imgData[posDst++] = pxColor.b;
            imgData[posDst] = pxColor.a;
          }
        }
      };
    }
  });

  // node_modules/qrcode/lib/renderer/canvas.js
  var require_canvas = __commonJS({
    "node_modules/qrcode/lib/renderer/canvas.js"(exports) {
      var Utils = require_utils2();
      function clearCanvas(ctx, canvas, size5) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (!canvas.style) canvas.style = {};
        canvas.height = size5;
        canvas.width = size5;
        canvas.style.height = size5 + "px";
        canvas.style.width = size5 + "px";
      }
      function getCanvasElement() {
        try {
          return document.createElement("canvas");
        } catch (e) {
          throw new Error("You need to specify a canvas element");
        }
      }
      exports.render = function render(qrData, canvas, options) {
        let opts = options;
        let canvasEl = canvas;
        if (typeof opts === "undefined" && (!canvas || !canvas.getContext)) {
          opts = canvas;
          canvas = void 0;
        }
        if (!canvas) {
          canvasEl = getCanvasElement();
        }
        opts = Utils.getOptions(opts);
        const size5 = Utils.getImageWidth(qrData.modules.size, opts);
        const ctx = canvasEl.getContext("2d");
        const image = ctx.createImageData(size5, size5);
        Utils.qrToImageData(image.data, qrData, opts);
        clearCanvas(ctx, canvasEl, size5);
        ctx.putImageData(image, 0, 0);
        return canvasEl;
      };
      exports.renderToDataURL = function renderToDataURL(qrData, canvas, options) {
        let opts = options;
        if (typeof opts === "undefined" && (!canvas || !canvas.getContext)) {
          opts = canvas;
          canvas = void 0;
        }
        if (!opts) opts = {};
        const canvasEl = exports.render(qrData, canvas, opts);
        const type = opts.type || "image/png";
        const rendererOpts = opts.rendererOpts || {};
        return canvasEl.toDataURL(type, rendererOpts.quality);
      };
    }
  });

  // node_modules/qrcode/lib/renderer/svg-tag.js
  var require_svg_tag = __commonJS({
    "node_modules/qrcode/lib/renderer/svg-tag.js"(exports) {
      var Utils = require_utils2();
      function getColorAttrib(color, attrib) {
        const alpha = color.a / 255;
        const str = attrib + '="' + color.hex + '"';
        return alpha < 1 ? str + " " + attrib + '-opacity="' + alpha.toFixed(2).slice(1) + '"' : str;
      }
      function svgCmd(cmd, x, y) {
        let str = cmd + x;
        if (typeof y !== "undefined") str += " " + y;
        return str;
      }
      function qrToPath(data, size5, margin) {
        let path = "";
        let moveBy = 0;
        let newRow = false;
        let lineLength = 0;
        for (let i = 0; i < data.length; i++) {
          const col = Math.floor(i % size5);
          const row = Math.floor(i / size5);
          if (!col && !newRow) newRow = true;
          if (data[i]) {
            lineLength++;
            if (!(i > 0 && col > 0 && data[i - 1])) {
              path += newRow ? svgCmd("M", col + margin, 0.5 + row + margin) : svgCmd("m", moveBy, 0);
              moveBy = 0;
              newRow = false;
            }
            if (!(col + 1 < size5 && data[i + 1])) {
              path += svgCmd("h", lineLength);
              lineLength = 0;
            }
          } else {
            moveBy++;
          }
        }
        return path;
      }
      exports.render = function render(qrData, options, cb) {
        const opts = Utils.getOptions(options);
        const size5 = qrData.modules.size;
        const data = qrData.modules.data;
        const qrcodesize = size5 + opts.margin * 2;
        const bg = !opts.color.light.a ? "" : "<path " + getColorAttrib(opts.color.light, "fill") + ' d="M0 0h' + qrcodesize + "v" + qrcodesize + 'H0z"/>';
        const path = "<path " + getColorAttrib(opts.color.dark, "stroke") + ' d="' + qrToPath(data, size5, opts.margin) + '"/>';
        const viewBox = 'viewBox="0 0 ' + qrcodesize + " " + qrcodesize + '"';
        const width = !opts.width ? "" : 'width="' + opts.width + '" height="' + opts.width + '" ';
        const svgTag = '<svg xmlns="http://www.w3.org/2000/svg" ' + width + viewBox + ' shape-rendering="crispEdges">' + bg + path + "</svg>\n";
        if (typeof cb === "function") {
          cb(null, svgTag);
        }
        return svgTag;
      };
    }
  });

  // node_modules/qrcode/lib/browser.js
  var require_browser = __commonJS({
    "node_modules/qrcode/lib/browser.js"(exports) {
      var canPromise = require_can_promise();
      var QRCode = require_qrcode();
      var CanvasRenderer = require_canvas();
      var SvgRenderer = require_svg_tag();
      function renderCanvas(renderFunc, canvas, text, opts, cb) {
        const args = [].slice.call(arguments, 1);
        const argsNum = args.length;
        const isLastArgCb = typeof args[argsNum - 1] === "function";
        if (!isLastArgCb && !canPromise()) {
          throw new Error("Callback required as last argument");
        }
        if (isLastArgCb) {
          if (argsNum < 2) {
            throw new Error("Too few arguments provided");
          }
          if (argsNum === 2) {
            cb = text;
            text = canvas;
            canvas = opts = void 0;
          } else if (argsNum === 3) {
            if (canvas.getContext && typeof cb === "undefined") {
              cb = opts;
              opts = void 0;
            } else {
              cb = opts;
              opts = text;
              text = canvas;
              canvas = void 0;
            }
          }
        } else {
          if (argsNum < 1) {
            throw new Error("Too few arguments provided");
          }
          if (argsNum === 1) {
            text = canvas;
            canvas = opts = void 0;
          } else if (argsNum === 2 && !canvas.getContext) {
            opts = text;
            text = canvas;
            canvas = void 0;
          }
          return new Promise(function(resolve, reject) {
            try {
              const data = QRCode.create(text, opts);
              resolve(renderFunc(data, canvas, opts));
            } catch (e) {
              reject(e);
            }
          });
        }
        try {
          const data = QRCode.create(text, opts);
          cb(null, renderFunc(data, canvas, opts));
        } catch (e) {
          cb(e);
        }
      }
      exports.create = QRCode.create;
      exports.toCanvas = renderCanvas.bind(null, CanvasRenderer.render);
      exports.toDataURL = renderCanvas.bind(null, CanvasRenderer.renderToDataURL);
      exports.toString = renderCanvas.bind(null, function(data, _, opts) {
        return SvgRenderer.render(data, opts);
      });
    }
  });

  // client/ethw.ts
  var require_ethw = __commonJS({
    "client/ethw.ts"() {
      init_esm();
      init_chains();
      init_account_abstraction();
      var import_qrcode = __toESM(require_browser());
      var emailInput = document.querySelector("#email");
      var sendCodeButton = document.querySelector("#send-code");
      var verifyCodeButton = document.querySelector("#verify-code");
      var createButton = document.querySelector("#create");
      var openButton = document.querySelector("#open");
      var otpBox = document.querySelector("#otp-box");
      var otpInput = document.querySelector("#otp");
      var otpNote = document.querySelector("#otp-note");
      var setup = document.querySelector("#setup");
      var wallet = document.querySelector("#wallet");
      var addressEl = document.querySelector("#address");
      var explorer = document.querySelector("#explorer");
      var qr = document.querySelector("#qr");
      var ethEl = document.querySelector("#eth");
      var tokenLabel = document.querySelector("#token-label");
      var tokenEl = document.querySelector("#token");
      var accountEl = document.querySelector("#account");
      var accountTrigger = document.querySelector("#account-trigger");
      var accountMenu = document.querySelector("#account-menu");
      var logoutButton = document.querySelector("#logout");
      var me = document.querySelector("#me");
      var recipientInput = document.querySelector("#recipient");
      var recipientAvatar = document.querySelector("#recipient-avatar");
      var resolvedEl = document.querySelector("#resolved");
      var amountInput = document.querySelector("#amount");
      var sendButton = document.querySelector("#send");
      var incomingList = document.querySelector("#incoming");
      var outgoingList = document.querySelector("#outgoing");
      var incomingNote = document.querySelector("#incoming-note");
      var collectButton = document.querySelector("#collect");
      var gasEl = document.querySelector("#gas");
      var statusEl = document.querySelector("#status");
      var config;
      var current = null;
      var decimals = 6;
      var lookupTimer = 0;
      var balanceTimer = 0;
      var userAvatarToken = 0;
      var recipientToken = 0;
      var lookedUp = null;
      var emailToken = null;
      var verifiedEmail = null;
      var gravatarCache = /* @__PURE__ */ new Map();
      var client = () => createPublicClient({
        chain: baseSepolia,
        transport: http(new URL(config.rpc, window.location.origin).toString())
      });
      function setStatus(message) {
        statusEl.textContent = message;
      }
      function explain(error) {
        if (error && typeof error === "object" && "shortMessage" in error) {
          return String(error.shortMessage);
        }
        if (error instanceof Error) return error.message;
        return "Something went wrong.";
      }
      function errorText(error) {
        const parts = [];
        let currentError = error;
        for (let depth = 0; currentError && depth < 4; depth += 1) {
          if (typeof currentError === "string") {
            parts.push(currentError);
            break;
          }
          if (typeof currentError !== "object") break;
          const record = currentError;
          if (record.shortMessage) parts.push(String(record.shortMessage));
          if (record.message) parts.push(String(record.message));
          if (record.details) parts.push(String(record.details));
          currentError = record.cause;
        }
        return parts.join(" ");
      }
      async function explainSend(error) {
        const text = errorText(error).toLowerCase();
        const gasFailure = text.includes("aa21") || text.includes("pay prefund") || text.includes("insufficient funds") || text.includes("missing or invalid parameters");
        if (gasFailure && current && !config.paymaster) {
          try {
            const balance = await client().getBalance({ address: current.address });
            if (balance === 0n) return "no gas in account";
          } catch {
            if (text.includes("aa21") || text.includes("pay prefund") || text.includes("insufficient funds")) {
              return "no gas in account";
            }
          }
        }
        return explain(error);
      }
      async function api(path, body) {
        const response = await fetch(path, {
          method: body === void 0 ? "GET" : "POST",
          headers: body === void 0 ? void 0 : { "content-type": "application/json" },
          body: body === void 0 ? void 0 : JSON.stringify(body)
        });
        const text = await response.text();
        const payload = text ? JSON.parse(text) : {};
        if (!response.ok) throw new Error(payload.error || response.statusText);
        return payload;
      }
      async function loadAccount(email) {
        const result = await api(
          `/ethw/api/account?email=${encodeURIComponent(email)}`
        );
        if (!result.registered || !result.address || !result.credentialId || !result.publicKey || !result.email) {
          return null;
        }
        return {
          email: result.email,
          address: result.address,
          credentialId: result.credentialId,
          publicKey: result.publicKey
        };
      }
      function isEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      }
      async function gravatarUrl(email, size5) {
        const normalized = email.trim().toLowerCase();
        const key = `${normalized}|${size5}`;
        const cached = gravatarCache.get(key);
        if (cached) return cached;
        const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(normalized));
        const hash3 = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
        const url = `https://www.gravatar.com/avatar/${hash3}?s=${size5}&d=identicon`;
        gravatarCache.set(key, url);
        return url;
      }
      function setAccountMenuOpen(open) {
        accountMenu.hidden = !open;
        accountTrigger.setAttribute("aria-expanded", open ? "true" : "false");
      }
      async function showUserAvatar(email) {
        const token = ++userAvatarToken;
        const trimmed = email.trim();
        if (!trimmed) {
          accountEl.hidden = true;
          setAccountMenuOpen(false);
          me.removeAttribute("src");
          return;
        }
        const url = await gravatarUrl(trimmed, 72);
        if (token !== userAvatarToken) return;
        me.src = url;
        accountEl.hidden = false;
      }
      function stopBalanceRefresh() {
        window.clearInterval(balanceTimer);
        balanceTimer = 0;
      }
      function startBalanceRefresh() {
        stopBalanceRefresh();
        balanceTimer = window.setInterval(() => {
          if (!current || document.hidden) return;
          refreshBalances({ quiet: true }).catch(() => void 0);
        }, 1e4);
      }
      function amountLabel() {
        const raw = amountInput.value.trim();
        if (!/^\d+(\.\d+)?$/.test(raw) || Number(raw) <= 0) return null;
        return raw;
      }
      function emailSendNotice(email, escrowed) {
        if (!current) return;
        const amount = amountLabel();
        if (!amount) {
          setStatus("Enter an amount greater than zero.");
          return;
        }
        const subject = `Sending you ${amount} ${config.symbol}`;
        const lead = escrowed ? `I'm sending you ${amount} ${config.symbol}. It is held in escrow until you collect it.` : `I'm sending you ${amount} ${config.symbol}.`;
        const next = escrowed ? `Create a wallet at ${window.location.origin} using ${email}, then collect it.` : `Create a wallet at ${window.location.origin} using ${email} so you can receive it.`;
        const body = [lead, "", next, "", `This is from ${current.email} (${current.address}).`].join("\n");
        const link = document.createElement("a");
        link.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        link.click();
        setStatus(`Email ready for ${email}: ${amount} ${config.symbol}.`);
      }
      async function showWallet(account) {
        current = account;
        window.localStorage.setItem("ethw.email", account.email);
        emailInput.value = account.email;
        setup.hidden = true;
        wallet.hidden = false;
        addressEl.textContent = account.address;
        explorer.href = `https://sepolia.basescan.org/address/${account.address}`;
        tokenLabel.textContent = config.symbol;
        gasEl.textContent = config.paymaster ? "" : "";
        syncSendButton();
        await import_qrcode.default.toCanvas(qr, account.address, { width: 180, margin: 1 });
        await showUserAvatar(account.email);
        await refreshBalances();
        await loadEscrow();
        startBalanceRefresh();
      }
      function logout() {
        current = null;
        stopBalanceRefresh();
        window.localStorage.removeItem("ethw.email");
        wallet.hidden = true;
        setup.hidden = false;
        clearEmailVerification();
        setAccountMenuOpen(false);
        setStatus("");
        showUserAvatar("").catch((error) => setStatus(explain(error)));
      }
      async function refreshBalances(options = {}) {
        if (!current) return;
        if (!options.quiet) {
          ethEl.textContent = "\u2026";
          tokenEl.textContent = "\u2026";
        }
        try {
          const rpc = client();
          const wei = await rpc.getBalance({ address: current.address });
          ethEl.textContent = formatEther(wei);
          if (!config.erc20) {
            tokenEl.textContent = "Set ERC20_ADDRESS on the server";
            return;
          }
          decimals = await rpc.readContract({
            address: config.erc20,
            abi: erc20Abi,
            functionName: "decimals"
          });
          const raw = await rpc.readContract({
            address: config.erc20,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [current.address]
          });
          tokenEl.textContent = formatUnits(raw, decimals);
        } catch (error) {
          if (options.quiet) return;
          ethEl.textContent = "unavailable";
          tokenEl.textContent = "unavailable";
          setStatus(explain(error));
        }
      }
      async function smartAccount() {
        if (!current) throw new Error("Open a wallet first.");
        const owner = toWebAuthnAccount({
          credential: { id: current.credentialId, publicKey: current.publicKey },
          rpId: window.location.hostname
        });
        return toCoinbaseSmartAccount({
          client: client(),
          owners: [owner],
          version: "1.1"
        });
      }
      function clearEmailVerification() {
        emailToken = null;
        verifiedEmail = null;
        createButton.disabled = true;
        otpBox.hidden = true;
        otpInput.value = "";
      }
      async function sendCode() {
        const email = emailInput.value.trim();
        if (!email) {
          setStatus("Enter an email.");
          return;
        }
        if (!config.mailReady) {
          setStatus("Email sending is not configured on the server.");
          return;
        }
        clearEmailVerification();
        setStatus("Sending a verification code.");
        sendCodeButton.disabled = true;
        try {
          const result = await api("/ethw/api/otp/send", { email });
          otpBox.hidden = false;
          otpNote.textContent = result.devCode ? `Dev mode code: ${result.devCode}` : "We emailed a code so only the mailbox owner can create this wallet.";
          setStatus("Enter the code from your email.");
          otpInput.focus();
        } finally {
          sendCodeButton.disabled = false;
        }
      }
      async function verifyCode() {
        const email = emailInput.value.trim();
        const code = otpInput.value.trim();
        if (!email) {
          setStatus("Enter an email.");
          return;
        }
        if (!/^\d{6}$/.test(code)) {
          setStatus("Enter the 6-digit code.");
          return;
        }
        verifyCodeButton.disabled = true;
        try {
          const result = await api("/ethw/api/otp/verify", { email, code });
          emailToken = result.emailToken;
          verifiedEmail = result.email;
          createButton.disabled = false;
          setStatus("Email verified. Create the wallet with your passkey.");
        } finally {
          verifyCodeButton.disabled = false;
        }
      }
      async function createWallet() {
        const email = emailInput.value.trim();
        if (!email) {
          setStatus("Enter an email.");
          return;
        }
        if (!emailToken || verifiedEmail !== email.trim().toLowerCase()) {
          setStatus("Verify your email before creating a wallet.");
          return;
        }
        setStatus("Confirm the passkey prompt.");
        const credential = await createWebAuthnCredential({
          name: email,
          authenticatorSelection: {
            residentKey: "required",
            requireResidentKey: true,
            userVerification: "required"
          }
        });
        const account = await toCoinbaseSmartAccount({
          client: client(),
          owners: [toWebAuthnAccount({ credential })],
          version: "1.1"
        });
        const saved = await api("/ethw/api/register", {
          email,
          address: account.address,
          credentialId: credential.id,
          publicKey: credential.publicKey,
          emailToken
        });
        clearEmailVerification();
        setStatus("Wallet created.");
        await showWallet({
          email: saved.email,
          address: saved.address,
          credentialId: credential.id,
          publicKey: credential.publicKey
        });
      }
      async function openWallet() {
        const email = emailInput.value.trim();
        if (!email) {
          setStatus("Enter the email you registered.");
          return;
        }
        const account = await loadAccount(email);
        if (!account) {
          setStatus("No wallet is registered for that email.");
          return;
        }
        setStatus("");
        await showWallet(account);
      }
      function setSendAction(registered) {
        sendButton.textContent = "Send";
        sendButton.disabled = registered ? !config.erc20 : false;
      }
      function renderEscrow(list, rows, empty, describe) {
        list.replaceChildren();
        if (rows.length === 0) {
          const item = document.createElement("li");
          item.textContent = empty;
          list.append(item);
          return;
        }
        for (const row of rows) {
          const item = document.createElement("li");
          item.append(`${describe(row)} \xB7 `);
          const link = document.createElement("a");
          link.href = `https://sepolia.basescan.org/tx/${row.txHash}`;
          link.target = "_blank";
          link.rel = "noopener";
          link.textContent = "transaction";
          item.append(link);
          list.append(item);
        }
      }
      function tokenAmount(amount) {
        try {
          return `${formatUnits(BigInt(amount), decimals)} ${config.symbol}`;
        } catch {
          return amount;
        }
      }
      async function loadEscrow() {
        if (!current) return;
        const result = await api(
          `/ethw/api/escrow?email=${encodeURIComponent(current.email)}`
        );
        renderEscrow(incomingList, result.incoming, "Nothing to collect.", (row) => {
          return `${tokenAmount(row.amount)} from ${row.senderEmail}`;
        });
        renderEscrow(outgoingList, result.outgoing, "No payments waiting.", (row) => {
          return `${tokenAmount(row.amount)} to ${row.recipientEmail} \u2014 not collected yet`;
        });
        incomingNote.textContent = config.escrow ? "" : result.incoming.length > 0 ? "Set ESCROW_ADDRESS and ESCROW_OPERATOR_KEY before these can be collected." : "Set ESCROW_ADDRESS on the server to hold payments for emails that have not registered.";
        collectButton.hidden = result.incoming.length === 0;
        if (result.incoming.length > 0) {
          const total = result.incoming.reduce((sum, row) => sum + BigInt(row.amount), 0n);
          setStatus(`You have ${formatUnits(total, decimals)} ${config.symbol} to collect.`);
        }
      }
      async function collectEscrow() {
        if (!current) return;
        collectButton.disabled = true;
        setStatus("Collecting the escrow balance.");
        try {
          const result = await api("/ethw/api/escrow/release", { email: current.email });
          setStatus(`Collected. ${result.txHash}`);
          await refreshBalances();
          await loadEscrow();
        } finally {
          collectButton.disabled = false;
        }
      }
      function syncSendButton() {
        const raw = recipientInput.value.trim().toLowerCase();
        const unregistered = isEmail(raw) && lookedUp?.email === raw && !lookedUp.account;
        setSendAction(!unregistered);
      }
      async function resolveRecipient() {
        const token = ++recipientToken;
        const raw = recipientInput.value.trim();
        if (!raw) {
          lookedUp = null;
          resolvedEl.textContent = "";
          recipientAvatar.hidden = true;
          recipientAvatar.removeAttribute("src");
          setSendAction(true);
          return;
        }
        const url = await gravatarUrl(raw, 80);
        if (token !== recipientToken) return;
        recipientAvatar.hidden = false;
        recipientAvatar.src = url;
        if (!isEmail(raw)) {
          lookedUp = null;
          resolvedEl.textContent = "";
          setSendAction(true);
          return;
        }
        const account = await loadAccount(raw);
        if (token !== recipientToken) return;
        lookedUp = { email: raw.toLowerCase(), account };
        if (account) {
          resolvedEl.textContent = `Registered \xB7 ${account.address}`;
          setSendAction(true);
        } else {
          resolvedEl.textContent = config.escrow ? "Not registered. A send is held in escrow until they register and collect it." : "Not registered";
          setSendAction(false);
        }
      }
      async function depositEscrow(email) {
        if (!current || !config.erc20 || !config.escrow) return;
        let amount;
        try {
          amount = parseUnits(amountInput.value.trim(), decimals);
        } catch {
          setStatus("Enter an amount.");
          return;
        }
        if (amount <= 0n) {
          setStatus("Enter an amount greater than zero.");
          return;
        }
        setStatus("Confirm the passkey to put this in escrow.");
        sendButton.disabled = true;
        try {
          const account = await smartAccount();
          const bundler = createBundlerClient({
            client: client(),
            transport: http(new URL(config.rpc, window.location.origin).toString()),
            chain: baseSepolia,
            paymaster: config.paymaster ? true : void 0
          });
          const hash3 = await bundler.sendUserOperation({
            account,
            calls: [
              {
                to: config.erc20,
                data: encodeFunctionData({
                  abi: erc20Abi,
                  functionName: "approve",
                  args: [config.escrow, amount]
                })
              },
              {
                to: config.escrow,
                data: encodeFunctionData({
                  abi: [
                    {
                      type: "function",
                      name: "deposit",
                      stateMutability: "nonpayable",
                      inputs: [
                        { name: "emailHash", type: "bytes32" },
                        { name: "amount", type: "uint256" }
                      ],
                      outputs: []
                    }
                  ],
                  functionName: "deposit",
                  args: [keccak256(toBytes(email.trim().toLowerCase())), amount]
                })
              }
            ]
          });
          setStatus("Waiting for the escrow deposit.");
          const receipt = await bundler.waitForUserOperationReceipt({ hash: hash3 });
          await api("/ethw/api/escrow/deposit", {
            senderEmail: current.email,
            recipientEmail: email,
            txHash: receipt.receipt.transactionHash
          });
          await refreshBalances();
          await loadEscrow();
          emailSendNotice(email, true);
        } catch (error) {
          setStatus(await explainSend(error));
        } finally {
          syncSendButton();
        }
      }
      async function sendToken() {
        if (!current) return;
        const raw = recipientInput.value.trim();
        if (!isEmail(raw)) {
          setStatus("Enter the recipient email.");
          return;
        }
        await resolveRecipient();
        const recipient = lookedUp?.email === raw.toLowerCase() ? lookedUp.account : null;
        if (!lookedUp || lookedUp.email !== raw.toLowerCase()) return;
        if (!recipient) {
          if (config.escrow && config.erc20) await depositEscrow(raw);
          else emailSendNotice(raw, false);
          return;
        }
        if (!config.erc20) {
          setStatus("Set ERC20_ADDRESS on the server before sending.");
          return;
        }
        if (recipient.address.toLowerCase() === current.address.toLowerCase()) {
          setStatus("Choose a different recipient.");
          return;
        }
        let amount;
        try {
          amount = parseUnits(amountInput.value.trim(), decimals);
        } catch {
          setStatus("Enter an amount.");
          return;
        }
        if (amount <= 0n) {
          setStatus("Enter an amount greater than zero.");
          return;
        }
        setStatus("Confirm the passkey to send.");
        sendButton.disabled = true;
        try {
          const account = await smartAccount();
          const bundler = createBundlerClient({
            client: client(),
            transport: http(new URL(config.rpc, window.location.origin).toString()),
            chain: baseSepolia,
            paymaster: config.paymaster ? true : void 0
          });
          const hash3 = await bundler.sendUserOperation({
            account,
            calls: [
              {
                to: config.erc20,
                data: encodeFunctionData({
                  abi: erc20Abi,
                  functionName: "transfer",
                  args: [recipient.address, amount]
                })
              }
            ]
          });
          setStatus("Waiting for the transfer.");
          const receipt = await bundler.waitForUserOperationReceipt({ hash: hash3 });
          const tx = receipt.receipt.transactionHash;
          setStatus(`Sent. ${tx}`);
          amountInput.value = "";
          await refreshBalances();
        } catch (error) {
          setStatus(await explainSend(error));
        } finally {
          syncSendButton();
        }
      }
      createButton.disabled = true;
      sendCodeButton.disabled = true;
      openButton.disabled = true;
      sendCodeButton.addEventListener("click", () => {
        sendCode().catch((error) => setStatus(explain(error)));
      });
      verifyCodeButton.addEventListener("click", () => {
        verifyCode().catch((error) => setStatus(explain(error)));
      });
      createButton.addEventListener("click", () => {
        createWallet().catch((error) => setStatus(explain(error)));
      });
      openButton.addEventListener("click", () => {
        openWallet().catch((error) => setStatus(explain(error)));
      });
      emailInput.addEventListener("input", () => {
        if (verifiedEmail && verifiedEmail !== emailInput.value.trim().toLowerCase()) clearEmailVerification();
      });
      collectButton.addEventListener("click", () => {
        collectEscrow().catch((error) => setStatus(explain(error)));
      });
      accountTrigger.addEventListener("click", (event) => {
        event.stopPropagation();
        setAccountMenuOpen(accountMenu.hidden);
      });
      logoutButton.addEventListener("click", () => {
        logout();
      });
      document.addEventListener("click", () => {
        if (!accountMenu.hidden) setAccountMenuOpen(false);
      });
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden && current) {
          refreshBalances({ quiet: true }).catch(() => void 0);
        }
      });
      recipientInput.addEventListener("input", () => {
        window.clearTimeout(lookupTimer);
        lookupTimer = window.setTimeout(() => {
          resolveRecipient().catch((error) => setStatus(explain(error)));
        }, 300);
      });
      sendButton.addEventListener("click", () => {
        sendToken().catch((error) => setStatus(explain(error)));
      });
      void api("/ethw/api/config").then(async (loaded) => {
        config = loaded;
        sendCodeButton.disabled = !config.mailReady;
        openButton.disabled = false;
        if (!config.mailReady) {
          setStatus("Set RESEND_API_KEY or SMTP_URL on the server to verify new wallets.");
        }
        const saved = window.localStorage.getItem("ethw.email");
        if (!saved) return;
        emailInput.value = saved;
        const account = await loadAccount(saved);
        if (account) await showWallet(account);
      }).catch((error) => setStatus(explain(error)));
    }
  });
  require_ethw();
})();
/*! Bundled license information:

@noble/hashes/esm/utils.js:
  (*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/esm/abstract/utils.js:
@noble/curves/esm/abstract/modular.js:
@noble/curves/esm/abstract/curve.js:
@noble/curves/esm/abstract/weierstrass.js:
@noble/curves/esm/_shortw_utils.js:
@noble/curves/esm/secp256k1.js:
@noble/curves/esm/abstract/utils.js:
@noble/curves/esm/abstract/modular.js:
@noble/curves/esm/abstract/curve.js:
@noble/curves/esm/abstract/weierstrass.js:
@noble/curves/esm/_shortw_utils.js:
@noble/curves/esm/secp256k1.js:
@noble/curves/esm/nist.js:
@noble/curves/esm/p256.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)
*/

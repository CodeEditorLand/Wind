var StringURL_default = (await import("zod")).string().url("Must be a URL.").endsWith("/", { message: "URL must end with /." });
export {
  StringURL_default as default
};
//# sourceMappingURL=StringURL.js.map

// packages/core/lib/utils/zod.ts

import type { JSONPath } from "jsonc-parser";

export const transformJsonPathToSchemaPath = (jsonPath: JSONPath) => {
  return jsonPath.flatMap((segment) => {
    return typeof segment === "number" ||
      (typeof segment === "string" && /^\d+$/.test(segment))
      ? ["items"]
      : ["properties", segment];
  });
};

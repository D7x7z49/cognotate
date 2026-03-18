// packages/core/lib/utils/jsonc.ts

import { readFile, writeFile } from "fs/promises";
import {
  modify,
  applyEdits,
  type FormattingOptions,
  type ModificationOptions,
  type JSONPath,
  stripComments,
} from "jsonc-parser";
import { is } from "zod/locales";

const FORMATTING: FormattingOptions = {
  insertSpaces: true,
  tabSize: 2,
  eol: "\n",
};

export const upateJsonc = async (
  filePath: string,
  path: JSONPath,
  value: string | number | boolean,
  beforeValidate: (content: string) => void,
  afterValidate: (content: string) => void,
  options: ModificationOptions = {
    formattingOptions: FORMATTING,
  },
) => {
  const originalContent = await readFile(filePath, "utf8");
  beforeValidate(originalContent);
  const edits = modify(originalContent, path, value, options);
  const modifiedContent = applyEdits(originalContent, edits);
  afterValidate(modifiedContent);
  await writeFile(filePath, modifiedContent, "utf8");
};

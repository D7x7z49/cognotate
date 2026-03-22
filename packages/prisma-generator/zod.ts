// packages/prisma-generator/zod.ts

import path from "path";
import { writeFile, mkdir, rm } from "fs/promises";
import { parseEnvValue } from "@prisma/internals";
import type { Generator, GeneratorOptions } from "@prisma/generator";
import type { DMMF } from "@prisma/generator-helper";

/* map prisma scalar -> zod */
function mapScalar(type: string): string {
  switch (type) {
    case "String":
      return "z.string()";
    case "Int":
      return "z.number().int()";
    case "Float":
      return "z.number()";
    case "Boolean":
      return "z.boolean()";
    case "DateTime":
      return "z.date()";
    case "Json":
      return "z.json()";
    case "Bytes":
      return "z.instanceof(Buffer)";
    case "BigInt":
      return "z.bigint()";
    case "Decimal":
      return "z.string()";
    default:
      return "z.unknown()";
  }
}

/* apply list / optional modifiers */
function wrap(type: string, f: DMMF.Field): string {
  if (f.isList) type = `z.array(${type})`;
  if (!f.isRequired) type += ".optional()";
  return type;
}

/* build field (scalar | enum | relation) */
function buildField(f: DMMF.Field): string {
  // relation uses getter to break circular inference
  if (f.kind === "object") {
    let type = `${f.type}Schema`;
    type = wrap(type, f);
    return `  get ${f.name}() { return ${type} }`;
  }

  const base = f.kind === "enum" ? `${f.type}Schema` : mapScalar(f.type);

  return `  ${f.name}: ${wrap(base, f)}`;
}

/* generate enum file */
function generateEnumFile(enums: readonly DMMF.DatamodelEnum[]): string {
  const body = enums
    .map((e) => {
      const values = e.values.map((v) => `'${v.name}'`).join(", ");
      return `export const ${e.name}Schema = z.enum([${values}])`;
    })
    .join("\n\n");

  return `import { z } from "zod"\n\n${body}\n`;
}

/* generate model file */
function generateModelFile(model: DMMF.Model): string {
  const enumDeps = new Set<string>();
  const modelDeps = new Set<string>();

  for (const f of model.fields) {
    if (f.kind === "enum") enumDeps.add(f.type);
    if (f.kind === "object" && f.type !== model.name) {
      modelDeps.add(f.type);
    }
  }

  const imports = [`import { z } from "zod"`];

  if (enumDeps.size) {
    imports.push(
      `import { ${[...enumDeps].map((n) => `${n}Schema`).join(", ")} } from "../enum"`,
    );
  }

  for (const dep of modelDeps) {
    imports.push(`import { ${dep}Schema } from "./${dep}"`);
  }

  const fields = model.fields
    .filter((f) => f.kind !== "unsupported")
    .map(buildField)
    .join(",\n");

  return `${imports.join("\n")}

export const ${model.name}Schema = z.object({
${fields}
});
`;
}

/* prisma generator */
export class ZodGenerator implements Generator {
  readonly name = "zod-generator";

  async getManifest() {
    return {
      prettyName: "Zod Schema Generator",
      version: "1.0.0",
      requiresEngines: [],
    };
  }

  async generate(options: GeneratorOptions) {
    const { dmmf, generator } = options;
    const outputDir = parseEnvValue(generator.output!);

    // ensure idempotency: derived output, no history
    await rm(outputDir, { recursive: true, force: true });

    await mkdir(outputDir, { recursive: true });
    await mkdir(path.join(outputDir, "models"), { recursive: true });

    // enum.ts
    await writeFile(
      path.join(outputDir, "enum.ts"),
      generateEnumFile(dmmf.datamodel.enums),
    );

    // models
    const names: string[] = [];

    for (const model of dmmf.datamodel.models) {
      await writeFile(
        path.join(outputDir, "models", `${model.name}.ts`),
        generateModelFile(model),
      );
      names.push(model.name);
    }

    // models/index.ts
    await writeFile(
      path.join(outputDir, "models", "index.ts"),
      names.map((n) => `export * from "./${n}"`).join("\n"),
    );

    // root index.ts
    await writeFile(
      path.join(outputDir, "index.ts"),
      `export * from "./enum"\nexport * from "./models"`,
    );
  }
}

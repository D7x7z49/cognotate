#!/usr/bin/env bun
// packages/prisma-generator/index.ts

import { generatorHandler } from "@prisma/generator-helper";
import { ZodGenerator } from "./zod";

export { ZodGenerator };

if (import.meta.main) {
  const generator = new ZodGenerator();

  generatorHandler({
    onManifest() {
      return generator.getManifest();
    },
    onGenerate(options) {
      return generator.generate(options);
    },
  });
}

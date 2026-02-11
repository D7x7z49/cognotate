// apps/cli/build.ts

import { COGNOTATE } from "@cognotate/core/lib/config";

const result = await Bun.build({
  entrypoints: ["./index.ts"],
  compile: {
    outfile: `./dist/${COGNOTATE}`,
  },
});

if (result.success) {
  console.log("Build succeeded!");
  console.log(result.outputs);
} else {
  console.error("Build failed!");
  result.logs.forEach((log) => {
    console.error(log);
  });
}

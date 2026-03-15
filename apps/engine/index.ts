// apps/engine/index.ts

import { runCLI } from "./main.ts";

if (import.meta.main) {
  runCLI().catch(console.error);
}

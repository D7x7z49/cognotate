// apps/engine/commands/config/set.ts

import _ from "lodash";
import { z } from "zod";
import { ConfigSchema, ROOT_CONFIG } from "@cognotate/core/lib/config";
import {
  transformJsonPathToSchemaPath,
  upateJsonc,
} from "@cognotate/core/lib/utils";
import { cliLogger as logger } from "@/lib/logger";

export const ACTION = "Set Cognotate Configuration";

export const setAction = async (options: { path?: string; value?: string }) => {
  const { path, value } = options;

  logger.sect(ACTION);

  if (!path) {
    logger.fail("path is required.");
    process.exit(1);
  }

  if (!value) {
    logger.fail("value is required.");
    process.exit(1);
  }

  logger.step("verifying config path.");
  const jsonPath: string[] = path.split(/[.\[\]]/).filter(Boolean);
  jsonPath.forEach((segment) => {
    if (!/^[A-Za-z0-9_]+$/.test(segment)) {
      logger.fail(
        `invalid path segment "${segment}" in [${jsonPath.join(", ")}]. allowed: letters, numbers, underscore.`,
      );
      process.exit(1);
    }
  });
  logger.find(`path "${path}" is valid.`);

  logger.step("verifying path exists.");
  const configJsonSchema = z.toJSONSchema(ConfigSchema);
  const schemaPath = transformJsonPathToSchemaPath(jsonPath);
  let current = [...schemaPath];
  if (!_.hasIn(configJsonSchema, current)) {
    while (current.length > 0) {
      if (_.hasIn(configJsonSchema, current)) {
        const segment = _.get(configJsonSchema, current);
        logger.fail(
          `json path [${jsonPath.join(", ")}] does not exist, segment "${schemaPath[current.length]}" not found.`,
        );
        logger.log(JSON.stringify(segment, null, 2));
        process.exit(1);
      } else {
        current.pop();
      }
    }
    logger.fail(`json path [${jsonPath.join(", ")}] is completely invalid.`);
    process.exit(1);
  } else {
    logger.find(`json path [${jsonPath.join(", ")}] exists.`);
  }

  await upateJsonc(
    ROOT_CONFIG,
    jsonPath,
    value,
    (content: string) => {
      const result = ConfigSchema.safeParse(JSON.parse(content));
      if (!result.success) {
        logger.fail("invalid read config.");
        logger.fail(result.error.issues.toString());
        process.exit(1);
      }
    },
    (content: string) => {
      const result = ConfigSchema.safeParse(JSON.parse(content));
      if (!result.success) {
        logger.fail("invalid write config.");
        logger.fail(result.error.issues.toString());
        process.exit(1);
      }
    },
  );

  logger.done(ACTION);
};

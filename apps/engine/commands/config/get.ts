// apps/engine/commands/config/get.ts

import _ from "lodash";
import { z } from "zod";
import { ConfigSchema, refreshConfig } from "@cognotate/core/lib/config";
import { transformJsonPathToSchemaPath } from "@cognotate/core/lib/utils";
import { cliLogger as logger } from "@/lib/logger";

export const ACTION = "Get Cognotate Configuration";

export const getAction = async (options: {
  path?: string;
  schema?: boolean;
}) => {
  const { path, schema } = options;

  const config = await refreshConfig();

  logger.sect(ACTION);

  if (!path) {
    if (schema) {
      logger.find("full config schema info.");
      logger.log(JSON.stringify(z.toJSONSchema(ConfigSchema), null, 2));
    } else {
      logger.find("full config info.");
      logger.log(JSON.stringify(config, null, 2));
    }
    logger.done(ACTION);
    return;
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

  if (schema) {
    logger.step("getting config schema.");
    const segment = _.get(configJsonSchema, schemaPath);
    logger.log(JSON.stringify(segment, null, 2));
    logger.done(ACTION);
    return;
  }

  logger.step("getting config value.");
  const value = _.get(config, jsonPath);
  logger.find(
    `json path [${jsonPath.join(", ")}] ${value ? "exists" : "does not exist"} value.`,
  );
  logger.log(`${path} = ${JSON.stringify(value, null, 2)}`);

  logger.done(ACTION);
};

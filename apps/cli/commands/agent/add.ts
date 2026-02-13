// apps/cli/commands/agent/add.ts

import { input, search, select } from "@inquirer/prompts";
import { z } from "zod";
import {
  AddAgentSchema,
  addAgent,
  DEFAULT_AGENT_PERMISSION,
} from "@cognotate/core/lib/agent";
import {
  verifyModelString,
  PROVIDERS,
  getProviderKeys,
  getModelList,
  saveProviderKeys,
  type ProviderValue,
} from "@cognotate/core/lib/llm";
import { subCommandAgentLogger as logger } from "@/lib/logger";

const InputArgSchema = AddAgentSchema.omit({ profession: true });
type InputArg = z.infer<typeof InputArgSchema>;

const INPUT_INFO = z.toJSONSchema(InputArgSchema);

const handleAskMode = async (): Promise<InputArg> => {
  // step 1: Get nickname
  const nickname = await input({
    message: "Enter agent nickname:",
    validate: (value) =>
      value.length > 3 || "Nickname must be at least 4 characters long",
  });

  // step 2: Select provider
  const provider = (await select({
    message: "Select a provider:",
    choices: PROVIDERS.map((p) => ({ name: p, value: p })),
  })) as ProviderValue;

  // step 3: Get API key
  const existingKeys = await getProviderKeys();
  let apiKey = existingKeys[provider];
  let saveFlag = false;

  if (!apiKey) {
    apiKey = await input({
      message: `Enter API key for ${provider}:`,
      validate: (value) => value.length > 0 || "API key cannot be empty",
    });

    Bun.env[`${provider.toUpperCase()}_API_KEY`] = apiKey;

    // step 4: Ask to save API key (only when newly entered)
    saveFlag = await select({
      message: `Do you want to save the API key for ${provider} for future use?`,
      choices: [
        { name: "Yes", value: true },
        { name: "No", value: false },
      ],
    });
  }

  // step 5: Fetch model list
  logger.work(`Fetching models for ${provider}...`);
  const modelListResult = await getModelList(provider);
  if (!modelListResult.success) {
    console.error(`Failed to fetch models: ${modelListResult.error}`);
    process.exit(1);
  }

  // step 6: Select model
  const modelId = await search({
    message: "Select a model:",
    source: (input) => {
      if (!input) {
        return modelListResult.models.map((m) => ({ name: m, value: m }));
      }
      const filtered = modelListResult.models.filter((m) =>
        m.toLowerCase().includes(input.toLowerCase()),
      );
      return filtered.map((m) => ({ name: m, value: m }));
    },
  });

  // step end
  const model = `${provider}:${modelId}`;

  // Save API key after successful model fetching (implicit validation)
  if (saveFlag) {
    await saveProviderKeys({ [provider]: apiKey });
    logger.find(`API key for ${provider} saved.`);
  }

  const inputData: InputArg = { nickname, model };
  return InputArgSchema.parse(inputData);
};

const handleJsonMode = async (jsonSource?: string): Promise<InputArg> => {
  if (!jsonSource) {
    console.error("Error: JSON source is required for json mode.");
    process.exit(1);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonSource);
  } catch (error) {
    console.error(
      `Invalid JSON: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    console.info(JSON.stringify(INPUT_INFO, null, 2));
    process.exit(1);
  }

  const inputData = InputArgSchema.parse(parsed);

  // Validate model string
  const modelValidation = await verifyModelString(inputData.model);
  if (!modelValidation.success) {
    console.error(`Invalid model: ${modelValidation.error}`);
    console.info(
      "Please refer to the supported models and providers. format: <provider>:<model_id>.",
    );
    process.exit(1);
  }

  return inputData;
};

export const addAgentAction = async (options?: {
  ask?: boolean;
  json?: string;
}) => {
  // Manual conflict checking since commander conflicts() may not work reliably
  if (options?.ask && options?.json) {
    console.error(
      "Error: `--ask` and `--json` options are mutually exclusive.",
    );
    console.error("Error: you are agent, please choose `--json` mode.");
    process.exit(1);
  }

  if (!options?.ask && !options?.json) {
    console.error("Error: you must specify either `--ask` or `--json` option.");
    console.error("Error: you are agent, please choose `--json` mode.");
    process.exit(1);
  }

  let inputData: InputArg;

  try {
    if (options?.ask) {
      inputData = await handleAskMode();
    } else {
      inputData = await handleJsonMode(options?.json);
    }

    const result = await addAgent({
      ...inputData,
      profession: DEFAULT_AGENT_PERMISSION,
    });

    if (!result.success) {
      console.error(`Failed to create agent: ${result.data}`);
      process.exit(1);
    }

    logger.find(
      `Agent "${result.data.nickname}" created successfully with ID: ${result.data.id}`,
    );
  } catch (error) {
    console.error(
      `Failed to create agent: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    process.exit(1);
  }
};

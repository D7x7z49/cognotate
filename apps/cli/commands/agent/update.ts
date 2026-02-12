// apps/cli/commands/agent/update.ts

import { input, search, select } from "@inquirer/prompts";
import { z } from "zod";
import {
  UpdateAgentSchema,
  updateAgent,
  type NetworkPermission,
  type SystemPermission,
} from "@cognotate/core/lib/agent";
import {
  verifyModelString,
  PROVIDERS,
  getProviderKeys,
  getModelList,
  saveProviderKeys,
  type ProviderValue,
} from "@cognotate/core/lib/llm";
import {
  editNetworkPermissions,
  editSystemPermissions,
} from "@/lib/inquirer/permission";

const InputArgSchema = UpdateAgentSchema.omit({ targetNickname: true });
type InputArg = z.infer<typeof InputArgSchema>;

const INPUT_INFO = z.toJSONSchema(InputArgSchema);

const handleAskMode = async (): Promise<InputArg> => {
  // step 1: Choose what to update
  const updateChoices = [
    { name: "Nickname", value: "nickname" },
    { name: "Model", value: "model" },
    { name: "Permissions (Profession)", value: "profession" },
  ];

  const fieldsToUpdate = await select({
    message: "What would you like to update?",
    choices: updateChoices,
  });

  let updateData: Partial<InputArg> = {};

  // step 3: Get new values based on selection
  if (fieldsToUpdate === "nickname") {
    const nickname = await input({
      message: "Enter new nickname:",
      validate: (value) =>
        value.length > 3 || "Nickname must be at least 4 characters long",
    });
    updateData.nickname = nickname;
  } else if (fieldsToUpdate === "model") {
    // Select provider
    const provider = (await select({
      message: "Select a provider:",
      choices: PROVIDERS.map((p) => ({ name: p, value: p })),
    })) as ProviderValue;

    // Get API key
    const existingKeys = await getProviderKeys();
    let apiKey = existingKeys[provider];

    if (!apiKey) {
      apiKey = await input({
        message: `Enter API key for ${provider}:`,
        validate: (value) => value.length > 0 || "API key cannot be empty",
      });

      Bun.env[`${provider.toUpperCase()}_API_KEY`] = apiKey;

      // Ask to save API key
      const saveFlag = await select({
        message: `Do you want to save the API key for ${provider} for future use?`,
        choices: [
          { name: "Yes", value: true },
          { name: "No", value: false },
        ],
      });

      if (saveFlag) {
        await saveProviderKeys({ [provider]: apiKey });
        console.log(`API key for ${provider} saved.`);
      }
    }

    // Fetch model list
    console.log(`Fetching models for ${provider}...`);
    const modelListResult = await getModelList(provider);
    if (!modelListResult.success) {
      console.error(`Failed to fetch models: ${modelListResult.error}`);
      process.exit(1);
    }

    // Select model
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

    const model = `${provider}:${modelId}`;
    updateData.model = model;
  } else if (fieldsToUpdate === "profession") {
    console.log("\n=== Agent Permissions Configuration ===");
    console.log(
      "Configure the permissions for this agent. You can set network access controls and system operation permissions.",
    );

    // Initialize permissions structure
    const profession: { network: NetworkPermission; system: SystemPermission } =
      {
        network: {
          outbound: true,
          domains: { whitelist: [], blacklist: [] },
        },
        system: {
          read: true,
          write: false,
          execute: false,
          commands: { whitelist: [], blacklist: [] },
        },
      };

    // Main permissions menu
    let configuring = true;
    while (configuring) {
      console.log("\n--- Current Permissions Summary ---");
      console.log(
        `Network: outbound=${profession.network.outbound}, domains: whitelist(${profession.network.domains.whitelist.length}), blacklist(${profession.network.domains.blacklist.length})`,
      );
      console.log(
        `System: read=${profession.system.read}, write=${profession.system.write}, execute=${profession.system.execute}, commands: whitelist(${profession.system.commands.whitelist.length}), blacklist(${profession.system.commands.blacklist.length})`,
      );

      const permissionType = await select({
        message: "Which permissions would you like to configure?",
        choices: [
          {
            name: "Network permissions (outbound access, domain lists)",
            value: "network",
          },
          {
            name: "System permissions (file access, command execution)",
            value: "system",
          },
          { name: "Finish permissions configuration", value: "done" },
        ],
      });

      if (permissionType === "network") {
        profession.network = await editNetworkPermissions(profession.network);
      } else if (permissionType === "system") {
        profession.system = await editSystemPermissions(profession.system);
      } else if (permissionType === "done") {
        configuring = false;
      }
    }

    updateData.profession = profession;
  }

  return InputArgSchema.parse(updateData);
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

  // Validate model string if provided
  if (inputData.model) {
    const modelValidation = await verifyModelString(inputData.model);
    if (!modelValidation.success) {
      console.error(`Invalid model: ${modelValidation.error}`);
      console.info(
        "Please refer to the supported models and providers. format: <provider>:<model_id>.",
      );
      process.exit(1);
    }
  }

  return inputData;
};

export const updateAgentAction = async (
  target: string,
  options?: {
    ask?: boolean;
    json?: string;
  },
) => {
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

    const result = await updateAgent({ targetNickname: target, ...inputData });

    if (!result.success) {
      console.error(`Failed to update agent: ${result.data}`);
      process.exit(1);
    }

    console.log(
      `Agent "${result.data.nickname}" updated successfully with ID: ${result.data.id}`,
    );
  } catch (error) {
    console.error(
      `Failed to update agent: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    process.exit(1);
  }
};

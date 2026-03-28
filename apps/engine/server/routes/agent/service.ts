// apps/engine/server/routes/agent/service.ts

import { status } from "elysia";
import {
  UserType,
  getUserById,
  listUser,
  updateAgentMetadata,
} from "@cognotate/core/lib/handler/user";
import { AgentModel } from "./model";
import { getProviderModelMatrix } from "@cognotate/core/lib/config";

const UPDATE_AGENT_MODEL_TIP = {
  format: "Invalid model format, expected provider:model.",
  fetch: "GET /model/list for supported providers.",
};

export abstract class Agent {
  static async list(
    input: AgentModel["listQuery"],
  ): Promise<AgentModel["listResponse"]> {
    const data = await listUser({
      ...input,
      type: UserType.AGENT,
    });
    const response = AgentModel.listResponse.safeParse(data);
    if (!response.success) {
      throw status(400, response.error.message);
    }

    if (!response.data) {
      throw status(404);
    }
    return response.data;
  }

  static async updateModel(
    input: AgentModel["updateModelBody"],
  ): Promise<AgentModel["updateModelResponse"]> {
    // validate model format: provider:model
    const parts = input.model.split(":");
    if (parts.length !== 2) {
      throw status(400, UPDATE_AGENT_MODEL_TIP.format);
    }
    const [provider, model] = parts;
    // ensure both parts are non-empty
    if (!provider || !model) {
      throw status(400, UPDATE_AGENT_MODEL_TIP.format);
    }

    // fetch available provider-model matrix
    const modelMatrix = await getProviderModelMatrix();

    // verify provider exists
    const providerEntry = modelMatrix.find(
      (entry) => entry.provider === provider,
    );
    if (!providerEntry) {
      throw status(400, {
        error: `Provider "${provider}" not supported`,
        tip: UPDATE_AGENT_MODEL_TIP.fetch,
      });
    }
    // verify model exists under that provider
    if (!providerEntry.models.includes(model)) {
      throw status(400, {
        error: `Model "${model}" not supported for provider "${provider}".`,
        tip: UPDATE_AGENT_MODEL_TIP.fetch,
      });
    }

    // fetch user by id
    const data = await getUserById({
      id: input.id,
    });
    if (!data) {
      throw status(404, "User not found");
    }
    // ensure user is an agent
    if (data.type !== UserType.AGENT) {
      throw status(400, "User type must be agent");
    }

    // update agent metadata with new model
    const result = await updateAgentMetadata({
      id: input.id,
      metadata: {
        ...data.metadata,
        model: input.model,
      },
    });
    if (!result) {
      throw status(404, "Update agent metadata failed");
    }

    // validate and return updated data
    const response = AgentModel.updateModelResponse.safeParse(result);
    if (!response.success) {
      throw status(400, response.error.message);
    }

    return response.data;
  }

  static async exportPrompt(
    input: AgentModel["exportPromptQuery"],
  ): Promise<AgentModel["exportPromptResponse"]> {
    // fetch user by id
    const data = await getUserById({
      id: input.id,
    });
    if (!data) {
      throw status(404, "User not found");
    }

    // ensure user is an agent
    if (data.type !== UserType.AGENT) {
      throw status(400, "User type must be agent");
    }

    // return prompt data
    const response = AgentModel.exportPromptResponse.safeParse(data);
    if (!response.success) {
      throw status(400, response.error.message);
    }

    return response.data;
  }

  static async importPrompt(
    input: AgentModel["importPromptBody"],
  ): Promise<AgentModel["importPromptResponse"]> {
    // fetch user by id
    const data = await getUserById({
      id: input.id,
    });
    if (!data) {
      throw status(404, "User not found");
    }
    // ensure user is an agent
    if (data.type !== UserType.AGENT) {
      throw status(400, "User type must be agent");
    }

    // update agent metadata with new prompt
    const result = await updateAgentMetadata({
      id: input.id,
      metadata: {
        ...data.metadata,
        prompt: input.prompt,
      },
    });
    if (!result) {
      throw status(404, "Update agent metadata failed");
    }

    // validate and return updated data
    const response = AgentModel.importPromptResponse.safeParse(result);
    if (!response.success) {
      throw status(400, response.error.message);
    }

    return response.data;
  }
}

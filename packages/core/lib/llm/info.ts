// packages/core/lib/llm/info.ts

import { PROVIDER_LIST, PROVIDERS, type ProviderValue } from "./constants";
import { getProviderKeys } from "./secret";

interface ModelListResult {
  success: boolean;
  models: string[];
  error: string | null;
}

const fetchModelList = async (
  transform: (data: unknown) => string[],
  url: string,
  init?: RequestInit,
): Promise<ModelListResult> => {
  try {
    const response = await fetch(url, {
      ...init,
    });
    if (!response.ok) {
      return {
        success: false,
        models: [],
        error: `http request failed with status ${response.status}`,
      };
    }
    const data = await response.json();
    return {
      success: true,
      models: transform(data),
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      models: [],
      error: "network request timed out",
    };
  }
};

export const getModelList = async (
  provider: ProviderValue,
): Promise<ModelListResult> => {
  const keys = await getProviderKeys();
  const apiKey = keys[provider];

  if (!apiKey) {
    return {
      success: false,
      models: [],
      error: "api key missing",
    };
  }

  const baseTransform = (data: unknown) => {
    return (data as { data: { id: string }[] }).data.map(
      (model: { id: string }) => model.id,
    );
  };

  const googleTransform = (data: unknown) => {
    return (data as { models: { name: string }[] }).models.map((model) =>
      model.name.replace("models/", ""),
    );
  };

  const baseHeaders = () => ({
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  switch (provider) {
    case PROVIDER_LIST.OPENAI:
      return fetchModelList(
        baseTransform,
        "https://api.openai.com/v1/models",
        baseHeaders(),
      );
    case PROVIDER_LIST.ANTHROPIC:
      return fetchModelList(
        baseTransform,
        "https://api.anthropic.com/v1/models",
        {
          headers: {
            "anthropic-version": "2023-06-01",
            "X-Api-Key": apiKey,
          },
        },
      );
    case PROVIDER_LIST.GOOGLE:
      return fetchModelList(
        googleTransform,
        `https://generativelanguage.googleapis.com/v1beta/models?pageSize=100&key=${apiKey}`,
      );
    case PROVIDER_LIST.XAI:
      return fetchModelList(
        baseTransform,
        "https://api.x.ai/v1/models",
        baseHeaders(),
      );
    case PROVIDER_LIST.DEEPSEEK:
      return fetchModelList(
        baseTransform,
        "https://api.deepseek.com/models",
        baseHeaders(),
      );
    case PROVIDER_LIST.OPENROUTER:
      return fetchModelList(
        baseTransform,
        "https://openrouter.ai/api/v1/models",
        baseHeaders(),
      );
    default:
      return {
        success: false,
        models: [],
        error: "unsupported provider",
      };
  }
};

export const verifyModelString = async (model: string) => {
  if (!model.includes(":"))
    return {
      success: false,
      error: "invalid model format",
    };
  const [providerKey, modelId] = model.split(":");
  if (!providerKey || !modelId)
    return {
      success: false,
      error: "invalid model format",
    };

  if (!(providerKey in PROVIDERS))
    return {
      success: false,
      error: "unsupported provider",
    };

  const models = await getModelList(providerKey as ProviderValue);
  if (!models.success)
    return {
      success: false,
      error: models.error,
    };

  if (!models.models.includes(modelId))
    return {
      success: false,
      error: "model not found",
    };

  return {
    success: true,
    error: null,
  };
};

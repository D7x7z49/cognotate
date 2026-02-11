// packages/core/lib/llm/info.ts

import { CACHE_FILE_KEY } from "@/lib/config";
import { getFileCache, setFileCache } from "@/lib/cache";

import { PROVIDER_LIST, PROVIDERS, type ProviderValue } from "./constants";
import { getProviderKeys } from "./secret";

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

  if (!PROVIDERS.includes(providerKey as ProviderValue))
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

const getCachePath = (url: string) => {
  const fileName = Bun.hash(url);
  return CACHE_FILE_KEY.from("models", `${fileName}.list.json`).build();
};

interface ModelListResult {
  success: boolean;
  models: string[];
  error: string | null;
}

const fetchModelList = async (
  transform: (data: unknown) => string[],
  url: string,
  force: boolean = false,
  init?: RequestInit,
): Promise<ModelListResult> => {
  if (!force) {
    const cachePath = getCachePath(url);
    const cached = await getFileCache<string[]>(cachePath);
    if (cached.hits && cached.data) {
      return {
        success: true,
        models: cached.data,
        error: null,
      };
    }
  }

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
    const models = transform(data);

    const cachePath = getCachePath(url);
    await setFileCache<string[]>(cachePath, models);

    return {
      success: true,
      models: models,
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
  force: boolean = false,
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
        force,
        baseHeaders(),
      );
    case PROVIDER_LIST.ANTHROPIC:
      return fetchModelList(
        baseTransform,
        "https://api.anthropic.com/v1/models",
        force,
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
        force,
        baseHeaders(),
      );
    case PROVIDER_LIST.DEEPSEEK:
      return fetchModelList(
        baseTransform,
        "https://api.deepseek.com/models",
        force,
        baseHeaders(),
      );
    case PROVIDER_LIST.OPENROUTER:
      return fetchModelList(
        baseTransform,
        "https://openrouter.ai/api/v1/models",
        force,
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

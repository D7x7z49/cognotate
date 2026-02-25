// apps/cli/lib/auth.ts

import { z } from "zod";
import { ROOT } from "@cognotate/core/lib/config";

const AUTH_FILE = `${ROOT}/auth.json`;

export const AuthStateSchema = z.object({
  currentIdentityId: z.string().min(1, "Identity ID cannot be empty"),
});

export type AuthState = z.infer<typeof AuthStateSchema>;

const readAuthFile = async (): Promise<AuthState | null> => {
  const file = Bun.file(AUTH_FILE);
  if (!(await file.exists())) {
    return null;
  }
  const data = await file.json();
  const result = AuthStateSchema.safeParse(data);
  return result.success ? result.data : null;
};

export const getAuth = async (): Promise<AuthState | null> => {
  return readAuthFile();
};

export const setAuth = async (auth: AuthState): Promise<void> => {
  const validated = AuthStateSchema.parse(auth);
  await Bun.write(AUTH_FILE, JSON.stringify(validated, null, 2));
};

export const getCurrentIdentityId = async (): Promise<string | null> => {
  const auth = await readAuthFile();
  return auth?.currentIdentityId ?? null;
};

export const setCurrentIdentityId = async (
  identityId: string,
): Promise<void> => {
  await setAuth({ currentIdentityId: identityId });
};

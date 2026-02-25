// apps/cli/commands/auth/login.ts

import { hostname, userInfo } from "os";
import { infoHumanByHostNickname, addHuman } from "@cognotate/core/lib/human";
import { setCurrentIdentityId } from "@/lib/auth";
import { cliLogger } from "@/lib/logger";

export const loginAction = async () => {
  const nickname = userInfo().username;
  const host = hostname();

  cliLogger.step(`Looking up Human "${nickname}@${host}"`);

  let human = await infoHumanByHostNickname({ host, nickname });

  if (!human) {
    cliLogger.step(`Creating Human "${nickname}@${host}"`);
    const result = await addHuman({ host, nickname });

    if (!result.success) {
      cliLogger.fail(result.data);
      return;
    }

    human = result.data;
  }

  cliLogger.find(`Human ID: ${human.id}, Identity ID: ${human.identity.id}`);

  await setCurrentIdentityId(human.identity.id);
  cliLogger.find(`Logged in as "${nickname}@${host}"`);
};

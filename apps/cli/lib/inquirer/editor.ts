// apps/cli/lib/inquirer/editor.ts

import { input, select } from "@inquirer/prompts";

export type ListItem = string;

export interface ListEditorOptions {
  listName: string;
  inputPrompt: string;
  emptyMessage: string;
  validate?: (value: string) => string | true;
}

export const createListEditor = (options: ListEditorOptions) => {
  const {
    listName,
    inputPrompt,
    emptyMessage,
    validate = () => true,
  } = options;

  return async (current: ListItem[]): Promise<ListItem[]> => {
    let items = [...current];

    while (true) {
      console.log(
        `\nCurrent ${listName}: ${items.length ? items.join(", ") : "none"}`,
      );

      const action = await select({
        message: `Manage ${listName}:`,
        choices: [
          { name: "Add", value: "add" },
          { name: "Remove", value: "remove" },
          { name: "Back", value: "back" },
        ],
      });

      if (action === "back") return items;

      if (action === "add") {
        const value = await input({
          message: inputPrompt,
          validate: (v) => {
            const trimmed = v.trim();
            if (!trimmed) return "Cannot be empty";
            if (items.includes(trimmed)) return "Already exists";
            return validate(trimmed);
          },
        });

        items.push(value.trim());
        console.log(`Added "${value}"`);
      }

      if (action === "remove") {
        if (!items.length) {
          console.log(emptyMessage);
          continue;
        }

        const toRemove = await select({
          message: `Select item to remove:`,
          choices: items.map((item) => ({ name: item, value: item })),
        });

        items = items.filter((item) => item !== toRemove);
        console.log(`Removed "${toRemove}"`);
      }
    }
  };
};

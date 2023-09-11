import { StateSerializer } from "./types";

export const jsonSerializer: StateSerializer = {
  deserialize: JSON.parse,
  serialize: JSON.stringify,
};

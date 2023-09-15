import { StateSerializer } from "./types";

export const jsonSerializer: StateSerializer = {
  serialize: JSON.stringify,
  deserialize: JSON.parse,
};

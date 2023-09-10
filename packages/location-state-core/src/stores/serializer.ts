import { Serializer } from "./types";

export const jsonSerializer: Serializer = {
  deserialize: JSON.parse,
  serialize: JSON.stringify,
};

import { Serializer } from "./types";

export const jsonSerializer: Serializer = {
  stateDeserialize: JSON.parse,
  stateSerialize: JSON.stringify,
};

import { ParticipantPopulated } from "./types";

export function userIsConversationParticipant(
  participants: ParticipantPopulated[],
  userId: string
): boolean {
  return !!participants.find((participants) => participants.userId === userId);
}

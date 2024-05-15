import { ParticipantPopulated } from "./types";

export function userIsConversationParticipant(
  participants: ParticipantPopulated[],
  userId: string
): boolean {
  return !!participants.find((participants) => participants.userId === userId);
}

export function isParticipantInConversation(
  participants: ParticipantPopulated[],
  userId: string,
  participantId: string
): boolean {
  const isUserParticipant = participants.some(
    (participant) => participant.userId === userId
  );

  const isParticipantInConversation = participants.some(
    (participant) => participant.userId === participantId
  );

  return isUserParticipant && isParticipantInConversation;
}

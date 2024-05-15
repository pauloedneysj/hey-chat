import { ParticipantPopulated } from "../../../backend/src/utils/types";
import { differenceInSeconds } from "date-fns";

export const formatUsernames = (
  participants: Array<ParticipantPopulated>,
  myUserId: string
): string => {
  const usernames = participants
    .filter((participant) => participant.user.id != myUserId)
    .map((participant) => participant.user.username);

  return usernames.join(", ");
};

export const userIsOnline = (lastSeen: string) => {
  const now = new Date();
  const diffInSeconds = differenceInSeconds(new Date(lastSeen), now);
  return Math.abs(diffInSeconds) <= 60;
};

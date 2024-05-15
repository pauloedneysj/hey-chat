import { differenceInSeconds } from "date-fns";
import { ParticipantPopulated } from "./types";

export const formatUsernames = (
  participants: ParticipantPopulated[],
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

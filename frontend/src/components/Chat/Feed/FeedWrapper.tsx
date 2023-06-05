import { Session } from "next-auth";

interface IFeedWrapper {
  session: Session;
}

export default function FeedWrapper({ session }: IFeedWrapper) {
  return <div>FeedWrapper</div>;
}

import { FC, ReactNode } from "react";
import { PostHogProvider } from "posthog-js/react";
interface RollbarProviderProps {
  children: ReactNode;
}

const { VITE_POSTHOG_KEY, VITE_POSTHOG_HOST } = import.meta.env;

const PostHogMiddleware: FC<RollbarProviderProps> = ({ children }) => {
  return (
    <PostHogProvider
      apiKey={VITE_POSTHOG_KEY}
      options={{
        api_host: VITE_POSTHOG_HOST,
        person_profiles: "identified_only"
      }}
    >
      {children}
    </PostHogProvider>
  );
};

export default PostHogMiddleware;

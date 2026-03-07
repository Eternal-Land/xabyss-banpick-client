import type { PropsWithChildren } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/lib/redux";

export default function Providers({ children }: PropsWithChildren) {
  return (
    <ReduxProvider store={store}>{children}</ReduxProvider>
  );
}

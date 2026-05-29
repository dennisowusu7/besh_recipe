"use client";

import { SessionProvider } from "next-auth/react";
import { Children } from "react";

const Provider = ({ children }: { children: React.ReactNode }) => {
    return <SessionProvider>{children}</SessionProvider>
};

export default Provider;
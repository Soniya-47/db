import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const isApproved = req.auth?.user?.isApproved;
    const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");
    const isOnLogin = req.nextUrl.pathname.startsWith("/login");
    const isOnRegister = req.nextUrl.pathname.startsWith("/register");
    const isOnPending = req.nextUrl.pathname.startsWith("/pending-approval");

    if (isOnDashboard) {
        if (!isLoggedIn) return NextResponse.redirect(new URL("/login", req.nextUrl));
        if (!isApproved) return NextResponse.redirect(new URL("/pending-approval", req.nextUrl));
    } else if (isOnPending) {
        if (!isLoggedIn) return NextResponse.redirect(new URL("/login", req.nextUrl));
        if (isApproved) return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    } else if (isOnLogin || isOnRegister) {
        if (isLoggedIn) {
            if (isApproved) return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
            return NextResponse.redirect(new URL("/pending-approval", req.nextUrl));
        }
    }
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

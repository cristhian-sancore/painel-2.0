import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    // Protect everything except /login, /setup, /api/setup, /api/auth, and public files
    "/((?!login|setup|api/setup|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};

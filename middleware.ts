import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/products/:path*",
    "/inventory/:path*",
    "/expenses/:path*",
    "/sales/:path*",
    "/alerts/:path*",
    "/users/:path*",
    "/account/:path*"
  ],
};

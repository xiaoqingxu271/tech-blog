import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// 保护 /admin 下所有页面（/admin/login 除外），未登录跳转登录页。
// 与数据层 API 401 形成纵深防御。
export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        if (pathname === "/admin/login") return true;
        return !!token;
      }
    },
    pages: { signIn: "/admin/login" }
  }
);

export const config = {
  matcher: ["/admin/:path*"]
};

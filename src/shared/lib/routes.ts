export const NAV_LINKS = [
  { href: "/", label: "Заказы" },
  { href: "/products", label: "Продукты" },
  { href: "/profile", label: "Профиль" },
];

export const AUTH_PAGES = ["/login", "/register"];

export function isAuthPage(pathname: string) {
  return AUTH_PAGES.some((path) => pathname.startsWith(path));
}

export const PERMISSIONS = {
  SUPER_ADMIN: [
    "dashboard",
    "catalog",
    "exhibition",
    "cinemas",
    "personal",
    "transactions",
    "inventory",
    "reports",
    "sell_tickets",
    "candy_bar",
  ],
  CASHIER: [
    "dashboard_cashier",
    "sell_tickets",
    "transactions",
    "candy_bar",
  ],
  CINEMA_MANAGER: ["dashboard", "exhibition", "cinemas"],
  USHER: ["dashboard"],
};

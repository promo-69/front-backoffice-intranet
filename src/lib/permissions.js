export const PERMISSIONS = {
  SUPER_ADMIN: [
    "dashboard",
    "exhibition",
    "cinemas",
    "users",
    "transactions",
    "inventory",
    "reports",
    "sell_tickets",
  ],
  CASHIER: [
    "dashboard_cashier",
    "sell_tickets",
    "transactions",
  ],
  CINEMA_MANAGER: ["dashboard", "exhibition", "cinemas"],
  USHER: ["dashboard"],
};

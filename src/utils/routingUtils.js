/**
 * Routing utility for role-based navigation
 * SINGLE SOURCE OF TRUTH
 */

export const redirectByRole = (navigate, role) => {
  if (!role) return;

  const normalizeRole = (r) =>
    r.replace(/_/g, "").toLowerCase();

  const roleMap = {
    tenant: "/tenant",
    landlord: "/landlord/add-property",
    subowner: "/sub_owner",
    worker: "/dr_worker",
  };

  const normalizedRole = normalizeRole(role);
  const targetPath = roleMap[normalizedRole];

  if (targetPath) {
    navigate(targetPath, { replace: true });
  } else {
    console.warn("No redirect path defined for role:", role);
  }
};

/**
 * Routing utility for role-based navigation
 * Single source of truth for redirect rules
 */

export const redirectByRole = (navigate, role) => {
  if (!role) return;

  const roleMap = {
    tenant: '/tenant',
    Tenant: '/tenant',
    landlord: '/landlord/add-property',
    Landlord: '/landlord/add-property',
    sub_owner: '/sub_owner',
    subOwner: '/sub_owner',
    worker: '/dr_worker',
    Worker: '/dr_worker',
    dr_worker: '/dr_worker',
  };

  const targetPath = roleMap[role];
  if (targetPath) {
    navigate(targetPath, { replace: true });
  } else {
    console.warn(`No redirect path defined for role: ${role}`);
  }
};

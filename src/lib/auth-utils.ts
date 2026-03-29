import { getAuthContext } from "./auth-context";

/**
 * getSessionRole
 * Returns the EFFECTIVE role (shadow role if impersonating, else real role).
 */
export async function getSessionRole() {
    const { effectiveRole } = await getAuthContext();
    return effectiveRole;
}

/**
 * getRealRole
 * Returns the ACTUAL role of the logged-in user, regardless of impersonation.
 */
export async function getRealRole() {
    const { realRole } = await getAuthContext();
    return realRole;
}

export async function isAdminOrTeacher() {
    const role = await getSessionRole();
    return role === "admin" || role === "teacher";
}

export async function isAdmin() {
    const role = await getSessionRole();
    return role === "admin";
}

/**
 * isImpersonating
 * Helper to check if the current session is a shadow session.
 */
export async function isImpersonating() {
    const { isImpersonating } = await getAuthContext();
    return isImpersonating;
}

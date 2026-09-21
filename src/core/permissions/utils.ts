export function hasPermission(permissionCodes: readonly string[], code: string): boolean {
  return permissionCodes.includes(code);
}

export function hasAnyPermission(permissionCodes: readonly string[], codes: readonly string[]): boolean {
  return codes.some((code) => permissionCodes.includes(code));
}

export function hasAllPermissions(permissionCodes: readonly string[], codes: readonly string[]): boolean {
  return codes.every((code) => permissionCodes.includes(code));
}

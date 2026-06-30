/** When true, /apply uses mock steps 2–3 and KCP review payment UI (no PG / no registration API). */
export function isApplyKcpDemo(): boolean {
  return import.meta.env.VITE_APPLY_KCP_DEMO === 'true';
}

/**
 * The new order after moving `activeId` to where `overId` is, or `null` when
 * either id is not in the list (a stale drag event) so callers can ignore it.
 */
export function moveItem(
  list: readonly string[],
  activeId: string,
  overId: string,
): string[] | null {
  const from = list.indexOf(activeId);
  const to = list.indexOf(overId);
  if (from === -1 || to === -1) return null;
  const next = [...list];
  next.splice(to, 0, ...next.splice(from, 1));
  return next;
}

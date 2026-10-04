import { runWithOwner } from "solid-js";

/**
 * The store with its setter writing from outside the reactive tree, as an
 * event handler does: Solid 2 forbids store writes in an owned scope, and a
 * test's `createRoot` body is one.
 */
export const external = <S, A extends unknown[]>([store, set]: readonly [
  S,
  (...args: A) => void,
]) => [store, (...args: A) => runWithOwner(null, () => set(...args))] as const;

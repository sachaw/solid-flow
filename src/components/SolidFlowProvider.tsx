import type { JSX } from "@solidjs/web";
import { merge, onCleanup, runWithOwner, type ParentProps } from "solid-js";

import { createSolidFlow } from "@/browser/createSolidFlow";
import { typedSolidFlowContext } from "@/contexts/flow";
import { getDefaultFlowStateProps } from "@/core/defaults";
import type { SolidFlowProps } from "@/core/flowProps";
import type { Edge, Node } from "@/types";

/** Hoists flow state above `SolidFlow` so hooks work outside the component (multi-panel UIs). */
export const SolidFlowProvider = <NodeType extends Node = Node, EdgeType extends Edge = Edge>(
  props: ParentProps<SolidFlowProps<NodeType, EdgeType>>,
): JSX.Element => {
  const _props = merge(getDefaultFlowStateProps(), props);
  const solidFlow = createSolidFlow(_props);

  onCleanup(() => {
    // Same reason as the cleanup in `SolidFlow` — a disposal walk is an owned
    // scope, and the reset writes a store, which cannot opt in to owned
    // writes. An uncaught throw here halts the host's whole reactive system.
    runWithOwner(null, () => solidFlow.actions.reset());
  });

  // In Solid 2.0 the context object IS the provider component.
  const ContextProvider = typedSolidFlowContext<NodeType, EdgeType>();

  return <ContextProvider value={solidFlow}>{props.children}</ContextProvider>;
};

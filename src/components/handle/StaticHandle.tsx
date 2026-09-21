import type { JSX } from "@solidjs/web";
import type { HandleType } from "@xyflow/system";

import { useNodeId } from "@/contexts";
import type { Position } from "@/types";

type StaticHandleProps = {
  readonly id: string;
  readonly type: HandleType;
  readonly position: Position;
  readonly title?: string;
  readonly style?: JSX.CSSProperties;
};

/**
 * A handle that is only ever the END of an edge: measured, drawn, never
 * dragged from or dropped on.
 *
 * `Handle` carries the whole connection gesture — two prop proxies, the rest
 * spread onto the element, a connection effect, keyed lookups of the
 * gesture's origin and target, and a class of a dozen reactive reads — and
 * pays for all of it on every handle, on every mount. A canvas that never
 * connects (`nodesConnectable={false}`) pays it for nothing: measured on a
 * 519-handle drawing, handles were half of what mounting it cost.
 *
 * This is the DOM contract the measuring pass reads (`getHandleBounds`): the
 * `source` / `target` class, `data-handleid`, `data-handlepos`, inside the
 * node — and the classes the stylesheet places a handle by. Nothing else.
 */
export const StaticHandle = (props: StaticHandleProps): JSX.Element => {
  const nodeId = useNodeId();
  return (
    <div
      data-handleid={props.id}
      data-nodeid={nodeId()}
      data-handlepos={props.position}
      title={props.title}
      style={props.style}
      class={`solid-flow__handle solid-flow__handle-${props.position} ${props.type}`}
    />
  );
};

import { JSX } from "@solidjs/web";
import { Align as Align$1, AriaLabelConfig as AriaLabelConfig$1, BezierPathOptions as BezierPathOptions$1, Box as Box$1, ColorMode as ColorMode$1, ColorModeClass as ColorModeClass$1, Connection, Connection as Connection$1, ConnectionLineType as ConnectionLineType$1, ConnectionMode as ConnectionMode$1, ConnectionState, ControlLinePosition, ControlPosition, ControlPosition as ControlPosition$1, CoordinateExtent, CoordinateExtent as CoordinateExtent$1, DefaultEdgeOptionsBase, Dimensions as Dimensions$1, EdgeBase, EdgeMarker, EdgeMarkerType as EdgeMarkerType$1, EdgePosition, EdgeToolbarBaseProps, FinalConnectionState, FitBounds, FitBoundsOptions as FitBoundsOptions$1, FitViewOptionsBase, GetBezierPathParams as GetBezierPathParams$1, GetSmoothStepPathParams as GetSmoothStepPathParams$1, GetStraightPathParams as GetStraightPathParams$1, Handle as Handle$1, HandleConnection, HandleConnection as HandleConnection$1, HandleProps, HandleType, InternalNodeBase, IsValidConnection as IsValidConnection$1, MarkerProps, MarkerType as MarkerType$1, NodeBase, NodeConnection, NodeConnection as NodeConnection$1, NodeOrigin, NodeOrigin as NodeOrigin$1, NodeProps as NodeProps$1, OnBeforeDeleteBase, OnConnect as OnConnect$1, OnConnectEnd as OnConnectEnd$1, OnConnectStart as OnConnectStart$1, OnConnectStartParams as OnConnectStartParams$1, OnError as OnError$1, OnMove, OnMove as OnMove$1, OnMoveEnd as OnMoveEnd$1, OnMoveStart as OnMoveStart$1, OnReconnect as OnReconnect$1, OnReconnectEnd as OnReconnectEnd$1, OnReconnectStart as OnReconnectStart$1, OnResize as OnResize$1, OnResizeEnd as OnResizeEnd$1, OnResizeStart as OnResizeStart$1, OnSelectionDrag as OnSelectionDrag$1, PanOnScrollMode as PanOnScrollMode$1, PanelPosition, PanelPosition as PanelPosition$1, Position as Position$1, Rect as Rect$1, ResizeControlVariant as ResizeControlVariant$1, ResizeDragEvent as ResizeDragEvent$1, ResizeParams as ResizeParams$1, ResizeParamsWithDirection as ResizeParamsWithDirection$1, SelectionMode as SelectionMode$1, SelectionRect as SelectionRect$1, SetCenter, SetCenterOptions as SetCenterOptions$1, SetViewport, ShouldResize, ShouldResize as ShouldResize$1, SmoothStepPathOptions as SmoothStepPathOptions$1, SnapGrid as SnapGrid$1, StepPathOptions, Transform as Transform$1, UpdateNodeInternals, Viewport, Viewport as Viewport$1, ViewportHelperFunctionOptions as ViewportHelperFunctionOptions$1, XYPosition, XYPosition as XYPosition$1, XYZPosition as XYZPosition$1, ZIndexMode, ZoomInOut, addEdge, getBezierEdgeCenter as getBezierEdgeCenter$1, getBezierPath, getConnectedEdges, getEdgeCenter as getEdgeCenter$1, getIncomers, getNodesBounds, getOutgoers, getSmoothStepPath, getStraightPath, getViewportForBounds } from "@xyflow/system";
import { Accessor, ParentComponent, ParentProps, Refreshable, Store, StoreSetter } from "solid-js";
//#region src/types/custom.d.ts
/** An arbitrary string-keyed record — the unconstrained default for node/edge data. */
type UnknownStruct = Record<string, unknown>;
//#endregion
//#region src/types/node.d.ts
/**
 * The node data structure that gets used for internal nodes.
 * There are some data structures added under node.internal
 * that are needed for tracking some properties
 * @public
 */
type InternalNode<NodeType extends Node = Node> = InternalNodeBase<NodeType>;
/**
 * The node data structure that gets used for the nodes prop.
 * @public
 */
type Node<NodeData extends UnknownStruct = UnknownStruct, NodeType extends string | undefined = string | undefined> = NodeBase<NodeData, NodeType> & {
  class?: string;
  style?: JSX.CSSProperties;
  focusable?: boolean;
  /**
   * When `false`, the node is exempt from viewport culling on both tiers:
   * the always-on CSS tier never hides it and `onlyRenderVisibleElements`
   * never unmounts it. Use for nodes whose content must keep running while
   * off-screen (media playback, timers, third-party embeds).
   * @default true
   */
  cullable?: boolean;
  /**
   * The ARIA role attribute for the node element, used for accessibility.
   * @default "group"
   */
  ariaRole?: JSX.HTMLAttributes<HTMLDivElement>["role"];
  /**
   * General escape hatch for adding custom attributes to the node's DOM
   * element. Event handlers, refs, and content-injection props are excluded
   * (Svelte Flow parity: their omit of `keyof DOMAttributes`); interaction
   * belongs on the node component, not here.
   */
  domAttributes?: Omit<JSX.HTMLAttributes<HTMLDivElement>, "id" | "style" | "class" | "draggable" | "role" | "aria-label" | "innerHTML" | "textContent" | "children" | keyof JSX.CustomAttributes<HTMLDivElement> | keyof JSX.EventHandlersElement<HTMLDivElement> | keyof JSX.EventHandlersWindow<HTMLDivElement>>;
};
/** Props passed to a node component (custom or built-in). */
type NodeProps<TData extends UnknownStruct = UnknownStruct, TType extends string | undefined = string | undefined> = NodeProps$1<Node<TData, TType>>;
/**
 * Map of node types to their components.
 */
type NodeTypes = { [K in string]: {
  bivarianceHack(props: NodeProps<Record<string, unknown>, string | undefined>): JSX.Element;
}["bivarianceHack"]; };
/** Union of the built-in node shapes (input, output, default, group). */
type BuiltInNode = Node<{
  label: string;
}, "input" | "output" | "default"> | Node<Record<string, never>, "group">;
/** The built-in node renderer map, keyed by node type. */
type BuiltInNodeTypes = {
  input: (props: NodeProps<{
    label: string;
  }, "input">) => JSX.Element;
  output: (props: NodeProps<{
    label: string;
  }, "output">) => JSX.Element;
  default: (props: NodeProps<{
    label: string;
  }, "default">) => JSX.Element;
  group: (props: NodeProps<Record<string, never>, "group">) => JSX.Element;
};
//#endregion
//#region src/types/edge.d.ts
/**
 * An `Edge` is the complete description with everything Svelte Flow needs to know in order to
 * render it.
 * @public
 */
type Edge<EdgeData extends UnknownStruct = UnknownStruct, EdgeType extends string | undefined = string | undefined> = EdgeBase<EdgeData, EdgeType> & {
  label?: string;
  labelStyle?: JSX.CSSProperties;
  style?: JSX.CSSProperties;
  class?: string;
  focusable?: boolean;
  /**
   * When `false`, the edge is exempt from viewport culling on both tiers:
   * the always-on CSS tier never hides it and `onlyRenderVisibleElements`
   * never unmounts it.
   * @default true
   */
  cullable?: boolean;
  /**
   * The ARIA role attribute for the edge, used for accessibility.
   * @default "group"
   */
  ariaRole?: JSX.HTMLAttributes<HTMLElement>["role"];
  /**
   * General escape hatch for adding custom attributes to the edge's DOM element.
   */
  domAttributes?: Omit<JSX.SvgSVGAttributes<SVGGElement>, "id" | "style" | "class" | "role" | "aria-label">;
};
/**
 * Props passed to edge components. This is the main interface that custom edge components should implement.
 */
type EdgeProps<EdgeData extends UnknownStruct = UnknownStruct, EdgeType extends string | undefined = string | undefined> = Omit<Edge<EdgeData, EdgeType>, "sourceHandle" | "targetHandle"> & EdgePosition & {
  markerStart?: string;
  markerEnd?: string;
  sourceHandleId?: string | null;
  targetHandleId?: string | null;
};
/**
 * Props for built-in edge components that render the actual SVG path.
 */
type BaseEdgeProps = {
  /** SVG path of the edge */
  path: string;
  /** The x coordinate of the label */
  labelX?: number;
  /** The y coordinate of the label */
  labelY?: number;
  /** Marker at start of edge */
  markerStart?: string;
  /** Marker at end of edge */
  markerEnd?: string;
  /** CSS class for the edge */
  class?: string;
  /** Edge label */
  label?: string;
  /** Styles for the edge label */
  labelStyle?: JSX.CSSProperties;
  /** Styles for the edge path */
  style?: JSX.CSSProperties;
  /** Interaction width for edge selection */
  interactionWidth?: number;
} & JSX.SvgSVGAttributes<SVGPathElement>;
/**
 * Props for built-in edge components (these match the actual component implementations)
 */
type BezierEdgeProps = EdgeProps<Record<string, unknown>, "default"> & {
  pathOptions?: BezierPathOptions$1;
};
/** Props for the built-in straight edge. */
type StraightEdgeProps = Omit<EdgeProps<Record<string, unknown>, "straight">, "sourcePosition" | "targetPosition">;
/** Props for the built-in step edge. */
type StepEdgeProps = EdgeProps<Record<string, unknown>, "step"> & {
  pathOptions?: StepPathOptions;
};
/** Props for the built-in smooth-step edge. */
type SmoothStepEdgeProps = EdgeProps<Record<string, unknown>, "smoothstep"> & {
  pathOptions?: SmoothStepPathOptions$1;
};
/**
 * Built-in edge types with their component signatures
 */
type BuiltInEdgeTypes = {
  default: (props: BezierEdgeProps) => JSX.Element;
  straight: (props: StraightEdgeProps) => JSX.Element;
  step: (props: StepEdgeProps) => JSX.Element;
  smoothstep: (props: SmoothStepEdgeProps) => JSX.Element;
};
/**
 * Union of all built-in edge props
 */
type BuiltInEdge = BezierEdgeProps | StraightEdgeProps | StepEdgeProps | SmoothStepEdgeProps;
/**
 * Map of edge types to their components.
 */
type EdgeTypes = { [K in string]: {
  bivarianceHack(props: EdgeProps<Record<string, unknown>, string | undefined>): JSX.Element;
}["bivarianceHack"]; };
/** Defaults applied to every new edge added to the flow. */
type DefaultEdgeOptions = DefaultEdgeOptionsBase<Edge>;
type EdgeLayouted<EdgeType extends Edge = Edge> = EdgeType & EdgePosition & {
  sourceNode?: Node;
  targetNode?: Node;
  sourceHandleId?: string | null;
  targetHandleId?: string | null;
  edge: EdgeType;
};
//#endregion
//#region src/types/events.d.ts
type NodeEventWithPointer<T = PointerEvent, NodeType extends Node = Node> = ({ node, event }: {
  node: NodeType;
  event: T;
}) => void;
type NodesEventWithPointer<T = PointerEvent, NodeType extends Node = Node> = ({ nodes, event }: {
  nodes: NodeType[];
  event: T;
}) => void;
type NodeTargetEventWithPointer<T = PointerEvent, NodeType extends Node = Node> = ({ targetNode, nodes, event }: {
  targetNode: NodeType | null;
  nodes: NodeType[];
  event: T;
}) => void;
/** Node pointer and drag event handlers accepted by the flow. */
type NodeEvents<NodeType extends Node = Node> = {
  /** This event handler is called when a user clicks on a node. */
  onNodeClick?: NodeEventWithPointer<MouseEvent | TouchEvent, NodeType>;
  /** This event handler is called when a user right-clicks on a node. */
  onNodeContextMenu?: NodeEventWithPointer<MouseEvent, NodeType>;
  /** This event handler is called when a user double-clicks on a node. */
  onNodeDoubleClick?: NodeEventWithPointer<MouseEvent, NodeType>;
  /** This event handler is called when a user drags a node. */
  onNodeDrag?: NodeTargetEventWithPointer<MouseEvent | TouchEvent, NodeType>;
  /** This event handler is called when a user starts to drag a node. */
  onNodeDragStart?: NodeTargetEventWithPointer<MouseEvent | TouchEvent, NodeType>;
  /** This event handler is called when a user stops dragging a node. */
  onNodeDragStop?: NodeTargetEventWithPointer<MouseEvent | TouchEvent, NodeType>;
  /** This event handler is called when the pointer of a user enters a node. */
  onNodePointerEnter?: NodeEventWithPointer<PointerEvent, NodeType>;
  /** This event handler is called when the pointer of a user leaves a node. */
  onNodePointerLeave?: NodeEventWithPointer<PointerEvent, NodeType>;
  /** This event handler is called when the pointer of a user moves over a node. */
  onNodePointerMove?: NodeEventWithPointer<PointerEvent, NodeType>;
};
/** Selection-box event handlers. */
type NodeSelectionEvents<NodeType extends Node = Node> = {
  /** This event handler is called when a user right-clicks the selection box. */
  onSelectionContextMenu?: NodesEventWithPointer<PointerEvent, NodeType>;
  /** This event handler is called when a user clicks the selection box. */
  onSelectionClick?: NodesEventWithPointer<MouseEvent, NodeType>;
};
/** Pane (background) event handlers. */
type PaneEvents = {
  /** This event handler is called when a user clicks the pane. */
  onPaneClick?: ({ event }: {
    event: MouseEvent;
  }) => void;
  /** This event handler is called when a user right-clicks the pane. */
  onPaneContextMenu?: ({ event }: {
    event: PointerEvent;
  }) => void;
  /** This event handler is called when a user scrolls the pane. */
  onPaneScroll?: ({ event }: {
    event: WheelEvent;
  }) => void;
  /** This event handler is called when the pointer of a user enters the pane. */
  onPanePointerEnter?: ({ event }: {
    event: PointerEvent;
  }) => void;
  /** This event handler is called when the pointer of a user moves over the pane. */
  onPanePointerMove?: ({ event }: {
    event: PointerEvent;
  }) => void;
  /** This event handler is called when the pointer of a user leaves the pane. */
  onPanePointerLeave?: ({ event }: {
    event: PointerEvent;
  }) => void;
};
/** Edge pointer event handlers. */
type EdgeEvents<EdgeType extends Edge = Edge> = {
  /** This event handler is called when a user clicks an edge. */
  onEdgeClick?: ({ edge, event }: {
    edge: EdgeType;
    event: MouseEvent;
  }) => void;
  /** This event handler is called when a user right-clicks an edge. */
  onEdgeContextMenu?: ({ edge, event }: {
    edge: EdgeType;
    event: PointerEvent;
  }) => void;
  /** This event handler is called when a user double-clicks an edge. */
  onEdgeDoubleClick?: ({ edge, event }: {
    edge: EdgeType;
    event: MouseEvent;
  }) => void;
  /** This event handler is called when the pointer of a user enters an edge. */
  onEdgePointerEnter?: ({ edge, event }: {
    edge: EdgeType;
    event: PointerEvent;
  }) => void;
  /** This event handler is called when the pointer of a user leaves an edge. */
  onEdgePointerLeave?: ({ edge, event }: {
    edge: EdgeType;
    event: PointerEvent;
  }) => void;
  /** This event handler is called when the pointer of a user moves over an edge. */
  onEdgePointerMove?: ({ edge, event }: {
    edge: EdgeType;
    event: PointerEvent;
  }) => void;
};
/** Handlers fired after node/edge deletions. */
type DeleteEvents<NodeType extends Node = Node, EdgeType extends Edge = Edge> = {
  onNodesDelete?: (nodes: NodeType[]) => void;
  onEdgesDelete?: (edges: EdgeType[]) => void;
};
/** Handlers for edge reconnection gestures. */
type EdgeReconnectEvents<EdgeType extends Edge = Edge> = {
  /**
   * This handler is called when the source or target of a reconnectable edge is dragged from the
   * current node. It will fire even if the edge's source or target do not end up changing.
   * You can use the `reconnectEdge` utility to convert the connection to a new edge.
   */
  onReconnect?: OnReconnect$1<EdgeType>;
  /**
   * This event fires when the user begins dragging the source or target of an editable edge.
   */
  onReconnectStart?: (event: MouseEvent | TouchEvent, edge: EdgeType, handleType: HandleType) => void;
  /**
   * This event fires when the user releases the source or target of an editable edge. It is called
   * even if an edge update does not occur.
   */
  onReconnectEnd?: (event: MouseEvent | TouchEvent, edge: EdgeType, handleType: HandleType, connectionState: FinalConnectionState) => void;
};
type OnSelectionDrag$2<NodeType extends Node = Node> = (event: MouseEvent, nodes: NodeType[]) => void;
//#endregion
//#region src/types/general.d.ts
declare const Position: typeof Position$1;
type Position = `${Position$1}`;
declare const ConnectionMode: typeof ConnectionMode$1;
type ConnectionMode = `${ConnectionMode$1}`;
declare const ConnectionLineType: typeof ConnectionLineType$1;
type ConnectionLineType = `${ConnectionLineType$1}`;
declare const MarkerType: typeof MarkerType$1;
type MarkerType = `${MarkerType$1}`;
/**
 * If you want to render a custom component for connection lines, you can set the
 * `connectionLineComponent` prop on the [`<SolidFlow />`](/api-reference/react-flow#connection-connectionLineComponent)
 * component. The `ConnectionLineComponentProps` are passed to your custom component.
 *
 * @public
 */
type ConnectionLineComponentProps<NodeType extends Node = Node> = {
  readonly connectionLineStyle?: JSX.CSSProperties;
  readonly connectionLineType: ConnectionLineType;
  readonly fromNode: InternalNode<NodeType>;
  readonly fromHandle: Handle$1;
  readonly fromX: number;
  readonly fromY: number;
  readonly toX: number;
  readonly toY: number;
  readonly fromPosition: Position;
  readonly toPosition: Position;
  readonly connectionStatus: "valid" | "invalid" | null;
  readonly toNode: InternalNode<NodeType> | null;
  readonly toHandle: Handle$1 | null;
};
declare const SelectionMode: typeof SelectionMode$1;
type SelectionMode = `${SelectionMode$1}`;
declare const PanOnScrollMode: typeof PanOnScrollMode$1;
type PanOnScrollMode = `${PanOnScrollMode$1}`;
declare const ResizeControlVariant: typeof ResizeControlVariant$1;
type ResizeControlVariant = `${ResizeControlVariant$1}`;
/** A single keyboard modifier key. */
type ShortcutModifier = "alt" | "ctrl" | "meta" | "shift";
/** Modifier requirement for a shortcut: none (`null`/`false`), one modifier, or a list that must all be held. */
type ShortcutModifierDefinition = null | false | ShortcutModifier | (ShortcutModifier | ShortcutModifier[])[];
/** Alias of `ShortcutModifierDefinition`. */
type KeyModifier = ShortcutModifierDefinition;
/** A key name plus an optional modifier requirement. */
type KeyDefinitionObject = {
  key: string;
  modifier?: KeyModifier;
};
/** A shortcut key: a plain key name or a `KeyDefinitionObject`. */
type KeyDefinition = string | KeyDefinitionObject;
/** Live state of an in-progress connection gesture. */
type ConnectionData = {
  connectionPosition: XYPosition$1 | null;
  connectionStartHandle: Handle$1 | null;
  connectionEndHandle: Handle$1 | null;
  connectionStatus: string | null;
};
/** Options for `fitView`: padding, zoom bounds, duration, and the node subset to fit. */
type FitViewOptions<NodeType extends Node = Node> = FitViewOptionsBase<NodeType>;
/** Handler called after nodes and/or edges are deleted. */
type OnDelete<NodeType extends Node = Node, EdgeType extends Edge = Edge> = (params: {
  nodes: NodeType[];
  edges: EdgeType[];
}) => void;
/** A connection together with the id of the edge it produced. */
type EdgeConnection = Connection$1 & {
  id: string;
};
/** Callback that gets called before a handle connection is created. */
type OnBeforeEdgeConnect<EdgeType extends Edge = Edge> = (connection: EdgeConnection) => EdgeType | EdgeConnection | undefined;
/** Callback that gets called after a handle connection is created. */
type OnEdgeConnect = (connection: EdgeConnection) => void;
/** Callback fired before a reconnect is applied; return the modified edge, or `undefined` to cancel. */
type OnBeforeReconnect<EdgeType extends Edge = Edge> = (newEdge: EdgeType, oldEdge: EdgeType) => EdgeType | undefined;
/** Callback fired before nodes/edges are deleted; can abort or narrow the deletion. */
type OnBeforeDelete<NodeType extends Node = Node, EdgeType extends Edge = Edge> = OnBeforeDeleteBase<NodeType, EdgeType>;
type IsValidConnection$2<EdgeType extends Edge = Edge> = (edge: EdgeType | Connection$1) => boolean;
/** Handler called when the set of selected nodes and edges changes. */
type OnSelectionChange<NodeType extends Node = Node, EdgeType extends Edge = Edge> = (params: {
  nodes: NodeType[];
  edges: EdgeType[];
}) => void;
/** A nodes + edges pair describing a (sub)graph. */
type NodeGraph<NodeType extends Node = Node, EdgeType extends Edge = Edge> = {
  readonly nodes: NodeType[];
  readonly edges: EdgeType[];
};
/** Callback that maps a completed connection to the edge to create. */
type OnEdgeCreate<EdgeType extends Edge = Edge> = (connection: Connection$1) => EdgeType | Connection$1;
//#endregion
//#region src/components/connection/ConnectionLine.d.ts
type ConnectionLineProps<NodeType extends Node = Node> = {
  readonly style: JSX.CSSProperties;
  readonly type: ConnectionLineType;
  readonly component: (props: ConnectionLineComponentProps<NodeType>) => JSX.Element;
  readonly containerStyle: string | JSX.CSSProperties;
};
/** Internal component rendering the in-progress connection line. */
declare const ConnectionLine: <NodeType extends Node = Node>(props: ParentProps<Partial<ConnectionLineProps<NodeType>>>) => JSX.Element;
//#endregion
//#region src/components/container/EdgeRenderer.d.ts
type EdgeRendererProps<EdgeType extends Edge = Edge> = EdgeEvents<EdgeType>;
/** Internal renderer iterating the edge id list into `EdgeWrapper`s. */
declare const EdgeRenderer: <NodeType extends Node = Node, EdgeType extends Edge = Edge>(props: EdgeRendererProps<EdgeType>) => JSX.Element;
//#endregion
//#region src/components/container/NodeRenderer.d.ts
type NodeRendererProps<NodeType extends Node = Node> = NodeEvents<NodeType> & {
  readonly nodeClickDistance: number;
};
/** Internal renderer iterating the node id list into `NodeWrapper`s; owns the shared measurement `ResizeObserver`. */
declare const NodeRenderer: <NodeType extends Node = Node>(props: NodeRendererProps<NodeType>) => JSX.Element;
//#endregion
//#region src/components/container/Pane.d.ts
type PaneProps = PaneEvents & {
  readonly panOnDrag?: boolean | number[];
  readonly selectionOnDrag?: boolean;
  readonly paneClickDistance?: number;
  readonly autoPanOnSelection?: boolean;
  readonly onSelectionStart?: (event: PointerEvent) => void;
  readonly onSelectionEnd?: (event: PointerEvent) => void;
};
/** Internal interaction surface handling pane clicks, the selection box, and pan gestures. */
declare const Pane: <NodeType extends Node = Node, EdgeType extends Edge = Edge>(props: ParentProps<PaneProps>) => JSX.Element;
//#endregion
//#region src/components/container/Panel.d.ts
type PanelProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "style"> & {
  /** Set position of the panel
   * @example 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
   */
  readonly position?: PanelPosition$1;
  readonly style?: JSX.CSSProperties;
  readonly "data-testid"?: string;
  readonly "data-message"?: string;
};
/** Positioned overlay container for UI placed above the flow (used by `Controls`, `MiniMap`, attribution). */
declare const Panel: (props: ParentProps<PanelProps>) => JSX.Element;
//#endregion
//#region src/components/container/ViewportPortal.d.ts
/** Portals children into graph coordinate space so they pan and zoom with the viewport. */
declare const ViewportPortal: (props: ParentProps) => JSX.Element;
//#endregion
//#region src/components/container/Zoom.d.ts
type ZoomProps = {
  readonly initialViewport?: Viewport$1;
  readonly panOnScrollMode: PanOnScrollMode;
  readonly onMove?: OnMove$1;
  readonly onMoveStart?: OnMoveStart$1;
  readonly onMoveEnd?: OnMoveEnd$1;
  readonly onViewportInitialized?: () => void;
  readonly preventScrolling: boolean;
  readonly zoomOnScroll: boolean;
  readonly zoomOnDoubleClick: boolean;
  readonly zoomOnPinch: boolean;
  readonly panOnScroll: boolean;
  readonly panOnScrollSpeed: number;
  readonly panOnDrag: boolean | number[];
  readonly paneClickDistance: number;
  readonly selectionOnDrag?: boolean;
};
/** Internal viewport controller wiring pan/zoom gestures (XYPanZoom) to the flow. */
declare const Zoom: (props: ParentProps<ZoomProps>) => JSX.Element;
//#endregion
//#region src/components/edge/BaseEdge.d.ts
/** Lowest-level edge primitive: renders the SVG path, label, and interaction width. */
declare const BaseEdge: (props: ParentProps<BaseEdgeProps>) => JSX.Element;
//#endregion
//#region src/components/edge/BezierEdge.d.ts
/** Built-in bezier edge component. */
declare const BezierEdge: (props: BezierEdgeProps) => JSX.Element;
//#endregion
//#region src/components/edge/BezierEdgeInternal.d.ts
/** Renderer-internal bezier edge variant. */
declare const BezierEdgeInternal: (props: BezierEdgeProps) => JSX.Element;
//#endregion
//#region src/components/edge/EdgeLabel.d.ts
type EdgeLabelProps = {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly selectEdgeOnClick?: boolean;
  readonly transparent?: boolean;
  readonly style?: JSX.CSSProperties;
} & Omit<JSX.HTMLAttributes<HTMLDivElement>, "style">;
/** Renders an edge label positioned in graph coordinates. */
declare const EdgeLabel: (props: ParentProps<EdgeLabelProps>) => JSX.Element;
//#endregion
//#region src/components/edge/EdgeLabelRenderer.d.ts
/** Portals edge labels into a shared HTML layer rendered above the edge SVG. */
declare const EdgeLabelRenderer: (props: ParentProps) => JSX.Element;
//#endregion
//#region src/components/edge/EdgeReconnectAnchor.d.ts
type EdgeReconnectAnchorProps = {
  readonly type: HandleType;
  readonly class?: string;
  readonly style?: JSX.CSSProperties;
  readonly position?: XYPosition$1;
  readonly size?: number;
  /** Externally mark the anchor as reconnecting (hides its children), in
   * addition to the gesture-driven internal state. */
  readonly reconnecting?: boolean;
  /** Called when a reconnect gesture on this anchor starts/ends — the Solid
   * translation of Svelte Flow's `bind:reconnecting`. */
  readonly onReconnectingChange?: (reconnecting: boolean) => void;
} & Omit<JSX.HTMLAttributes<HTMLDivElement>, "style">;
/** Grab area that lets an edge end be dragged off its handle and reconnected. */
declare const EdgeReconnectAnchor: (props: ParentProps<EdgeReconnectAnchorProps>) => JSX.Element;
//#endregion
//#region src/components/edge/EdgeWrapper.d.ts
type EdgeWrapperProps<EdgeType extends Edge = Edge> = EdgeEvents<EdgeType> & {
  readonly edgeId: string;
};
/** Internal per-edge wrapper: interaction, a11y, viewport culling, and the dynamic edge component. */
declare const EdgeWrapper: <NodeType extends Node = Node, EdgeType extends Edge = Edge>(props: EdgeWrapperProps<EdgeType>) => JSX.Element;
//#endregion
//#region src/components/edge/SmoothStepEdge.d.ts
/** Built-in smooth-step edge component. */
declare const SmoothStepEdge: (props: SmoothStepEdgeProps) => JSX.Element;
//#endregion
//#region src/components/edge/SmoothStepEdgeInternal.d.ts
/** Renderer-internal smooth-step edge variant. */
declare const SmoothStepEdgeInternal: (props: SmoothStepEdgeProps) => JSX.Element;
//#endregion
//#region src/components/edge/StepEdge.d.ts
/** Built-in step edge component. */
declare const StepEdge: (props: StepEdgeProps) => JSX.Element;
//#endregion
//#region src/components/edge/StepEdgeInternal.d.ts
/** Renderer-internal step edge variant. */
declare const StepEdgeInternal: (props: StepEdgeProps) => JSX.Element;
//#endregion
//#region src/components/edge/StraightEdge.d.ts
/** Built-in straight edge component. */
declare const StraightEdge: (props: StraightEdgeProps) => JSX.Element;
//#endregion
//#region src/components/edge/StraightEdgeInternal.d.ts
/** Renderer-internal straight edge variant. */
declare const StraightEdgeInternal: (props: Omit<StraightEdgeProps, "sourcePosition" | "targetPosition">) => JSX.Element;
//#endregion
//#region src/components/handle/Handle.d.ts
type HandleProps$1 = Omit<HandleProps, "position"> & {
  readonly position: Position;
  readonly class?: string;
  readonly style?: JSX.CSSProperties;
  readonly onConnect?: (connections: Connection$1[]) => void;
  readonly onDisconnect?: (connections: Connection$1[]) => void;
} & Omit<JSX.HTMLAttributes<HTMLDivElement>, "style">;
/** Connection point on a node; place inside custom nodes to make them connectable. */
declare const Handle: <NodeType extends Node = Node, EdgeType extends Edge = Edge>(props: ParentProps<HandleProps$1>) => JSX.Element;
//#endregion
//#region src/components/handle/StaticHandle.d.ts
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
declare const StaticHandle: (props: StaticHandleProps) => JSX.Element;
//#endregion
//#region src/components/marker/Marker.d.ts
type MarkerProps$1 = MarkerProps & {
  readonly markerUnits?: "strokeWidth" | "userSpaceOnUse";
  readonly strokeWidth?: number;
};
/** Internal SVG `<marker>` definition for one edge marker configuration. */
declare const Marker: (props: MarkerProps$1) => JSX.Element;
//#endregion
//#region src/components/marker/MarkerDefinition.d.ts
/** Internal collector rendering every unique edge marker into one SVG defs block. */
declare const MarkerDefinition: () => JSX.Element;
//#endregion
//#region src/components/node/DefaultNode.d.ts
/** Built-in default node: label with source and target handles. */
declare const DefaultNode: (props: NodeProps<{
  label: string;
}, "default">) => JSX.Element;
//#endregion
//#region src/components/node/GroupNode.d.ts
/** Built-in group node: a plain container for child nodes. */
declare const GroupNode: (props: NodeProps<Record<string, never>>) => JSX.Element;
//#endregion
//#region src/components/node/InputNode.d.ts
/** Built-in input node: label with a source handle only. */
declare const InputNode: (props: NodeProps<{
  label: string;
}>) => JSX.Element;
//#endregion
//#region src/components/node/NodeWrapper.d.ts
type NodeWrapperProps<NodeType extends Node = Node> = NodeEvents<NodeType> & {
  readonly nodeId: string;
  readonly resizeObserver: ResizeObserver | undefined;
  readonly nodeClickDistance: number;
};
/** Internal per-node wrapper: dragging, selection, a11y, measurement, viewport culling, and the dynamic node component. */
declare const NodeWrapper: <NodeType extends Node = Node>(props: NodeWrapperProps<NodeType>) => JSX.Element;
//#endregion
//#region src/components/node/OutputNode.d.ts
/** Built-in output node: label with a target handle only. */
declare const OutputNode: (props: NodeProps<{
  label: string;
}>) => JSX.Element;
//#endregion
//#region src/components/selection/NodeSelection.d.ts
type NodeSelectionProps<NodeType extends Node = Node> = NodeSelectionEvents<NodeType> & Pick<NodeEvents<NodeType>, "onNodeDrag" | "onNodeDragStart" | "onNodeDragStop">;
/** Internal draggable bounding box rendered around multi-selected nodes. */
declare const NodeSelection: <NodeType extends Node = Node>(props: NodeSelectionProps<NodeType>) => JSX.Element;
//#endregion
//#region src/components/selection/Selection.d.ts
type SelectionProps = {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number | string;
  readonly height?: number | string;
  readonly isVisible?: boolean;
};
/** Internal selection-rectangle visual. */
declare const Selection: (props: SelectionProps) => JSX.Element;
//#endregion
//#region src/types/system.d.ts
/** Alignment of an attached element (e.g. a toolbar) along its side: 'start' | 'center' | 'end'. */
type Align = Align$1;
/** Configurable UI strings and ARIA descriptions (localization / a11y overrides). */
type AriaLabelConfig = AriaLabelConfig$1;
/** Options controlling bezier edge path curvature. */
type BezierPathOptions = BezierPathOptions$1;
/** A rectangle expressed as top-left position plus bottom-right extent. */
type Box = Box$1;
/** Color scheme for the flow: an explicit class or 'system' (media-query resolved). */
type ColorMode = ColorMode$1;
/** A resolved color scheme class: 'light' | 'dark'. */
type ColorModeClass = ColorModeClass$1;
/** A width/height pair. */
type Dimensions = Dimensions$1;
/** An edge marker reference: a marker type string or a full `EdgeMarker` config. */
type EdgeMarkerType = EdgeMarkerType$1;
/** Options for fitting the viewport to a set of bounds. */
type FitBoundsOptions = FitBoundsOptions$1;
/** Parameters accepted by `getBezierPath`. */
type GetBezierPathParams = GetBezierPathParams$1;
/** Parameters accepted by `getSmoothStepPath`. */
type GetSmoothStepPathParams = GetSmoothStepPathParams$1;
/** Parameters accepted by `getStraightPath`. */
type GetStraightPathParams = GetStraightPathParams$1;
/** Predicate deciding whether a pending connection may become an edge. */
type IsValidConnection<EdgeType extends EdgeBase = EdgeBase> = IsValidConnection$1<EdgeType>;
/** Handler called when a connection successfully completes. */
type OnConnect = OnConnect$1;
/** Handler called when a connection gesture ends (whether or not an edge was made). */
type OnConnectEnd<NodeType extends NodeBase = NodeBase> = OnConnectEnd$1<NodeType>;
/** Handler called when a user starts dragging a connection from a handle. */
type OnConnectStart = OnConnectStart$1;
/** The handle a connection gesture started from. */
type OnConnectStartParams = OnConnectStartParams$1;
/** Handler for internal, non-fatal flow errors (logged instead of thrown). */
type OnError = OnError$1;
/** Handler called when the user starts panning or zooming the viewport. */
type OnMoveStart = OnMove$1;
/** Handler called when the user stops panning or zooming the viewport. */
type OnMoveEnd = OnMove$1;
/** Handler called after an edge has been reconnected to a different handle. */
type OnReconnect<EdgeType extends EdgeBase = EdgeBase> = OnReconnect$1<EdgeType>;
/** Handler called when an edge reconnection gesture ends. */
type OnReconnectEnd<NodeType extends NodeBase = NodeBase, EdgeType extends EdgeBase = EdgeBase> = OnReconnectEnd$1<NodeType, EdgeType>;
/** Handler called when the user starts dragging an edge end off its handle. */
type OnReconnectStart<EdgeType extends EdgeBase = EdgeBase> = OnReconnectStart$1<EdgeType>;
/** Handler called while a node is being resized. */
type OnResize = OnResize$1;
/** Handler called when a node resize gesture ends. */
type OnResizeEnd = OnResizeEnd$1;
/** Handler called when a node resize gesture starts. */
type OnResizeStart = OnResizeStart$1;
/** Handler called while a selection of nodes is dragged. */
type OnSelectionDrag<NodeType extends NodeBase = NodeBase> = OnSelectionDrag$1<NodeType>;
/** Pro/attribution options (`hideAttribution`). */
/**
 * Attribution options (formerly exported by @xyflow/system; the export was
 * removed in 0.0.81, so the shape lives here now — upstream parity).
 * If you hide the attribution, please support the xyflow project.
 */
type ProOptions = {
  account?: string;
  /** If you hide the attribution, please support the xyflow project. */
  hideAttribution: boolean;
};
/** A rectangle: position plus dimensions. */
type Rect = Rect$1;
/** The drag event delivered to resize handlers. */
type ResizeDragEvent = ResizeDragEvent$1;
/** Geometry of a resize step: position and dimensions. */
type ResizeParams = ResizeParams$1;
/** Resize geometry plus the direction of the drag. */
type ResizeParamsWithDirection = ResizeParamsWithDirection$1;
/** The user-drawn selection rectangle in flow coordinates. */
type SelectionRect = SelectionRect$1;
/** Options for `setCenter`: zoom and transition behavior. */
type SetCenterOptions = SetCenterOptions$1;
/** Options controlling smooth-step edge path geometry. */
type SmoothStepPathOptions = SmoothStepPathOptions$1;
/** Grid nodes snap to while dragging: `[x, y]` step sizes. */
type SnapGrid = SnapGrid$1;
/** The viewport transform as `[translateX, translateY, zoom]`. */
type Transform = Transform$1;
/** Common options for viewport helper functions (e.g. transition duration). */
type ViewportHelperFunctionOptions = ViewportHelperFunctionOptions$1;
/** An x/y position with a z-index. */
type XYZPosition = XYZPosition$1;
/** Returns the center `[x, y]` of a straight edge between two points. */
declare const getEdgeCenter: typeof getEdgeCenter$1;
/** Returns the label center and offsets for a bezier edge. */
declare const getBezierEdgeCenter: typeof getBezierEdgeCenter$1;
//#endregion
//#region src/core/flowProps.d.ts
/** Initial (uncontrolled) values used to seed a flow before the first measure/fit. */
type SolidFlowInitialProps = {
  readonly initialNodes: Node[];
  readonly initialEdges: Edge[];
  readonly initialWidth: number;
  readonly initialHeight: number;
  readonly fitView: boolean;
  readonly nodeOrigin: NodeOrigin$1;
};
/** The graph itself: element sources (controlled or uncontrolled, per axis), renderer maps, and the container dimensions. */
type SolidFlowGraphProps<NodeType extends Node = Node, EdgeType extends Edge = Edge> = {
  /**
   * The id of the flow. This is necessary if you want to render multiple flows.
   */
  readonly id?: string;
  /** Sets a fixed width for the flow */
  readonly width?: number;
  /** Sets a fixed height for the flow */
  readonly height?: number;
  /**
   * An store of nodes to render in a flow.
   * @example
   * const [nodes] = createStore([
   *  {
   *    id: 'node-1',
   *    type: 'input',
   *    data: { label: 'Node 1' },
   *    position: { x: 250, y: 50 }
   *  }
   * ]);
   */
  readonly nodes?: Store<NodeType[]>;
  /**
   * An store of edges to render in a flow.
   * @example
   * const [edges] = createStore([
   *  {
   *    id: 'edge-1-2',
   *    source: 'node-1',
   *    target: 'node-2',
   *  }
   * ]);
   */
  readonly edges?: Store<EdgeType[]>;
  /**
   * Initial nodes for an UNCONTROLLED flow. When `nodes` is not supplied,
   * the flow owns element state: this array seeds it once (later values
   * are ignored), and membership belongs to the flow — commands like
   * `addNodes`/`deleteElements` and completed connections write through
   * and persist, with no adoption step. Mutually exclusive with `nodes`
   * (which wins, with a dev warning). Mode is fixed at mount, per axis:
   * nodes and edges can each be controlled or uncontrolled independently.
   */
  readonly defaultNodes?: readonly NodeType[];
  /**
   * Initial edges for an UNCONTROLLED flow — the edge-axis counterpart of
   * `defaultNodes`: seeds once, flow owns membership, completed
   * connections are kept automatically. Mutually exclusive with `edges`.
   */
  readonly defaultEdges?: readonly EdgeType[];
  /**
   * Custom node types to be available in a flow.
   * Solid Flow matches a node's type to a component in the nodeTypes object.
   * @example
   * import CustomNode from './CustomNode';
   *
   * const nodeTypes = { nameOfNodeType: CustomNode };
   */
  readonly nodeTypes?: NodeTypes;
  /**
   * Custom edge types to be available in a flow.
   * Solid Flow matches an edge's type to a component in the edgeTypes object.
   * @example
   * import CustomEdge from './CustomEdge';
   *
   * const edgeTypes = { nameOfEdgeType: CustomEdge };
   */
  readonly edgeTypes?: EdgeTypes;
};
/** Keyboard activation keys and keyboard-accessibility switches. */
type SolidFlowKeyboardProps = {
  /** Pressing down this key you can select multiple elements with a selection box.
   * @default 'Shift'
   */
  readonly selectionKey?: KeyDefinition | KeyDefinition[] | null;
  /** If a key is set, you can pan the viewport while that key is held down even if panOnScroll is set to false.
   *
   * By setting this prop to null you can disable this functionality.
   * @default 'Space'
   */
  readonly panActivationKey?: KeyDefinition | KeyDefinition[] | null;
  /** Pressing down this key deletes all selected nodes & edges.
   * @default 'Backspace'
   */
  readonly deleteKey?: KeyDefinition | KeyDefinition[] | null;
  /** Pressing down this key you can select multiple elements by clicking.
   * @default 'Meta' for macOS, "Ctrl" for other systems
   */
  readonly multiSelectionKey?: KeyDefinition | KeyDefinition[] | null;
  /** If a key is set, you can zoom the viewport while that key is held down even if panOnScroll is set to false.
   *
   * By setting this prop to null you can disable this functionality.
   * @default 'Meta' for macOS, "Ctrl" for other systems
   * */
  readonly zoomActivationKey?: KeyDefinition | KeyDefinition[] | null;
  /**
   * You can use this prop to disable keyboard accessibility features such as selecting nodes or
   * moving selected nodes with the arrow keys.
   * @default false
   */
  readonly disableKeyboardA11y?: boolean;
};
/** Camera configuration: initial framing, zoom bounds, and coordinate-space extents. */
type SolidFlowViewportProps<NodeType extends Node = Node> = {
  /** If set, initial viewport will show all nodes & edges */
  readonly fitView?: boolean;
  /**
   * Options to be used in combination with fitView
   * @example
   * const fitViewOptions = {
   *  padding: 0.1,
   *  includeHiddenNodes: false,
   *  minZoom: 0.1,
   *  maxZoom: 1,
   *  duration: 200,
   *  nodes: [{id: 'node-1'}, {id: 'node-2'}], // nodes to fit
   * };
   */
  readonly fitViewOptions?: FitViewOptions<NodeType>;
  /**
   * Defines nodes relative position to its coordinates
   * @default [0, 0]
   * @example
   * [0, 0] // default, top left
   * [0.5, 0.5] // center
   * [1, 1] // bottom right
   */
  readonly nodeOrigin?: NodeOrigin$1;
  /** Minimum zoom level
   * @default 0.5
   */
  readonly minZoom?: number;
  /** Maximum zoom level
   * @default 2
   */
  readonly maxZoom?: number;
  /**
   * Sets the initial position and zoom of the viewport.
   * If a default viewport is provided but fitView is enabled, the default viewport will be ignored.
   * @default { zoom: 1, position: { x: 0, y: 0 } }
   * @example
   * const initialViewport = {
   *  zoom: 0.5,
   *  position: { x: 0, y: 0 }
   * };
   */
  readonly initialViewport?: Viewport$1;
  /** Custom viewport to be used instead of internal one */
  readonly viewport?: Store<Viewport$1>;
  /**
   * By default the viewport extends infinitely. You can use this prop to set a boundary.
   * The first pair of coordinates is the top left boundary and the second pair is the bottom right.
   * @default @default [[-∞, -∞], [+∞, +∞]]
   * @example [[-1000, -10000], [1000, 1000]]
   */
  readonly translateExtent?: CoordinateExtent$1;
  /**
   * By default the nodes can be placed anywhere. You can use this prop to set a boundary.
   * The first pair of coordinates is the top left boundary and the second pair is the bottom right.
   * @default [[-∞, -∞], [+∞, +∞]]
   * @example [[-1000, -10000], [1000, 1000]]
   */
  readonly nodeExtent?: CoordinateExtent$1;
};
/** Pointer interaction: drag/click thresholds, pan/zoom gestures, selection behavior, and per-element interactivity switches. */
type SolidFlowInteractionProps = {
  /**
   * With a threshold greater than zero you can control the distinction between node drag and click events.
   * If threshold equals 1, you need to drag the node 1 pixel before a drag event is fired.
   * @default 1
   */
  readonly nodeDragThreshold?: number;
  /**
   * Distance that the mouse can move between mousedown/up that will trigger a click
   * @default 0
   */
  readonly paneClickDistance?: number;
  /** Distance that the mouse can move between mousedown/up that will trigger a click
   * @default 0
   */
  readonly nodeClickDistance?: number;
  /**
   * Controls if nodes should be automatically selected when being dragged
   */
  readonly selectNodesOnDrag?: boolean;
  /**
   * Grid all nodes will snap to
   * @example [20, 20]
   */
  readonly snapGrid?: SnapGrid$1;
  /**
   * Controls if all nodes should be draggable
   * @default true
   */
  readonly nodesDraggable?: boolean;
  /**
   * When `true`, the viewport will pan when a node is focused.
   * @default true
   */
  readonly autoPanOnNodeFocus?: boolean;
  /**
   * When `true`, the viewport will pan when a drag selection approaches the edges of the flow container.
   * @default true
   */
  readonly autoPanOnSelection?: boolean;
  /**
   * Controls if all nodes should be connectable to each other
   * @default true
   */
  readonly nodesConnectable?: boolean;
  /** Controls if all elements should (nodes & edges) be selectable
   * @default true
   */
  readonly elementsSelectable?: boolean;
  /**
   * When `true`, focus between nodes can be cycled with the `Tab` key and selected with the `Enter`
   * key. This option can be overridden by individual nodes by setting their `focusable` prop.
   * @default true
   */
  readonly nodesFocusable?: boolean;
  /**
   * When `true`, focus between edges can be cycled with the `Tab` key and selected with the `Enter`
   * key. This option can be overridden by individual edges by setting their `focusable` prop.
   * @default true
   */
  readonly edgesFocusable?: boolean;
  /**
   * Disabling this prop will allow the user to scroll the page even when their pointer is over the flow.
   * @default true
   */
  readonly preventScrolling?: boolean;
  /**
   * Controls if the viewport should zoom by scrolling inside the container.
   * @default true
   */
  readonly zoomOnScroll?: boolean;
  /**
   * Controls if the viewport should zoom by double clicking somewhere on the flow
   * @default true
   */
  readonly zoomOnDoubleClick?: boolean;
  /**
   * Controls if the viewport should zoom by pinching on a touch screen
   * @default true
   */
  readonly zoomOnPinch?: boolean;
  /**
   * Controls if the viewport should pan by scrolling inside the container
   * Can be limited to a specific direction with panOnScrollMode
   * @default false
   */
  readonly panOnScroll?: boolean;
  /**
   * Controls how fast the viewport pans while scrolling.
   * Only applies when `panOnScroll` is enabled.
   * @default 0.5
   */
  readonly panOnScrollSpeed?: number;
  /**
   * This prop is used to limit the direction of panning when panOnScroll is enabled.
   * The "free" option allows panning in any direction.
   * @default "free"
   * @example "horizontal" | "vertical"
   */
  readonly panOnScrollMode?: PanOnScrollMode;
  /**
   * Enableing this prop allows users to pan the viewport by clicking and dragging.
   * You can also set this prop to an array of numbers to limit which mouse buttons can activate panning.
   * @default true
   * @example [0, 2] // allows panning with the left and right mouse buttons
   * [0, 1, 2, 3, 4] // allows panning with all mouse buttons
   */
  readonly panOnDrag?: boolean | number[];
  /**
   * Select multiple elements with a selection box, without pressing down selectionKey.
   * @default false
   */
  readonly selectionOnDrag?: boolean;
  /**
   * When set to "partial", when the user creates a selection box by click and dragging
   * nodes that are only partially in the box are still selected.
   * @default 'full'
   */
  readonly selectionMode?: SelectionMode;
  /**
   * You can enable this prop to automatically pan the viewport while dragging a node.
   * @default true
   */
  readonly autoPanOnNodeDrag?: boolean;
  /**
   * The speed at which the viewport auto-pans while dragging a node or a
   * connection toward the edge of the viewport.
   * @default 15
   */
  readonly autoPanSpeed?: number;
  /**
   * If a node is draggable, clicking and dragging that node will move it around the canvas. Adding
   * the `"nodrag"` class prevents this behavior and this prop allows you to change the name of that
   * class.
   * @default "nodrag"
   */
  readonly noDragClass?: string;
  /**
   * Typically, scrolling the mouse wheel when the mouse is over the canvas will zoom the viewport.
   * Adding the `"nowheel"` class to an element n the canvas will prevent this behavior and this prop
   * allows you to change the name of that class.
   * @default "nowheel"
   */
  readonly noWheelClass?: string;
  /**
   * If an element in the canvas does not stop mouse events from propagating, clicking and dragging
   * that element will pan the viewport. Adding the `"nopan"` class prevents this behavior and this
   * prop allows you to change the name of that class.
   * @default "nopan"
   */
  readonly noPanClass?: string;
};
/** Creating connections: gesture tuning, validation, and the in-progress connection line. */
type SolidFlowConnectionProps<NodeType extends Node = Node, EdgeType extends Edge = Edge> = {
  /**
   * The threshold in pixels that the mouse must move before a connection line starts to drag.
   * This is useful to prevent accidental connections when clicking on a handle.
   * @default 1
   */
  readonly connectionDragThreshold?: number;
  /**
   * The radius around a handle where you drop a connection line to create a new edge.
   * @default 20
   */
  readonly connectionRadius?: number;
  /**
   * 'strict' connection mode will only allow you to connect source handles to target handles.
   * 'loose' connection mode will allow you to connect handles of any type to one another.
   * @default 'strict'
   */
  readonly connectionMode?: ConnectionMode;
  /** Provide a custom snippet to be used insted of the default connection line */
  readonly connectionLineComponent?: (props: ConnectionLineComponentProps<NodeType>) => JSX.Element;
  /** Styles to be applied to the connection line */
  readonly connectionLineStyle?: JSX.CSSProperties;
  /** Styles to be applied to the container of the connection line */
  readonly connectionLineContainerStyle?: JSX.CSSProperties;
  /** Choose from the built-in edge types to be used for connections
   * @default "default"
   * @example "default" | "straight" | "step" | "smoothstep" | "simplebezier"
   */
  readonly connectionLineType?: ConnectionLineType;
  /** Toggles ability to make connections via clicking the handles */
  readonly clickConnect?: boolean;
  /**
   * You can enable this prop to automatically pan the viewport while making a new connection.
   * @default true
   */
  readonly autoPanOnConnect?: boolean;
  readonly isValidConnection?: IsValidConnection$2<EdgeType>;
};
/** Appearance and render strategy: color mode, styling, z-order, culling, edge defaults, and attribution. */
type SolidFlowRenderingProps = {
  /**
   * Only render (mount) elements inside the overscanned viewport: nodes and
   * edges outside it are unmounted entirely, and remount as the viewport
   * reaches them. This is the heavy-duty tier for very large graphs — at
   * 10k nodes it cuts the DOM by ~16x, roughly halves memory, and makes
   * node drags ~3.7x faster (fewer live subscribers).
   *
   * The flow's data graph is unaffected: positions, selection, and cached
   * measurements live outside the components, so an unmounted node comes
   * back exactly as it left (at its measured size, still selected).
   * Component-LOCAL state does not survive — signals created inside a
   * custom node, uncontrolled inputs, scroll positions of inner elements.
   * Keep state you care about in `node.data`. Never unmounted: selected
   * elements, unmeasured nodes, and the node holding DOM focus. Elements
   * whose component-local state (or side effects) must keep running while
   * off-screen can opt out entirely with `cullable: false` on the node or
   * edge — they are then exempt from both tiers.
   *
   * Independent of this prop, off-viewport elements are always CSS-culled
   * (`visibility: hidden` + `pointer-events: none`, everything stays
   * mounted) — that tier has no user-visible semantics beyond leaving the
   * accessibility tree and tab order while off-screen.
   * @default false
   */
  readonly onlyRenderVisibleElements?: boolean;
  /**
   * Controls color scheme used for styling the flow
   * @default 'system'
   * @example 'system' | 'light' | 'dark'
   */
  readonly colorMode?: ColorMode$1;
  /** Fallback color mode for SSR if colorMode is set to 'system' */
  readonly colorModeSSR?: Omit<ColorMode$1, "system">;
  /** Class to be applied to the flow container */
  readonly class?: string;
  /** Styles to be applied to the flow container */
  readonly style?: JSX.CSSProperties;
  /** Enabling this option will raise the z-index of nodes when they are selected.
   * @default true
   */
  readonly elevateNodesOnSelect?: boolean;
  /**
   * Controls how z-indexes are calculated for nodes and edges.
   * 'auto' automatically manages z-indexing for selections and sub flows,
   * 'basic' manages z-indexing for selections only, and
   * 'manual' does not apply any automatic z-indexing.
   * @default "basic"
   */
  readonly zIndexMode?: ZIndexMode;
  /**
   * Enabling this option will raise the z-index of edges when they are selected,
   * or when the connected nodes are selected.
   * @default true
   */
  readonly elevateEdgesOnSelect?: boolean;
  /**
   * This callback can be used to validate a new connection.
   * If you return `false`, the edge will not be added to your flow.
   * If you have custom connection logic its preferred to use this callback over the
   * `isValidConnection` prop on the handle component for performance reasons.
   */
  /**
   * Set position of the attribution
   * @default 'bottom-right'
   * @example 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
   */
  readonly attributionPosition?: PanelPosition$1;
  /**
   * By default, we render a small attribution in the corner of your flows that links back to the project.
   * You are free to remove this attribution but we ask that you take a quick look at our
   * {@link https://svelteflow.dev/learn/troubleshooting/remove-attribution | removing attribution guide}
   * before doing so.
   */
  readonly proOptions?: ProOptions;
  /** Color of edge markers
   * You can pass `null` to use the CSS variable `--xy-edge-stroke` for the marker color.
   * @example "#b1b1b7"
   */
  readonly defaultMarkerColor?: string | null;
  /**
   * Defaults to be applied to all new edges that are added to the flow.
   * Properties on a new edge will override these defaults if they exist.
   * @example
   * const defaultEdgeOptions = {
   *  type: 'customEdgeType',
   *  animated: true
   * }
   */
  readonly defaultEdgeOptions?: DefaultEdgeOptions;
};
/** Screen-reader configuration: live announcements and overridable UI strings. */
type SolidFlowA11yProps = {
  /**
   * Static message announced to screen readers via the flow's aria-live
   * region (in addition to the built-in keyboard-interaction messages).
   */
  readonly ariaLiveMessage?: string;
  /**
   * Configuration for customizable labels, descriptions, and UI text. Provided keys will override the corresponding defaults.
   * Allows localization, customization of ARIA descriptions, control labels, minimap labels, and other UI strings.
   */
  readonly ariaLabelConfig?: Partial<AriaLabelConfig$1>;
};
/** Viewport movement callbacks (gesture-driven and programmatic). */
type SolidFlowViewportEventProps = {
  /** This event handler is called when the user begins to pan or zoom the viewport */
  readonly onMoveStart?: OnMoveStart$1;
  /** This event handler is called when the user pans or zooms the viewport */
  readonly onMove?: OnMove$1;
  /** This event handler is called when the user stops panning or zooming the viewport */
  readonly onMoveEnd?: OnMoveEnd$1;
  /**
   * This event handler is called on every viewport change, gesture or
   * programmatic (setViewport, fitView) — React Flow onViewportChange
   * parity.
   */
  readonly onViewportChange?: (viewport: Viewport$1) => void;
};
/** Connection and reconnection lifecycle callbacks. */
type SolidFlowConnectionEventProps<NodeType extends Node = Node, EdgeType extends Edge = Edge> = {
  /** This handler gets called when a new edge is created. You can use it to modify the newly created edge. */
  readonly onBeforeConnect?: OnBeforeEdgeConnect<EdgeType>;
  /** This event gets fired when a connection successfully completes and an edge is created. */
  readonly onConnect?: OnEdgeConnect;
  /** When a user starts to drag a connection line, this event gets fired. */
  readonly onConnectStart?: OnConnectStart$1;
  /** When a user stops dragging a connection line, this event gets fired. */
  readonly onConnectEnd?: OnConnectEnd$1;
  /** This event gets fired when after an edge was reconnected*/
  readonly onReconnect?: OnReconnect$1<EdgeType>;
  /** This event gets fired when a user starts to reconnect an edge */
  readonly onReconnectStart?: OnReconnectStart$1<EdgeType>;
  /** This event gets fired when a user stops reconnecting an edge */
  readonly onReconnectEnd?: OnReconnectEnd$1<NodeType, EdgeType>;
  /** This handler gets called when an edge is reconnected. You can use it to modify the edge before the update is applied. */
  readonly onBeforeReconnect?: OnBeforeReconnect<EdgeType>;
  /** A connection is started by clicking on a handle */
  readonly onClickConnectStart?: OnConnectStart$1;
  /** A connection is finished by clicking on a handle */
  readonly onClickConnectEnd?: OnConnectEnd$1;
};
/** Selection change and selection-drag callbacks. */
type SolidFlowSelectionEventProps<NodeType extends Node = Node, EdgeType extends Edge = Edge> = {
  /** This event handler gets called when the selected nodes & edges change */
  readonly onSelectionChange?: OnSelectionChange<NodeType, EdgeType>;
  /** This event handler gets called when a user starts to drag a selection box. */
  readonly onSelectionDragStart?: OnSelectionDrag$2<NodeType>;
  /** This event handler gets called when a user drags a selection box. */
  readonly onSelectionDrag?: OnSelectionDrag$2<NodeType>;
  /** This event handler gets called when a user stops dragging a selection box. */
  readonly onSelectionDragStop?: OnSelectionDrag$2<NodeType>;
  /** This event handler gets called when the user starts to drag a selection box */
  readonly onSelectionStart?: (event: PointerEvent) => void;
  /** This event handler gets called when the user finishes dragging a selection box */
  readonly onSelectionEnd?: (event: PointerEvent) => void;
};
/** Flow lifecycle: init, deletion (with veto), and non-fatal error reporting. */
type SolidFlowLifecycleEventProps<NodeType extends Node = Node, EdgeType extends Edge = Edge> = {
  /** This handler gets called when the flow is finished initializing */
  readonly onInit?: () => void;
  /**
   * Ocassionally something may happen that causes Solid Flow to throw an error.
   * Instead of exploding your application, we log a message to the console and then call this event handler.
   * You might use it for additional logging or to show a message to the user.
   */
  readonly onFlowError?: OnError$1;
  /** This handler gets called when the user deletes nodes or edges.
   * @example
   * onDelete={({nodes, edges}) => {
   *  console.log('deleted nodes:', nodes);
   *  console.log('deleted edges:', edges);
   * }}
   */
  readonly onDelete?: OnDelete<NodeType, EdgeType>;
  /** This handler gets called before the user deletes nodes or edges and provides a way to abort the deletion by returning false. */
  readonly onBeforeDelete?: OnBeforeDelete<NodeType, EdgeType>;
};
/**
 * Props accepted by the `SolidFlow` component — the full configuration surface
 * of a flow, and the config contract of the headless core (`createFlowState`).
 * Composed from the named groups above (each independently exported) plus the
 * per-element event maps in types/events.
 */
type SolidFlowProps<NodeType extends Node = Node, EdgeType extends Edge = Edge> = NodeEvents<NodeType> & NodeSelectionEvents<NodeType> & EdgeEvents<EdgeType> & DeleteEvents<NodeType, EdgeType> & PaneEvents & SolidFlowGraphProps<NodeType, EdgeType> & SolidFlowKeyboardProps & SolidFlowViewportProps<NodeType> & SolidFlowInteractionProps & SolidFlowConnectionProps<NodeType, EdgeType> & SolidFlowRenderingProps & SolidFlowA11yProps & SolidFlowViewportEventProps & SolidFlowConnectionEventProps<NodeType, EdgeType> & SolidFlowSelectionEventProps<NodeType, EdgeType> & SolidFlowLifecycleEventProps<NodeType, EdgeType>;
//#endregion
//#region src/components/SolidFlow.d.ts
type SolidFlowComponentProps<NodeType extends Node = Node, EdgeType extends Edge = Edge> = ParentProps<SolidFlowProps<NodeType, EdgeType>> & Omit<JSX.HTMLAttributes<HTMLDivElement>, "style" | "onselectionchange" | "onSelectionChange">;
/** The flow canvas component: renders nodes and edges and wires up viewport and interactions. */
declare const SolidFlow: <NodeType extends Node = Node, EdgeType extends Edge = Edge>(props: SolidFlowComponentProps<NodeType, EdgeType>) => JSX.Element;
//#endregion
//#region src/components/SolidFlowProvider.d.ts
/** Hoists flow state above `SolidFlow` so hooks work outside the component (multi-panel UIs). */
declare const SolidFlowProvider: <NodeType extends Node = Node, EdgeType extends Edge = Edge>(props: ParentProps<SolidFlowProps<NodeType, EdgeType>>) => JSX.Element;
//#endregion
//#region src/core/projections/connections.d.ts
/**
 * Lookup keys for the connection index. Each edge is registered under six
 * keys — for both of its endpoints: the node, the node+handle-type, and (when
 * a handle id is present) the node+type+handle:
 *   `${nodeId}` · `${nodeId}-${type}` · `${nodeId}-${type}-${handleId}`
 */
declare const connectionKey: (nodeId: string, type?: HandleType, handleId?: string | null) => string;
/** The connections index: a handle's `connectionKey` mapped to its live `HandleConnection`s. */
type ConnectionsRecord = Record<string, Record<string, HandleConnection$1>>;
//#endregion
//#region src/core/flowState.d.ts
/**
 * The current selection, as one object: the pair travels together everywhere
 * it is consumed (selection change callbacks, deletion, toolbars).
 */
type FlowSelection<NodeType extends Node = Node, EdgeType extends Edge = Edge> = {
  readonly nodes: readonly NodeType[];
  readonly edges: readonly EdgeType[];
};
/**
 * The flow's data graph as one reactive struct — the canonical read surface.
 *
 * Every property read in a tracked scope is a live subscription; the struct
 * itself is a stable identity for the provider's lifetime, so destructuring
 * `const { flow } = useSolidFlow()` is safe (reactivity lives inside the
 * property reads, not in the container). Reads in event handlers are
 * untracked, so `flow.viewport.zoom` inside a handler is already the
 * "imperative getter" — no extra API needed.
 *
 * Keyed lookups are id-keyed records (`flow.internalNodes[id]`) rather than
 * Maps: reactive property reads, per-key granularity, and the shape the
 * underlying projections produce natively.
 */
type FlowState<NodeType extends Node = Node, EdgeType extends Edge = Edge> = {
  /** The user node graph. */
  readonly nodes: readonly NodeType[];
  /** The user edge graph. */
  readonly edges: readonly EdgeType[];
  /** Adopted nodes keyed by id: absolute positions, z order, measured dimensions, handle bounds. */
  readonly internalNodes: Record<string, InternalNode<NodeType>>;
  /** Screen-space edge geometry keyed by edge id; edges with missing/unmeasured endpoints have no entry. */
  readonly layoutedEdges: Record<string, EdgeLayouted<EdgeType>>;
  /**
   * The connection index. Keys are built with {@link connectionKey}:
   * `nodeId`, `nodeId-type`, and `nodeId-type-handleId`; each value maps a
   * connection pair key to its {@link HandleConnection}.
   */
  readonly connections: ConnectionsRecord;
  /** The currently selected nodes and edges. */
  readonly selection: FlowSelection<NodeType, EdgeType>;
  /** True once every non-hidden node has been measured. */
  readonly nodesInitialized: boolean;
  /** True once the pan/zoom instance exists. */
  readonly viewportInitialized: boolean;
  readonly viewport: Viewport$1;
  /** The flow container's measured width in px. */
  readonly width: number;
  /** The flow container's measured height in px. */
  readonly height: number;
  /** The resolved color mode ("system" resolves to the user's preference). */
  readonly colorMode: ColorModeClass$1;
  /** The in-progress connection gesture state. */
  readonly connection: ConnectionState<InternalNode<NodeType>>;
  /** True while a node drag is in progress. */
  readonly dragging: boolean;
  readonly minZoom: number;
  readonly maxZoom: number;
  readonly nodesDraggable: boolean;
  readonly nodesConnectable: boolean;
  readonly elementsSelectable: boolean;
  readonly snapGrid: SnapGrid$1 | undefined;
};
/**
 * The flow's write surface: every public mutation, viewport motion, and
 * geometry helper. Commands are stable identities — destructuring
 * `const { commands } = useSolidFlow()` is safe.
 */
type FlowCommands<NodeType extends Node = Node, EdgeType extends Edge = Edge> = {
  /** Fits the view to the graph (or to `options.nodes`). */
  readonly fitView: (options?: FitViewOptions<NodeType>) => Promise<boolean>;
  /** Fits the view to the given bounds. */
  readonly fitBounds: (bounds: Rect$1, options?: FitBoundsOptions$1) => Promise<boolean>;
  /** Zooms in by 1.2. */
  readonly zoomIn: ZoomInOut;
  /** Zooms out by 1 / 1.2. */
  readonly zoomOut: ZoomInOut;
  /** Sets the zoom level. */
  readonly setZoom: (zoomLevel: number, options?: ViewportHelperFunctionOptions$1) => Promise<boolean>;
  /** Centers the view on the given flow position. */
  readonly setCenter: (x: number, y: number, options?: SetCenterOptions$1) => Promise<boolean>;
  /** Sets the viewport. */
  readonly setViewport: (viewport: Viewport$1, options?: ViewportHelperFunctionOptions$1) => Promise<boolean>;
  /** Pans the viewport by the given delta. */
  readonly panBy: (delta: XYPosition$1) => Promise<boolean>;
  /** Converts a screen/client position to a flow position. */
  readonly screenToFlowPosition: (clientPosition: XYPosition$1, options?: {
    snapToGrid: boolean;
  }) => XYPosition$1;
  /** Converts a flow position to a screen/client position. */
  readonly flowToScreenPosition: (flowPosition: XYPosition$1) => XYPosition$1;
  /** Appends one or many nodes. */
  readonly addNodes: (payload: NodeType[] | NodeType) => void;
  /** Appends one or many edges. */
  readonly addEdges: (payload: EdgeType[] | EdgeType) => void;
  /** Writes the nodes root (canonical Solid store setter — mutate the draft or return a new array). */
  readonly setNodes: StoreSetter<NodeType[]>;
  /** Writes the edges root (canonical Solid store setter — mutate the draft or return a new array). */
  readonly setEdges: StoreSetter<EdgeType[]>;
  /** Merges (or replaces, with `options.replace`) a node by id. */
  readonly updateNode: (id: string, nodeUpdate: Partial<NodeType> | ((node: NodeType) => Partial<NodeType>), options?: {
    replace: boolean;
  }) => void;
  /** Merges (or replaces, with `options.replace`) a node's `data` by id. */
  readonly updateNodeData: (id: string, dataUpdate: Partial<NodeType["data"]> | ((node: NodeType) => Partial<NodeType["data"]>), options?: {
    replace: boolean;
  }) => void;
  /** Merges (or replaces, with `options.replace`) an edge by id. */
  readonly updateEdge: (id: string, edgeUpdate: Partial<EdgeType> | ((edge: EdgeType) => Partial<EdgeType>), options?: {
    replace: boolean;
  }) => void;
  /** Deletes the given nodes/edges plus connected edges, honoring `onBeforeDelete`. */
  readonly deleteElements: (params: {
    nodes?: (Partial<NodeType> & {
      id: string;
    })[];
    edges?: (Partial<EdgeType> & {
      id: string;
    })[];
  }) => Promise<{
    deletedNodes: NodeType[];
    deletedEdges: EdgeType[];
  }>;
  /** All nodes intersecting the given node or rect. */
  readonly getIntersectingNodes: (nodeOrRect: NodeType | {
    id: NodeType["id"];
  } | Rect$1, partially?: boolean, nodesToIntersect?: NodeType[]) => NodeType[];
  /** Whether the given node or rect intersects the area. */
  readonly isNodeIntersecting: (nodeOrRect: NodeType | {
    id: NodeType["id"];
  } | Rect$1, area: Rect$1, partially?: boolean) => boolean;
  /** The bounding rect of the given nodes (or node ids). */
  readonly getNodesBounds: (nodes: (NodeType | InternalNode<NodeType> | string)[]) => Rect$1;
  /** Requests a DOM re-measure of the given node id(s). */
  readonly updateNodeInternals: (id: string | string[]) => void;
  /** The nodes, edges, and viewport as a plain JSON-safe object. */
  readonly toObject: () => {
    nodes: NodeType[];
    edges: EdgeType[];
    viewport: Viewport$1;
  };
};
//#endregion
//#region src/core/stores/createEdgeStore.d.ts
type EdgeDataOf<T> = T extends ((props: EdgeProps<infer TData, infer _TType>) => unknown) ? TData : UnknownStruct;
type AllEdgeTypes<TUserEdgeTypes extends EdgeTypes> = TUserEdgeTypes extends Record<string, never> ? BuiltInEdgeTypes : BuiltInEdgeTypes & TUserEdgeTypes;
/**
 * The discriminated union of edge configurations for a renderer map: one
 * member per built-in and custom edge type, with `data` narrowed by the
 * `type` discriminant (the MAP KEY — what the renderer actually matches).
 * Use it to carry `createEdgeStore`'s guided typing anywhere a plain array
 * or vanilla store is typed:
 *
 * ```typescript
 * const initialEdges = [
 *   { id: "e1", source: "1", target: "2", type: "labeled", data: { label: "hi" } },
 * ] satisfies SolidFlowEdge<typeof edgeTypes>[];
 * ```
 */
type SolidFlowEdge<TUserEdgeTypes extends EdgeTypes = Record<string, never>> = { [K in keyof AllEdgeTypes<TUserEdgeTypes>]: Edge<EdgeDataOf<AllEdgeTypes<TUserEdgeTypes>[K]>, K & string>; }[keyof AllEdgeTypes<TUserEdgeTypes>];
type EdgesInput<TUserEdgeTypes extends EdgeTypes> = SolidFlowEdge<TUserEdgeTypes>;
/**
 * Creates a type-safe reactive store of edges for use in Solid Flow.
 *
 * This utility function provides full type safety and autocomplete for creating edges,
 * combining both built-in edge types (default, straight, step, smoothstep) and custom user-defined
 * edge types. When a specific edge type is selected, TypeScript automatically infers the
 * required data structure and validates the edge configuration.
 *
 * @template TUserEdgeTypes - The user's custom edge types map (optional)
 * @param edges - Array of edge configurations to create
 * @returns A SolidJS store tuple [store, setStore] with properly typed Edge objects
 *
 * @example
 * ```typescript
 * // Using only built-in edge types (no generic parameter needed)
 * const [builtInEdges, setBuiltInEdges] = createEdgeStore([
 *   {
 *     id: "1",
 *     source: "1",
 *     target: "2",
 *     type: "default",
 *     data: { label: "Start" }
 *   },
 *   {
 *     id: "2",
 *     source: "2",
 *     target: "3",
 *     type: "default",
 *     data: { label: "Process" }
 *   }
 * ]);
 * ```
 *
 * @example
 * ```typescript
 * // Using custom edge types (requires generic parameter)
 * const customEdgeTypes = {
 *   textEdge: (props: EdgeProps<{ content: string }, "textEdge">) =>
 *     <div>{props.data.content}</div>,
 *   numberEdge: (props: EdgeProps<{ value: number }, "numberEdge">) =>
 *     <div>{props.data.value}</div>
 * } satisfies EdgeTypes;
 *
 * const [mixedEdges, setMixedEdges] = createEdgeStore<typeof customEdgeTypes>([
 *   {
 *     id: "1",
 *     source: "1",
 *     target: "2",
 *     type: "default",        // Built-in type
 *     data: { label: "Input" }
 *   },
 *   {
 *     id: "2",
 *     source: "2",
 *     target: "3",
 *     type: "textEdge",     // Custom type - gets autocomplete
 *     data: { content: "Custom text edge" }  // Type-safe data
 *   },
 *   {
 *     id: "3",
 *     source: "3",
 *     target: "4",
 *     type: "numberEdge",   // Another custom type
 *     data: { value: 42 },  // Type-safe data
 *     style: { "background-color": "lightblue" }  // All Edge properties available
 *   }
 * ]);
 * ```
 *
 * @remarks
 * - Provides autocomplete for the `type` field with all available edge types
 * - Validates `data` structure based on the selected edge type
 * - Supports all Edge properties (style, animated, selectable, etc.)
 * - Works seamlessly with both built-in and custom edge types
 * - Type errors prevent invalid type names or incorrect data structures
 */
/**
 * Also accepts an async seed ("Fetch High"): pass `async () => edges`
 * instead of an array. Reads throw `NotReadyError` until the first value
 * (cover the flow with `<Loading fallback>`); afterwards the store is an
 * ordinary writable store. See {@link createNodeStore} for details.
 */
declare const createEdgeStore: <TUserEdgeTypes extends EdgeTypes = Record<string, never>>(edges: NoInfer<EdgesInput<TUserEdgeTypes>>[] | (() => Promise<NoInfer<EdgesInput<TUserEdgeTypes>>[]> | AsyncIterable<NoInfer<EdgesInput<TUserEdgeTypes>>[]>)) => readonly [Store<EdgesInput<TUserEdgeTypes>[]>, StoreSetter<EdgesInput<TUserEdgeTypes>[]>];
/** The optimistic twin of {@link createEdgeStore}'s async form — see {@link createOptimisticNodeStore}. */
declare function createOptimisticEdgeStore<TUserEdgeTypes extends EdgeTypes = Record<string, never>>(edges: NoInfer<EdgesInput<TUserEdgeTypes>>[]): readonly [Store<EdgesInput<TUserEdgeTypes>[]>, StoreSetter<EdgesInput<TUserEdgeTypes>[]>];
declare function createOptimisticEdgeStore<TUserEdgeTypes extends EdgeTypes = Record<string, never>>(edges: () => Promise<NoInfer<EdgesInput<TUserEdgeTypes>>[]> | AsyncIterable<NoInfer<EdgesInput<TUserEdgeTypes>>[]>): readonly [Store<EdgesInput<TUserEdgeTypes>[]> & Refreshable<EdgesInput<TUserEdgeTypes>[]>, StoreSetter<EdgesInput<TUserEdgeTypes>[]>];
//#endregion
//#region src/core/stores/createNodeStore.d.ts
type NodeDataOf<T> = T extends ((props: NodeProps<infer TData, infer _TType>) => unknown) ? TData : UnknownStruct;
type AllNodeTypes<TUserNodeTypes extends NodeTypes> = TUserNodeTypes extends Record<string, never> ? BuiltInNodeTypes : BuiltInNodeTypes & TUserNodeTypes;
/**
 * The discriminated union of node configurations for a renderer map: one
 * member per built-in and custom node type, with `data` narrowed by the
 * `type` discriminant (the MAP KEY — what the renderer actually matches).
 * Use it to carry `createNodeStore`'s guided typing anywhere a plain array
 * or vanilla store is typed:
 *
 * ```typescript
 * const initialNodes = [
 *   { id: "1", type: "custom", position: { x: 0, y: 0 }, data: { value: 1 } },
 * ] satisfies SolidFlowNode<typeof nodeTypes>[];
 * ```
 */
type SolidFlowNode<TUserNodeTypes extends NodeTypes = Record<string, never>> = { [K in keyof AllNodeTypes<TUserNodeTypes>]: Node<NodeDataOf<AllNodeTypes<TUserNodeTypes>[K]>, K & string>; }[keyof AllNodeTypes<TUserNodeTypes>];
type NodesInput<TUserNodeTypes extends NodeTypes> = SolidFlowNode<TUserNodeTypes>;
/**
 * Creates a type-safe reactive store of nodes for use in Solid Flow.
 *
 * This utility function provides full type safety and autocomplete for creating nodes,
 * combining both built-in node types (input, output, default, group) and custom user-defined
 * node types. When a specific node type is selected, TypeScript automatically infers the
 * required data structure and validates the node configuration.
 *
 * @template TUserNodeTypes - The user's custom node types map (optional)
 * @param nodes - Array of node configurations to create
 * @returns A SolidJS store tuple [store, setStore] with properly typed Node objects
 *
 * @example
 * ```typescript
 * // Using only built-in node types (no generic parameter needed)
 * const [builtInNodes, setBuiltInNodes] = createNodeStore([
 *   {
 *     id: "1",
 *     position: { x: 0, y: 0 },
 *     type: "input",
 *     data: { label: "Start" }
 *   },
 *   {
 *     id: "2",
 *     position: { x: 200, y: 100 },
 *     type: "default",
 *     data: { label: "Process" }
 *   }
 * ]);
 * ```
 *
 * @example
 * ```typescript
 * // Using custom node types (requires generic parameter)
 * const customNodeTypes = {
 *   textNode: (props: NodeProps<{ content: string }, "textNode">) =>
 *     <div>{props.data.content}</div>,
 *   numberNode: (props: NodeProps<{ value: number }, "numberNode">) =>
 *     <div>{props.data.value}</div>
 * } satisfies NodeTypes;
 *
 * const [mixedNodes, setMixedNodes] = createNodeStore<typeof customNodeTypes>([
 *   {
 *     id: "1",
 *     position: { x: 0, y: 0 },
 *     type: "input",        // Built-in type
 *     data: { label: "Input" }
 *   },
 *   {
 *     id: "2",
 *     position: { x: 100, y: 100 },
 *     type: "textNode",     // Custom type - gets autocomplete
 *     data: { content: "Custom text node" }  // Type-safe data
 *   },
 *   {
 *     id: "3",
 *     position: { x: 200, y: 200 },
 *     type: "numberNode",   // Another custom type
 *     data: { value: 42 },  // Type-safe data
 *     style: { "background-color": "lightblue" }  // All Node properties available
 *   }
 * ]);
 * ```
 *
 * @remarks
 * - Provides autocomplete for the `type` field with all available node types
 * - Validates `data` structure based on the selected node type
 * - Supports all Node properties (style, draggable, hidden, etc.)
 * - Works seamlessly with both built-in and custom node types
 * - Type errors prevent invalid type names or incorrect data structures
 */
/**
 * Also accepts an async seed ("Fetch High"): pass `async () => nodes` —
 * typically an API call — instead of an array. No memo required: the
 * function goes straight to `createStore`'s projection derive, so reads
 * throw `NotReadyError` until the first value (cover the flow with
 * `<Loading fallback>`), and the graph retries them when the data lands.
 * Afterwards the store is an ordinary writable store — draft writes and
 * wholesale replacement work exactly like the array form.
 *
 * An async GENERATOR works the same way ("a value that keeps arriving"):
 * `createNodeStore(async function* () { for await (const g of stream) yield g.nodes; })`
 * is unsettled until the first yield, then every yield updates the store —
 * the natural source for server-pushed / collaborative graphs (pair with a
 * `live()` server function).
 */
declare const createNodeStore: <TUserNodeTypes extends NodeTypes = Record<string, never>>(nodes: NoInfer<NodesInput<TUserNodeTypes>>[] | (() => Promise<NoInfer<NodesInput<TUserNodeTypes>>[]> | AsyncIterable<NoInfer<NodesInput<TUserNodeTypes>>[]>)) => readonly [Store<NodesInput<TUserNodeTypes>[]>, StoreSetter<NodesInput<TUserNodeTypes>[]>];
/**
 * The optimistic twin of {@link createNodeStore}'s async form: a guided-union
 * wrapper over `createOptimisticStore` for per-mutation server sync (write
 * the prediction in an `action`, `yield` the request, `refresh` to
 * reconcile). Purely a typing convenience — the flow composes with a raw
 * `createOptimisticStore` identically (flow-driven state lives in sidecars
 * and survives overlay reverts); this keeps the same `data`-narrowed-by-
 * `type` guidance as the other factories.
 */
declare function createOptimisticNodeStore<TUserNodeTypes extends NodeTypes = Record<string, never>>(nodes: NoInfer<NodesInput<TUserNodeTypes>>[]): readonly [Store<NodesInput<TUserNodeTypes>[]>, StoreSetter<NodesInput<TUserNodeTypes>[]>];
declare function createOptimisticNodeStore<TUserNodeTypes extends NodeTypes = Record<string, never>>(nodes: () => Promise<NoInfer<NodesInput<TUserNodeTypes>>[]> | AsyncIterable<NoInfer<NodesInput<TUserNodeTypes>>[]>): readonly [Store<NodesInput<TUserNodeTypes>[]> & Refreshable<NodesInput<TUserNodeTypes>[]>, StoreSetter<NodesInput<TUserNodeTypes>[]>];
//#endregion
//#region src/hooks/useColorMode.d.ts
/**
 * Hook for receiving the current color mode class ('dark' or 'light').
 *
 * When the flow's `colorMode` prop is set to `"system"`, this resolves to the
 * user's current system preference.
 *
 * @public
 * @returns an accessor for the current color mode class
 */
declare function useColorMode(): () => ColorModeClass$1;
//#endregion
//#region src/hooks/useConnection.d.ts
/**
 * Hook for receiving the current connection.
 *
 * @public
 * @returns current connection as a readable store
 */
declare function useConnection(): Accessor<ConnectionState>;
//#endregion
//#region src/hooks/useGraph.d.ts
/**
 * Hook for getting the current nodes from the store.
 *
 * @public
 * @returns store with an array of nodes
 */
declare function useNodes<NodeType extends Node = Node>(): Accessor<readonly NodeType[]>;
/**
 * Hook for getting the current edges from the store.
 *
 * @public
 * @returns store with an array of edges
 */
declare function useEdges<EdgeType extends Edge = Edge>(): Accessor<readonly EdgeType[]>;
/**
 * Hook for getting the current viewport from the store.
 *
 * @public
 * @returns store with the viewport object
 */
declare function useViewport(): Accessor<Viewport$1>;
/**
 * Reactive lookup of one node by id (xyflow#5868 parity). Returns the USER
 * node row — for measured geometry use {@link useInternalNode}.
 */
declare function useNode<NodeType extends Node = Node>(id: Accessor<string>): Accessor<NodeType | undefined>;
/** Reactive lookup of one edge by id (xyflow#5868 parity). */
declare function useEdge<EdgeType extends Edge = Edge>(id: Accessor<string>): Accessor<EdgeType | undefined>;
/** The currently selected nodes, reactively (xyflow#5868 parity). */
declare function useSelectedNodes<NodeType extends Node = Node>(): Accessor<readonly NodeType[]>;
/** The currently selected edges, reactively (xyflow#5868 parity). */
declare function useSelectedEdges<EdgeType extends Edge = Edge>(): Accessor<readonly EdgeType[]>;
//#endregion
//#region src/hooks/useInitialized.d.ts
/**
 * Hook for seeing if all nodes have been measured.
 *
 * Returns `false` until every non-hidden node has been rendered and measured.
 * Useful for running layouting or fitView logic that depends on node dimensions.
 *
 * @public
 * @returns an accessor that indicates whether the nodes are initialized
 */
declare function useNodesInitialized(): Accessor<boolean>;
/**
 * Hook for seeing if the viewport is initialized.
 *
 * Returns `true` once the pan/zoom instance has been created for the flow.
 *
 * @public
 * @returns an accessor that indicates whether the viewport is initialized
 */
declare function useViewportInitialized(): Accessor<boolean>;
//#endregion
//#region src/hooks/useInternalNode.d.ts
/**
 * Hook to get an internal node (the node enriched with measured dimensions,
 * absolute position, and z-order) by id.
 *
 * The id is an accessor (not a plain string) on purpose: passing a raw
 * reactive read like `props.nodeId` would capture the value once and silently
 * lose reactivity — `useInternalNode(() => props.nodeId)` keeps it live.
 *
 * @public
 * @param id - a reactive accessor for the node id
 * @returns an accessor with the internal node, or undefined while absent
 */
declare function useInternalNode(id: Accessor<string>): Accessor<InternalNode | undefined>;
//#endregion
//#region src/hooks/useKeyPress.d.ts
/**
 * Reactive "is this key (combo) held right now?" — the Solid Flow
 * counterpart of React Flow's `useKeyPress`, usable anywhere (no flow
 * context required).
 *
 * The definition is an Accessor per house convention — `useKeyPress(() =>
 * "a")`, `useKeyPress(() => ["a", "d"])`, or `useKeyPress(() => ({ key:
 * "s", modifier: ["meta"] }))`; swapping the definition resets the state.
 *
 * Hardened beyond upstream:
 * - Combos re-activate when the base key is re-pressed while the modifier
 *   stays held (upstream's oldest open key bug, xyflow#2248).
 * - Stuck modifiers self-heal from the flags later keyboard/pointer/wheel
 *   events carry (OS overlays swallow keyups without blurring — the macOS
 *   screenshot HUD; xyflow#5679), and window blur resets.
 */
declare function useKeyPress(keys: Accessor<KeyDefinition | KeyDefinition[] | null>): Accessor<boolean>;
//#endregion
//#region src/hooks/useNodeConnections.d.ts
type UseNodeConnectionsParams = {
  id?: string;
  handleType?: HandleType;
  handleId?: string;
};
/**
 * Hook to retrieve all edges connected to a node. Can be filtered by handle type and id.
 *
 * @public
 * @param param.id - node id - optional if called inside a custom node
 * @param param.handleType - filter by handle type 'source' or 'target'
 * @param param.handleId - filter by handle id (this is only needed if the node has multiple handles of the same type)
 * @todo @param param.onConnect - gets called when a connection is established
 * @todo @param param.onDisconnect - gets called when a connection is removed
 * @returns an array with connections
 */
declare const useNodeConnections: (params: Accessor<UseNodeConnectionsParams>) => Accessor<NodeConnection$1[]>;
//#endregion
//#region src/hooks/useNodesData.d.ts
type NodeData<NodeType extends Node> = Pick<NodeType, "id" | "data" | "type">;
/**
 * Hook for receiving data of one or multiple nodes
 *
 * @param nodeId - The id (or ids) of the node to get the data from
 * @returns A memo with an array of data objects
 */
declare function useNodesData<NodeType extends Node = Node>(nodeId: Accessor<string | undefined | null>): Accessor<NodeData<NodeType> | undefined>;
/** Reactive accessor for the `data` of one or many nodes by id. */
declare function useNodesData<NodeType extends Node = Node>(nodeIds: Accessor<string[] | undefined | null>): Accessor<NodeData<NodeType>[]>;
//#endregion
//#region src/hooks/useSolidFlow.d.ts
/**
 * The canonical flow API: the reactive {@link FlowState} struct plus the
 * {@link FlowCommands} write surface. Every command is also spread onto the
 * returned object directly for upstream (React Flow / Svelte Flow)
 * familiarity — `useSolidFlow().fitView()` and
 * `useSolidFlow().commands.fitView()` are the same function.
 *
 * There are no imperative getters: event handlers are untracked scopes in
 * Solid, so reading `flow.viewport.zoom` (or `flow.internalNodes[id]`) inside
 * one already IS the imperative read — while the same read in a tracked scope
 * subscribes.
 */
type UseSolidFlowReturn<NodeType extends Node = Node, EdgeType extends Edge = Edge> = FlowCommands<NodeType, EdgeType> & {
  /** The flow's data graph as one reactive struct — the canonical read surface. */
  readonly flow: FlowState<NodeType, EdgeType>;
  /** The flow's write surface (same functions as the spread members). */
  readonly commands: FlowCommands<NodeType, EdgeType>;
};
/**
 * Hook for accessing the flow instance: `{ flow, commands }` plus the
 * commands spread at the top level for upstream familiarity.
 *
 * `flow` and `commands` are stable identities, so destructuring them is safe:
 * `const { flow, commands } = useSolidFlow()`.
 *
 * @public
 * @returns the flow's read struct and write surface
 */
declare function useSolidFlow<NodeType extends Node = Node, EdgeType extends Edge = Edge>(): UseSolidFlowReturn<NodeType, EdgeType>;
//#endregion
//#region src/hooks/useUpdateNodeInternals.d.ts
/**
 * Hook for updating node internals. Sugar for `commands.updateNodeInternals`.
 *
 * @public
 * @returns function for updating node internals
 */
declare function useUpdateNodeInternals(): UpdateNodeInternals;
//#endregion
//#region src/contexts/edgeId.d.ts
/**
 * Returns the id of the edge this component is rendered inside. Available
 * anywhere in a custom edge's subtree (provided by the edge wrapper), so
 * nested components — like a custom edge label — can learn their host edge
 * without prop drilling.
 *
 * @public
 * @returns a reactive accessor for the surrounding edge's id
 */
declare function useEdgeId(): Accessor<string>;
//#endregion
//#region src/contexts/nodeId.d.ts
/**
 * Returns the id of the node this component is rendered inside. Available
 * anywhere in a custom node's subtree (provided by the node wrapper), so
 * nested components — like a custom `Handle` — can learn their host node
 * without prop drilling.
 *
 * @public
 * @returns a reactive accessor for the surrounding node's id
 */
declare function useNodeId(): Accessor<string>;
//#endregion
//#region src/plugins/background/types.d.ts
/** Available background pattern styles. */
type BackgroundVariant = "lines" | "dots" | "cross";
//#endregion
//#region src/plugins/background/Background.d.ts
/** Props for the `Background` plugin. */
type BackgroundProps = {
  readonly id?: string;
  /** Variant of the pattern
   * @example 'lines', 'dots', 'cross'
   */
  readonly variant?: BackgroundVariant;
  /** Color of the background */
  readonly bgColor?: string;
  /** Color of the pattern */
  readonly patternColor?: string;
  /** Class applied to the pattern */
  readonly patternClass?: string;
  /** Class applied to the container */
  readonly class?: string;
  /** Gap between repetitions of the pattern */
  readonly gap?: number | [number, number];
  /** Size of a single pattern element */
  readonly size?: number;
  /** Line width of the Line pattern */
  readonly lineWidth?: number;
  /** Style applied to the container */
  readonly style?: JSX.CSSProperties;
};
/** Canvas background pattern (lines, dots, or cross) rendered beneath the graph. */
declare const Background: (props: BackgroundProps) => JSX.Element;
//#endregion
//#region src/plugins/controls/ControlButton.d.ts
type ControlButtonProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  readonly class?: string;
  readonly bgColor?: string;
  readonly bgColorHover?: string;
  readonly color?: string;
  readonly colorHover?: string;
  readonly borderColor?: string;
  readonly onClick?: JSX.EventHandler<HTMLButtonElement, MouseEvent>;
};
/** A styled button for use inside `Controls`. */
declare const ControlButton: (props: ParentProps<ControlButtonProps>) => JSX.Element;
//#endregion
//#region src/plugins/controls/Controls.d.ts
type ControlsOrientation = "horizontal" | "vertical";
type ControlsProps = {
  /** Position of the controls on the pane
   * @example "top-left" | "top-right" | "bottom-left" | "bottom-right"
   */
  readonly position?: PanelPosition$1;
  /** Show button for zoom in/out */
  readonly showZoom?: boolean;
  /** Show button for fit view */
  readonly showFitView?: boolean;
  /** Show button for toggling interactivity */
  readonly showLock?: boolean;
  readonly buttonBgColor?: string;
  readonly buttonBgColorHover?: string;
  readonly buttonColor?: string;
  readonly buttonColorHover?: string;
  readonly buttonBorderColor?: string;
  readonly style?: JSX.CSSProperties;
  readonly orientation?: ControlsOrientation;
  readonly fitViewOptions?: FitViewOptions;
  readonly beforeControls?: JSX.Element;
  readonly afterControls?: JSX.Element;
} & Omit<JSX.HTMLAttributes<HTMLDivElement>, "style">;
/** Viewport control panel: zoom in/out, fit view, and interactivity lock. */
declare const Controls: (props: ParentProps<ControlsProps>) => JSX.Element;
//#endregion
//#region src/plugins/minimap/MiniMapNode.d.ts
/**
 * Props passed to a minimap node renderer — the default `MiniMapNode` or a
 * custom component supplied via the `MiniMap` `nodeComponent` prop. Position
 * and dimensions are in flow coordinates (the minimap svg's viewBox space).
 */
type MiniMapNodeProps = {
  /** The id of the node this minimap representation stands for. */
  readonly id: string;
  readonly class?: string;
  readonly x: number;
  readonly y: number;
  readonly width?: number;
  readonly height?: number;
  readonly borderRadius?: number;
  readonly color?: string;
  readonly shapeRendering: JSX.RectSVGAttributes<SVGRectElement>["shape-rendering"];
  readonly strokeColor?: string;
  readonly strokeWidth?: number;
  readonly selected?: boolean;
  /** The node's own style; its background feeds the default fill fallback. */
  readonly style?: JSX.CSSProperties;
  /** Click handler (wired when the `MiniMap` has `onNodeClick`); call with the node id. */
  readonly onClick?: (event: MouseEvent, id: string) => void;
};
/** The default minimap node: a rounded rect. Custom `nodeComponent`s can wrap it. */
declare const MiniMapNode: (props: MiniMapNodeProps) => JSX.Element;
//#endregion
//#region src/plugins/minimap/MiniMap.d.ts
/** Derives a per-node minimap attribute (color, stroke, class) from the node. */
type GetMiniMapNodeAttribute<NodeType extends Node> = (node: NodeType) => string;
/** Props for the `MiniMap` plugin. */
type MiniMapProps<NodeType extends Node> = Omit<JSX.HTMLAttributes<HTMLDivElement>, "style" | "onClick"> & {
  /** Background color of minimap */
  readonly bgColor?: string;
  /** Color of nodes on the minimap */
  readonly nodeColor?: string | GetMiniMapNodeAttribute<NodeType>;
  /** Stroke color of nodes on the minimap */
  readonly nodeStrokeColor?: string | GetMiniMapNodeAttribute<NodeType>;
  /** Class applied to nodes on the minimap */
  readonly nodeClass?: string | GetMiniMapNodeAttribute<NodeType>;
  /** Border radius of nodes on the minimap */
  readonly nodeBorderRadius?: number;
  /** Stroke width of nodes on the minimap */
  readonly nodeStrokeWidth?: number;
  /** Color of the mask representing viewport */
  readonly maskColor?: string;
  /** Stroke color of the mask representing viewport */
  readonly maskStrokeColor?: string;
  /** Stroke width of the mask representing viewport */
  readonly maskStrokeWidth?: number;
  /** Position of the minimap on the pane
   * @example "top-left" | "top-right" | "bottom-left" | "bottom-right"
   */
  readonly position?: PanelPosition$1;
  /** Style applied to container */
  readonly style?: JSX.CSSProperties;
  /** The aria-label applied to container */
  readonly ariaLabel?: string | null;
  /** Width of minimap */
  readonly width?: number;
  /** Height of minimap */
  readonly height?: number;
  /** Called when the minimap pane is clicked, with the position in flow coordinates. */
  readonly onClick?: (event: MouseEvent, position: XYPosition$1) => void;
  /** Called when a node on the minimap is clicked. */
  readonly onNodeClick?: (event: MouseEvent, node: NodeType) => void;
  readonly pannable?: boolean;
  readonly zoomable?: boolean;
  /**
   * Custom component rendering each node on the minimap (receives
   * {@link MiniMapNodeProps}); defaults to the built-in rounded rect.
   */
  readonly nodeComponent?: (props: MiniMapNodeProps) => JSX.Element;
  /** Invert the direction when panning the minimap viewport */
  readonly inversePan?: boolean;
  /** Step size for zooming in/out */
  readonly zoomStep?: number;
  /**
   * Scales the padding around the graph inside the minimap (multiplied by
   * the minimap's view scale). Upstream parity.
   * @default 5
   */
  readonly offsetScale?: number;
};
/** Miniature overview map of the whole flow, with optional pan/zoom interaction. */
declare const MiniMap: <NodeType extends Node>(props: ParentProps<Partial<MiniMapProps<NodeType>>>) => JSX.Element;
//#endregion
//#region src/plugins/nodeResizer/NodeResizer.d.ts
type NodeResizerProps = {
  /** Id of the node it is resizing
   * @remarks optional if used inside custom node
   */
  readonly nodeId?: string;
  /** Class applied to handle */
  readonly handleClass?: string;
  /** Style applied to handle */
  readonly handleStyle?: JSX.CSSProperties;
  /** Class applied to line */
  readonly lineClass?: string;
  /** Style applied to line */
  readonly lineStyle?: JSX.CSSProperties;
  /** Are the controls visible */
  readonly visible?: boolean;
  /** Minimum width of node */
  readonly minWidth?: number;
  /** Minimum height of node */
  readonly minHeight?: number;
  /** Maximum width of node */
  readonly maxWidth?: number;
  /** Maximum height of node */
  readonly maxHeight?: number;
  /** Keep aspect ratio when resizing */
  readonly keepAspectRatio?: boolean;
  /** Automatically scale the node when resizing */
  readonly autoScale?: boolean;
  /** Callback to determine if node should resize */
  readonly shouldResize?: ShouldResize$1;
  /** Callback called when resizing starts */
  readonly onResizeStart?: OnResizeStart$1;
  /** Callback called when resizing */
  readonly onResize?: OnResize$1;
  /** Callback called when resizing ends */
  readonly onResizeEnd?: OnResizeEnd$1;
} & Omit<JSX.HTMLAttributes<HTMLDivElement>, "onResize" | "style">;
/** Resize handles and lines around a node; place inside a custom node to make it resizable. */
declare const NodeResizer: (props: Partial<NodeResizerProps>) => JSX.Element;
//#endregion
//#region src/plugins/nodeResizer/ResizeControl.d.ts
type NodeResizerSubProps = Pick<NodeResizerProps, "nodeId" | "minWidth" | "minHeight" | "maxWidth" | "maxHeight" | "autoScale" | "keepAspectRatio" | "shouldResize" | "onResizeStart" | "onResize" | "onResizeEnd">;
type ResizeControlProps = NodeResizerSubProps & {
  /** Position of control
   * @example "top-left" | "top-right" | "bottom-left" | "bottom-right"
   */
  readonly position?: ControlPosition$1;
  /** Variant of control
   * @example "handle", "line"
   */
  readonly variant?: ResizeControlVariant;
  readonly color?: string;
  readonly style?: JSX.CSSProperties;
} & Omit<JSX.HTMLAttributes<HTMLDivElement>, "onResize" | "style">;
/** A single resize handle or line — the building block of `NodeResizer`. */
declare const ResizeControl: <NodeType extends Node = Node>(props: ParentProps<ResizeControlProps>) => JSX.Element;
//#endregion
//#region src/plugins/toolbar/EdgeToolbar.d.ts
/** Props for the `EdgeToolbar` plugin. */
type EdgeToolbarProps = EdgeToolbarBaseProps & {
  /** If `true`, clicking the toolbar selects the edge it belongs to. */
  readonly selectEdgeOnClick?: boolean;
} & Omit<JSX.HTMLAttributes<HTMLDivElement>, "style">;
/**
 * The `<EdgeToolbar />` component renders a toolbar or tooltip for an edge.
 * It must be used inside a custom edge component. By default it is only
 * visible when the edge is selected; pass `isVisible` to control it manually.
 *
 * The toolbar does not scale with the viewport so that its content is always legible.
 */
declare const EdgeToolbar: (props: ParentProps<EdgeToolbarProps>) => JSX.Element;
//#endregion
//#region src/plugins/toolbar/NodeToolbar.d.ts
/** Props for the `NodeToolbar` plugin. */
type NodeToolbarProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "style"> & {
  /** The id of the node, or array of ids the toolbar should be displayed at */
  readonly nodeId: string | string[];
  /** Position of the toolbar relative to the node
   * @example "top" | "right" | "bottom" | "left"
   */
  readonly position: Position;
  /** Align the toolbar relative to the node
   * @example Align.Start, Align.Center, Align.End
   */
  readonly align: Align$1;
  /** Offset the toolbar from the node */
  readonly offset: number;
  /** If true, node toolbar is visible even if node is not selected */
  readonly isVisible: boolean;
  /** Style of the toolbar */
  readonly style: Omit<JSX.CSSProperties, "z-index" | "position" | "transform">;
};
/** Toolbar attached to a node, rendered above the graph so it does not scale with zoom. */
declare const NodeToolbar: ParentComponent<Partial<NodeToolbarProps>>;
//#endregion
export { Align, AriaLabelConfig, Background, type BackgroundProps, type BackgroundVariant, BaseEdge, BezierEdge, BezierEdgeInternal, type BezierEdgeProps, BezierPathOptions, Box, type BuiltInEdge, type BuiltInNode, type BuiltInNodeTypes, ColorMode, ColorModeClass, type Connection, ConnectionData, ConnectionLine, ConnectionLineComponentProps, ConnectionLineType, ConnectionMode, type ConnectionsRecord, ControlButton, type ControlLinePosition, type ControlPosition, Controls, type CoordinateExtent, type DefaultEdgeOptions, DefaultNode, DeleteEvents, Dimensions, type Edge, EdgeConnection, EdgeEvents, EdgeLabel, EdgeLabelRenderer, type EdgeMarker, EdgeMarkerType, type EdgeProps, EdgeReconnectAnchor, EdgeReconnectEvents, EdgeRenderer, EdgeToolbar, EdgeToolbarProps, type EdgeTypes, EdgeWrapper, type FitBounds, FitBoundsOptions, FitViewOptions, type FlowCommands, type FlowSelection, type FlowState, GetBezierPathParams, type GetMiniMapNodeAttribute, GetSmoothStepPathParams, GetStraightPathParams, GroupNode, Handle, type HandleConnection, InputNode, type InternalNode, IsValidConnection, KeyDefinition, KeyDefinitionObject, KeyModifier, Marker, MarkerDefinition, MarkerType, MiniMap, MiniMapNode, type MiniMapNodeProps, type MiniMapProps, type Node, type NodeConnection, NodeEvents, NodeGraph, type NodeOrigin, type NodeProps, NodeRenderer, NodeResizer, NodeSelection, NodeSelectionEvents, NodeToolbar, NodeToolbarProps, type NodeTypes, NodeWrapper, OnBeforeDelete, OnBeforeEdgeConnect, OnBeforeReconnect, OnConnect, OnConnectEnd, OnConnectStart, OnConnectStartParams, OnDelete, OnEdgeConnect, OnEdgeCreate, OnError, type OnMove, OnMoveEnd, OnMoveStart, OnReconnect, OnReconnectEnd, OnReconnectStart, OnResize, OnResizeEnd, OnResizeStart, OnSelectionChange, OnSelectionDrag, OutputNode, PanOnScrollMode, Pane, PaneEvents, Panel, type PanelPosition, Position, ProOptions, Rect, ResizeControl, ResizeControlVariant, ResizeDragEvent, ResizeParams, ResizeParamsWithDirection, Selection, SelectionMode, SelectionRect, type SetCenter, SetCenterOptions, type SetViewport, ShortcutModifier, ShortcutModifierDefinition, type ShouldResize, SmoothStepEdge, SmoothStepEdgeInternal, type SmoothStepEdgeProps, SmoothStepPathOptions, SnapGrid, SolidFlow, type SolidFlowEdge, type SolidFlowInitialProps, type SolidFlowNode, type SolidFlowProps, SolidFlowProvider, StaticHandle, StepEdge, StepEdgeInternal, type StepEdgeProps, StraightEdge, StraightEdgeInternal, type StraightEdgeProps, Transform, UseSolidFlowReturn, Viewport, ViewportHelperFunctionOptions, ViewportPortal, type XYPosition, XYZPosition, Zoom, addEdge, connectionKey, createEdgeStore, createNodeStore, createOptimisticEdgeStore, createOptimisticNodeStore, getBezierEdgeCenter, getBezierPath, getConnectedEdges, getEdgeCenter, getIncomers, getNodesBounds, getOutgoers, getSmoothStepPath, getStraightPath, getViewportForBounds, useColorMode, useConnection, useEdge, useEdgeId, useEdges, useInternalNode, useKeyPress, useNode, useNodeConnections, useNodeId, useNodes, useNodesData, useNodesInitialized, useSelectedEdges, useSelectedNodes, useSolidFlow, useUpdateNodeInternals, useViewport, useViewportInitialized };
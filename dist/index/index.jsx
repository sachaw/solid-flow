import { ConnectionLineType as ConnectionLineType$1, ConnectionMode as ConnectionMode$1, MarkerType as MarkerType$1, PanOnScrollMode as PanOnScrollMode$1, Position as Position$1, ResizeControlVariant as ResizeControlVariant$1, SelectionMode as SelectionMode$1, XYDrag, XYHandle, XYMinimap, XYPanZoom, XYResizer, XY_RESIZER_HANDLE_POSITIONS, XY_RESIZER_LINE_POSITIONS, addEdge, addEdge as addEdge$1, areConnectionMapsEqual, calcAutoPan, calculateNodePosition, clampPosition, clampPositionToParent, createDevWarn, createMarkerIds, elementSelectionKeys, errorMessages, evaluateAbsolutePosition, fitViewport, getBezierEdgeCenter as getBezierEdgeCenter$1, getBezierPath, getBezierPath as getBezierPath$1, getBoundsOfRects, getConnectedEdges, getConnectionStatus, getDimensions, getEdgeCenter as getEdgeCenter$1, getEdgePosition, getEdgeToolbarTransform, getElementsToRemove, getElevatedEdgeZIndex, getEventPosition, getHandleBounds, getHostForElement, getIncomers, getInternalNodesBounds, getMarkerId, getNodeDimensions, getNodePositionWithOrigin, getNodeToolbarTransform, getNodesBounds, getNodesBounds as getNodesBounds$1, getNodesInside, getOutgoers, getOverlappingArea, getSmoothStepPath, getSmoothStepPath as getSmoothStepPath$1, getStraightPath, getStraightPath as getStraightPath$1, getViewportForBounds, getViewportForBounds as getViewportForBounds$1, handleConnectionChange, infiniteExtent, initialConnection, isCoordinateExtent, isEdgeBase, isInputDOMNode, isMacOs, isNodeBase, isNumeric, isRectObject, mergeAriaLabelConfig, nodeHasDimensions, nodeToRect, panBy, pointToRendererPoint, rendererPointToPoint, shallowNodeData, snapPosition } from "@xyflow/system";
import { For, Show, createContext, createEffect, createMemo, createOptimisticStore, createProjection, createSignal, createStore, flush, isPending, mapArray, merge, omit, onCleanup, onSettled, runWithOwner, snapshot, untrack, useContext } from "solid-js";
import { createMediaQuery } from "@solid-primitives/media";
import { Dynamic, Portal, isServer } from "@solidjs/web";
import { createEventListener, createEventListenerMap } from "@solid-primitives/event-listener";
//#region src/contexts/edgeId.ts
const EdgeIdContext = createContext(null);
/**
* Returns the id of the edge this component is rendered inside. Available
* anywhere in a custom edge's subtree (provided by the edge wrapper), so
* nested components — like a custom edge label — can learn their host edge
* without prop drilling.
*
* @public
* @returns a reactive accessor for the surrounding edge's id
*/
function useEdgeId() {
	let ctx = useContext(EdgeIdContext);
	if (!ctx) throw Error("solid-flow: useEdgeId must be called inside an edge component (anywhere under a custom edge's subtree)");
	return ctx;
}
//#endregion
//#region src/utils.ts
/**
* Test whether an object is usable as a Node
* @public
* @remarks In TypeScript this is a type guard that will narrow the type of whatever you pass in to Node if it returns true
* @param element - The element to test
* @returns A boolean indicating whether the element is an Node
*/
const isNode = (element) => isNodeBase(element), isEdge = (element) => isEdgeBase(element), toPxString = (value) => value === void 0 ? void 0 : `${value}px`, ARROW_KEY_DIFFS = {
	ArrowUp: {
		x: 0,
		y: -1
	},
	ArrowDown: {
		x: 0,
		y: 1
	},
	ArrowLeft: {
		x: -1,
		y: 0
	},
	ArrowRight: {
		x: 1,
		y: 0
	}
}, scheduleIdleCallback = typeof requestIdleCallback == "function" ? requestIdleCallback : (callback) => setTimeout(callback, 0);
/**
* Reactive prop defaulting with skip-undefined semantics: a prop counts as
* "absent" when it reads `undefined`, so parents forwarding optional props
* (e.g. `<Handle position={props.targetPosition} />`) do not clobber defaults.
* This is deliberate policy on top of Solid 2.0's `merge`, where `undefined`
* is a real value that overrides.
*/
function propDefaults(props, defaults) {
	let out = {}, keys = /* @__PURE__ */ new Set([...Object.keys(defaults), ...Object.keys(props)]);
	for (let key of keys) Object.defineProperty(out, key, {
		get: () => props[key] === void 0 ? defaults[key] : props[key],
		enumerable: !0,
		configurable: !0
	});
	return out;
}
const getEdgeId = (connection) => {
	let { source, sourceHandle, target, targetHandle } = connection;
	return `xy-edge__${source}${sourceHandle || ""}-${target}${targetHandle || ""}`;
}, isEdgeSelectable = (edge, store) => edge.selectable ?? store.defaultEdgeOptions.selectable ?? store.elementsSelectable, emitFlowError = (onError, id, message) => {
	onError && onError(id, message);
}, EdgeLabelRenderer = (props) => {
	let { store } = useInternalSolidFlow(), labelNode = () => store.domNode?.querySelector(".solid-flow__edge-labels");
	return <Show when={labelNode()}>{(root) => <Portal mount={root()}>{props.children}</Portal>}</Show>;
}, EdgeLabel = (props) => {
	let _props = propDefaults(props, {
		x: 0,
		y: 0,
		selectEdgeOnClick: !1,
		transparent: !1,
		style: {}
	}), rest = omit(_props, "x", "y", "width", "height", "selectEdgeOnClick", "transparent", "children", "class", "style"), { actions } = useInternalSolidFlow(), id = useEdgeId(), zIndex = () => actions.getLayoutedEdge(id())?.zIndex;
	return <EdgeLabelRenderer>
      <div role="button" tabindex={-1} class={[
		"solid-flow__edge-label",
		{ transparent: _props.transparent },
		_props.class
	]} style={{
		"pointer-events": "all",
		width: toPxString(_props.width),
		height: toPxString(_props.height),
		transform: `translate(-50%, -50%) translate(${_props.x}px,${_props.y}px)`,
		cursor: _props.selectEdgeOnClick ? "pointer" : void 0,
		"z-index": zIndex(),
		..._props.style
	}} onClick={() => {
		_props.selectEdgeOnClick && actions.handleEdgeSelection(id());
	}} {...rest}>
        {_props.children}
      </div>
    </EdgeLabelRenderer>;
}, BaseEdge = (props) => {
	let _props = propDefaults(props, { interactionWidth: 20 }), rest = omit(_props, "class", "style", "path", "interactionWidth", "label", "labelStyle", "labelX", "labelY", "markerStart", "markerEnd");
	return <>
      <path d={_props.path} class={["solid-flow__edge-path", _props.class]} marker-start={_props.markerStart} marker-end={_props.markerEnd} fill="none" style={_props.style} {...rest} />

      <Show when={_props.interactionWidth > 0}>
        <path d={_props.path} stroke-opacity={0} stroke-width={_props.interactionWidth} fill="none" class="solid-flow__edge-interaction" />
      </Show>

      <Show when={_props.label}>
        <EdgeLabel x={_props.labelX} y={_props.labelY} style={_props.labelStyle}>
          {_props.label}
        </EdgeLabel>
      </Show>
    </>;
}, BezierEdge = (props) => {
	let pathData = () => {
		let [path, labelX, labelY] = getBezierPath$1({
			sourceX: props.sourceX,
			sourceY: props.sourceY,
			targetX: props.targetX,
			targetY: props.targetY,
			sourcePosition: props.sourcePosition,
			targetPosition: props.targetPosition,
			curvature: props.pathOptions?.curvature
		});
		return {
			path,
			labelX,
			labelY
		};
	};
	return <BaseEdge id={props.id} path={pathData().path} labelX={pathData().labelX} labelY={pathData().labelY} label={props.label} labelStyle={props.labelStyle} markerStart={props.markerStart} markerEnd={props.markerEnd} interactionWidth={props.interactionWidth} style={props.style} />;
}, BezierEdgeInternal = (props) => {
	let pathData = () => {
		let [path, labelX, labelY] = getBezierPath$1({
			sourceX: props.sourceX,
			sourceY: props.sourceY,
			targetX: props.targetX,
			targetY: props.targetY,
			sourcePosition: props.sourcePosition,
			targetPosition: props.targetPosition
		});
		return {
			path,
			labelX,
			labelY
		};
	};
	return <BaseEdge path={pathData().path} labelX={pathData().labelX} labelY={pathData().labelY} label={props.label} labelStyle={props.labelStyle} markerStart={props.markerStart} markerEnd={props.markerEnd} interactionWidth={props.interactionWidth} style={props.style} />;
};
//#endregion
//#region src/core/spatial/grid.ts
/**
* A uniform spatial hash over axis-aligned rects — the plain, NON-reactive
* building block behind the flow's spatial queries (RFC-4239 dossier:
* gesture-scoped snapshots and epoch-rebuilt indexes; deliberately never a
* live-maintained reactive structure, which would re-create the round-6
* central-collection anti-pattern).
*
* Every operation is O(cells touched); with cellSize on the order of the
* query radius or median node size, inserts and queries touch O(1) cells.
* No balancing, no extent-known-up-front requirement, no dependency —
* upstream's own bake-off (quadtree vs BVH vs rbush) is why: fixed-radius
* neighborhood and rect-vs-box queries are the textbook grid case.
*/
var SpatialGrid = class {
	cellSize;
	cells = /* @__PURE__ */ new Map();
	rects = /* @__PURE__ */ new Map();
	constructor(cellSize) {
		this.cellSize = cellSize;
	}
	cellRange(rect) {
		let size = this.cellSize;
		return {
			minX: Math.floor(rect.x / size),
			maxX: Math.floor((rect.x + rect.width) / size),
			minY: Math.floor(rect.y / size),
			maxY: Math.floor((rect.y + rect.height) / size)
		};
	}
	insert(id, rect) {
		this.rects.set(id, rect);
		let { minX, maxX, minY, maxY } = this.cellRange(rect);
		for (let cx = minX; cx <= maxX; cx++) for (let cy = minY; cy <= maxY; cy++) {
			let key = `${cx}:${cy}`, bucket = this.cells.get(key);
			bucket ? bucket.push(id) : this.cells.set(key, [id]);
		}
	}
	/** Ids of entries whose rect overlaps the query rect (touching counts). */
	queryRect(query) {
		let { minX, maxX, minY, maxY } = this.cellRange(query), seen = /* @__PURE__ */ new Set(), result = [];
		for (let cx = minX; cx <= maxX; cx++) for (let cy = minY; cy <= maxY; cy++) {
			let bucket = this.cells.get(`${cx}:${cy}`);
			if (bucket) for (let id of bucket) {
				if (seen.has(id)) continue;
				seen.add(id);
				let rect = this.rects.get(id);
				rect.x <= query.x + query.width && rect.x + rect.width >= query.x && rect.y <= query.y + query.height && rect.y + rect.height >= query.y && result.push(id);
			}
		}
		return result;
	}
	get size() {
		return this.rects.size;
	}
}, GestureSpatialLookup = class {
	#real;
	#cellSize;
	#grid = null;
	#queryRect = null;
	constructor(real, cellSize) {
		this.#real = real, this.#cellSize = cellSize;
	}
	/** Snapshot the current geometry into the grid (gesture start). */
	arm(rectOf) {
		let grid = new SpatialGrid(this.#cellSize);
		for (let [id, value] of this.#real.entries()) grid.insert(id, rectOf(value));
		this.#grid = grid, this.#queryRect = null;
	}
	/** Focus iteration on the neighborhood of the pointer (per move). */
	setQueryCenter(center, radius) {
		this.#queryRect = {
			x: center.x - radius,
			y: center.y - radius,
			width: radius * 2,
			height: radius * 2
		};
	}
	/** Focus iteration on an explicit rect (box-selection gestures). */
	setQueryRect(rect) {
		this.#queryRect = rect;
	}
	/** Back to plain pass-through (gesture end). */
	disarm() {
		this.#grid = null, this.#queryRect = null;
	}
	#candidateIds() {
		return !this.#grid || !this.#queryRect ? null : this.#grid.queryRect(this.#queryRect);
	}
	get(key) {
		return this.#real.get(key);
	}
	has(key) {
		return this.#real.has(key);
	}
	get size() {
		return this.#real.size;
	}
	*keys() {
		let candidates = this.#candidateIds();
		if (!candidates) {
			yield* this.#real.keys();
			return;
		}
		for (let id of candidates) this.#real.has(id) && (yield id);
	}
	*values() {
		let candidates = this.#candidateIds();
		if (!candidates) {
			yield* this.#real.values();
			return;
		}
		for (let id of candidates) {
			let value = this.#real.get(id);
			value !== void 0 && (yield value);
		}
	}
	*entries() {
		let candidates = this.#candidateIds();
		if (!candidates) {
			yield* this.#real.entries();
			return;
		}
		for (let id of candidates) {
			let value = this.#real.get(id);
			value !== void 0 && (yield [id, value]);
		}
	}
	[Symbol.iterator]() {
		return this.entries();
	}
	forEach(callback, thisArg) {
		for (let [key, value] of this.entries()) callback.call(thisArg, value, key, this);
	}
	[Symbol.toStringTag] = "GestureSpatialLookup";
	set() {
		throw Error("GestureSpatialLookup is read-only");
	}
	getOrInsert() {
		throw Error("GestureSpatialLookup is read-only");
	}
	getOrInsertComputed() {
		throw Error("GestureSpatialLookup is read-only");
	}
	delete() {
		throw Error("GestureSpatialLookup is read-only");
	}
	clear() {
		throw Error("GestureSpatialLookup is read-only");
	}
};
//#endregion
//#region src/components/handle/connectionGestureLookup.ts
/**
* Upstream `getClosestHandle` prefilters nodes within
* `connectionRadius + ADDITIONAL_DISTANCE` of the pointer; ADDITIONAL_DISTANCE
* is hardcoded to 250 in @xyflow/system (xyhandle/utils.ts). Tracked here with
* a safety pad: a superset of candidates is always correct (their exact
* distance filter runs after), so the pad only costs a few extra candidates.
*/
const armConnectionGestureLookup = (options) => {
	let { event, real, domNode, getTransform, connectionRadius } = options, containerBounds = domNode?.getBoundingClientRect();
	if (!containerBounds) return real;
	let radius = connectionRadius + 250 + 50, lookup = new GestureSpatialLookup(real, radius);
	lookup.arm((node) => nodeToRect(node));
	let update = (moveEvent) => {
		lookup.setQueryCenter(pointToRendererPoint(getEventPosition(moveEvent, containerBounds), getTransform(), !1, [1, 1]), radius);
	};
	update(event);
	let doc = getHostForElement(event.target), dispose = () => {
		doc.removeEventListener("mousemove", update, !0), doc.removeEventListener("touchmove", update, !0), doc.removeEventListener("mouseup", dispose, !0), doc.removeEventListener("touchend", dispose, !0), lookup.disarm();
	};
	return doc.addEventListener("mousemove", update, !0), doc.addEventListener("touchmove", update, !0), doc.addEventListener("mouseup", dispose, !0), doc.addEventListener("touchend", dispose, !0), lookup;
}, buildConnectionGestureParams = (options) => {
	let { event, store, actions, gestureLookup } = options;
	return {
		lib: store.lib,
		flowId: store.id,
		domNode: store.domNode,
		autoPanOnConnect: store.autoPanOnConnect,
		autoPanSpeed: store.autoPanSpeed,
		connectionMode: store.connectionMode,
		connectionRadius: store.connectionRadius,
		nodeLookup: gestureLookup,
		cancelConnection: actions.cancelConnection,
		panBy: actions.panBy,
		updateConnection: ((connection) => {
			actions.setConnection(connection), flush();
		}),
		isValidConnection: store.isValidConnection,
		onConnectStart: store.onConnectStart,
		onConnectEnd: store.onConnectEnd,
		getTransform: () => store.transform,
		getFromHandle: () => store.connection.fromHandle,
		dragThreshold: store.connectionDragThreshold,
		handleDomNode: event.currentTarget
	};
}, EdgeReconnectAnchor = (props) => {
	let _props = propDefaults(props, {
		size: 25,
		reconnecting: !1,
		style: {}
	}), rest = omit(_props, "type", "class", "style", "position", "size", "reconnecting", "onReconnectingChange", "children"), { store, nodeLookup, edgeLookup, actions } = useInternalSolidFlow(), edgeId = useEdgeId(), [reconnecting, setReconnecting] = createSignal(!1);
	if (!edgeId()) throw Error("[solid-flow]: EdgeReconnectAnchor must be used within an Edge component");
	let edge = () => edgeLookup[edgeId()], isReconnecting = () => _props.reconnecting || reconnecting(), setReconnectingState = (next) => {
		setReconnecting(next), _props.onReconnectingChange?.(next);
	}, onPointerDown = (event) => {
		if (event.button !== 0) return;
		setReconnectingState(!0), store.onReconnectStart?.(event, edge(), _props.type);
		let opposite = _props.type === "target" ? {
			nodeId: edge().source,
			handleId: edge().sourceHandle ?? null,
			type: "source"
		} : {
			nodeId: edge().target,
			handleId: edge().targetHandle ?? null,
			type: "target"
		}, gestureLookup = armConnectionGestureLookup({
			event,
			real: nodeLookup,
			domNode: store.domNode,
			getTransform: () => store.transform,
			connectionRadius: store.connectionRadius
		});
		XYHandle.onPointerDown(event, {
			...buildConnectionGestureParams({
				event,
				store,
				actions,
				gestureLookup
			}),
			nodeId: opposite.nodeId,
			handleId: opposite.handleId,
			isTarget: opposite.type === "target",
			edgeUpdaterType: opposite.type,
			onConnect: (connection) => {
				let newEdge = {
					...edge(),
					...connection
				};
				newEdge = store.onBeforeReconnect?.(newEdge, edge()) ?? newEdge, newEdge && actions.setEdges((edges) => edges.map((e) => e.id === edge().id ? newEdge : e)), store.onReconnect?.(edge(), connection);
			},
			onReconnectEnd: (event, connectionState) => {
				setReconnectingState(!1), store.onReconnectEnd?.(event, edge(), opposite.type, connectionState);
			}
		});
	};
	return <EdgeLabel x={_props.position?.x} y={_props.position?.y} style={_props.style} {...rest}>
      <div onPointerDown={onPointerDown} class={[
		"solid-flow__edgeupdater",
		`solid-flow__edgeupdater-${_props.type}`,
		store.noPanClass,
		_props.class
	]} style={{
		width: toPxString(_props.size),
		height: toPxString(_props.size),
		background: "transparent",
		border: "none",
		cursor: "move",
		..._props.style
	}}>
        <Show when={!isReconnecting()}>{_props.children}</Show>
      </div>
    </EdgeLabel>;
}, ARIA_NODE_DESC_KEY = "solid-flow__node-desc", ARIA_EDGE_DESC_KEY = "solid-flow__edge-desc", A11yDescriptions = () => {
	let { store } = useInternalSolidFlow();
	return <>
      <div id={`${ARIA_NODE_DESC_KEY}-${store.id}`} class="a11y-hidden">
        {store.disableKeyboardA11y ? store.ariaLabelConfig["node.a11yDescription.default"] : store.ariaLabelConfig["node.a11yDescription.keyboardDisabled"]}
      </div>
      <div id={`${ARIA_EDGE_DESC_KEY}-${store.id}`} class="a11y-hidden">
        {store.ariaLabelConfig["edge.a11yDescription.default"]}
      </div>

      <Show when={!store.disableKeyboardA11y}>
        <div id={`solid-flow__aria-live-${store.id}`} aria-live="assertive" aria-atomic="true" class="a11y-live-msg">
          {store.ariaLiveMessage}
        </div>
      </Show>
    </>;
}, samePos = (a, b) => !!a && a.x === b.x && a.y === b.y, joinPosition = (rowPosition, entry) => entry === void 0 ? rowPosition : samePos(rowPosition, entry.rowBefore) || samePos(rowPosition, entry.position) ? entry.position : rowPosition, joinDragging = (rowDragging, entry) => entry === void 0 ? !!rowDragging : entry.dragging, dragEntry = (overlay, id) => id in overlay ? overlay[id] : void 0, joinSelected = (rowSelected, entry) => entry === void 0 ? !!rowSelected : entry.value, overlayEntry = (overlay, id) => id in overlay ? overlay[id] : void 0, createElementCommands = ({ store, setNodesStore, setEdgesStore, setSelectionOverlay, setDragOverlay, nodeLookup, controlledEdges }) => {
	let addEdge = (edgeParams) => {
		controlledEdges() || setEdgesStore((edges) => {
			let next = addEdge$1(edgeParams, edges);
			next !== edges && edges.push(next[next.length - 1]);
		});
	}, updateNodePositions = (nodeDragItems, dragging = !1) => {
		setNodesStore((nodes) => {
			let writes = [];
			for (let node of nodes) {
				if (!nodeDragItems.has(node.id)) continue;
				let position = nodeDragItems.get(node.id).position;
				writes.push({
					id: node.id,
					position,
					rowBefore: { ...node.position },
					row: node
				}), node.dragging = dragging, node.position = position;
			}
			setDragOverlay((draft) => {
				for (let { id, position, rowBefore, row } of writes) draft[id] = {
					position,
					dragging,
					rowBefore: draft[id]?.rowBefore ?? rowBefore,
					row
				};
			});
		});
	}, updateNode = (id, nodeUpdate, options = { replace: !1 }) => {
		setNodesStore((nodes) => {
			let index = nodes.findIndex((node) => node.id === id);
			if (index === -1) return;
			let node = nodes[index], nextNode = typeof nodeUpdate == "function" ? nodeUpdate(node) : nodeUpdate;
			nextNode.selected !== void 0 && (node.selected = !!nextNode.selected, setSelectionOverlay((draft) => {
				draft.nodes[id] = {
					value: !!nextNode.selected,
					row: node
				};
			})), nodes[index] = options?.replace && isNode(nextNode) ? nextNode : {
				...node,
				...nextNode
			};
		});
	};
	return {
		addNodes: (payload) => {
			let newNodes = Array.isArray(payload) ? payload : [payload];
			setNodesStore((nodes) => [...nodes, ...newNodes]);
		},
		addEdges: (payload) => {
			let newEdges = Array.isArray(payload) ? payload : [payload];
			setEdgesStore((edges) => [...edges, ...newEdges]);
		},
		updateNode,
		updateNodeData: (id, dataUpdate, options) => {
			let node = nodeLookup.get(id)?.internals.userNode;
			if (!node) return;
			let nextData = typeof dataUpdate == "function" ? dataUpdate(node) : dataUpdate;
			updateNode(id, (current) => ({
				...current,
				data: options?.replace ? nextData : {
					...current.data,
					...nextData
				}
			}));
		},
		updateEdge: (id, edgeUpdate, options = { replace: !1 }) => {
			setEdgesStore((edges) => {
				let index = edges.findIndex((edge) => edge.id === id);
				if (index === -1) return;
				let edge = edges[index], nextEdge = typeof edgeUpdate == "function" ? edgeUpdate(edge) : edgeUpdate;
				nextEdge.selected !== void 0 && (edge.selected = !!nextEdge.selected, setSelectionOverlay((draft) => {
					draft.edges[id] = {
						value: !!nextEdge.selected,
						row: edge
					};
				})), edges[index] = options.replace && isEdge(nextEdge) ? nextEdge : {
					...edge,
					...nextEdge
				};
			});
		},
		deleteElements: async ({ nodes: nodesToRemove = [], edges: edgesToRemove = [] }) => {
			let { nodes: matchingNodes, edges: matchingEdges } = await getElementsToRemove({
				nodesToRemove,
				edgesToRemove,
				nodes: store.nodes,
				edges: store.edges,
				onBeforeDelete: store.onBeforeDelete
			});
			if (matchingEdges) {
				let remainingEdges = store.edges.filter((edge) => !matchingEdges.some(({ id }) => id === edge.id));
				store.onEdgesDelete?.(matchingEdges), setEdgesStore(() => remainingEdges);
			}
			if (matchingNodes) {
				let remainingNodes = store.nodes.filter((node) => !matchingNodes.some(({ id }) => id === node.id));
				store.onNodesDelete?.(matchingNodes), setNodesStore(() => remainingNodes);
			}
			let deletedNodes = matchingNodes ?? [], deletedEdges = matchingEdges ?? [];
			return (deletedNodes.length > 0 || deletedEdges.length > 0) && store.onDelete?.({
				nodes: deletedNodes,
				edges: deletedEdges
			}), {
				deletedNodes: matchingNodes,
				deletedEdges: matchingEdges
			};
		},
		toObject: () => structuredClone({
			nodes: [...snapshot(store.nodes)],
			edges: [...snapshot(store.edges)],
			viewport: { ...snapshot(store.viewport) }
		}),
		addEdge,
		updateNodePositions
	};
}, createGeometryCommands = ({ store, nodeLookup }) => {
	let intersectionGrid = null, intersectionRows = null, queryIntersectionCandidates = (rect) => untrack(() => {
		if (!intersectionGrid) {
			let grid = new SpatialGrid(300), rows = /* @__PURE__ */ new Map();
			for (let node of store.nodes) {
				let internalNode = nodeLookup.get(node.id);
				internalNode && (grid.insert(node.id, nodeToRect(internalNode)), rows.set(node.id, node));
			}
			intersectionGrid = grid, intersectionRows = rows, queueMicrotask(() => {
				intersectionGrid = null, intersectionRows = null;
			});
		}
		let rows = intersectionRows, result = [];
		for (let id of intersectionGrid.queryRect(rect)) {
			let row = rows.get(id);
			row && result.push(row);
		}
		return result;
	}), getNodeRect = (node) => {
		let nodeToUse = isNode(node) ? node : nodeLookup.get(node.id);
		if (!nodeToUse) return null;
		let position = nodeToUse.parentId ? evaluateAbsolutePosition(nodeToUse.position, nodeToUse.measured, nodeToUse.parentId, nodeLookup, store.nodeOrigin) : nodeToUse.position, nodeWithPosition = {
			...nodeToUse,
			position,
			width: nodeToUse.measured?.width ?? nodeToUse.width,
			height: nodeToUse.measured?.height ?? nodeToUse.height
		};
		return nodeToRect(nodeWithPosition);
	};
	return {
		getIntersectingNodes: (nodeOrRect, partially = !0, nodesToIntersect) => {
			let isRect = isRectObject(nodeOrRect), nodeRect = isRect ? nodeOrRect : getNodeRect(nodeOrRect);
			return nodeRect ? (nodesToIntersect ?? queryIntersectionCandidates(nodeRect)).filter((n) => {
				let internalNode = nodeLookup.get(n.id);
				if (!internalNode || !isRect && n.id === nodeOrRect.id) return !1;
				let currNodeRect = nodeToRect(internalNode), overlappingArea = getOverlappingArea(currNodeRect, nodeRect);
				return partially && overlappingArea > 0 || overlappingArea >= nodeRect.width * nodeRect.height;
			}) : [];
		},
		isNodeIntersecting: (nodeOrRect, area, partially = !0) => {
			let nodeRect = isRectObject(nodeOrRect) ? nodeOrRect : getNodeRect(nodeOrRect);
			if (!nodeRect) return !1;
			let overlappingArea = getOverlappingArea(nodeRect, area);
			return partially && overlappingArea > 0 || overlappingArea >= nodeRect.width * nodeRect.height;
		},
		getNodesBounds: (nodesToMeasure) => getNodesBounds$1(nodesToMeasure, {
			nodeLookup,
			nodeOrigin: store.nodeOrigin
		})
	};
}, createSelectionCommands = ({ store, setNodesStore, setEdgesStore, setSelectionRect, setSelectionRectMode, nodeLookup, edgeLookup, updateNodePositions, selectionOverlay, setSelectionOverlay }) => {
	let nodeSelected = (node) => joinSelected(node.selected, overlayEntry(selectionOverlay.nodes, node.id)), edgeSelected = (edge) => joinSelected(edge.selected, overlayEntry(selectionOverlay.edges, edge.id)), writeOverlay = (kind, row, value) => {
		setSelectionOverlay((draft) => {
			draft[kind][row.id] = {
				value,
				row
			};
		});
	}, unselectNodesAndEdges = ({ nodes: _nodes, edges } = {}) => {
		let requestedNodeIds = _nodes ? new Set(_nodes.map(({ id }) => id)) : null, nodeTargets = requestedNodeIds?.size === 0 ? /* @__PURE__ */ new Set() : new Set(store.selectedNodes.filter((node) => !requestedNodeIds || requestedNodeIds.has(node.id)).map(({ id }) => id));
		nodeTargets.size && setNodesStore((nodes) => {
			for (let node of nodes) nodeTargets.has(node.id) && (writeOverlay("nodes", node, !1), node.selected = !1);
		});
		let requestedEdgeIds = edges ? new Set(edges.map(({ id }) => id)) : null, edgeTargets = requestedEdgeIds?.size === 0 ? /* @__PURE__ */ new Set() : new Set(store.selectedEdges.filter((edge) => !requestedEdgeIds || requestedEdgeIds.has(edge.id)).map(({ id }) => id));
		edgeTargets.size && setEdgesStore((edges) => {
			for (let edge of edges) edgeTargets.has(edge.id) && (writeOverlay("edges", edge, !1), edge.selected = !1);
		}), flush();
	}, addSelectedNodes = (ids) => {
		let isMultiSelection = store.multiselectionKeyPressed, idSet = new Set(ids), nodeOverlay = snapshot(selectionOverlay.nodes);
		setNodesStore((nodes) => {
			for (let node of nodes) {
				let nodeWillBeSelected = idSet.has(node.id), current = joinSelected(node.selected, nodeOverlay[node.id]), selected = isMultiSelection && current || nodeWillBeSelected;
				current !== selected && (writeOverlay("nodes", node, selected), node.selected = selected);
			}
		}), isMultiSelection || unselectNodesAndEdges({ nodes: [] }), flush();
	}, addSelectedEdges = (ids) => {
		let isMultiSelection = store.multiselectionKeyPressed, idSet = new Set(ids), edgeOverlay = snapshot(selectionOverlay.edges);
		setEdgesStore((edges) => {
			for (let edge of edges) {
				let edgeWillBeSelected = idSet.has(edge.id), current = joinSelected(edge.selected, edgeOverlay[edge.id]), selected = isMultiSelection && current || edgeWillBeSelected;
				current !== selected && (writeOverlay("edges", edge, selected), edge.selected = selected);
			}
		}), isMultiSelection || unselectNodesAndEdges({ edges: [] }), flush();
	};
	return {
		unselectNodesAndEdges,
		addSelectedNodes,
		addSelectedEdges,
		handleNodeSelection: (id, unselect, nodeRef) => {
			let node = store.nodes.find((n) => n.id === id);
			if (!node) {
				emitFlowError(store.onError, "012", errorMessages.error012(id));
				return;
			}
			setSelectionRect(void 0), setSelectionRectMode(void 0), nodeSelected(node) ? (unselect || nodeSelected(node) && store.multiselectionKeyPressed) && (unselectNodesAndEdges({
				nodes: [node],
				edges: []
			}), requestAnimationFrame(() => nodeRef?.blur())) : addSelectedNodes([id]);
		},
		handleEdgeSelection: (id) => {
			let edge = edgeLookup[id];
			if (!edge) {
				emitFlowError(store.onError, "012", errorMessages.error012(id));
				return;
			}
			isEdgeSelectable(edge, store) && (setSelectionRect(void 0), setSelectionRectMode(void 0), edgeSelected(edge) ? edgeSelected(edge) && store.multiselectionKeyPressed && unselectNodesAndEdges({
				nodes: [],
				edges: [edge]
			}) : addSelectedEdges([id]));
		},
		moveSelectedNodes: (direction, factor) => {
			let nodeUpdates = /* @__PURE__ */ new Map(), xVelo = store.snapGrid?.[0] ?? 5, yVelo = store.snapGrid?.[1] ?? 5, xDiff = direction.x * xVelo * factor, yDiff = direction.y * yVelo * factor;
			for (let node of nodeLookup.values()) {
				if (!(node.selected && (node.draggable || store.nodesDraggable && node.draggable === void 0))) continue;
				let nextPosition = {
					x: node.internals.positionAbsolute.x + xDiff,
					y: node.internals.positionAbsolute.y + yDiff
				};
				store.snapGrid && (nextPosition = snapPosition(nextPosition, store.snapGrid));
				let { position } = calculateNodePosition({
					nodeId: node.id,
					nextPosition,
					nodeLookup,
					nodeExtent: store.nodeExtent,
					nodeOrigin: store.nodeOrigin,
					onError: store.onError
				});
				nodeUpdates.set(node.id, { position });
			}
			updateNodePositions(nodeUpdates);
		},
		applySelectionSets: (selectedNodeIds, selectedEdgeIds) => {
			let nodeOverlay = snapshot(selectionOverlay.nodes);
			setNodesStore((nodes) => {
				for (let node of nodes) {
					let selected = selectedNodeIds.has(node.id);
					joinSelected(node.selected, nodeOverlay[node.id]) !== selected && (writeOverlay("nodes", node, selected), node.selected = selected);
				}
			});
			let edgeOverlay = snapshot(selectionOverlay.edges);
			setEdgesStore((edges) => {
				for (let edge of edges) {
					let selected = selectedEdgeIds.has(edge.id);
					joinSelected(edge.selected, edgeOverlay[edge.id]) !== selected && (writeOverlay("edges", edge, selected), edge.selected = selected);
				}
			});
		}
	};
}, createViewportCommands = ({ store, nodeLookup, defaultFitViewOptions }) => {
	let fitView = async (options) => {
		if (!store.panZoom) return !1;
		let ready = () => {
			if (!store.width || !store.height || nodeLookup.size === 0) return !1;
			for (let node of nodeLookup.values()) if (node.measured?.width && node.measured?.height) return !0;
			return !1;
		};
		for (let frame = 0; !ready(); frame++) {
			if (frame >= 30 || typeof requestAnimationFrame > "u") return !1;
			await new Promise((resolve) => requestAnimationFrame(() => resolve()));
		}
		return store.panZoom ? await fitViewport({
			nodes: nodeLookup,
			width: store.width,
			height: store.height,
			panZoom: store.panZoom,
			minZoom: store.minZoom,
			maxZoom: store.maxZoom
		}, options ?? defaultFitViewOptions()) : !1;
	}, zoomBy = async (factor, options) => store.panZoom ? store.panZoom.scaleBy(factor, options) : !1;
	return {
		fitView,
		fitBounds: async (bounds, options) => {
			if (!store.panZoom) return !1;
			let viewport = getViewportForBounds$1(bounds, store.width, store.height, store.minZoom, store.maxZoom, options?.padding ?? .1);
			return await store.panZoom.setViewport(viewport, {
				duration: options?.duration,
				ease: options?.ease,
				interpolate: options?.interpolate
			}), !0;
		},
		zoomIn: (options) => zoomBy(1.2, options),
		zoomOut: (options) => zoomBy(1 / 1.2, options),
		setZoom: (zoomLevel, options) => {
			let currentPanZoom = store.panZoom;
			return currentPanZoom ? currentPanZoom.scaleTo(zoomLevel, { duration: options?.duration }) : Promise.resolve(!1);
		},
		setCenter: async (x, y, options) => {
			let nextZoom = options?.zoom === void 0 ? store.maxZoom : options.zoom, currentPanZoom = store.panZoom;
			return currentPanZoom ? (await currentPanZoom.setViewport({
				x: store.width / 2 - x * nextZoom,
				y: store.height / 2 - y * nextZoom,
				zoom: nextZoom
			}, {
				duration: options?.duration,
				ease: options?.ease,
				interpolate: options?.interpolate
			}), Promise.resolve(!0)) : Promise.resolve(!1);
		},
		setViewport: async (nextViewport, options) => {
			let currentViewport = store.viewport;
			return store.panZoom ? (await store.panZoom.setViewport({
				x: nextViewport.x ?? currentViewport.x,
				y: nextViewport.y ?? currentViewport.y,
				zoom: nextViewport.zoom ?? currentViewport.zoom
			}, options), !0) : !1;
		},
		panBy: (delta) => panBy({
			delta,
			panZoom: store.panZoom,
			transform: store.transform,
			translateExtent: store.translateExtent,
			width: store.width,
			height: store.height
		}),
		screenToFlowPosition: (position, options = { snapToGrid: !0 }) => {
			if (!store.domNode) return position;
			let _snapGrid = options.snapToGrid ? store.snapGrid : !1, { x, y, zoom } = store.viewport, { x: domX, y: domY } = store.domNode.getBoundingClientRect(), correctedPosition = {
				x: position.x - domX,
				y: position.y - domY
			};
			return pointToRendererPoint(correctedPosition, [
				x,
				y,
				zoom
			], !!_snapGrid, _snapGrid || [1, 1]);
		},
		flowToScreenPosition: (position) => {
			if (!store.domNode) return position;
			let { x, y, zoom } = store.viewport, { x: domX, y: domY } = store.domNode.getBoundingClientRect(), rendererPosition = rendererPointToPoint(position, [
				x,
				y,
				zoom
			]);
			return {
				x: rendererPosition.x + domX,
				y: rendererPosition.y + domY
			};
		},
		zoomBy
	};
}, STEP = .5 / 2, rectsEqual = (a, b) => a === b || !!a && !!b && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height, rectsOverlap = (a, b) => a.x <= b.x + b.width && a.x + a.width >= b.x && a.y <= b.y + b.height && a.y + a.height >= b.y, createCullingViewport = (source) => createMemo(() => {
	let { width, height } = source;
	if (!width || !height) return null;
	let [tx, ty, zoom] = source.transform, zoomBucket = 2 ** Math.floor(Math.log2(zoom)), bucketWidth = width / zoomBucket, bucketHeight = height / zoomBucket, stepX = bucketWidth * STEP, stepY = bucketHeight * STEP, centerX = (width / 2 - tx) / zoom, centerY = (height / 2 - ty) / zoom, quantizedX = Math.round(centerX / stepX) * stepX, quantizedY = Math.round(centerY / stepY) * stepY, halfWidth = bucketWidth * 1, halfHeight = bucketHeight * 1;
	return {
		x: quantizedX - halfWidth,
		y: quantizedY - halfHeight,
		width: 2 * halfWidth,
		height: 2 * halfHeight
	};
}, { equals: rectsEqual }), isNodeCulled = (node, cullingViewport) => {
	if (!cullingViewport || node.selected || node.cullable === !1) return !1;
	let { width, height } = node.measured;
	if (!width || !height || !node.internals.handleBounds) return !1;
	let { x, y } = node.internals.positionAbsolute;
	return !rectsOverlap({
		x,
		y,
		width,
		height
	}, cullingViewport);
}, isEdgeCulled = (row, cullingViewport) => {
	if (!cullingViewport || row.selected || row.cullable === !1) return !1;
	let x = Math.min(row.sourceX, row.targetX), y = Math.min(row.sourceY, row.targetY);
	return !rectsOverlap({
		x,
		y,
		width: Math.abs(row.sourceX - row.targetX),
		height: Math.abs(row.sourceY - row.targetY)
	}, cullingViewport);
}, getDefaultFlowStateProps = () => ({
	id: "1",
	nodeOrigin: [0, 0],
	nodeExtent: infiniteExtent,
	defaultEdgeOptions: {},
	colorMode: "system",
	colorModeSSR: "light",
	connectionMode: "strict",
	connectionLineType: "default",
	connectionRadius: 20,
	nodeDragThreshold: 1,
	minZoom: .5,
	maxZoom: 2,
	selectionMode: "partial",
	fitView: !1,
	noPanClass: "nopan",
	noDragClass: "nodrag",
	noWheelClass: "nowheel",
	autoPanOnNodeDrag: !0,
	autoPanOnConnect: !0,
	autoPanOnNodeFocus: !0,
	autoPanOnSelection: !0,
	autoPanSpeed: 15,
	elevateEdgesOnSelect: !0,
	nodesDraggable: !0,
	nodesConnectable: !0,
	nodesFocusable: !0,
	edgesFocusable: !0,
	elementsSelectable: !0,
	selectNodesOnDrag: !0,
	elevateNodesOnSelect: !0,
	zIndexMode: "basic",
	onlyRenderVisibleElements: !1,
	disableKeyboardA11y: !1,
	defaultMarkerColor: "#b1b1b7",
	ariaLiveMessage: "",
	style: {},
	isValidConnection: (() => !0),
	onFlowError: createDevWarn("Solid Flow", "https://solidflow.dev/")
});
//#endregion
//#region src/core/facades.ts
/**
* A read-only `Map` view over an id-keyed record projection, for
* @xyflow/system interop: system helpers take `Map`s, our reactive lookups
* are records. Every read passes through to the record, so reads inside
* tracked scopes subscribe normally — `get`/`has` check with `in` first,
* which also subscribes while the key is still absent (the projection
* absent-key footgun), and `size`/iteration read the key set structurally.
*
* The mutating `Map` methods throw: writes belong to the roots the
* projection derives from.
*/
var RecordMapFacade = class {
	#record;
	constructor(record) {
		this.#record = record;
	}
	get(key) {
		let value = this.#record[key];
		return value === void 0 ? key in this.#record ? this.#record[key] : void 0 : value;
	}
	has(key) {
		return key in this.#record;
	}
	get size() {
		return Object.keys(this.#record).length;
	}
	*keys() {
		yield* Object.keys(this.#record);
	}
	*values() {
		for (let key of Object.keys(this.#record)) yield this.#record[key];
	}
	*entries() {
		for (let key of Object.keys(this.#record)) yield [key, this.#record[key]];
	}
	[Symbol.iterator]() {
		return this.entries();
	}
	forEach(callback, thisArg) {
		for (let [key, value] of this.entries()) callback.call(thisArg, value, key, this);
	}
	[Symbol.toStringTag] = "RecordMapFacade";
	set() {
		throw Error("RecordMapFacade is read-only; write to the projection's source roots");
	}
	getOrInsert() {
		throw Error("RecordMapFacade is read-only; write to the projection's source roots");
	}
	getOrInsertComputed() {
		throw Error("RecordMapFacade is read-only; write to the projection's source roots");
	}
	delete() {
		throw Error("RecordMapFacade is read-only; write to the projection's source roots");
	}
	clear() {
		throw Error("RecordMapFacade is read-only; write to the projection's source roots");
	}
};
//#endregion
//#region src/core/measurementIngest.ts
/**
* The measurement ingest lifecycle (WP3): everything that flows FROM the DOM
* measuring pass INTO the data graph, plus the garbage collection that keeps
* the measurements root aligned with graph membership. The DOM side (resize
* observers, the idle-scheduled measuring pass) lives in createSolidFlow;
* headless usage never calls these.
*/
const createMeasurementIngest = ({ setMeasurementsStore, setNodesStore, nodes }) => (createEffect(() => new Set(nodes().map((n) => n.id)), (currentIds) => {
	setMeasurementsStore((draft) => {
		for (let id of Object.keys(draft)) currentIds.has(id) || delete draft[id];
	});
}), {
	applyMeasurementWrites: (writes) => {
		setMeasurementsStore((draft) => {
			for (let write of writes) if (write.hidden) {
				let entry = draft[write.id];
				entry && (entry.handleBounds = void 0);
			} else draft[write.id] = {
				measured: write.measured,
				handleBounds: write.handleBounds
			};
		});
	},
	applyNodeChanges: (changes) => {
		changes.length !== 0 && setNodesStore((nodes) => {
			let nodeById = new Map(nodes.map((node) => [node.id, node]));
			for (let change of changes) {
				let node = nodeById.get(change.id);
				if (node) switch (change.type) {
					case "dimensions":
						change.setAttributes && (node.width = change.dimensions?.width ?? node.width, node.height = change.dimensions?.height ?? node.height), node.measured = {
							...node.measured,
							...change.dimensions
						};
						break;
					case "position": node.position = change.position ?? node.position;
				}
			}
		});
	}
}), createOverlayRelease = ({ selectionOverlay, setSelectionOverlay, dragOverlay, setDragOverlay, nodeLookup, hasEdge }) => {
	let releaseTimer;
	onCleanup(() => clearTimeout(releaseTimer)), createEffect(() => {
		let candidates = [];
		for (let id in selectionOverlay.nodes) {
			let entry = selectionOverlay.nodes[id];
			!!entry.row.selected === entry.value && candidates.push(["nodes", id]);
		}
		for (let id in selectionOverlay.edges) {
			let entry = selectionOverlay.edges[id];
			!!entry.row.selected === entry.value && candidates.push(["edges", id]);
		}
		let dragCandidates = [];
		for (let id in dragOverlay) {
			let entry = dragOverlay[id];
			!entry.dragging && entry.row.position.x === entry.position.x && entry.row.position.y === entry.position.y && dragCandidates.push(id);
		}
		return {
			candidates,
			dragCandidates
		};
	}, ({ candidates, dragCandidates }) => {
		(candidates.length || dragCandidates.length) && (clearTimeout(releaseTimer), releaseTimer = setTimeout(() => {
			let confirmed = candidates.filter(([kind, id]) => {
				let entry = selectionOverlay[kind][id];
				return entry !== void 0 && !!entry.row.selected === entry.value;
			}), dragConfirmed = dragCandidates.filter((id) => {
				let entry = dragOverlay[id];
				return entry !== void 0 && !entry.dragging && entry.row.position.x === entry.position.x && entry.row.position.y === entry.position.y;
			}), goneSel = [];
			for (let id in selectionOverlay.nodes) nodeLookup.has(id) || goneSel.push(["nodes", id]);
			for (let id in selectionOverlay.edges) hasEdge(id) || goneSel.push(["edges", id]);
			let goneDrag = [];
			for (let id in dragOverlay) nodeLookup.has(id) || goneDrag.push(id);
			(confirmed.length || goneSel.length) && setSelectionOverlay((draft) => {
				for (let [kind, id] of [...confirmed, ...goneSel]) delete draft[kind][id];
			}), (dragConfirmed.length || goneDrag.length) && setDragOverlay((draft) => {
				for (let id of [...dragConfirmed, ...goneDrag]) delete draft[id];
			}), (confirmed.length || dragConfirmed.length || goneSel.length || goneDrag.length) && flush();
		}, 0));
	});
}, connectionKey = (nodeId, type, handleId) => `${nodeId}${type ? handleId ? `-${type}-${handleId}` : `-${type}` : ""}`, pairKey = (aNode, aHandle, bNode, bHandle) => `${aNode}-${aHandle}--${bNode}-${bHandle}`, createConnections = (source) => createProjection(() => {
	let out = {}, add = (key, entry, connection) => {
		(out[key] ??= {})[entry] = connection;
	};
	for (let edge of source.edges) {
		let sourceHandle = edge.sourceHandle ?? null, targetHandle = edge.targetHandle ?? null, connection = {
			edgeId: edge.id,
			source: edge.source,
			target: edge.target,
			sourceHandle,
			targetHandle
		}, sourceKey = pairKey(edge.source, sourceHandle, edge.target, targetHandle), targetKey = pairKey(edge.target, targetHandle, edge.source, sourceHandle);
		add(edge.source, targetKey, connection), add(connectionKey(edge.source, "source"), targetKey, connection), sourceHandle && add(connectionKey(edge.source, "source", sourceHandle), targetKey, connection), add(edge.target, sourceKey, connection), add(connectionKey(edge.target, "target"), sourceKey, connection), targetHandle && add(connectionKey(edge.target, "target", targetHandle), sourceKey, connection);
	}
	return out;
}, {}, { key: "id" }), createEdgeLookup = (source) => createProjection(() => {
	let out = {};
	for (let edge of source.edges) out[edge.id] = edge;
	return out;
}, {}, { key: "id" }), createRowRecordProjection = (rowStores) => {
	let assigned = /* @__PURE__ */ new Map();
	return createProjection((draft) => {
		let seen = /* @__PURE__ */ new Set();
		for (let { id, store } of rowStores()) {
			let row = store.row;
			row && (seen.add(id), assigned.get(id) !== row && (assigned.set(id, row), draft[id] = row));
		}
		for (let id of assigned.keys()) seen.has(id) || (assigned.delete(id), delete draft[id]);
	}, {}, {
		key: null,
		shallow: !0
	});
};
function isManualZIndexMode(zIndexMode) {
	return zIndexMode === "manual";
}
function calculateZ(node, selectedNodeZ, zIndexMode) {
	let zIndex = isNumeric(node.zIndex) ? node.zIndex : 0;
	return isManualZIndexMode(zIndexMode) ? zIndex : zIndex + (node.selected ? selectedNodeZ : 0);
}
const EMPTY_AUTO_INDEX = /* @__PURE__ */ new Map(), createInternalNodes = (source) => {
	let autoIndex = createMemo(() => {
		if (source.zIndexMode !== "auto") return EMPTY_AUTO_INDEX;
		let index = /* @__PURE__ */ new Map(), rootIds = /* @__PURE__ */ new Set();
		for (let node of source.nodes) node.parentId ? rootIds.has(node.parentId) && !index.has(node.parentId) && index.set(node.parentId, index.size + 1) : rootIds.add(node.id);
		return index;
	}), entryById = /* @__PURE__ */ new Map(), rowStores = mapArray(() => source.nodes, (userNodeAccessor, index) => {
		let id = userNodeAccessor().id, store = createProjection(() => {
			let userNode = userNodeAccessor(), { nodeOrigin, nodeExtent, zIndexMode } = source, selectedNodeZ = source.elevateNodesOnSelect && !isManualZIndexMode(zIndexMode) ? 1e3 : 0, measurement = userNode.id in source.measurements ? source.measurements[userNode.id] : void 0, selected = joinSelected(userNode.selected, overlayEntry(source.selectionOverlay, userNode.id)), dragOverlayEntry = dragEntry(source.dragOverlay, userNode.id), position = joinPosition(userNode.position, dragOverlayEntry), dragging = joinDragging(userNode.dragging, dragOverlayEntry), measured = {
				width: measurement?.measured.width ?? userNode.measured?.width,
				height: measurement?.measured.height ?? userNode.measured?.height
			}, dimensions = getNodeDimensions({
				measured,
				width: userNode.width,
				height: userNode.height,
				initialWidth: userNode.initialWidth,
				initialHeight: userNode.initialHeight
			}), rootParentIndex = autoIndex().get(userNode.id), row = {
				...userNode,
				selected,
				position,
				dragging,
				measured,
				internals: {
					positionAbsolute: clampPosition(getNodePositionWithOrigin({
						...userNode,
						position,
						measured
					}, nodeOrigin), isCoordinateExtent(userNode.extent) ? userNode.extent : nodeExtent, dimensions),
					handleBounds: measurement?.handleBounds,
					z: calculateZ({
						zIndex: userNode.zIndex,
						selected
					}, selectedNodeZ, zIndexMode) + (rootParentIndex === void 0 ? 0 : rootParentIndex * 10),
					...rootParentIndex === void 0 ? {} : { rootParentIndex },
					userNode
				}
			};
			if (userNode.parentId) {
				let parentEntry = entryById.get(userNode.parentId);
				if (parentEntry && parentEntry.index() < index()) {
					let { x, y, z } = calculateChildXYZ(row, parentEntry.store.row, nodeOrigin, nodeExtent, selectedNodeZ, zIndexMode);
					row.internals.positionAbsolute = {
						x,
						y
					}, row.internals.z = z;
				} else source.nodes.length, emitFlowError(source.onError, "parent-missing", `Parent node ${userNode.parentId} not found. Please make sure that parent nodes are in front of their child nodes in the nodes array.`);
			}
			return { row };
		}, {}, { key: "id" }), entry = {
			store,
			index
		};
		return entryById.set(id, entry), onCleanup(() => {
			entryById.get(id) === entry && entryById.delete(id);
		}), {
			id,
			store
		};
	}, { keyed: (userNode) => userNode.id });
	return createRowRecordProjection(rowStores);
};
function calculateChildXYZ(childNode, parentNode, nodeOrigin, nodeExtent, selectedNodeZ, zIndexMode) {
	let { x: parentX, y: parentY } = parentNode.internals.positionAbsolute, childDimensions = getNodeDimensions(childNode), positionWithOrigin = getNodePositionWithOrigin(childNode, nodeOrigin), clampedPosition = isCoordinateExtent(childNode.extent) ? clampPosition(positionWithOrigin, childNode.extent, childDimensions) : positionWithOrigin, absolutePosition = clampPosition({
		x: parentX + clampedPosition.x,
		y: parentY + clampedPosition.y
	}, nodeExtent, childDimensions);
	childNode.extent === "parent" && (absolutePosition = clampPositionToParent(absolutePosition, childDimensions, parentNode));
	let childZ = calculateZ(childNode, selectedNodeZ, zIndexMode), parentZ = parentNode.internals.z ?? 0;
	return {
		x: absolutePosition.x,
		y: absolutePosition.y,
		z: parentZ >= childZ ? parentZ + 1 : childZ
	};
}
//#endregion
//#region src/core/projections/layoutedEdges.ts
/**
* Edge layout join: user edges × internal nodes → screen-space edge geometry,
* decomposed into SUB-STORES (spike 13): each edge is its own keyed
* projection holding `{ row }` — the layouted row, or null while the edge
* produces none (missing/unready endpoints, culled) — and the public record
* is a SHALLOW projection holding the PRESENT rows' proxies by reference.
*
* Reads chain: `record[id].sourceX` goes through the shallow slot into the
* edge's own store, so every materialized leaf signal hangs off its EDGE's
* computed (defeating rc.1's per-update companion walk — see
* internalNodes.ts). The edge projection tracks exactly what the join reads —
* the edge's props and its endpoints' geometry leaves through nodeLookup
* (which chains into the node row stores) — so one node move re-runs only
* the adjacent edges' projections; the record computed re-runs only when
* membership or presence changes.
*
* The viewport never participates here: #15 culling is CSS-only, applied by
* EdgeWrapper from the quantized culling viewport — panning must not touch
* edge rows, and the record's membership must not change as edges cross the
* viewport (no mount/unmount churn).
*
* Rows whose endpoints are missing or unmeasured simply drop out of the
* record — the same "no entry" contract the ReactiveMap pipeline had.
*/
const createLayoutedEdges = (source) => {
	let rowStores = mapArray(() => source.edges, (edgeAccessor) => ({
		id: edgeAccessor().id,
		store: createProjection(() => {
			let edge = edgeAccessor();
			return { row: buildRow(source, edge) };
		}, { row: null }, { key: "id" })
	}), { keyed: (edge) => edge.id });
	return createRowRecordProjection(rowStores);
}, buildRow = (source, edge) => {
	let sourceNode = source.nodeLookup.get(edge.source), targetNode = source.nodeLookup.get(edge.target);
	if (!sourceNode || !targetNode) return null;
	let edgePosition = getEdgePosition({
		id: edge.id,
		sourceNode,
		targetNode,
		sourceHandle: edge.sourceHandle || null,
		targetHandle: edge.targetHandle || null,
		connectionMode: source.connectionMode,
		onError: source.onError
	});
	if (!edgePosition) return null;
	let selected = joinSelected(edge.selected, overlayEntry(source.selectionOverlay, edge.id));
	return {
		...source.defaultEdgeOptions,
		...edge,
		selected,
		...edgePosition,
		zIndex: getElevatedEdgeZIndex({
			selected,
			zIndex: edge.zIndex ?? source.defaultEdgeOptions.zIndex,
			sourceNode,
			targetNode,
			elevateOnSelect: source.elevateEdgesOnSelect,
			zIndexMode: source.zIndexMode
		}),
		sourceNode,
		targetNode,
		edge
	};
}, createParentIds = (source) => createProjection(() => {
	let out = {};
	for (let node of source.nodes) node.parentId && (out[node.parentId] = !0);
	return out;
}, {}, { key: "id" }), createSelectedIds = (rows, overlay) => {
	let rowStores = createMemo(mapArray(rows, (row) => {
		let store = createProjection((draft) => {
			draft.row = joinSelected(row.selected, overlayEntry(overlay(), row.id)) ? { id: row.id } : null;
		}, { row: null }, { key: null });
		return onCleanup(() => void 0), {
			id: row.id,
			store
		};
	}));
	return createRowRecordProjection(rowStores);
}, createSeededGraphStores = (props, config) => {
	props.nodes !== void 0 && props.defaultNodes, props.edges !== void 0 && props.defaultEdges;
	let nodeDefaultsPending = props.nodes === void 0 && isPending(() => props.defaultNodes?.length), edgeDefaultsPending = props.edges === void 0 && isPending(() => props.defaultEdges?.length), [nodesStore, setNodesStore] = createStore(props.nodes ?? (nodeDefaultsPending ? [] : [...props.defaultNodes ?? []])), [edgesStore, setEdgesStore] = createStore(props.edges ?? (edgeDefaultsPending ? [] : [...props.defaultEdges ?? []])), nodeSeedAdopted = props.nodes !== void 0 || !nodeDefaultsPending && props.defaultNodes !== void 0, edgeSeedAdopted = props.edges !== void 0 || !edgeDefaultsPending && props.defaultEdges !== void 0;
	return createEffect(() => {
		let next = config().nodes;
		if (next) for (let node of next);
		return { next };
	}, ({ next }) => {
		next && (nodeSeedAdopted = !0, setNodesStore(() => next));
	}, { defer: !0 }), createEffect(() => {
		let next = config().edges;
		if (next) for (let edge of next);
		return { next };
	}, ({ next }) => {
		next && (edgeSeedAdopted = !0, setEdgesStore(() => next));
	}, { defer: !0 }), createEffect(() => {
		let defaultNodes = config().defaultNodes;
		return defaultNodes ? [...defaultNodes] : void 0;
	}, (seed) => {
		seed && !nodeSeedAdopted && untrack(() => config().nodes) === void 0 && (nodeSeedAdopted = !0, setNodesStore(() => seed));
	}), createEffect(() => {
		let defaultEdges = config().defaultEdges;
		return defaultEdges ? [...defaultEdges] : void 0;
	}, (seed) => {
		seed && !edgeSeedAdopted && untrack(() => config().edges) === void 0 && (edgeSeedAdopted = !0, setEdgesStore(() => seed));
	}), {
		nodesStore,
		setNodesStore,
		edgesStore,
		setEdgesStore
	};
}, getInitialViewport = (fitView, initialViewport, width, height, nodeLookup) => {
	if (fitView && !initialViewport && width && height) {
		let bounds = getInternalNodesBounds(nodeLookup, { filter: (node) => !(!node.width && !node.initialWidth || !node.height && !node.initialHeight) });
		return getViewportForBounds$1(bounds, width, height, .5, 2, .1);
	}
	return initialViewport ?? {
		x: 0,
		y: 0,
		zoom: 1
	};
}, createFlowState = (props, injections = {}) => {
	let _props = merge(getDefaultFlowStateProps(), props), initialNodeTypes = injections.initialNodeTypes ?? {}, initialEdgeTypes = injections.initialEdgeTypes ?? {}, prefersDark = injections.prefersDark ?? (() => _props.colorModeSSR === "dark"), [config, setConfig] = createSignal(_props), ariaLabelConfig = createMemo(() => mergeAriaLabelConfig(config().ariaLabelConfig)), [ariaLiveMessage, setAriaLiveMessage] = createSignal(() => config().ariaLiveMessage), [clickConnectStartHandle, setClickConnectStartHandle] = createSignal(void 0), [connection, setConnection] = createSignal(initialConnection), [domNode, setDomNode] = createSignal(null), [dragging, setDragging] = createSignal(!1), [elementsSelectable, setElementsSelectable] = createSignal(() => config().elementsSelectable), [height, setHeight] = createSignal(() => config().height), minZoom = createMemo(() => config().minZoom), maxZoom = createMemo(() => config().maxZoom), [nodesConnectable, setNodesConnectable] = createSignal(() => config().nodesConnectable), [nodesDraggable, setNodesDraggable] = createSignal(() => config().nodesDraggable), [panZoom, setPanZoom] = createSignal(null), [selectionRect, setSelectionRect] = createSignal(), [selectionRectMode, setSelectionRectMode] = createSignal(), [snapGrid, setSnapGrid] = createSignal(() => config().snapGrid), translateExtent = createMemo(() => config().translateExtent ?? infiniteExtent), [width, setWidth] = createSignal(() => config().width), [selectionKeyPressed, setSelectionKeyPressed] = createSignal(!1), [multiselectionKeyPressed, setMultiselectionKeyPressed] = createSignal(!1), [deleteKeyPressed, setDeleteKeyPressed] = createSignal(!1), [panActivationKeyPressed, setPanActivationKeyPressed] = createSignal(!1), [zoomActivationKeyPressed, setZoomActivationKeyPressed] = createSignal(!1), { nodesStore, setNodesStore, edgesStore, setEdgesStore } = createSeededGraphStores(props, config), [measurementsStore, setMeasurementsStore] = createStore({}), [selectionOverlay, setSelectionOverlay] = createStore({
		nodes: {},
		edges: {}
	}), [dragOverlay, setDragOverlay] = createStore({}), internalNodes = createInternalNodes({
		get nodes() {
			return nodesStore;
		},
		get measurements() {
			return measurementsStore;
		},
		get selectionOverlay() {
			return selectionOverlay.nodes;
		},
		get dragOverlay() {
			return dragOverlay;
		},
		get nodeOrigin() {
			return config().nodeOrigin;
		},
		get nodeExtent() {
			return config().nodeExtent;
		},
		get elevateNodesOnSelect() {
			return config().elevateNodesOnSelect;
		},
		get zIndexMode() {
			return config().zIndexMode;
		},
		get onError() {
			return config().onFlowError;
		}
	}), nodeLookup = new RecordMapFacade(internalNodes), initialViewport = getInitialViewport(_props.fitView, _props.initialViewport, _props.width ?? 0, _props.height ?? 0, nodeLookup), [viewportStore, setViewportStore] = createStore(_props.viewport ?? initialViewport);
	createEffect(() => config().viewport, (next) => {
		next && setViewportStore(() => next);
	}, { defer: !0 });
	let transform = createMemo(() => [
		viewportStore.x,
		viewportStore.y,
		viewportStore.zoom
	]), nodesInitialized = createMemo(() => {
		let nodes = nodesStore;
		if (nodes.length === 0) return !1;
		for (let node of nodes) {
			if (node.hidden) continue;
			let measurement = node.id in measurementsStore ? measurementsStore[node.id] : void 0, width = measurement?.measured.width ?? node.measured?.width, height = measurement?.measured.height ?? node.measured?.height;
			if (width === void 0 || height === void 0) return !1;
		}
		return !0;
	}), resolvedColorMode = createMemo(() => {
		let mode = config().colorMode;
		return mode === "system" ? prefersDark() ? "dark" : "light" : mode;
	}), projectedConnection = createMemo(() => {
		let state = connection();
		return state.inProgress ? {
			...state,
			to: pointToRendererPoint(state.to, transform())
		} : state;
	}), connectionFromHandle = createMemo(() => connection().fromHandle ?? null, { equals: (a, b) => a === b || !!a && !!b && a.nodeId === b.nodeId && a.type === b.type && a.id === b.id }), connectionTargetByHandle = createProjection((draft) => {
		let state = connection(), toHandle = state.inProgress ? state.toHandle : null, key = toHandle ? connectionKey(toHandle.nodeId, toHandle.type, toHandle.id ?? null) : null;
		for (let existing of Object.keys(draft)) existing !== key && delete draft[existing];
		key && (draft[key] = state.isValid ? "valid" : "invalid");
	}, {}, { key: null }), connectionOriginByHandle = createProjection((draft) => {
		let fromHandle = connection().fromHandle ?? clickConnectStartHandle(), fromKey = fromHandle ? connectionKey(fromHandle.nodeId, fromHandle.type, fromHandle.id ?? null) : null, siblingKey = fromHandle ? connectionKey(fromHandle.nodeId, fromHandle.type === "source" ? "target" : "source", fromHandle.id ?? null) : null;
		for (let existing of Object.keys(draft)) existing !== fromKey && existing !== siblingKey && delete draft[existing];
		fromKey && (draft[fromKey] = "from"), siblingKey && (draft[siblingKey] = "excluded");
	}, {}, { key: null }), mergedNodeTypes = createMemo(() => ({
		...initialNodeTypes,
		...config().nodeTypes
	})), mergedEdgeTypes = createMemo(() => ({
		...initialEdgeTypes,
		...config().edgeTypes
	})), selectedNodeIds = createSelectedIds(() => nodesStore, () => selectionOverlay.nodes), selectedEdgeIds = createSelectedIds(() => edgesStore, () => selectionOverlay.edges), selectedNodesView = createMemo(() => Object.keys(selectedNodeIds).map((id) => nodeLookup.get(id)?.internals.userNode).filter((node) => node !== void 0)), selectedEdgesView = createMemo(() => Object.keys(selectedEdgeIds).map((id) => edgeLookup[id]).filter((edge) => edge !== void 0)), store = merge({
		width: 0,
		height: 0
	}, config, {
		get ariaLabelConfig() {
			return ariaLabelConfig();
		},
		get ariaLiveMessage() {
			return ariaLiveMessage();
		},
		get clickConnectStartHandle() {
			return clickConnectStartHandle();
		},
		get colorMode() {
			return resolvedColorMode();
		},
		get connection() {
			return projectedConnection();
		},
		get connectionFromHandle() {
			return connectionFromHandle();
		},
		get connectionTargetByHandle() {
			return connectionTargetByHandle;
		},
		get connectionOriginByHandle() {
			return connectionOriginByHandle;
		},
		get domNode() {
			return domNode();
		},
		get dragging() {
			return dragging();
		},
		get edgeTypes() {
			return mergedEdgeTypes();
		},
		get elementsSelectable() {
			return elementsSelectable();
		},
		get height() {
			return height();
		},
		get lib() {
			return "solid";
		},
		get onError() {
			return config().onFlowError;
		},
		get maxZoom() {
			return maxZoom();
		},
		get minZoom() {
			return minZoom();
		},
		get edges() {
			return edgesStore;
		},
		get nodes() {
			return nodesStore;
		},
		get nodesConnectable() {
			return nodesConnectable();
		},
		get nodesDraggable() {
			return nodesDraggable();
		},
		get nodeTypes() {
			return mergedNodeTypes();
		},
		get panZoom() {
			return panZoom();
		},
		get selectedNodes() {
			return selectedNodesView();
		},
		get selectedEdges() {
			return selectedEdgesView();
		},
		get selectionRect() {
			return selectionRect();
		},
		get selectionRectMode() {
			return selectionRectMode();
		},
		get snapGrid() {
			return snapGrid();
		},
		get viewport() {
			return viewportStore;
		},
		get viewportInitialized() {
			return panZoom() !== null;
		},
		get nodesInitialized() {
			return nodesInitialized();
		},
		get visibleEdgeIds() {
			return visibleEdgeIds();
		},
		get visibleNodeIds() {
			return visibleNodeIds();
		},
		get cullingViewport() {
			return cullingViewport();
		},
		get transform() {
			return transform();
		},
		get translateExtent() {
			return translateExtent();
		},
		get width() {
			return width();
		},
		get selectionKeyPressed() {
			return selectionKeyPressed();
		},
		get multiselectionKeyPressed() {
			return multiselectionKeyPressed();
		},
		get deleteKeyPressed() {
			return deleteKeyPressed();
		},
		get panActivationKeyPressed() {
			return panActivationKeyPressed();
		},
		get zoomActivationKeyPressed() {
			return zoomActivationKeyPressed();
		}
	}), cullingViewport = createCullingViewport({
		get width() {
			return store.width;
		},
		get height() {
			return store.height;
		},
		get transform() {
			return transform();
		}
	}), visibleNodeIds = createMemo(() => nodesStore.map((node) => node.id)), parentIds = createParentIds({ get nodes() {
		return store.nodes;
	} }), edgeLookup = createEdgeLookup({ get edges() {
		return store.edges;
	} }), connections = createConnections({ get edges() {
		return store.edges;
	} }), layoutedEdges = createLayoutedEdges({
		get selectionOverlay() {
			return selectionOverlay.edges;
		},
		get edges() {
			return store.edges;
		},
		get connectionMode() {
			return store.connectionMode;
		},
		get defaultEdgeOptions() {
			return store.defaultEdgeOptions;
		},
		get elevateEdgesOnSelect() {
			return store.elevateEdgesOnSelect;
		},
		get zIndexMode() {
			return store.zIndexMode;
		},
		get onError() {
			return store.onError;
		},
		nodeLookup
	}), visibleEdgeIds = createMemo(() => edgesStore.map((edge) => edge.id)), getLayoutedEdge = (id) => id in layoutedEdges ? layoutedEdges[id] : void 0, viewportCommands = createViewportCommands({
		store,
		nodeLookup,
		defaultFitViewOptions: () => config().fitViewOptions
	}), { fitView, zoomIn, zoomOut, setCenter, panBy } = viewportCommands, resetStoreValues = () => {
		setDragging(!1), setSelectionRect(void 0), setSelectionRectMode(void 0), setSelectionKeyPressed(!1), setMultiselectionKeyPressed(!1), setDeleteKeyPressed(!1), setPanActivationKeyPressed(!1), setZoomActivationKeyPressed(!1), setConnection({ ...initialConnection }), setClickConnectStartHandle(void 0), setViewportStore(() => config().initialViewport ?? {
			x: 0,
			y: 0,
			zoom: 1
		}), setAriaLiveMessage(""), setSnapGrid(void 0);
	}, elementCommands = createElementCommands({
		store,
		setNodesStore,
		setEdgesStore,
		setSelectionOverlay,
		setDragOverlay,
		nodeLookup,
		controlledEdges: () => untrack(() => config().edges) !== void 0
	}), { addEdge, updateNodePositions } = elementCommands, initialFitViewApplied = !1, initialNodesMeasured = !1, applyInitialFitView = (initialFitView) => {
		initialFitViewApplied = !initialFitView;
	}, tryInitialFitView = () => {
		!initialFitViewApplied && initialNodesMeasured && untrack(() => store.panZoom && store.width && store.height) && (initialFitViewApplied = !0, untrack(() => fitView()));
	}, { applyMeasurementWrites, applyNodeChanges } = createMeasurementIngest({
		setMeasurementsStore,
		setNodesStore,
		nodes: () => nodesStore
	}), markInitialNodesMeasured = () => {
		initialNodesMeasured = !0, tryInitialFitView();
	}, requestMeasure = () => {}, setMeasureRequester = (fn) => {
		requestMeasure = fn;
	}, stableSetViewport = (viewport) => setViewportStore(() => viewport), { unselectNodesAndEdges, addSelectedNodes, addSelectedEdges, handleNodeSelection, handleEdgeSelection, moveSelectedNodes, applySelectionSets } = createSelectionCommands({
		store,
		setNodesStore,
		setEdgesStore,
		setSelectionRect,
		setSelectionRectMode,
		nodeLookup,
		edgeLookup,
		updateNodePositions,
		selectionOverlay,
		setSelectionOverlay
	});
	createOverlayRelease({
		selectionOverlay,
		setSelectionOverlay,
		dragOverlay,
		setDragOverlay,
		nodeLookup,
		hasEdge: (id) => id in edgeLookup
	});
	let cancelConnection = () => {
		setConnection({ ...initialConnection });
	}, reset = () => {
		resetStoreValues(), unselectNodesAndEdges();
	}, flow = {
		get nodes() {
			return store.nodes;
		},
		get edges() {
			return store.edges;
		},
		get internalNodes() {
			return internalNodes;
		},
		get layoutedEdges() {
			return layoutedEdges;
		},
		get connections() {
			return connections;
		},
		selection: {
			get nodes() {
				return store.selectedNodes;
			},
			get edges() {
				return store.selectedEdges;
			}
		},
		get nodesInitialized() {
			return store.nodesInitialized;
		},
		get viewportInitialized() {
			return store.viewportInitialized;
		},
		get viewport() {
			return store.viewport;
		},
		get width() {
			return store.width;
		},
		get height() {
			return store.height;
		},
		get colorMode() {
			return store.colorMode;
		},
		get connection() {
			return store.connection;
		},
		get dragging() {
			return store.dragging;
		},
		get minZoom() {
			return store.minZoom;
		},
		get maxZoom() {
			return store.maxZoom;
		},
		get nodesDraggable() {
			return store.nodesDraggable;
		},
		get nodesConnectable() {
			return store.nodesConnectable;
		},
		get elementsSelectable() {
			return store.elementsSelectable;
		},
		get snapGrid() {
			return store.snapGrid;
		}
	}, geometryCommands = createGeometryCommands({
		store,
		nodeLookup
	}), commands = {
		fitView: viewportCommands.fitView,
		fitBounds: viewportCommands.fitBounds,
		zoomIn,
		zoomOut,
		setZoom: viewportCommands.setZoom,
		setCenter,
		setViewport: viewportCommands.setViewport,
		panBy,
		screenToFlowPosition: viewportCommands.screenToFlowPosition,
		flowToScreenPosition: viewportCommands.flowToScreenPosition,
		addNodes: elementCommands.addNodes,
		addEdges: elementCommands.addEdges,
		setNodes: setNodesStore,
		setEdges: setEdgesStore,
		updateNode: elementCommands.updateNode,
		updateNodeData: elementCommands.updateNodeData,
		updateEdge: elementCommands.updateEdge,
		deleteElements: elementCommands.deleteElements,
		getIntersectingNodes: geometryCommands.getIntersectingNodes,
		isNodeIntersecting: geometryCommands.isNodeIntersecting,
		getNodesBounds: geometryCommands.getNodesBounds,
		updateNodeInternals: (id) => {
			let updateIds = Array.isArray(id) ? id : [id], updates = [];
			for (let updateId of updateIds) {
				let nodeElement = store.domNode?.querySelector(`.solid-flow__node[data-id="${updateId}"]`);
				nodeElement && updates.push([updateId, {
					id: updateId,
					nodeElement,
					force: !0
				}]);
			}
			requestMeasure(updates);
		},
		toObject: elementCommands.toObject
	};
	return createEffect(() => !!(width() && height() && panZoom()), (ready) => {
		ready && tryInitialFitView();
	}), createEffect(() => ({
		panZoom: store.panZoom,
		viewport: {
			x: store.viewport.x,
			y: store.viewport.y,
			zoom: store.viewport.zoom
		}
	}), ({ panZoom, viewport }) => {
		panZoom?.syncViewport(viewport);
	}), createEffect(() => ({
		panZoom: panZoom(),
		extent: [store.minZoom, store.maxZoom]
	}), ({ panZoom, extent }) => {
		panZoom?.setScaleExtent(extent);
	}), createEffect(() => ({
		panZoom: panZoom(),
		extent: store.translateExtent
	}), ({ panZoom, extent }) => {
		panZoom?.setTranslateExtent(extent);
	}), {
		store,
		flow,
		commands,
		internalNodes,
		layoutedEdges,
		nodeLookup,
		edgeLookup,
		parentIds,
		connections,
		actions: {
			getLayoutedEdge,
			applyInitialFitView,
			applyMeasurementWrites,
			applyNodeChanges,
			markInitialNodesMeasured,
			setMeasureRequester,
			setAriaLiveMessage,
			setClickConnectStartHandle,
			setConfig,
			setConnection,
			setDeleteKeyPressed,
			setDomNode,
			setDragging,
			setEdges: setEdgesStore,
			setElementsSelectable,
			setHeight,
			setMultiselectionKeyPressed,
			setNodes: setNodesStore,
			setNodesConnectable,
			setNodesDraggable,
			setPanActivationKeyPressed,
			setPanZoom,
			setSelectionKeyPressed,
			setSelectionRect,
			setSelectionRectMode,
			setViewport: stableSetViewport,
			setWidth,
			setZoomActivationKeyPressed,
			addEdge,
			updateNodePositions,
			zoomIn,
			zoomOut,
			fitView,
			setCenter,
			unselectNodesAndEdges,
			addSelectedNodes,
			applySelectionSets,
			addSelectedEdges,
			handleNodeSelection,
			handleEdgeSelection,
			moveSelectedNodes,
			panBy,
			cancelConnection,
			reset
		}
	};
}, createSeededStore = (input) => {
	let [store, setStore] = typeof input == "function" ? createStore(input, []) : createStore(input);
	return [store, setStore];
};
function createSeededOptimisticStore(input) {
	let [store, setStore] = typeof input == "function" ? createOptimisticStore(input, []) : createOptimisticStore(input);
	return [store, setStore];
}
//#endregion
//#region src/core/stores/createEdgeStore.ts
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
const createEdgeStore = (edges) => createSeededStore(edges);
function createOptimisticEdgeStore(edges) {
	return createSeededOptimisticStore(edges);
}
//#endregion
//#region src/core/stores/createNodeStore.ts
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
const createNodeStore = (nodes) => createSeededStore(nodes);
function createOptimisticNodeStore(nodes) {
	return createSeededOptimisticStore(nodes);
}
//#endregion
//#region src/components/edge/EdgeWrapper.tsx
/** Internal per-edge wrapper: interaction, a11y, viewport culling, and the dynamic edge component. */
const EdgeWrapper = (props) => {
	let edgeRef, [edgeEl, setEdgeEl] = createSignal(), { store, actions } = useInternalSolidFlow(), edgeId = () => props.edgeId, edge = () => actions.getLayoutedEdge(edgeId()), edgeType = () => edge().type ?? "default", edgeStyle = createMemo(() => {
		let s = edge().style;
		return s ? { ...s } : void 0;
	}), edgeLabelStyle = createMemo(() => {
		let s = edge().labelStyle;
		return s ? { ...s } : void 0;
	}), selectable = () => isEdgeSelectable(edge(), store), focusable = () => edge().focusable ?? store.edgesFocusable, edgeTypeValid = () => edgeType() in store.edgeTypes, edgeComponent = () => store.edgeTypes[edgeTypeValid() ? edgeType() : "default"];
	createEffect(() => ({
		valid: edgeTypeValid(),
		edgeType: edgeType()
	}), ({ valid, edgeType }) => {
		valid || emitFlowError(store.onError, "011", errorMessages.error011(edgeType));
	});
	let markerStartUrl = () => edge().markerStart ? `url('#${getMarkerId(edge().markerStart, store.id)}')` : void 0, markerEndUrl = () => edge().markerEnd ? `url('#${getMarkerId(edge().markerEnd, store.id)}')` : void 0, onClick = (event) => {
		selectable() && actions.handleEdgeSelection(edgeId()), props.onEdgeClick?.({
			edge: edge(),
			event
		});
	}, onContextMenu = (event) => props.onEdgeContextMenu?.({
		edge: edge(),
		event
	}), onPointerEnter = (event) => props.onEdgePointerEnter?.({
		edge: edge(),
		event
	}), onPointerLeave = (event) => props.onEdgePointerLeave?.({
		edge: edge(),
		event
	}), onPointerMove = (event) => props.onEdgePointerMove?.({
		edge: edge(),
		event
	});
	createEventListener(edgeEl, "dblclick", (event) => props.onEdgeDoubleClick?.({
		edge: edge(),
		event
	}));
	let onKeyDown = (event) => {
		!store.disableKeyboardA11y && elementSelectionKeys.includes(event.key) && selectable() && (event.key === "Escape" ? (edgeRef?.blur(), actions.unselectNodesAndEdges({ edges: [edge()] })) : actions.addSelectedEdges([edge().id]));
	}, ariaLabel = () => edge().ariaLabel ?? `Edge from ${edge().source} to ${edge().target}`, culled = createMemo(() => isEdgeCulled(edge(), store.cullingViewport));
	return <EdgeIdContext value={edgeId}>
      <Show when={!edge().hidden}>
        <svg class="solid-flow__edge-wrapper" style={{
		"z-index": edge().zIndex,
		visibility: culled() ? "hidden" : void 0,
		"pointer-events": culled() ? "none" : void 0
	}}>
          <g ref={(el) => {
		edgeRef = el, setEdgeEl(el);
	}} data-id={edge().id} tabindex={focusable() ? 0 : void 0} role={edge().ariaRole ?? (focusable() ? "group" : "img")} aria-label={ariaLabel()} aria-roledescription="edge" aria-describedby={focusable() ? `${ARIA_EDGE_DESC_KEY}-${store.id}` : void 0} class={[
		"solid-flow__edge",
		`solid-flow__edge-${edgeType()}`,
		{
			animated: !!edge().animated,
			selected: !!edge().selected,
			selectable: !!selectable()
		},
		edge().class
	]} onClick={onClick} onKeyDown={(e) => focusable() && onKeyDown(e)} onContextMenu={onContextMenu} onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave} onPointerMove={onPointerMove} {...edge().domAttributes}>
            <Dynamic component={edgeComponent()} id={edge().id} source={edge().source} target={edge().target} sourceX={edge().sourceX} sourceY={edge().sourceY} targetX={edge().targetX} targetY={edge().targetY} sourcePosition={edge().sourcePosition} targetPosition={edge().targetPosition} animated={edge().animated} selected={edge().selected} label={edge().label} labelStyle={edgeLabelStyle()} data={edge().data} style={edgeStyle()} interactionWidth={edge().interactionWidth} selectable={selectable()} deletable={edge().deletable ?? !0} type={edgeType()} sourceHandleId={edge().sourceHandle} targetHandleId={edge().targetHandle} markerStart={markerStartUrl()} markerEnd={markerEndUrl()} />
          </g>
        </svg>
      </Show>
    </EdgeIdContext>;
}, SmoothStepEdge = (props) => {
	let pathData = createMemo(() => {
		let [path, labelX, labelY] = getSmoothStepPath$1({
			sourceX: props.sourceX,
			sourceY: props.sourceY,
			targetX: props.targetX,
			targetY: props.targetY,
			sourcePosition: props.sourcePosition,
			targetPosition: props.targetPosition,
			borderRadius: props.pathOptions?.borderRadius,
			offset: props.pathOptions?.offset
		});
		return {
			path,
			labelX,
			labelY
		};
	});
	return <BaseEdge id={props.id} path={pathData().path} labelX={pathData().labelX} labelY={pathData().labelY} label={props.label} labelStyle={props.labelStyle} markerStart={props.markerStart} markerEnd={props.markerEnd} interactionWidth={props.interactionWidth} style={props.style} />;
}, SmoothStepEdgeInternal = (props) => {
	let pathData = () => {
		let [path, labelX, labelY] = getSmoothStepPath$1({
			sourceX: props.sourceX,
			sourceY: props.sourceY,
			targetX: props.targetX,
			targetY: props.targetY,
			sourcePosition: props.sourcePosition,
			targetPosition: props.targetPosition
		});
		return {
			path,
			labelX,
			labelY
		};
	};
	return <BaseEdge path={pathData().path} labelX={pathData().labelX} labelY={pathData().labelY} label={props.label} labelStyle={props.labelStyle} markerStart={props.markerStart} markerEnd={props.markerEnd} interactionWidth={props.interactionWidth} style={props.style} />;
}, StepEdge = (props) => {
	let pathData = createMemo(() => {
		let [path, labelX, labelY] = getSmoothStepPath$1({
			sourceX: props.sourceX,
			sourceY: props.sourceY,
			targetX: props.targetX,
			targetY: props.targetY,
			sourcePosition: props.sourcePosition,
			targetPosition: props.targetPosition,
			borderRadius: 0,
			offset: props.pathOptions?.offset
		});
		return {
			path,
			labelX,
			labelY
		};
	});
	return <BaseEdge id={props.id} path={pathData().path} labelX={pathData().labelX} labelY={pathData().labelY} label={props.label} labelStyle={props.labelStyle} markerStart={props.markerStart} markerEnd={props.markerEnd} interactionWidth={props.interactionWidth} style={props.style} />;
}, StepEdgeInternal = (props) => {
	let pathData = () => {
		let [path, labelX, labelY] = getSmoothStepPath$1({
			sourceX: props.sourceX,
			sourceY: props.sourceY,
			targetX: props.targetX,
			targetY: props.targetY,
			sourcePosition: props.sourcePosition,
			targetPosition: props.targetPosition,
			borderRadius: 0
		});
		return {
			path,
			labelX,
			labelY
		};
	};
	return <BaseEdge path={pathData().path} labelX={pathData().labelX} labelY={pathData().labelY} label={props.label} labelStyle={props.labelStyle} markerStart={props.markerStart} markerEnd={props.markerEnd} interactionWidth={props.interactionWidth} style={props.style} />;
}, StraightEdge = (props) => {
	let pathData = createMemo(() => {
		let [path, labelX, labelY] = getStraightPath$1({
			sourceX: props.sourceX,
			sourceY: props.sourceY,
			targetX: props.targetX,
			targetY: props.targetY
		});
		return {
			path,
			labelX,
			labelY
		};
	});
	return <BaseEdge id={props.id} path={pathData().path} labelX={pathData().labelX} labelY={pathData().labelY} label={props.label} labelStyle={props.labelStyle} markerStart={props.markerStart} markerEnd={props.markerEnd} interactionWidth={props.interactionWidth} style={props.style} />;
}, StraightEdgeInternal = (props) => {
	let pathData = () => {
		let [path, labelX, labelY] = getStraightPath$1({
			sourceX: props.sourceX,
			sourceY: props.sourceY,
			targetX: props.targetX,
			targetY: props.targetY
		});
		return {
			path,
			labelX,
			labelY
		};
	};
	return <BaseEdge path={pathData().path} labelX={pathData().labelX} labelY={pathData().labelY} label={props.label} labelStyle={props.labelStyle} markerStart={props.markerStart} markerEnd={props.markerEnd} interactionWidth={props.interactionWidth} style={props.style} />;
}, NodeConnectableContext = createContext(null);
function useNodeConnectable() {
	let ctx = useContext(NodeConnectableContext);
	if (!ctx) throw Error("solid-flow: Your application must be wrapped with <SolidFlow> in order to invoke useNodeConnectable");
	return ctx;
}
//#endregion
//#region src/components/handle/Handle.tsx
/** Connection point on a node; place inside custom nodes to make them connectable. */
const Handle = (props) => {
	let _props = propDefaults(props, {
		type: "source",
		position: "top",
		isConnectableStart: !0,
		isConnectableEnd: !0
	}), { store, nodeLookup, connections, actions } = useInternalSolidFlow(), rest = omit(_props, "id", "type", "position", "isConnectable", "isConnectableStart", "isConnectableEnd", "isValidConnection", "onConnect", "onDisconnect", "children", "class", "style"), nodeId = useNodeId(), nodeConnectable = useNodeConnectable(), connectable = () => _props.isConnectable ?? nodeConnectable(), isTarget = () => _props.type === "target", handleId = () => _props.id ?? null, originState = () => store.connectionOriginByHandle[connectionKey(nodeId(), _props.type, handleId())], connectingFrom = () => originState() === "from", targetState = () => store.connectionTargetByHandle[connectionKey(nodeId(), _props.type, handleId())], connectingTo = () => targetState() !== void 0, valid = () => targetState() === "valid", prevConnections = null;
	createEffect(() => {
		if (!_props.onConnect && !_props.onDisconnect) return null;
		let rec = connections[connectionKey(nodeId(), _props.type, _props.id)], map = /* @__PURE__ */ new Map();
		for (let key of Object.keys(rec ?? {})) map.set(key, { ...rec[key] });
		return { connections: map };
	}, (current) => {
		if (!current) return;
		let { connections: next } = current;
		prevConnections && !areConnectionMapsEqual(next, prevConnections) && (handleConnectionChange(prevConnections, next, props.onDisconnect), handleConnectionChange(next, prevConnections, props.onConnect)), prevConnections = next;
	});
	let onConnectExtended = (connection) => {
		let handleConnection = {
			...connection,
			id: getEdgeId(connection)
		}, edge = store.onBeforeConnect?.(handleConnection) ?? handleConnection;
		actions.addEdge(edge), store.onConnect?.(handleConnection);
	}, onPointerDown = (event) => {
		let gestureLookup = armConnectionGestureLookup({
			event,
			real: nodeLookup,
			domNode: store.domNode,
			getTransform: () => store.transform,
			connectionRadius: store.connectionRadius
		});
		XYHandle.onPointerDown(event, {
			...buildConnectionGestureParams({
				event,
				store,
				actions,
				gestureLookup
			}),
			handleId: handleId(),
			nodeId: nodeId(),
			isTarget: isTarget(),
			isValidConnection: _props.isValidConnection ?? store.isValidConnection,
			onConnect: onConnectExtended
		});
	}, onClick = (event) => {
		if (!nodeId() || !store.clickConnectStartHandle && !_props.isConnectableStart) return;
		if (!store.clickConnectStartHandle) {
			store.onClickConnectStart?.(event, {
				nodeId: nodeId(),
				handleId: handleId(),
				handleType: _props.type
			}), actions.setClickConnectStartHandle({
				nodeId: nodeId(),
				type: _props.type,
				id: handleId()
			});
			return;
		}
		let doc = getHostForElement(event.target), isValidConnectionHandler = _props.isValidConnection ?? store.isValidConnection, { connection, isValid } = XYHandle.isValid(event, {
			handle: {
				nodeId: nodeId(),
				id: handleId(),
				type: _props.type
			},
			connectionMode: store.connectionMode,
			fromNodeId: store.clickConnectStartHandle.nodeId,
			fromHandleId: store.clickConnectStartHandle.id ?? null,
			fromType: store.clickConnectStartHandle.type,
			isValidConnection: isValidConnectionHandler,
			flowId: store.id,
			doc,
			lib: store.lib,
			nodeLookup
		});
		isValid && connection && onConnectExtended(connection);
		let connectionClone = structuredClone(snapshot(store.connection));
		delete connectionClone.inProgress, connectionClone.toPosition = connectionClone.toHandle ? connectionClone.toHandle.position : null, store.onClickConnectEnd?.(event, connectionClone), actions.setClickConnectStartHandle(void 0);
	};
	return <div {...rest} role="button" aria-label={store.ariaLabelConfig["handle.ariaLabel"]} tabindex={-1} data-handleid={handleId()} data-nodeid={nodeId()} data-handlepos={_props.position} data-id={`${store.id}-${nodeId()}-${_props.id || null}-${_props.type}`} onClick={store.clickConnect ? onClick : void 0} onPointerDown={onPointerDown} style={_props.style} class={[
		"solid-flow__handle",
		`solid-flow__handle-${_props.position}`,
		store.noDragClass,
		store.noPanClass,
		_props.class,
		{
			valid: valid(),
			connectingto: !!connectingTo(),
			connectingfrom: !!connectingFrom(),
			source: !isTarget(),
			target: isTarget(),
			connectablestart: _props.isConnectableStart,
			connectableend: _props.isConnectableEnd,
			connectable: !!connectable(),
			excluded: !!originState()
		}
	]}>
      {_props.children}
    </div>;
}, StaticHandle = (props) => {
	let nodeId = useNodeId();
	return <div data-handleid={props.id} data-nodeid={nodeId()} data-handlepos={props.position} title={props.title} style={props.style} class={`solid-flow__handle solid-flow__handle-${props.position} ${props.type}`} />;
}, DefaultNode = (props) => <>
    <Handle type="target" position={props.targetPosition ?? "top"} isConnectable={props.isConnectable} />
    {props.data.label}
    <Handle type="source" position={props.sourcePosition ?? "bottom"} isConnectable={props.isConnectable} />
  </>, GroupNode = (props) => <div style={{
	position: "absolute",
	left: 0,
	top: 0,
	width: toPxString(props.width),
	height: toPxString(props.height)
}} />, InputNode = (props) => <>
    {props.data?.label}
    <Handle type="source" position={props.sourcePosition ?? "bottom"} isConnectable={props.isConnectable} />
  </>, createDraggable = (elem, params) => {
	let { store, nodeLookup, actions } = useInternalSolidFlow(), [dragging, setDragging] = createSignal(!1);
	return createEffect(() => ({
		el: elem(),
		current: params()
	}), ({ el, current }) => {
		if (!el || current.disabled) return;
		let { onDrag, onDragStart, onDragStop, onNodeMouseDown } = current, dragInstance = XYDrag({
			onDrag,
			onDragStart: (event, dragItems, node, nodes) => {
				setDragging(!0), onDragStart?.(event, dragItems, node, nodes);
			},
			onDragStop: (event, dragItems, node, nodes) => {
				setDragging(!1), onDragStop?.(event, dragItems, node, nodes);
			},
			onNodeMouseDown,
			getStoreItems: () => ({
				nodes: store.nodes,
				nodeLookup,
				edges: store.edges,
				nodeExtent: store.nodeExtent,
				snapGrid: store.snapGrid ?? [0, 0],
				snapToGrid: !!store.snapGrid,
				autoPanSpeed: store.autoPanSpeed,
				nodeOrigin: store.nodeOrigin,
				multiSelectionActive: store.multiselectionKeyPressed,
				domNode: store.domNode,
				transform: store.transform,
				autoPanOnNodeDrag: store.autoPanOnNodeDrag,
				nodesDraggable: store.nodesDraggable,
				selectNodesOnDrag: store.selectNodesOnDrag,
				nodeDragThreshold: store.nodeDragThreshold,
				unselectNodesAndEdges: actions.unselectNodesAndEdges,
				updateNodePositions: actions.updateNodePositions,
				panBy: actions.panBy
			})
		});
		return dragInstance.update({
			domNode: el,
			nodeId: current.nodeId,
			noDragClassName: current.noDragClass,
			handleSelector: current.handleSelector,
			isSelectable: current.isSelectable,
			nodeClickDistance: current.nodeClickDistance
		}), () => {
			dragInstance.destroy();
		};
	}), dragging;
}, NodeIdContext = createContext(null);
/**
* Returns the id of the node this component is rendered inside. Available
* anywhere in a custom node's subtree (provided by the node wrapper), so
* nested components — like a custom `Handle` — can learn their host node
* without prop drilling.
*
* @public
* @returns a reactive accessor for the surrounding node's id
*/
function useNodeId() {
	let ctx = useContext(NodeIdContext);
	if (!ctx) throw Error("solid-flow: useNodeId must be called inside a node component (anywhere under a custom node's subtree)");
	return ctx;
}
//#endregion
//#region src/components/node/NodeWrapper.tsx
/** Internal per-node wrapper: dragging, selection, a11y, measurement, viewport culling, and the dynamic node component. */
const NodeWrapper = (props) => {
	let { store, nodeLookup, parentIds, actions } = useInternalSolidFlow(), [nodeRef, setNodeRef] = createSignal(), node = () => nodeLookup.get(props.nodeId);
	createEventListener(nodeRef, "dblclick", (event) => props.onNodeDoubleClick?.({
		node: userNode(),
		event
	})), onCleanup(() => {
		let el = nodeRef();
		el && props.resizeObserver?.unobserve(el);
	});
	let nodeId = () => node().id, nodeType = () => node().type ?? "default", deletable = () => node().deletable ?? !0, selectable = () => node().selectable ?? store.elementsSelectable, focusable = () => node().focusable ?? store.nodesFocusable, draggable = () => node().draggable ?? store.nodesDraggable, connectable = () => node().connectable ?? store.nodesConnectable, userNode = () => node().internals.userNode, nodeTypeValid = () => nodeType() in store.nodeTypes, nodeComponent = () => store.nodeTypes[nodeTypeValid() ? nodeType() : "default"], isParentNode = () => !!parentIds[node().id], transform = () => {
		let { x, y } = node().internals.positionAbsolute;
		return `translate(${x}px, ${y}px)`;
	}, sizeStyle = () => {
		let w = node().width ?? node().initialWidth, h = node().height ?? node().initialHeight;
		return {
			...node().style,
			...w ? { width: toPxString(w) } : {},
			...h ? { height: toPxString(h) } : {}
		};
	}, culled = createMemo(() => isNodeCulled(node(), store.cullingViewport)), style = () => ({
		...sizeStyle(),
		"z-index": node().internals.z,
		transform: transform(),
		visibility: culled() || !nodeHasDimensions(node()) ? "hidden" : "visible",
		"pointer-events": culled() ? "none" : void 0
	});
	createEffect(() => ({
		valid: nodeTypeValid(),
		nodeType: nodeType()
	}), ({ valid, nodeType }) => {
		valid || emitFlowError(store.onError, "003", errorMessages.error003(nodeType));
	}), createEffect(() => ({
		id: node().id,
		nodeElement: nodeRef(),
		nodeType: nodeType(),
		sourcePosition: node().sourcePosition,
		targetPosition: node().targetPosition
	}), (current, prev) => {
		current.nodeElement && (prev && prev.nodeElement === current.nodeElement && prev.sourcePosition === current.sourcePosition && prev.targetPosition === current.targetPosition && prev.nodeType === current.nodeType || actions.requestUpdateNodeInternals([[current.id, {
			id: current.id,
			nodeElement: current.nodeElement,
			force: !0
		}]]));
	}), createEffect(() => ({
		nodeElement: nodeRef(),
		hasDimensions: nodeHasDimensions(node()),
		resizeObserver: props.resizeObserver
	}), (current, prev) => {
		current.nodeElement === prev?.nodeElement && current.resizeObserver === prev?.resizeObserver && current.hasDimensions || (prev?.nodeElement && prev.resizeObserver?.unobserve(prev.nodeElement), current.nodeElement && current.resizeObserver?.observe(current.nodeElement));
	});
	let onSelectNodeHandler = (event) => {
		selectable() && (!store.selectNodesOnDrag || !draggable() || store.nodeDragThreshold > 0) && actions.handleNodeSelection(node().id), props.onNodeClick?.({
			node: userNode(),
			event
		});
	}, onKeyDown = (event) => {
		if (isInputDOMNode(event) || store.disableKeyboardA11y) return;
		if (elementSelectionKeys.includes(event.key) && selectable()) {
			actions.handleNodeSelection(node().id, event.key === "Escape", nodeRef());
			return;
		}
		let arrowKeyDiff = ARROW_KEY_DIFFS[event.key];
		draggable() && node().selected && arrowKeyDiff && (event.preventDefault(), actions.setAriaLiveMessage(store.ariaLabelConfig["node.a11yDescription.ariaLiveMessage"]({
			direction: event.key.replace("Arrow", "").toLowerCase(),
			x: ~~node().internals.positionAbsolute.x,
			y: ~~node().internals.positionAbsolute.y
		})), actions.moveSelectedNodes(arrowKeyDiff, event.shiftKey ? 4 : 1));
	}, onFocus = () => {
		if (store.disableKeyboardA11y || !store.autoPanOnNodeFocus || !nodeRef()?.matches(":focus-visible")) return;
		let { width, height, viewport } = store;
		getNodesInside(/* @__PURE__ */ new Map([[node().id, node()]]), {
			x: 0,
			y: 0,
			width,
			height
		}, [
			viewport.x,
			viewport.y,
			viewport.zoom
		], !0).length > 0 || actions.setCenter(node().position.x + (node().measured.width ?? 0) / 2, node().position.y + (node().measured.height ?? 0) / 2, { zoom: viewport.zoom });
	}, dragging = createDraggable(nodeRef, () => ({
		nodeId: node().id,
		isSelectable: selectable(),
		disabled: !draggable(),
		handleSelector: node().dragHandle,
		noDragClass: store.noDragClass,
		nodeClickDistance: props.nodeClickDistance,
		onNodeMouseDown: actions.handleNodeSelection,
		onDrag: (event, _, targetNode, nodes) => {
			props.onNodeDrag?.({
				event,
				targetNode,
				nodes
			});
		},
		onDragStart: (event, _, targetNode, nodes) => {
			props.onNodeDragStart?.({
				event,
				targetNode,
				nodes
			});
		},
		onDragStop: (event, _, targetNode, nodes) => {
			props.onNodeDragStop?.({
				event,
				targetNode,
				nodes
			});
		}
	}));
	return <Show when={!node().hidden}>
      <div ref={setNodeRef} data-id={node().id} class={[
		"solid-flow__node",
		`solid-flow__node-${nodeType()}`,
		{
			connectable: !!connectable(),
			draggable: !!draggable(),
			dragging: dragging(),
			nopan: !!draggable(),
			parent: isParentNode(),
			selectable: !!selectable(),
			selected: !!node().selected
		},
		node().class
	]} style={style()} onClick={onSelectNodeHandler} onPointerEnter={(event) => props.onNodePointerEnter?.({
		node: userNode(),
		event
	})} onPointerLeave={(event) => props.onNodePointerLeave?.({
		node: userNode(),
		event
	})} onPointerMove={(event) => props.onNodePointerMove?.({
		node: userNode(),
		event
	})} onContextMenu={(event) => props.onNodeContextMenu?.({
		node: userNode(),
		event
	})} onKeyDown={(e) => focusable() && onKeyDown(e)} onFocus={() => focusable() && onFocus()} tabindex={focusable() ? 0 : void 0} role={node().ariaRole ?? (focusable() ? "group" : void 0)} aria-roledescription="node" aria-describedby={store.disableKeyboardA11y ? void 0 : `${ARIA_NODE_DESC_KEY}-${store.id}`} {...node().domAttributes}>
        <NodeIdContext value={nodeId}>
          <NodeConnectableContext value={connectable}>
            <Dynamic component={nodeComponent()} data={node().data} id={node().id} selected={!!node().selected} selectable={selectable()} deletable={deletable()} sourcePosition={node().sourcePosition} targetPosition={node().targetPosition} zIndex={node().internals.z} dragging={dragging()} draggable={draggable()} dragHandle={node().dragHandle} parentId={node().parentId} type={nodeType()} isConnectable={connectable()} positionAbsoluteX={node().internals.positionAbsolute.x} positionAbsoluteY={node().internals.positionAbsolute.y} width={node().width} height={node().height} />
          </NodeConnectableContext>
        </NodeIdContext>
      </div>
    </Show>;
}, OutputNode = (props) => <>
    <Handle type="target" position={props.targetPosition ?? "top"} isConnectable={props.isConnectable} />
    {props.data?.label}
  </>;
//#endregion
//#region src/browser/measure.ts
/**
* The DOM side of the measurement pipeline (fork of @xyflow/system's
* updateNodeInternals): reads each updated node element's dimensions and
* handle bounds from the DOM and reports them as data — measurement writes
* for the measurements root plus user-facing dimension/position changes —
* instead of writing into a node lookup. The internalNodes projection turns
* the measurement writes back into internal-node state.
*
* `parentExpandChildren` must be turned into changes via
* {@link handleExpandParent} only AFTER the measurement writes have been
* flushed, so parent geometry reflects this measuring pass.
*/
function measureNodeInternals(updates, nodeLookup, domNode, nodeExtent) {
	let measurementWrites = [], changes = [], parentExpandChildren = [], updatedInternals = !1, viewportNode = domNode?.querySelector(".xyflow__viewport");
	if (!viewportNode) return {
		updatedInternals,
		measurementWrites,
		changes,
		parentExpandChildren
	};
	let style = window.getComputedStyle(viewportNode), { m22: zoom } = new window.DOMMatrixReadOnly(style.transform);
	for (let update of updates.values()) {
		let node = nodeLookup.get(update.id);
		if (!node) continue;
		if (node.hidden) {
			measurementWrites.push({
				id: node.id,
				hidden: !0
			}), updatedInternals = !0;
			continue;
		}
		let dimensions = getDimensions(update.nodeElement), dimensionChanged = node.measured.width !== dimensions.width || node.measured.height !== dimensions.height;
		if (dimensions.width && dimensions.height && (dimensionChanged || !node.internals.handleBounds || update.force)) {
			let nodeBounds = update.nodeElement.getBoundingClientRect(), extent = isCoordinateExtent(node.extent) ? node.extent : nodeExtent, { positionAbsolute } = node.internals;
			node.parentId && node.extent === "parent" ? positionAbsolute = clampPositionToParent(positionAbsolute, dimensions, nodeLookup.get(node.parentId)) : extent && (positionAbsolute = clampPosition(positionAbsolute, extent, dimensions)), measurementWrites.push({
				id: node.id,
				measured: dimensions,
				handleBounds: {
					source: getHandleBounds("source", update.nodeElement, nodeBounds, zoom, node.id),
					target: getHandleBounds("target", update.nodeElement, nodeBounds, zoom, node.id)
				}
			}), updatedInternals = !0, dimensionChanged && (changes.push({
				id: node.id,
				type: "dimensions",
				dimensions
			}), node.expandParent && node.parentId && parentExpandChildren.push({
				id: node.id,
				parentId: node.parentId,
				rect: nodeToRect({
					...node,
					measured: dimensions,
					internals: {
						...node.internals,
						positionAbsolute
					}
				})
			}));
		}
	}
	return {
		updatedInternals,
		measurementWrites,
		changes,
		parentExpandChildren
	};
}
function handleExpandParent(children, nodeLookup, getChildNodes, nodeOrigin = [0, 0]) {
	let changes = [], parentExpansions = /* @__PURE__ */ new Map();
	for (let child of children) {
		let parent = nodeLookup.get(child.parentId);
		if (!parent) continue;
		let parentRect = parentExpansions.get(child.parentId)?.expandedRect ?? nodeToRect(parent), expandedRect = getBoundsOfRects(parentRect, child.rect);
		parentExpansions.set(child.parentId, {
			expandedRect,
			parent
		});
	}
	return parentExpansions.size > 0 && parentExpansions.forEach(({ expandedRect, parent }, parentId) => {
		let positionAbsolute = parent.internals.positionAbsolute, dimensions = getNodeDimensions(parent), origin = parent.origin ?? nodeOrigin, xChange = expandedRect.x < positionAbsolute.x ? Math.round(Math.abs(positionAbsolute.x - expandedRect.x)) : 0, yChange = expandedRect.y < positionAbsolute.y ? Math.round(Math.abs(positionAbsolute.y - expandedRect.y)) : 0, newWidth = Math.max(dimensions.width, Math.round(expandedRect.width)), newHeight = Math.max(dimensions.height, Math.round(expandedRect.height)), widthChange = (newWidth - dimensions.width) * origin[0], heightChange = (newHeight - dimensions.height) * origin[1];
		if (xChange > 0 || yChange > 0 || widthChange || heightChange) {
			changes.push({
				id: parentId,
				type: "position",
				position: {
					x: parent.position.x - xChange + widthChange,
					y: parent.position.y - yChange + heightChange
				}
			});
			for (let childNode of getChildNodes(parentId)) children.some((child) => child.id === childNode.id) || changes.push({
				id: childNode.id,
				type: "position",
				position: {
					x: childNode.position.x + xChange,
					y: childNode.position.y + yChange
				}
			});
		}
		(dimensions.width < expandedRect.width || dimensions.height < expandedRect.height || xChange || yChange) && changes.push({
			id: parentId,
			type: "dimensions",
			setAttributes: !0,
			dimensions: {
				width: newWidth + (xChange ? origin[0] * xChange - widthChange : 0),
				height: newHeight + (yChange ? origin[1] * yChange - heightChange : 0)
			}
		});
	}), changes;
}
//#endregion
//#region src/browser/createSolidFlow.ts
const InitialNodeTypesMap = {
	input: InputNode,
	output: OutputNode,
	default: DefaultNode,
	group: GroupNode
}, InitialEdgeTypesMap = {
	straight: StraightEdgeInternal,
	smoothstep: SmoothStepEdgeInternal,
	default: BezierEdgeInternal,
	step: StepEdgeInternal
}, createSolidFlow = (props) => {
	let state = createFlowState(props, {
		prefersDark: createMediaQuery("(prefers-color-scheme: dark)", props.colorModeSSR === "dark"),
		initialNodeTypes: InitialNodeTypesMap,
		initialEdgeTypes: InitialEdgeTypesMap
	}), { store, nodeLookup, actions } = state, prime = () => {
		store.selectedNodes, store.selectedEdges;
	};
	typeof requestIdleCallback == "function" ? requestIdleCallback(prime) : setTimeout(prime, 50);
	let pendingEntries, requestUpdateNodeInternals = (updateEntries) => {
		if (pendingEntries) {
			pendingEntries.push(...updateEntries);
			return;
		}
		pendingEntries = updateEntries, scheduleIdleCallback(() => {
			let updates = new Map(pendingEntries);
			pendingEntries = void 0;
			let { updatedInternals, measurementWrites, changes, parentExpandChildren } = measureNodeInternals(updates, nodeLookup, store.domNode, store.nodeExtent);
			updatedInternals && (actions.applyMeasurementWrites(measurementWrites), flush(), parentExpandChildren.length > 0 && changes.push(...handleExpandParent(parentExpandChildren, nodeLookup, (parentId) => store.nodes.filter((node) => node.parentId === parentId), store.nodeOrigin)), actions.applyNodeChanges(changes), flush(), actions.markInitialNodesMeasured());
		});
	};
	return actions.setMeasureRequester(requestUpdateNodeInternals), {
		...state,
		actions: {
			...actions,
			requestUpdateNodeInternals
		}
	};
}, SolidFlowContext = createContext(null), typedSolidFlowContext = () => SolidFlowContext;
function useInternalSolidFlow() {
	let ctx = useContext(typedSolidFlowContext());
	if (!ctx) throw Error("solid-flow: Your application must be wrapped with <SolidFlow> in order to invoke useInternalSolidFlow within your components");
	return ctx;
}
//#endregion
//#region src/components/connection/ConnectionLine.tsx
/** Internal component rendering the in-progress connection line. */
const ConnectionLine = (props) => {
	let { store } = useInternalSolidFlow(), connectionStatus = () => getConnectionStatus(store.connection.isValid), inProgress = createMemo(() => {
		let state = store.connection;
		return state.inProgress ? state : null;
	});
	return <Show when={inProgress()}>
      {(connection) => <svg class="solid-flow__container solid-flow__connectionline" width={store.width} height={store.height} style={props.containerStyle}>
          <g class={["solid-flow__connection", connectionStatus()]}>
            <Show when={props.component} fallback={<InternalConnectionLine style={props.style} connection={connection()} />}>
              {(CustomComponent) => {
		let UserConnectionLine = CustomComponent();
		return <UserConnectionLine connectionLineType={store.connectionLineType} connectionLineStyle={props.style} fromNode={connection().fromNode} fromHandle={connection().fromHandle} fromX={connection().from.x} fromY={connection().from.y} toX={connection().to.x} toY={connection().to.y} fromPosition={connection().fromPosition} toPosition={connection().toPosition} connectionStatus={connectionStatus()} toNode={connection().toNode} toHandle={connection().toHandle} />;
	}}
            </Show>
          </g>
        </svg>}
    </Show>;
}, InternalConnectionLine = (props) => {
	let { store } = useInternalSolidFlow(), path = () => {
		let pathParams = {
			sourceX: props.connection.from.x,
			sourceY: props.connection.from.y,
			sourcePosition: props.connection.fromPosition,
			targetX: props.connection.to.x,
			targetY: props.connection.to.y,
			targetPosition: props.connection.toPosition
		};
		switch (store.connectionLineType) {
			case "default": {
				let [path] = getBezierPath$1(pathParams);
				return path;
			}
			case "straight": {
				let [path] = getStraightPath$1(pathParams);
				return path;
			}
			case "step":
			case "smoothstep": {
				let [path] = getSmoothStepPath$1({
					...pathParams,
					borderRadius: store.connectionLineType === "step" ? 0 : void 0
				});
				return path;
			}
		}
	};
	return <path class="solid-flow__connection-path" fill="none" style={props.style} d={path()} />;
}, Marker = (props) => {
	let _props = propDefaults(props, {
		markerUnits: "strokeWidth",
		orient: "auto-start-reverse",
		width: 12.5,
		height: 12.5,
		color: "none"
	}), color = () => _props.color ?? "var(--xy-edge-stroke)";
	return <marker class="solid-flow__arrowhead" id={_props.id} markerWidth={_props.width} markerHeight={_props.height} viewBox="-10 -10 20 20" markerUnits={_props.markerUnits} orient={_props.orient} refX="0" refY="0">
      <Show when={_props.type === "arrow"} fallback={<polyline class="arrowclosed" stroke={color()} fill={color()} stroke-linecap="round" stroke-linejoin="round" stroke-width={_props.strokeWidth} points="-5,-4 0,0 -5,4 -5,-4" />}>
        <polyline class="arrow" stroke={color()} fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width={_props.strokeWidth} points="-5,-4 0,0 -5,4" />
      </Show>
    </marker>;
}, MarkerDefinition = () => {
	let { store } = useInternalSolidFlow(), markers = createMemo(() => createMarkerIds(store.edges, {
		id: store.id,
		defaultColor: store.defaultMarkerColor,
		defaultMarkerStart: store.defaultEdgeOptions.markerStart,
		defaultMarkerEnd: store.defaultEdgeOptions.markerEnd
	}));
	return <Show when={markers().length > 0}>
      <svg class="solid-flow__marker">
        <defs>
          <For each={markers()}>{(marker) => <Marker {...marker} />}</For>
        </defs>
      </svg>
    </Show>;
}, createFocusedIdTracker = () => {
	let [focusedId, setFocusedId] = createSignal(null);
	return {
		focusedId,
		onFocusIn: (event) => {
			let element = event.target.closest("[data-id]");
			setFocusedId(element?.getAttribute("data-id") ?? null);
		},
		onFocusOut: () => setFocusedId(null)
	};
}, EdgeRenderer = (props) => {
	let { store, actions } = useInternalSolidFlow(), { focusedId: focusedEdgeId, onFocusIn, onFocusOut } = createFocusedIdTracker();
	return <div class="solid-flow__edges" onFocusIn={onFocusIn} onFocusOut={onFocusOut}>
      <MarkerDefinition />

      <For each={store.visibleEdgeIds}>
        {(edgeId) => {
		let unmounted = createMemo(() => {
			if (!store.onlyRenderVisibleElements || focusedEdgeId() === edgeId) return !1;
			let edge = actions.getLayoutedEdge(edgeId);
			return !!edge && isEdgeCulled(edge, store.cullingViewport);
		});
		return <Show when={!unmounted() && actions.getLayoutedEdge(edgeId) != null}>
              <EdgeWrapper edgeId={edgeId} onEdgeClick={props.onEdgeClick} onEdgeDoubleClick={props.onEdgeDoubleClick} onEdgePointerMove={props.onEdgePointerMove} onEdgeContextMenu={props.onEdgeContextMenu} onEdgePointerEnter={props.onEdgePointerEnter} onEdgePointerLeave={props.onEdgePointerLeave} />
            </Show>;
	}}
      </For>
    </div>;
}, NodeRenderer = (props) => {
	let { actions, store, nodeLookup } = useInternalSolidFlow(), resizeObserver = isServer ? void 0 : new ResizeObserver((entries) => {
		actions.requestUpdateNodeInternals(entries.map((entry) => {
			let id = entry.target.getAttribute("data-id");
			return [id, {
				id,
				nodeElement: entry.target,
				force: !0
			}];
		}));
	});
	onCleanup(() => {
		resizeObserver?.disconnect();
	});
	let { focusedId: focusedNodeId, onFocusIn, onFocusOut } = createFocusedIdTracker();
	return <div class="solid-flow__container solid-flow__nodes" onFocusIn={onFocusIn} onFocusOut={onFocusOut}>
      <For each={store.visibleNodeIds}>
        {(nodeId) => {
		let unmounted = createMemo(() => {
			if (!store.onlyRenderVisibleElements || focusedNodeId() === nodeId) return !1;
			let node = nodeLookup.get(nodeId);
			return !!node && isNodeCulled(node, store.cullingViewport);
		});
		return <Show when={!unmounted() && nodeLookup.get(nodeId) !== void 0}>
              <NodeWrapper nodeId={nodeId} resizeObserver={resizeObserver} nodeClickDistance={props.nodeClickDistance} onNodeClick={props.onNodeClick} onNodeDoubleClick={props.onNodeDoubleClick} onNodePointerEnter={props.onNodePointerEnter} onNodePointerMove={props.onNodePointerMove} onNodePointerLeave={props.onNodePointerLeave} onNodeDrag={props.onNodeDrag} onNodeDragStart={props.onNodeDragStart} onNodeDragStop={props.onNodeDragStop} onNodeContextMenu={props.onNodeContextMenu} />
            </Show>;
	}}
      </For>
    </div>;
}, isSetEqual = (a, b) => {
	if (a.size !== b.size) return !1;
	for (let item of a) if (!b.has(item)) return !1;
	return !0;
}, Pane = (props) => {
	let { store, nodeLookup, edgeLookup, connections, actions } = useInternalSolidFlow(), [containerRef, setContainerRef] = createSignal(), container, containerBounds = null, connectionEndedOnPane = !1, selectionInProgress = !1, selectionSpatialLookup = new GestureSpatialLookup(nodeLookup, 400), selectedNodeIds = /* @__PURE__ */ new Set(), selectedEdgeIds = /* @__PURE__ */ new Set(), autoPanId = 0, position = {
		x: 0,
		y: 0
	}, autoPanStarted = !1, autoPanOnSelection = () => props.autoPanOnSelection ?? !0, paneClickDistance = () => props.paneClickDistance ?? 0, _panOnDrag = () => store.panActivationKeyPressed || props.panOnDrag, isSelecting = () => store.selectionKeyPressed || !!store.selectionRect || props.selectionOnDrag && _panOnDrag() !== !0, isSelectionEnabled = () => store.elementsSelectable && (isSelecting() || store.selectionRectMode === "user"), onClick = (event) => {
		if (event.target === container) {
			if (selectionInProgress || store.connection.inProgress || connectionEndedOnPane) {
				selectionInProgress = !1, connectionEndedOnPane = !1;
				return;
			}
			props.onPaneClick?.({ event }), actions.unselectNodesAndEdges(), actions.setSelectionRectMode(void 0), actions.setSelectionRect(void 0);
		}
	}, onPointerDownCapture = (event) => {
		if (event.pointerType === "touch" && _panOnDrag() !== !1 && !store.selectionKeyPressed || (containerBounds = container?.getBoundingClientRect() ?? null, !containerBounds)) return;
		let eventTargetIsContainer = event.target === container, isNoKeyEvent = !eventTargetIsContainer && !!event.target.closest(".nokey"), isSelectionActive = props.selectionOnDrag && eventTargetIsContainer || store.selectionKeyPressed;
		if (isNoKeyEvent || !isSelecting() || !isSelectionActive || event.button !== 0 || !event.isPrimary) return;
		event.target?.setPointerCapture?.(event.pointerId), selectionSpatialLookup.arm((node) => nodeToRect(node)), selectionInProgress = !1, autoPanStarted = !1;
		let { x, y } = getEventPosition(event, containerBounds), userSelectionFlowOrigin = pointToRendererPoint({
			x,
			y
		}, store.transform);
		actions.setSelectionRect({
			width: 0,
			height: 0,
			startX: userSelectionFlowOrigin.x,
			startY: userSelectionFlowOrigin.y,
			x,
			y
		}), flush(), eventTargetIsContainer || (event.stopPropagation(), event.preventDefault());
	}, commitUserSelectionRect = (mouseX, mouseY) => {
		let selectionRect = store.selectionRect;
		if (selectionRect?.startX === void 0 || selectionRect.startY === void 0) return;
		let userStartPosition = {
			x: selectionRect.startX,
			y: selectionRect.startY
		}, screenStart = rendererPointToPoint(userStartPosition, store.transform), nextUserSelectRect = {
			startX: userStartPosition.x,
			startY: userStartPosition.y,
			x: mouseX < screenStart.x ? mouseX : screenStart.x,
			y: mouseY < screenStart.y ? mouseY : screenStart.y,
			width: Math.abs(mouseX - screenStart.x),
			height: Math.abs(mouseY - screenStart.y)
		}, prevSelectedNodeIds = selectedNodeIds, prevSelectedEdgeIds = selectedEdgeIds;
		{
			let [tx, ty, zoom] = store.transform;
			selectionSpatialLookup.setQueryRect({
				x: (nextUserSelectRect.x - tx) / zoom,
				y: (nextUserSelectRect.y - ty) / zoom,
				width: nextUserSelectRect.width / zoom,
				height: nextUserSelectRect.height / zoom
			});
		}
		selectedNodeIds = new Set(getNodesInside(selectionSpatialLookup, nextUserSelectRect, store.transform, store.selectionMode === "partial", !0).map((n) => n.id)), selectedEdgeIds = /* @__PURE__ */ new Set();
		for (let nodeId of selectedNodeIds) {
			let nodeConnections = connections[nodeId];
			if (nodeConnections) for (let { edgeId } of Object.values(nodeConnections)) {
				let edge = edgeLookup[edgeId];
				edge && isEdgeSelectable(edge, store) && selectedEdgeIds.add(edgeId);
			}
		}
		(!isSetEqual(prevSelectedNodeIds, selectedNodeIds) || !isSetEqual(prevSelectedEdgeIds, selectedEdgeIds)) && actions.applySelectionSets(selectedNodeIds, selectedEdgeIds), actions.setSelectionRectMode("user"), actions.setSelectionRect(nextUserSelectRect), flush();
	}, autoPan = () => {
		if (!autoPanOnSelection() || !containerBounds) return;
		let [x = 0, y = 0] = calcAutoPan(position, containerBounds, store.autoPanSpeed);
		actions.panBy({
			x,
			y
		}).then((panned) => {
			if (!selectionInProgress || !panned) {
				autoPanId = requestAnimationFrame(autoPan);
				return;
			}
			commitUserSelectionRect(position.x, position.y), autoPanId = requestAnimationFrame(autoPan);
		});
	}, cleanupAutoPan = () => {
		autoPanId &&= (cancelAnimationFrame(autoPanId), 0), autoPanStarted = !1;
	};
	onCleanup(() => {
		cleanupAutoPan();
	});
	let onPointerMove = (event) => {
		if (!isSelecting() || !containerBounds || !store.selectionRect) return;
		let mousePos = getEventPosition(event, containerBounds);
		position = {
			x: mousePos.x,
			y: mousePos.y
		};
		let userStartPosition = {
			x: store.selectionRect.startX ?? 0,
			y: store.selectionRect.startY ?? 0
		}, screenStart = rendererPointToPoint(userStartPosition, store.transform);
		if (!selectionInProgress) {
			let requiredDistance = store.selectionKeyPressed ? 0 : paneClickDistance();
			if (Math.hypot(mousePos.x - screenStart.x, mousePos.y - screenStart.y) <= requiredDistance) return;
			actions.unselectNodesAndEdges(), props.onSelectionStart?.(event);
		}
		selectionInProgress = !0, autoPanStarted ||= (autoPan(), !0), commitUserSelectionRect(mousePos.x, mousePos.y);
	}, onPointerUp = (event) => {
		if (!isSelectionEnabled()) {
			event.target === container && store.connection.inProgress && (connectionEndedOnPane = !0);
			return;
		}
		event.button === 0 && (event.target?.releasePointerCapture?.(event.pointerId), !selectionInProgress && event.target === container && onClick(event), actions.setSelectionRect(void 0), selectionInProgress && actions.setSelectionRectMode(selectedNodeIds.size > 0 ? "nodes" : void 0), flush(), selectionInProgress && props.onSelectionEnd?.(event), cleanupAutoPan());
	}, onPointerCancel = (event) => {
		event.target?.releasePointerCapture?.(event.pointerId), cleanupAutoPan();
	}, onClickCapture = (event) => {
		selectionInProgress &&= (event.stopPropagation(), !1);
	};
	createEventListener(containerRef, "pointerdown", (e) => {
		isSelectionEnabled() && onPointerDownCapture(e);
	}, { capture: !0 }), createEventListener(containerRef, "click", (e) => {
		isSelectionEnabled() && onClickCapture(e);
	}, { capture: !0 });
	let onContextMenu = (event) => {
		if (event.target !== container) return;
		let result = _panOnDrag();
		if (Array.isArray(result) && result.includes(2)) {
			event.preventDefault();
			return;
		}
		props.onPaneContextMenu?.({ event });
	};
	return <div ref={(el) => {
		container = el, setContainerRef(el);
	}} onWheel={(event) => props.onPaneScroll?.({ event })} onPointerEnter={(event) => props.onPanePointerEnter?.({ event })} onPointerLeave={(event) => props.onPanePointerLeave?.({ event })} class={["solid-flow__container solid-flow__pane", {
		selection: !!isSelecting(),
		dragging: store.dragging,
		draggable: props.panOnDrag === !0 || Array.isArray(props.panOnDrag) && props.panOnDrag.includes(0)
	}]} onClick={(e) => isSelectionEnabled() ? void 0 : onClick(e)} onPointerMove={(e) => {
		props.onPanePointerMove?.({ event: e }), isSelectionEnabled() && onPointerMove(e);
	}} onPointerUp={onPointerUp} onPointerCancel={(e) => isSelectionEnabled() ? onPointerCancel(e) : void 0} onContextMenu={onContextMenu}>
      {props.children}
    </div>;
}, Panel = (props) => {
	let { store } = useInternalSolidFlow(), _props = propDefaults(props, {
		position: "top-right",
		style: {}
	}), rest = omit(_props, "class", "position", "style", "children");
	return <div class={[
		"solid-flow__panel",
		..._props.position.split("-"),
		_props.class
	]} style={{
		"pointer-events": store.selectionRectMode ? "none" : void 0,
		..._props.style
	}} {...rest}>
      {_props.children}
    </div>;
}, Viewport = (props) => {
	let { store } = useInternalSolidFlow();
	return <div class="solid-flow__container solid-flow__viewport xyflow__viewport" style={{ transform: `translate(${store.viewport.x}px, ${store.viewport.y}px) scale(${store.viewport.zoom})` }}>
      {props.children}
    </div>;
}, ViewportPortal = (props) => {
	let { store } = useInternalSolidFlow();
	return <Show when={store.domNode}>
      {(domNode) => <Portal mount={domNode().querySelector(".solid-flow__viewport-portal") ?? void 0}>
          {props.children}
        </Portal>}
    </Show>;
}, Zoom = (props) => {
	let [ref, setRef] = createSignal(), { store, actions } = useInternalSolidFlow(), viewPort = () => props.initialViewport || {
		x: 0,
		y: 0,
		zoom: 1
	}, panOnDrag = () => store.panActivationKeyPressed || props.panOnDrag, panOnScroll = () => store.panActivationKeyPressed || props.panOnScroll, onTransformChange = (transform) => {
		let [x, y, zoom] = transform;
		actions.setViewport({
			x,
			y,
			zoom
		});
	};
	return createEffect(() => ref(), (el) => {
		if (!el) return;
		let panZoomInstance = untrack(() => XYPanZoom({
			domNode: el,
			minZoom: store.minZoom,
			maxZoom: store.maxZoom,
			translateExtent: store.translateExtent,
			viewport: viewPort(),
			onDraggingChange: actions.setDragging,
			onPanZoomStart: props.onMoveStart,
			onPanZoom: props.onMove,
			onPanZoomEnd: props.onMoveEnd
		})), vp = panZoomInstance.getViewport(), initial = untrack(() => viewPort());
		(initial.x !== vp.x || initial.y !== vp.y || initial.zoom !== vp.zoom) && onTransformChange([
			vp.x,
			vp.y,
			vp.zoom
		]), actions.setViewport(vp), actions.setPanZoom(panZoomInstance), props.onViewportInitialized?.();
	}), createEffect(() => ({
		panZoom: store.panZoom,
		options: {
			lib: store.lib,
			panActivationKeyPressed: store.panActivationKeyPressed,
			zoomActivationKeyPressed: store.zoomActivationKeyPressed,
			noPanClassName: store.noPanClass,
			noWheelClassName: store.noWheelClass,
			userSelectionActive: !!store.selectionRect,
			panOnScrollSpeed: props.panOnScrollSpeed,
			panOnDrag: panOnDrag(),
			panOnScroll: panOnScroll(),
			zoomOnScroll: props.zoomOnScroll,
			zoomOnDoubleClick: props.zoomOnDoubleClick,
			zoomOnPinch: props.zoomOnPinch,
			panOnScrollMode: props.panOnScrollMode,
			preventScrolling: typeof props.preventScrolling != "boolean" || props.preventScrolling,
			paneClickDistance: props.paneClickDistance,
			selectionOnDrag: props.selectionOnDrag,
			connectionInProgress: store.connection.inProgress
		}
	}), ({ panZoom, options }) => {
		panZoom?.update({
			...options,
			onTransformChange
		});
	}), <div ref={setRef} class="solid-flow__container solid-flow__zoom">
      {props.children}
    </div>;
}, Selection = (props) => {
	let _props = propDefaults(props, { isVisible: !0 }), styles = () => ({
		..._props.width != null && { width: typeof _props.width == "string" ? _props.width : toPxString(_props.width) },
		..._props.height != null && { height: typeof _props.height == "string" ? _props.height : toPxString(_props.height) },
		..._props.x != null && _props.y != null && { transform: `translate(${props.x}px, ${props.y}px)` }
	});
	return <Show when={_props.isVisible}>
      <div class="solid-flow__selection" style={styles()} />
    </Show>;
}, NodeSelection = (props) => {
	let { store, nodeLookup, actions } = useInternalSolidFlow(), [ref, setRef] = createSignal(), bounds = createMemo(() => store.selectionRectMode === "nodes" ? getInternalNodesBounds(nodeLookup, { filter: (node) => !!node.selected }) : null);
	createEffect(() => ({
		el: ref(),
		focusable: !store.disableKeyboardA11y
	}), ({ el, focusable }) => {
		focusable && el?.focus({ preventScroll: !0 });
	});
	let onContextMenu = (event) => {
		let selectedNodes = store.selectedNodes;
		props.onSelectionContextMenu?.({
			nodes: selectedNodes,
			event
		});
	}, onClick = (event) => {
		let selectedNodes = store.selectedNodes;
		props.onSelectionClick?.({
			nodes: selectedNodes,
			event
		});
	};
	createDraggable(ref, () => ({
		disabled: !1,
		onDrag: (event, _, __, nodes) => {
			props.onNodeDrag?.({
				event,
				targetNode: null,
				nodes
			});
		},
		onDragStart: (event, _, __, nodes) => {
			props.onNodeDragStart?.({
				event,
				targetNode: null,
				nodes
			});
		},
		onDragStop: (event, _, __, nodes) => {
			props.onNodeDragStop?.({
				event,
				targetNode: null,
				nodes
			});
		}
	}));
	let onKeyDown = (event) => {
		let diff = ARROW_KEY_DIFFS[event.key];
		diff && (event.preventDefault(), actions.moveSelectedNodes(diff, event.shiftKey ? 4 : 1));
	};
	return <Show when={store.selectionRectMode === "nodes" && bounds() && isNumeric(bounds()?.x) && isNumeric(bounds()?.y)}>
      <div ref={setRef} class={["solid-flow__selection-wrapper", store.noPanClass]} style={{
		width: toPxString(bounds()?.width),
		height: toPxString(bounds()?.height),
		transform: `translate(${bounds()?.x}px, ${bounds()?.y}px)`
	}} onClick={onClick} onContextMenu={onContextMenu} role={store.disableKeyboardA11y ? void 0 : "button"} tabindex={store.disableKeyboardA11y ? void 0 : -1} onKeyDown={store.disableKeyboardA11y ? void 0 : onKeyDown}>
        <Selection width="100%" height="100%" x={0} y={0} />
      </div>
    </Show>;
}, Attribution = (props) => <Show when={!props.proOptions?.hideAttribution}>
      <Panel position={props.position ?? "bottom-right"} class="solid-flow__attribution" data-message="Feel free to remove the attribution or check out how you could support us: https://solidflow.dev/support-us">
        <a href="https://solidflow.dev" target="_blank" rel="noopener noreferrer" aria-label="Solid Flow attribution">
          Solid Flow
        </a>
      </Panel>
    </Show>, MODIFIER_FLAG = {
	alt: "altKey",
	control: "ctrlKey",
	ctrl: "ctrlKey",
	meta: "metaKey",
	shift: "shiftKey"
};
function isKeyObject(key) {
	return typeof key == "object" && !!key;
}
function getModifier(key) {
	return isKeyObject(key) && key.modifier || [];
}
function getKeyString(key) {
	return key == null ? "" : isKeyObject(key) ? key.key : key;
}
function matchesKey(event, keyDef) {
	if (!keyDef) return !1;
	let keyString = getKeyString(keyDef);
	if (!keyString) return !1;
	let modifiers = getModifier(keyDef);
	if (Array.isArray(modifiers)) {
		let modifierMatch = modifiers.flatMap((mod) => mod).every((mod) => {
			switch (mod.toLowerCase()) {
				case "meta": return event.metaKey;
				case "ctrl": return event.ctrlKey;
				case "alt": return event.altKey;
				case "shift": return event.shiftKey;
				default: return !1;
			}
		});
		return event.key === keyString && modifierMatch;
	}
	return event.key === keyString;
}
function matchesKeyArray(event, keyDefs) {
	return keyDefs ? (Array.isArray(keyDefs) ? keyDefs : [keyDefs]).some((keyDef) => matchesKey(event, keyDef)) : !1;
}
/**
* Whether an event's modifier flags PROVE this key definition cannot be held
* right now: the key itself is a modifier whose flag is off, or one of its
* required modifiers is off. Definitions built on non-modifier keys are never
* contradicted (their state isn't derivable from flags). This is the
* self-heal for OS overlays that swallow keyups without blurring the window
* (upstream xyflow#5679).
*/
function isContradicted(flags, keyDef) {
	let keyFlag = MODIFIER_FLAG[getKeyString(keyDef).toLowerCase()];
	if (keyFlag && !flags[keyFlag]) return !0;
	let modifiers = getModifier(keyDef);
	return (Array.isArray(modifiers) ? modifiers.flatMap((mod) => mod) : [modifiers]).some((mod) => {
		let modFlag = MODIFIER_FLAG[mod.toLowerCase()];
		return !!modFlag && !flags[modFlag];
	});
}
/** True only when EVERY definition for this key state is contradicted. */
function allContradicted(flags, keyDefs) {
	if (!keyDefs) return !1;
	let keys = Array.isArray(keyDefs) ? keyDefs : [keyDefs];
	return keys.length > 0 && keys.every((keyDef) => isContradicted(flags, keyDef));
}
//#endregion
//#region src/hooks/useSolidFlow.ts
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
function useSolidFlow() {
	let { flow, commands } = useInternalSolidFlow();
	return {
		...commands,
		flow,
		commands
	};
}
//#endregion
//#region src/components/utility/KeyHandler.ts
const KeyHandler = (props) => {
	let { store, actions } = useInternalSolidFlow(), { deleteElements } = useSolidFlow(), _props = {
		get selectionKey() {
			return props.selectionKey ?? "Shift";
		},
		get multiSelectionKey() {
			return props.multiSelectionKey ?? (isMacOs() ? "Meta" : "Control");
		},
		get deleteKey() {
			return props.deleteKey ?? "Backspace";
		},
		get panActivationKey() {
			return props.panActivationKey ?? " ";
		},
		get zoomActivationKey() {
			return props.zoomActivationKey ?? (isMacOs() ? "Meta" : "Control");
		}
	}, resetKeysAndSelection = () => {
		actions.setSelectionRect(void 0), actions.setSelectionKeyPressed(!1), actions.setMultiselectionKeyPressed(!1), actions.setDeleteKeyPressed(!1), actions.setPanActivationKeyPressed(!1), actions.setZoomActivationKeyPressed(!1);
	}, reconcileModifiers = (event) => {
		let changed = !1;
		store.selectionKeyPressed && allContradicted(event, _props.selectionKey) && (actions.setSelectionKeyPressed(!1), changed = !0), store.multiselectionKeyPressed && allContradicted(event, _props.multiSelectionKey) && (actions.setMultiselectionKeyPressed(!1), changed = !0), store.panActivationKeyPressed && allContradicted(event, _props.panActivationKey) && (actions.setPanActivationKeyPressed(!1), changed = !0), store.zoomActivationKeyPressed && allContradicted(event, _props.zoomActivationKey) && (actions.setZoomActivationKeyPressed(!1), changed = !0), changed && flush();
	}, cancelPointerGestures = () => {
		let release = (Ctor, type) => {
			try {
				window.dispatchEvent(new Ctor(type, { view: window }));
			} catch {
				window.dispatchEvent(new Ctor(type));
			}
		};
		release(MouseEvent, "mouseup"), typeof PointerEvent < "u" && release(PointerEvent, "pointerup");
	}, handleWindowBlur = () => {
		resetKeysAndSelection(), cancelPointerGestures();
	}, handleDelete = async () => {
		let selectedNodes = store.selectedNodes, selectedEdges = store.selectedEdges;
		await deleteElements({
			nodes: selectedNodes,
			edges: selectedEdges
		});
	};
	return isServer || (createEventListenerMap(window, {
		keydown: (event) => {
			reconcileModifiers(event), matchesKeyArray(event, _props.selectionKey) && actions.setSelectionKeyPressed(!0), matchesKeyArray(event, _props.multiSelectionKey) && actions.setMultiselectionKeyPressed(!0), matchesKeyArray(event, _props.deleteKey) && !isInputDOMNode(event) && (event.ctrlKey || event.metaKey || event.shiftKey || (actions.setDeleteKeyPressed(!0), handleDelete())), matchesKeyArray(event, _props.panActivationKey) && actions.setPanActivationKeyPressed(!0), matchesKeyArray(event, _props.zoomActivationKey) && actions.setZoomActivationKeyPressed(!0), flush();
		},
		keyup: (event) => {
			reconcileModifiers(event), matchesKeyArray(event, _props.selectionKey) && actions.setSelectionKeyPressed(!1), matchesKeyArray(event, _props.multiSelectionKey) && actions.setMultiselectionKeyPressed(!1), matchesKeyArray(event, _props.deleteKey) && actions.setDeleteKeyPressed(!1), matchesKeyArray(event, _props.panActivationKey) && actions.setPanActivationKeyPressed(!1), matchesKeyArray(event, _props.zoomActivationKey) && actions.setZoomActivationKeyPressed(!1), flush();
		},
		blur: handleWindowBlur,
		contextmenu: resetKeysAndSelection
	}), createEventListenerMap(window, {
		pointerdown: reconcileModifiers,
		wheel: reconcileModifiers
	}, {
		capture: !0,
		passive: !0
	})), null;
}, FLOW_PROP_KEYS = /* @__PURE__ */ "ariaLabelConfig.ariaLiveMessage.attributionPosition.autoPanOnConnect.autoPanOnNodeDrag.autoPanOnNodeFocus.autoPanOnSelection.autoPanSpeed.class.clickConnect.colorMode.colorModeSSR.connectionDragThreshold.connectionLineComponent.connectionLineContainerStyle.connectionLineStyle.connectionLineType.connectionMode.connectionRadius.defaultEdgeOptions.defaultEdges.defaultMarkerColor.defaultNodes.deleteKey.disableKeyboardA11y.edgeTypes.edges.edgesFocusable.elementsSelectable.elevateEdgesOnSelect.elevateNodesOnSelect.fitView.fitViewOptions.height.id.initialViewport.isValidConnection.maxZoom.minZoom.multiSelectionKey.noDragClass.noPanClass.noWheelClass.nodeClickDistance.nodeDragThreshold.nodeExtent.nodeOrigin.nodeTypes.nodes.nodesConnectable.nodesDraggable.nodesFocusable.onBeforeConnect.onBeforeDelete.onBeforeReconnect.onClickConnectEnd.onClickConnectStart.onConnect.onConnectEnd.onConnectStart.onDelete.onEdgeClick.onEdgeContextMenu.onEdgeDoubleClick.onEdgePointerEnter.onEdgePointerLeave.onEdgePointerMove.onEdgesDelete.onFlowError.onInit.onMove.onMoveEnd.onMoveStart.onNodeClick.onNodeContextMenu.onNodeDoubleClick.onNodeDrag.onNodeDragStart.onNodeDragStop.onNodePointerEnter.onNodePointerLeave.onNodePointerMove.onNodesDelete.onPaneClick.onPaneContextMenu.onPanePointerEnter.onPanePointerLeave.onPanePointerMove.onPaneScroll.onReconnect.onReconnectEnd.onReconnectStart.onSelectionChange.onSelectionClick.onSelectionContextMenu.onSelectionDrag.onSelectionDragStart.onSelectionDragStop.onSelectionEnd.onSelectionStart.onViewportChange.onlyRenderVisibleElements.panActivationKey.panOnDrag.panOnScroll.panOnScrollMode.panOnScrollSpeed.paneClickDistance.preventScrolling.proOptions.selectNodesOnDrag.selectionKey.selectionMode.selectionOnDrag.snapGrid.style.translateExtent.viewport.width.zIndexMode.zoomActivationKey.zoomOnDoubleClick.zoomOnPinch.zoomOnScroll".split("."), SolidFlow = (props) => {
	let [domNodeRef, setDomNodeRef] = createSignal(), domNode, _props = merge({
		...getDefaultFlowStateProps(),
		colorMode: "light",
		nodeClickDistance: 0,
		panOnScroll: !1,
		preventScrolling: !0,
		panOnDrag: !0,
		panOnScrollSpeed: .5,
		panOnScrollMode: "free",
		paneClickDistance: 0,
		selectionOnDrag: !1,
		translateExtent: infiniteExtent,
		zoomOnPinch: !0,
		zoomOnDoubleClick: !0,
		zoomOnScroll: !0
	}, props), htmlProps = omit(_props, ...FLOW_PROP_KEYS, "children"), TypedSolidFlowContext = typedSolidFlowContext(), solidFlow = useContext(TypedSolidFlowContext) ?? createSolidFlow(_props), { store, actions } = solidFlow;
	onSettled(() => (actions.applyInitialFitView(_props.fitView), actions.setConfig(_props), actions.setDomNode(domNode), () => {
		runWithOwner(null, () => actions.reset());
	})), createEffect(() => domNodeRef(), (el) => {
		if (!el) return;
		let observer = new ResizeObserver(() => {
			actions.setWidth(el.clientWidth), actions.setHeight(el.clientHeight);
		});
		return observer.observe(el), () => observer.disconnect();
	});
	let selectedElements = createMemo(() => ({
		nodes: store.selectedNodes,
		edges: store.selectedEdges
	}), { equals: (a, b) => a.nodes.length === b.nodes.length && a.edges.length === b.edges.length && a.nodes.every((node, i) => node.id === b.nodes[i].id) && a.edges.every((edge, i) => edge.id === b.edges[i].id) });
	createEffect(() => ({
		x: store.viewport.x,
		y: store.viewport.y,
		zoom: store.viewport.zoom
	}), (viewport, prev) => {
		prev && untrack(() => _props.onViewportChange)?.(viewport);
	}), createEffect(() => selectedElements(), (params) => {
		untrack(() => _props.onSelectionChange)?.(params);
	});
	let asyncSeedGuard = () => (_props.nodes?.length, _props.edges?.length, null), rootStyle = () => ({
		width: toPxString(_props.width),
		height: toPxString(_props.height),
		..._props.style
	});
	return <div role="application" data-testid="solid-flow__wrapper" ref={(el) => {
		domNode = el, setDomNodeRef(el);
	}} class={[
		"solid-flow",
		"solid-flow__container",
		_props.class,
		store.colorMode,
		{
			connecting: !!store.connectionFromHandle || !!store.clickConnectStartHandle,
			"connecting-from-source": (store.connectionFromHandle ?? store.clickConnectStartHandle)?.type === "source",
			"connecting-from-target": (store.connectionFromHandle ?? store.clickConnectStartHandle)?.type === "target",
			"connection-strict": store.connectionMode === "strict"
		}
	]} style={rootStyle()} onScroll={(e) => {
		e.currentTarget.scrollTo({
			top: 0,
			left: 0,
			behavior: "auto"
		});
	}} {...htmlProps}>
      <TypedSolidFlowContext value={solidFlow}>
        {asyncSeedGuard()}
        <KeyHandler selectionKey={_props.selectionKey} deleteKey={_props.deleteKey} panActivationKey={_props.panActivationKey} multiSelectionKey={_props.multiSelectionKey} zoomActivationKey={_props.zoomActivationKey} />
        <Zoom panOnScrollMode={_props.panOnScrollMode} preventScrolling={_props.preventScrolling} zoomOnScroll={_props.zoomOnScroll} zoomOnDoubleClick={_props.zoomOnDoubleClick} zoomOnPinch={_props.zoomOnPinch} panOnScroll={_props.panOnScroll} panOnScrollSpeed={_props.panOnScrollSpeed} panOnDrag={_props.panOnDrag} paneClickDistance={_props.paneClickDistance} selectionOnDrag={_props.selectionOnDrag} onMoveStart={_props.onMoveStart} onMove={_props.onMove} onMoveEnd={_props.onMoveEnd} onViewportInitialized={_props.onInit} initialViewport={_props.viewport || _props.initialViewport}>
          <Pane onPaneClick={_props.onPaneClick} onPaneContextMenu={_props.onPaneContextMenu} onPaneScroll={_props.onPaneScroll} onPanePointerEnter={_props.onPanePointerEnter} onPanePointerMove={_props.onPanePointerMove} onPanePointerLeave={_props.onPanePointerLeave} onSelectionStart={_props.onSelectionStart} onSelectionEnd={_props.onSelectionEnd} panOnDrag={_props.panOnDrag} selectionOnDrag={_props.selectionOnDrag} paneClickDistance={_props.paneClickDistance} autoPanOnSelection={_props.autoPanOnSelection}>
            <Viewport>
              <div class="solid-flow__container solid-flow__viewport-back" />
              <EdgeRenderer onEdgeClick={_props.onEdgeClick} onEdgeContextMenu={_props.onEdgeContextMenu} onEdgePointerEnter={_props.onEdgePointerEnter} onEdgePointerLeave={_props.onEdgePointerLeave} onEdgePointerMove={_props.onEdgePointerMove} onEdgeDoubleClick={_props.onEdgeDoubleClick} />
              <div class="solid-flow__container solid-flow__edge-labels" />
              <ConnectionLine type={_props.connectionLineType} component={_props.connectionLineComponent} containerStyle={_props.connectionLineContainerStyle} style={_props.connectionLineStyle} />
              <NodeRenderer nodeClickDistance={_props.nodeClickDistance} onNodeClick={_props.onNodeClick} onNodeDoubleClick={_props.onNodeDoubleClick} onNodeContextMenu={_props.onNodeContextMenu} onNodePointerEnter={_props.onNodePointerEnter} onNodePointerMove={_props.onNodePointerMove} onNodePointerLeave={_props.onNodePointerLeave} onNodeDrag={_props.onNodeDrag} onNodeDragStart={_props.onNodeDragStart} onNodeDragStop={_props.onNodeDragStop} />
              <NodeSelection onSelectionClick={_props.onSelectionClick} onSelectionContextMenu={_props.onSelectionContextMenu} onNodeDrag={_props.onNodeDrag} onNodeDragStart={_props.onNodeDragStart} onNodeDragStop={_props.onNodeDragStop} />
            </Viewport>
            <Selection isVisible={!!store.selectionRect && store.selectionRectMode === "user"} width={store.selectionRect?.width} height={store.selectionRect?.height} x={store.selectionRect?.x} y={store.selectionRect?.y} />
          </Pane>
        </Zoom>
        <Attribution proOptions={_props.proOptions} position={_props.attributionPosition} />
        <A11yDescriptions />
        {_props.children}
      </TypedSolidFlowContext>
    </div>;
}, SolidFlowProvider = (props) => {
	let _props = merge(getDefaultFlowStateProps(), props), solidFlow = createSolidFlow(_props);
	onCleanup(() => {
		runWithOwner(null, () => solidFlow.actions.reset());
	});
	let ContextProvider = typedSolidFlowContext();
	return <ContextProvider value={solidFlow}>{props.children}</ContextProvider>;
};
//#endregion
//#region src/hooks/useColorMode.ts
/**
* Hook for receiving the current color mode class ('dark' or 'light').
*
* When the flow's `colorMode` prop is set to `"system"`, this resolves to the
* user's current system preference.
*
* @public
* @returns an accessor for the current color mode class
*/
function useColorMode() {
	let { flow } = useInternalSolidFlow();
	return () => flow.colorMode;
}
//#endregion
//#region src/hooks/useConnection.ts
/**
* Hook for receiving the current connection.
*
* @public
* @returns current connection as a readable store
*/
function useConnection() {
	let { flow } = useInternalSolidFlow();
	return () => flow.connection;
}
//#endregion
//#region src/hooks/useGraph.ts
/**
* Hook for getting the current nodes from the store.
*
* @public
* @returns store with an array of nodes
*/
function useNodes() {
	let { flow } = useInternalSolidFlow();
	return () => flow.nodes;
}
/**
* Hook for getting the current edges from the store.
*
* @public
* @returns store with an array of edges
*/
function useEdges() {
	let { flow } = useInternalSolidFlow();
	return () => flow.edges;
}
/**
* Hook for getting the current viewport from the store.
*
* @public
* @returns store with the viewport object
*/
function useViewport() {
	let { flow } = useInternalSolidFlow();
	return () => flow.viewport;
}
/**
* Reactive lookup of one node by id (xyflow#5868 parity). Returns the USER
* node row — for measured geometry use {@link useInternalNode}.
*/
function useNode(id) {
	let { flow } = useInternalSolidFlow();
	return () => flow.nodes.find((node) => node.id === id());
}
/** Reactive lookup of one edge by id (xyflow#5868 parity). */
function useEdge(id) {
	let { flow } = useInternalSolidFlow();
	return () => flow.edges.find((edge) => edge.id === id());
}
/** The currently selected nodes, reactively (xyflow#5868 parity). */
function useSelectedNodes() {
	let { flow } = useInternalSolidFlow();
	return () => flow.selection.nodes;
}
/** The currently selected edges, reactively (xyflow#5868 parity). */
function useSelectedEdges() {
	let { flow } = useInternalSolidFlow();
	return () => flow.selection.edges;
}
//#endregion
//#region src/hooks/useInitialized.ts
/**
* Hook for seeing if all nodes have been measured.
*
* Returns `false` until every non-hidden node has been rendered and measured.
* Useful for running layouting or fitView logic that depends on node dimensions.
*
* @public
* @returns an accessor that indicates whether the nodes are initialized
*/
function useNodesInitialized() {
	let { flow } = useInternalSolidFlow();
	return () => flow.nodesInitialized;
}
/**
* Hook for seeing if the viewport is initialized.
*
* Returns `true` once the pan/zoom instance has been created for the flow.
*
* @public
* @returns an accessor that indicates whether the viewport is initialized
*/
function useViewportInitialized() {
	let { flow } = useInternalSolidFlow();
	return () => flow.viewportInitialized;
}
//#endregion
//#region src/hooks/useInternalNode.ts
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
function useInternalNode(id) {
	let { flow } = useInternalSolidFlow();
	return () => flow.internalNodes[id()];
}
//#endregion
//#region src/hooks/useKeyPress.ts
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
function useKeyPress(keys) {
	let [pressed, setPressed] = createSignal(!1);
	if (createEffect(() => keys(), () => {
		setPressed(!1);
	}, { defer: !0 }), !isServer) {
		let reconcile = (event) => {
			pressed() && allContradicted(event, keys()) && (setPressed(!1), flush());
		};
		createEventListenerMap(window, {
			keydown: (event) => {
				reconcile(event), matchesKeyArray(event, keys()) && (setPressed(!0), flush());
			},
			keyup: (event) => {
				reconcile(event), matchesKeyArray(event, keys()) && (setPressed(!1), flush());
			},
			blur: () => {
				setPressed(!1), flush();
			}
		}), createEventListenerMap(window, {
			pointerdown: reconcile,
			wheel: reconcile
		}, {
			capture: !0,
			passive: !0
		});
	}
	return pressed;
}
//#endregion
//#region src/hooks/useNodeConnections.ts
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
const useNodeConnections = (params) => {
	let { flow } = useInternalSolidFlow(), ctxNodeId = () => {
		let id = useContext(NodeIdContext);
		return id ? id() : "";
	}, id = () => params().handleId, type = () => params().handleType, nodeId = () => params().id ?? ctxNodeId(), [connections, setConnections] = createSignal([]), prevConnections;
	return createEffect(() => {
		let rec = flow.connections[connectionKey(nodeId(), type(), id())], map = /* @__PURE__ */ new Map();
		for (let key of Object.keys(rec ?? {})) map.set(key, { ...rec[key] });
		return { connections: map };
	}, ({ connections: nextConnections }) => {
		areConnectionMapsEqual(nextConnections, prevConnections) || (prevConnections = nextConnections, setConnections(Array.from(nextConnections.values())));
	}), connections;
};
//#endregion
//#region src/hooks/useNodesData.ts
function useNodesData(nodeIds) {
	let { flow } = useInternalSolidFlow(), prevNodesData = [];
	return createMemo(() => {
		let nodesData = [], idValues = nodeIds();
		if (!idValues) return;
		let ids = Array.isArray(idValues) ? idValues : [idValues];
		for (let nodeId of ids) {
			let node = flow.internalNodes[nodeId]?.internals.userNode;
			node && nodesData.push({
				id: node.id,
				type: node.type,
				data: node.data
			});
		}
		return shallowNodeData(nodesData, prevNodesData) || (prevNodesData = nodesData), Array.isArray(idValues) ? nodesData : nodesData[0];
	});
}
//#endregion
//#region src/hooks/useUpdateNodeInternals.ts
/**
* Hook for updating node internals. Sugar for `commands.updateNodeInternals`.
*
* @public
* @returns function for updating node internals
*/
function useUpdateNodeInternals() {
	let { commands } = useInternalSolidFlow();
	return commands.updateNodeInternals;
}
//#endregion
//#region src/plugins/background/DotPattern.tsx
const DotPattern = (props) => {
	let _props = propDefaults(props, { radius: 5 });
	return <circle class={[
		"solid-flow__background-pattern",
		"dots",
		_props.class
	]} cx={_props.radius} cy={_props.radius} r={_props.radius} />;
}, LinePattern = (props) => {
	let _props = propDefaults(props, { lineWidth: 1 });
	return <path stroke-width={_props.lineWidth} d={`M${_props.dimensions[0] / 2} 0 V${_props.dimensions[1]} M0 ${_props.dimensions[1] / 2} H${_props.dimensions[0]}`} class={[
		"solid-flow__background-pattern",
		_props.variant,
		_props.class
	]} />;
}, DEFAULT_SIZE = {
	dots: 1,
	lines: 1,
	cross: 6
}, Background = (props) => {
	let _props = propDefaults(props, {
		variant: "dots",
		gap: 20,
		lineWidth: 1,
		style: {}
	}), { store } = useInternalSolidFlow(), isDots = () => _props.variant === "dots", isCross = () => _props.variant === "cross", patternId = () => `background-pattern-${store.id}-${_props.id ?? ""}`, scaledSize = () => (_props.size ?? DEFAULT_SIZE[_props.variant]) * store.viewport.zoom, gapXY = () => Array.isArray(_props.gap) ? _props.gap : [_props.gap, _props.gap], scaledGap = () => [gapXY()[0] * store.viewport.zoom || 1, gapXY()[1] * store.viewport.zoom || 1], patternDimensions = () => isCross() ? [scaledSize(), scaledSize()] : scaledGap(), patternOffset = () => isDots() ? [scaledSize() / 2, scaledSize() / 2] : [patternDimensions()[0] / 2, patternDimensions()[1] / 2];
	return <svg data-testid="solid-flow__background" class={["solid-flow__container solid-flow__background", _props.class]} style={{
		"--xy-background-color-props": _props.bgColor,
		"--xy-background-pattern-color-props": _props.patternColor,
		..._props.style
	}}>
      <pattern id={patternId()} x={store.viewport.x % scaledGap()[0]} y={store.viewport.y % scaledGap()[1]} width={scaledGap()[0]} height={scaledGap()[1]} patternUnits="userSpaceOnUse" patternTransform={`translate(-${patternOffset()[0]},-${patternOffset()[1]})`}>
        <Show when={!isDots()} fallback={<DotPattern radius={scaledSize() / 2} class={_props.patternClass} />}>
          <LinePattern class={_props.patternClass} dimensions={patternDimensions()} variant={_props.variant} lineWidth={_props.lineWidth} />
        </Show>
      </pattern>
      <rect x="0" y="0" width="100%" height="100%" fill={`url(#${patternId()})`} />
    </svg>;
}, ControlButton = (props) => {
	let rest = omit(props, "class", "bgColor", "bgColorHover", "color", "colorHover", "borderColor", "onClick", "children"), style = () => Object.entries({
		"--xy-controls-button-background-color-props": props.bgColor,
		"--xy-controls-button-background-color-hover-props": props.bgColorHover,
		"--xy-controls-button-color-props": props.color,
		"--xy-controls-button-color-hover-props": props.colorHover,
		"--xy-controls-button-border-color-props": props.borderColor
	}).filter(([_, value]) => value !== void 0).reduce((acc, [key, value]) => (acc[key] = value, acc), {});
	return <button type="button" class={["solid-flow__controls-button", props.class]} onClick={(e) => props.onClick?.(e)} style={style()} {...rest}>
      {props.children}
    </button>;
}, Fit = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 30">
    <path d="M3.692 4.63c0-.53.4-.938.939-.938h5.215V0H4.708C2.13 0 0 2.054 0 4.63v5.216h3.692V4.631zM27.354 0h-5.2v3.692h5.17c.53 0 .984.4.984.939v5.215H32V4.631A4.624 4.624 0 0027.354 0zm.954 24.83c0 .532-.4.94-.939.94h-5.215v3.768h5.215c2.577 0 4.631-2.13 4.631-4.707v-5.139h-3.692v5.139zm-23.677.94c-.531 0-.939-.4-.939-.94v-5.138H0v5.139c0 2.577 2.13 4.707 4.708 4.707h5.138V25.77H4.631z" />
  </svg>, Lock = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 32">
    <path d="M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0 8 0 4.571 3.429 4.571 7.619v3.048H3.048A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047zm4.724-13.866H7.467V7.619c0-2.59 2.133-4.724 4.723-4.724 2.591 0 4.724 2.133 4.724 4.724v3.048z" />
  </svg>, Minus = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 5">
    <path d="M0 0h32v4.2H0z" />
  </svg>, Plus = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <path d="M32 18.133H18.133V32h-4.266V18.133H0v-4.266h13.867V0h4.266v13.867H32z" />
  </svg>, Unlock = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 32">
    <path d="M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0c-4.114 1.828-1.37 2.133.305 2.438 1.676.305 4.42 2.59 4.42 5.181v3.048H3.047A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047z" />
  </svg>, Controls = (props) => {
	let { store, actions } = useInternalSolidFlow(), _props = propDefaults(props, {
		position: "bottom-left",
		showZoom: !0,
		showFitView: !0,
		showLock: !0,
		orientation: "vertical"
	}), rest = omit(_props, "class", "position", "showZoom", "showFitView", "showLock", "orientation", "fitViewOptions", "beforeControls", "afterControls", "buttonBgColor", "buttonBgColorHover", "buttonColor", "buttonColorHover", "buttonBorderColor", "style", "children"), getMinZoomReached = () => store.viewport.zoom <= store.minZoom, getMaxZoomReached = () => store.viewport.zoom >= store.maxZoom, getIsInteractive = () => store.nodesDraggable || store.nodesConnectable || store.elementsSelectable, onZoomInHandler = () => {
		actions.zoomIn();
	}, onZoomOutHandler = () => {
		actions.zoomOut();
	}, onFitViewHandler = () => {
		actions.fitView(_props.fitViewOptions);
	}, onToggleInteractivity = () => {
		let newValue = !getIsInteractive();
		actions.setNodesDraggable(newValue), actions.setNodesConnectable(newValue), actions.setElementsSelectable(newValue);
	}, buttonProps = () => ({
		bgColor: _props.buttonBgColor,
		bgColorHover: _props.buttonBgColorHover,
		color: _props.buttonColor,
		colorHover: _props.buttonColorHover,
		borderColor: _props.buttonBorderColor
	});
	return <Panel class={[
		"solid-flow__controls",
		_props.orientation,
		_props.class
	]} position={_props.position} data-testid="solid-flow__controls" aria-label={store.ariaLabelConfig["controls.ariaLabel"]} style={_props.style} {...rest}>
      {_props.beforeControls}
      <Show when={_props.showZoom}>
        <>
          <ControlButton onClick={onZoomInHandler} class="solid-flow__controls-zoomin" title={store.ariaLabelConfig["controls.zoomIn.ariaLabel"]} aria-label={store.ariaLabelConfig["controls.zoomIn.ariaLabel"]} disabled={getMaxZoomReached()} {...buttonProps()}>
            <Plus />
          </ControlButton>
          <ControlButton onClick={onZoomOutHandler} class="solid-flow__controls-zoomout" title={store.ariaLabelConfig["controls.zoomOut.ariaLabel"]} aria-label={store.ariaLabelConfig["controls.zoomOut.ariaLabel"]} disabled={getMinZoomReached()} {...buttonProps()}>
            <Minus />
          </ControlButton>
        </>
      </Show>
      <Show when={_props.showFitView}>
        <ControlButton class="solid-flow__controls-fitview" onClick={onFitViewHandler} title={store.ariaLabelConfig["controls.fitView.ariaLabel"]} aria-label={store.ariaLabelConfig["controls.fitView.ariaLabel"]} {...buttonProps()}>
          <Fit />
        </ControlButton>
      </Show>
      <Show when={_props.showLock}>
        <ControlButton class="solid-flow__controls-interactive" onClick={onToggleInteractivity} title={store.ariaLabelConfig["controls.interactive.ariaLabel"]} aria-label={store.ariaLabelConfig["controls.interactive.ariaLabel"]} {...buttonProps()}>
          <Show when={getIsInteractive()} fallback={<Lock />}>
            <Unlock />
          </Show>
        </ControlButton>
      </Show>
      {_props.children}
      {_props.afterControls}
    </Panel>;
}, MiniMapNode = (props) => {
	let _props = propDefaults(props, {
		borderRadius: 5,
		width: 0,
		height: 0
	}), fill = () => _props.color ?? _props.style?.background ?? _props.style?.["background-color"], style = () => Object.entries({
		fill: fill(),
		stroke: _props.strokeColor,
		"stroke-width": _props.strokeWidth
	}).filter(([_, value]) => value !== void 0).reduce((acc, [key, value]) => (acc[key] = value, acc), {});
	return <rect class={[
		"solid-flow__minimap-node",
		{ selected: !!_props.selected },
		_props.class
	]} x={_props.x} y={_props.y} rx={_props.borderRadius} ry={_props.borderRadius} width={_props.width} height={_props.height} shape-rendering={_props.shapeRendering} style={style()} onClick={_props.onClick ? (event) => _props.onClick(event, _props.id) : void 0} />;
}, getAttrFunction = (value) => value instanceof Function ? value : () => value, MiniMap = (props) => {
	let { store, nodeLookup } = useInternalSolidFlow(), _props = propDefaults(props, {
		position: "bottom-right",
		nodeClass: "",
		nodeStrokeColor: "transparent",
		pannable: !0,
		zoomable: !0,
		width: 200,
		height: 150,
		nodeBorderRadius: 5,
		offsetScale: 5,
		nodeStrokeWidth: 2,
		style: {}
	}), paneProps = omit(_props, "class", "style", "position", "nodeClass", "nodeStrokeColor", "nodeColor", "pannable", "zoomable", "inversePan", "zoomStep", "offsetScale", "bgColor", "width", "height", "maskColor", "maskStrokeColor", "maskStrokeWidth", "nodeBorderRadius", "nodeStrokeWidth", "nodeComponent", "onClick", "onNodeClick"), nodeColorFunc = () => _props.nodeColor === void 0 ? void 0 : getAttrFunction(_props.nodeColor), nodeStrokeColorFunc = () => getAttrFunction(_props.nodeStrokeColor), nodeClassFunc = () => getAttrFunction(_props.nodeClass), shapeRendering = typeof window > "u" || window.chrome ? "crispEdges" : "geometricPrecision", labelledBy = createMemo(() => `solid-flow__minimap-desc-${store.id}`), viewBB = createMemo(() => ({
		x: -store.viewport.x / store.viewport.zoom,
		y: -store.viewport.y / store.viewport.zoom,
		width: store.width / store.viewport.zoom,
		height: store.height / store.viewport.zoom
	})), rectsEqual = (a, b) => a === b || !!a && !!b && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height, sampleBounds = () => untrack(() => {
		if (nodeLookup.size === 0) return null;
		let bounds = getInternalNodesBounds(nodeLookup);
		return Number.isFinite(bounds.x) && Number.isFinite(bounds.width) ? bounds : null;
	}), [graphBounds, setGraphBounds] = createSignal(sampleBounds(), { equals: rectsEqual });
	createEffect(() => store.dragging, (dragging) => {
		if (!dragging) {
			setGraphBounds(sampleBounds());
			return;
		}
		let raf = requestAnimationFrame(function tick() {
			setGraphBounds(sampleBounds()), raf = requestAnimationFrame(tick);
		});
		return () => cancelAnimationFrame(raf);
	}), createEffect(() => ({
		count: store.nodes.length,
		initialized: store.nodesInitialized
	}), () => {
		setGraphBounds(sampleBounds());
	}), createEffect(() => null, () => {
		let interval = setInterval(() => setGraphBounds(sampleBounds()), 500);
		return () => clearInterval(interval);
	});
	let boundingRect = createMemo(() => {
		let view = viewBB(), bounds = graphBounds();
		return bounds ? getBoundsOfRects(bounds, view) : view;
	}), viewScale = createMemo(() => Math.max(boundingRect().width / _props.width, boundingRect().height / _props.height)), getViewWidth = () => viewScale() * _props.width, getViewHeight = () => viewScale() * _props.height, getOffset = () => _props.offsetScale * viewScale(), getX = () => {
		let rect = boundingRect();
		return rect.x - (getViewWidth() - rect.width) / 2 - getOffset();
	}, getY = () => {
		let rect = boundingRect();
		return rect.y - (getViewHeight() - rect.height) / 2 - getOffset();
	}, getViewboxWidth = () => getViewWidth() + getOffset() * 2, getViewboxHeight = () => getViewHeight() + getOffset() * 2, strokeWidth = () => _props.maskStrokeWidth ? _props.maskStrokeWidth * viewScale() : void 0, nodeIds = createMemo(() => store.nodes.map((node) => node.id), { equals: (a, b) => a.length === b.length && a.every((id, i) => id === b[i]) });
	return <Panel position={_props.position} data-testid="solid-flow__minimap" class={["solid-flow__minimap", _props.class]} style={{
		"--xy-minimap-background-color-props": _props.bgColor,
		..._props.style
	}} {...paneProps}>
      <Show when={store.panZoom}>
        {(panZoom) => {
		let [ref, setRef] = createSignal(), [minimap, setMinimap] = createSignal();
		createEffect(() => ({
			el: ref(),
			panZoom: panZoom()
		}), ({ el, panZoom }) => {
			if (!el) return;
			let instance = XYMinimap({
				domNode: el,
				panZoom,
				getTransform: () => store.transform,
				getViewScale: viewScale
			});
			return setMinimap(instance), () => {
				instance.destroy();
			};
		}), createEffect(() => ({
			instance: minimap(),
			options: {
				translateExtent: store.translateExtent,
				width: store.width,
				height: store.height,
				inversePan: _props.inversePan,
				zoomStep: _props.zoomStep,
				pannable: _props.pannable,
				zoomable: _props.zoomable
			}
		}), ({ instance, options }) => {
			instance?.update(options);
		});
		let onSvgClick = (event) => {
			if (!_props.onClick) return;
			let [x, y] = minimap()?.pointer(event) ?? [0, 0];
			_props.onClick(event, {
				x,
				y
			});
		}, onSvgNodeClick = (event, nodeId) => {
			let node = nodeLookup.get(nodeId)?.internals.userNode;
			node && _props.onNodeClick?.(event, node);
		};
		return <svg ref={setRef} width={_props.width} height={_props.height} viewBox={`${getX()} ${getY()} ${getViewboxWidth()} ${getViewboxHeight()}`} class="solid-flow__minimap-svg" role="img" aria-labelledby={labelledBy()} onClick={_props.onClick ? onSvgClick : void 0} style={{
			"--xy-minimap-mask-background-color-props": _props.maskColor,
			"--xy-minimap-mask-stroke-color-props": _props.maskStrokeColor,
			"--xy-minimap-mask-stroke-width-props": strokeWidth()
		}}>
              <title id={labelledBy()}>{store.ariaLabelConfig["minimap.ariaLabel"]}</title>
              <For keyed={!1} each={nodeIds()}>
                {(nodeId) => {
			let visibleNode = createMemo(() => {
				let row = nodeLookup.get(nodeId());
				return row && nodeHasDimensions(row) && !row.hidden ? row : null;
			});
			return <Show when={visibleNode()}>
                      {(node) => {
				let dimensions = () => getNodeDimensions(node()), userNode = () => node().internals.userNode;
				return <Dynamic component={_props.nodeComponent ?? MiniMapNode} id={nodeId()} x={node().internals.positionAbsolute.x} y={node().internals.positionAbsolute.y} borderRadius={_props.nodeBorderRadius} strokeWidth={_props.nodeStrokeWidth} shapeRendering={shapeRendering} width={dimensions().width} height={dimensions().height} selected={node().selected} color={nodeColorFunc()?.call(null, userNode())} strokeColor={nodeStrokeColorFunc().call(null, userNode())} class={nodeClassFunc().call(null, userNode())} style={{ ...node().style }} onClick={_props.onNodeClick ? onSvgNodeClick : void 0} />;
			}}
                    </Show>;
		}}
              </For>
              <path class="solid-flow__minimap-mask" d={`M${getX() - getOffset()},${getY() - getOffset()}h${getViewboxWidth() + getOffset() * 2}v${getViewboxHeight() + getOffset() * 2}h${-getViewboxWidth() - getOffset() * 2}z
            M${viewBB().x},${viewBB().y}h${viewBB().width}v${viewBB().height}h${-viewBB().width}z`} fill-rule="evenodd" pointer-events="none" />
            </svg>;
	}}
      </Show>
    </Panel>;
}, ResizeControl = (props) => {
	let _props = propDefaults(props, {
		variant: "handle",
		minWidth: 10,
		minHeight: 10,
		maxWidth: Number.MAX_VALUE,
		maxHeight: Number.MAX_VALUE,
		keepAspectRatio: !1,
		autoScale: !0,
		style: {}
	}), rest = omit(_props, "nodeId", "variant", "position", "minWidth", "minHeight", "maxWidth", "maxHeight", "keepAspectRatio", "autoScale", "onResizeStart", "onResize", "onResizeEnd", "shouldResize", "class", "children", "color", "style"), [resizeControlRef, setResizeControlRef] = createSignal(), { store, nodeLookup, actions } = useInternalSolidFlow(), ctxNodeId = useNodeId(), nodeId = () => _props.nodeId ?? ctxNodeId(), isLineVariant = () => _props.variant === "line", controlPosition = () => _props.position ?? (isLineVariant() ? "right" : "bottom-right"), positionClassNames = () => controlPosition().split("-"), [resizer, setResizer] = createSignal();
	return createEffect(() => resizeControlRef(), (el) => {
		if (!el) return;
		let instance = XYResizer({
			domNode: el,
			nodeId: nodeId(),
			getStoreItems: () => ({
				nodeLookup,
				transform: store.transform,
				snapGrid: store.snapGrid,
				snapToGrid: !!store.snapGrid,
				nodeOrigin: store.nodeOrigin,
				paneDomNode: store.domNode
			}),
			onChange: (change, childChanges) => {
				let changes = /* @__PURE__ */ new Map(), position = change.x && change.y ? {
					x: change.x,
					y: change.y
				} : void 0;
				changes.set(nodeId(), {
					...change,
					position
				});
				for (let childChange of childChanges) changes.set(childChange.id, { position: childChange.position });
				actions.setNodes((nodes) => {
					for (let node of nodes) {
						let nodeChange = changes.get(node.id);
						nodeChange && (node.width = nodeChange.width, node.height = nodeChange.height, node.position = {
							x: nodeChange.position?.x ?? node.position.x,
							y: nodeChange.position?.y ?? node.position.y
						});
					}
				});
			}
		});
		return setResizer(instance), () => {
			instance.destroy();
		};
	}), createEffect(() => ({
		instance: resizer(),
		options: {
			controlPosition: controlPosition(),
			boundaries: {
				minWidth: _props.minWidth,
				minHeight: _props.minHeight,
				maxWidth: _props.maxWidth,
				maxHeight: _props.maxHeight
			},
			keepAspectRatio: !!_props.keepAspectRatio,
			onResizeStart: _props.onResizeStart,
			onResize: _props.onResize,
			onResizeEnd: _props.onResizeEnd,
			shouldResize: _props.shouldResize
		}
	}), ({ instance, options }) => {
		instance?.update(options);
	}), <div ref={setResizeControlRef} class={[
		"solid-flow__resize-control",
		_props.variant,
		store.noDragClass,
		...positionClassNames(),
		_props.class
	]} style={{
		"border-color": isLineVariant() ? _props.color : void 0,
		"background-color": isLineVariant() ? void 0 : _props.color,
		scale: isLineVariant() || !_props.autoScale ? void 0 : Math.max(1 / store.viewport.zoom, 1),
		..._props.style
	}} {...rest}>
      {_props.children}
    </div>;
}, NodeResizer = (props) => {
	let _props = propDefaults(props, {
		autoScale: !0,
		visible: !0
	}), rest = omit(props, "handleClass", "handleStyle", "lineClass", "lineStyle");
	return <Show when={_props.visible}>
      <For each={XY_RESIZER_LINE_POSITIONS}>
        {(position) => <ResizeControl variant="line" position={position} class={props.lineClass} style={props.lineStyle} {...rest} />}
      </For>
      <For each={XY_RESIZER_HANDLE_POSITIONS}>
        {(position) => <ResizeControl position={position} class={props.handleClass} style={props.handleStyle} {...rest} />}
      </For>
    </Show>;
}, EdgeToolbar = (props) => {
	let rest = omit(props, "x", "y", "alignX", "alignY", "isVisible", "selectEdgeOnClick", "class", "children"), { store, edgeLookup } = useInternalSolidFlow(), edgeId = useEdgeId(), isActive = () => typeof props.isVisible == "boolean" ? props.isVisible : !!edgeLookup[edgeId()]?.selected, transform = () => getEdgeToolbarTransform(props.x, props.y, store.viewport.zoom, props.alignX ?? "center", props.alignY ?? "center");
	return <Show when={isActive()}>
      <EdgeLabel selectEdgeOnClick={props.selectEdgeOnClick} transparent>
        <div class={["solid-flow__edge-toolbar", props.class]} style={{
		position: "absolute",
		transform: transform(),
		"transform-origin": "0 0"
	}} data-id={edgeId()} {...rest}>
          {props.children}
        </div>
      </EdgeLabel>
    </Show>;
}, NodeToolbar = (props) => {
	let { store, flow, commands } = useInternalSolidFlow(), _props = propDefaults(props, {
		offset: 10,
		position: "top",
		align: "center",
		style: {}
	}), divProps = omit(_props, "nodeId", "position", "align", "offset", "isVisible", "style", "children"), ctxNodeId = () => {
		let id = useContext(NodeIdContext);
		return id ? id() : "";
	}, toolbarNodes = () => (Array.isArray(_props.nodeId) ? _props.nodeId : [_props.nodeId ?? ctxNodeId()]).reduce((res, nodeId) => {
		let node = flow.internalNodes[nodeId];
		return node && res.push(node), res;
	}, []), transform = () => {
		let nodeRect = commands.getNodesBounds(toolbarNodes());
		return nodeRect ? getNodeToolbarTransform(nodeRect, store.viewport, _props.position, _props.offset, _props.align) : "";
	}, zIndex = () => {
		let nodes = toolbarNodes();
		return nodes.length === 0 ? 1 : Math.max(...nodes.map((node) => (node.internals.z || 5) + 1));
	}, selectedNodesCount = () => flow.selection.nodes.length, isActive = () => {
		let nodes = toolbarNodes();
		return typeof _props.isVisible == "boolean" ? _props.isVisible : nodes.length === 1 && !!nodes[0].selected && selectedNodesCount() === 1;
	}, showPortal = () => !!(store.domNode && isActive() && toolbarNodes().length > 0);
	return <Show when={showPortal()}>
      <Portal mount={store.domNode}>
        <div class="solid-flow__node-toolbar" data-id={toolbarNodes().reduce((acc, node) => `${acc}${node.id} `, "").trim()} style={{
		position: "absolute",
		transform: transform(),
		"z-index": zIndex(),
		..._props.style
	}} {...divProps}>
          {_props.children}
        </div>
      </Portal>
    </Show>;
}, Position = Position$1, ConnectionMode = ConnectionMode$1, ConnectionLineType = ConnectionLineType$1, MarkerType = MarkerType$1, SelectionMode = SelectionMode$1, PanOnScrollMode = PanOnScrollMode$1, ResizeControlVariant = ResizeControlVariant$1, getEdgeCenter = getEdgeCenter$1, getBezierEdgeCenter = getBezierEdgeCenter$1;
//#endregion
export { Background, BaseEdge, BezierEdge, BezierEdgeInternal, ConnectionLine, ConnectionLineType, ConnectionMode, ControlButton, Controls, DefaultNode, EdgeLabel, EdgeLabelRenderer, EdgeReconnectAnchor, EdgeRenderer, EdgeToolbar, EdgeWrapper, GroupNode, Handle, InputNode, Marker, MarkerDefinition, MarkerType, MiniMap, MiniMapNode, NodeRenderer, NodeResizer, NodeSelection, NodeToolbar, NodeWrapper, OutputNode, PanOnScrollMode, Pane, Panel, Position, ResizeControl, ResizeControlVariant, Selection, SelectionMode, SmoothStepEdge, SmoothStepEdgeInternal, SolidFlow, SolidFlowProvider, StaticHandle, StepEdge, StepEdgeInternal, StraightEdge, StraightEdgeInternal, Viewport, ViewportPortal, Zoom, addEdge, connectionKey, createEdgeStore, createNodeStore, createOptimisticEdgeStore, createOptimisticNodeStore, getBezierEdgeCenter, getBezierPath, getConnectedEdges, getEdgeCenter, getIncomers, getNodesBounds, getOutgoers, getSmoothStepPath, getStraightPath, getViewportForBounds, useColorMode, useConnection, useEdge, useEdgeId, useEdges, useInternalNode, useKeyPress, useNode, useNodeConnections, useNodeId, useNodes, useNodesData, useNodesInitialized, useSelectedEdges, useSelectedNodes, useSolidFlow, useUpdateNodeInternals, useViewport, useViewportInitialized };

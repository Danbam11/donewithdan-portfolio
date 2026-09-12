import masterSvgUrl from './haircutdone-workflow.svg?url';
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const EXPECTED_VIEW_BOX = "0 0 3980 2005.6584821479928";
const TRAVEL_SPEED = 300;
const MOTION_PATH_EXTENSION = 36;
const MOTION_SAMPLE_SPACING = 8;
const JOURNEY_TIMING = Object.freeze({
  initialDelay: 900,
  sourcePrecharge: 180,
  arrivalHold: 280,
  edgeHandoffGap: 140,
  terminalHold: 700,
  betweenJourneys: 1100,
  loopGap: 1800,
});
const AMBIENT_DUTY_CYCLE = 0.78;
const AMBIENT_INITIAL_DELAY = 650;
const GOLDEN_FRACTION = 0.6180339887498949;

export const BOARD_WIDTH = 1248;
export const BOARD_HEIGHT = 677;
export const WORKFLOW_WIDTH = 1120;
export const WORKFLOW_HEIGHT = 565;
export const HAIRCUTDONE_WORKFLOW_DIMENSIONS = Object.freeze({
  boardWidth: BOARD_WIDTH,
  boardHeight: BOARD_HEIGHT,
  workflowWidth: WORKFLOW_WIDTH,
  workflowHeight: WORKFLOW_HEIGHT,
});

let activeInstance = null;
const domId = (semanticId) => `haircutdone-workflow-${semanticId}`;

// These deterministic corrections were applied to the golden-ratio starting
// phases after auditing the measured path durations over a 60-second window.
// They change phase only; speed, duty cycle, paths, and signal count stay fixed.
const AMBIENT_PHASE_ADJUSTMENTS = Object.freeze({
  "edge-001-booking-route": 0.12379181268625006,
  "edge-booking-route-002": 0.7434484675526609,
  "edge-booking-route-007": 0.9075188282923792,
  "edge-007-002": 0.5787885329965502,
  "edge-booking-route-006": 0.788503700820729,
  "edge-006-002": 0.8994231905322524,
  "edge-002-appointment-outcome": 0.38130140263587253,
  "edge-appointment-outcome-003": 0.8048543351143593,
  "edge-appointment-outcome-004": 0.990093412338756,
  "edge-appointment-outcome-005": 0.9541790498932826,
  "edge-003-004": 0.13659431806765587,
  "edge-appointment-outcome-002-rebooks": 0.9357545835943892,
  "edge-005-002-rescheduled": 0.02948195521254049,
});

const JOURNEYS = Object.freeze([
  Object.freeze({
    id: "journey-standard-completion",
    edges: Object.freeze([
      "edge-001-booking-route",
      "edge-booking-route-002",
      "edge-002-appointment-outcome",
      "edge-appointment-outcome-003",
    ]),
  }),
  Object.freeze({
    id: "journey-vip-route",
    edges: Object.freeze([
      "edge-001-booking-route",
      "edge-booking-route-007",
      "edge-007-002",
      "edge-002-appointment-outcome",
      "edge-appointment-outcome-004",
    ]),
  }),
  Object.freeze({
    id: "journey-no-booking-rebook",
    edges: Object.freeze([
      "edge-001-booking-route",
      "edge-booking-route-006",
      "edge-006-002",
      "edge-002-appointment-outcome",
      "edge-appointment-outcome-002-rebooks",
      "edge-002-appointment-outcome",
      "edge-appointment-outcome-003",
    ]),
  }),
  Object.freeze({
    id: "journey-cancellation-reschedule",
    edges: Object.freeze([
      "edge-001-booking-route",
      "edge-booking-route-002",
      "edge-002-appointment-outcome",
      "edge-appointment-outcome-005",
      "edge-005-002-rescheduled",
      "edge-002-appointment-outcome",
      "edge-appointment-outcome-003",
    ]),
  }),
  Object.freeze({
    id: "journey-completed-return",
    edges: Object.freeze([
      "edge-001-booking-route",
      "edge-booking-route-002",
      "edge-002-appointment-outcome",
      "edge-appointment-outcome-003",
      "edge-003-004",
    ]),
  }),
]);

// These indices point to the original top-level exported SVG elements. Moving
// those elements into semantic groups preserves every approved coordinate.
const EDGE_MAP = [
  {
    id: "edge-001-booking-route",
    sourceIndices: [3, 4],
    from: "node-001",
    to: "node-booking-route",
  },
  {
    id: "edge-booking-route-002",
    sourceIndices: [5, 6],
    from: "node-booking-route",
    to: "node-002",
  },
  {
    id: "edge-booking-route-007",
    sourceIndices: [13, 14, 15, 16, 17, 18],
    from: "node-booking-route",
    to: "node-007",
  },
  {
    id: "edge-007-002",
    sourceIndices: [19, 20],
    from: "node-007",
    to: "node-002",
  },
  {
    id: "edge-booking-route-006",
    sourceIndices: [31, 32],
    from: "node-booking-route",
    to: "node-006",
  },
  {
    id: "edge-006-002",
    sourceIndices: [23, 24],
    from: "node-006",
    to: "node-002",
  },
  {
    id: "edge-002-appointment-outcome",
    sourceIndices: [7, 8],
    from: "node-002",
    to: "node-appointment-outcome",
  },
  {
    id: "edge-appointment-outcome-003",
    sourceIndices: [9, 10],
    from: "node-appointment-outcome",
    to: "node-003",
  },
  {
    id: "edge-appointment-outcome-004",
    sourceIndices: [21, 22],
    from: "node-appointment-outcome",
    to: "node-004",
  },
  {
    id: "edge-appointment-outcome-005",
    sourceIndices: [11, 12],
    from: "node-appointment-outcome",
    to: "node-005",
  },
  {
    id: "edge-003-004",
    sourceIndices: [29, 30],
    from: "node-003",
    to: "node-004",
  },
  {
    id: "edge-appointment-outcome-002-rebooks",
    sourceIndices: [27, 28],
    from: "node-appointment-outcome",
    to: "node-002",
    sourceExtension: 84,
    extendSourceTowardNode: true,
  },
  {
    id: "edge-005-002-rescheduled",
    sourceIndices: [25, 26],
    from: "node-005",
    to: "node-002",
  },
];

const NODE_MAP = [
  {
    id: "node-001",
    label: "Lead Capture",
    sourceIndices: [42, 43, 44, 45, 46, 47, 48],
    surfaceIndex: 42,
    badgeIndex: 43,
    iconIndex: 44,
    titleIndex: 45,
    subtitleIndex: 46,
    artifactIndices: [47],
    badgeTextIndex: 48,
  },
  {
    id: "node-booking-route",
    label: "Booking Route",
    sourceIndices: [86, 87, 88, 89],
    surfaceIndex: 86,
    iconIndex: 87,
    titleIndex: 88,
    subtitleIndex: 89,
  },
  {
    id: "node-002",
    label: "Booking & Reminders",
    sourceIndices: [49, 50, 51, 52, 53, 54],
    surfaceIndex: 49,
    badgeIndex: 50,
    iconIndex: 51,
    titleIndex: 52,
    subtitleIndex: 53,
    badgeTextIndex: 54,
  },
  {
    id: "node-007",
    label: "VIP Request",
    sourceIndices: [61, 62, 63, 64, 65, 66],
    surfaceIndex: 61,
    iconIndex: 62,
    badgeIndex: 63,
    titleIndex: 64,
    subtitleIndex: 65,
    badgeTextIndex: 66,
  },
  {
    id: "node-006",
    label: "No Booking",
    sourceIndices: [55, 56, 57, 58, 59, 60],
    surfaceIndex: 55,
    badgeIndex: 56,
    iconIndex: 57,
    titleIndex: 58,
    subtitleIndex: 59,
    badgeTextIndex: 60,
  },
  {
    id: "node-appointment-outcome",
    label: "Appointment Outcome",
    sourceIndices: [90, 91, 92, 93],
    surfaceIndex: 90,
    iconIndex: 91,
    titleIndex: 92,
    subtitleIndex: 93,
  },
  {
    id: "node-003",
    label: "Completed Visit",
    sourceIndices: [67, 68, 69, 70, 71, 72],
    surfaceIndex: 67,
    badgeIndex: 68,
    iconIndex: 69,
    titleIndex: 70,
    subtitleIndex: 71,
    badgeTextIndex: 72,
  },
  {
    id: "node-004",
    label: "No-show Recovery",
    sourceIndices: [73, 74, 75, 76, 77, 78],
    surfaceIndex: 73,
    badgeIndex: 74,
    iconIndex: 75,
    titleIndex: 76,
    subtitleIndex: 77,
    badgeTextIndex: 78,
  },
  {
    id: "node-005",
    label: "Cancellation Handling",
    sourceIndices: [79, 80, 81, 82, 83, 84],
    surfaceIndex: 79,
    badgeIndex: 80,
    iconIndex: 81,
    titleIndex: 82,
    subtitleIndex: 83,
    badgeTextIndex: 84,
  },
];

function createSvgGroup(id, className) {
  const group = document.createElementNS(SVG_NAMESPACE, "g");
  if (id) {
    group.id = id;
  }
  group.setAttribute("class", className);
  return group;
}

function wrapOriginalElements(sourceNodes, { id, sourceIndices }, className) {
  const elements = sourceIndices.map((index) => sourceNodes[index]);
  if (elements.some((element) => !element)) {
    throw new Error(`The approved SVG structure changed while mapping ${id}.`);
  }

  const wrapper = createSvgGroup(domId(id), className);
  wrapper.dataset.haircutdoneId = id;
  elements[0].parentNode.insertBefore(wrapper, elements[0]);
  elements.forEach((element) => wrapper.append(element));
  return wrapper;
}

function createSvgFilter(definitions, id, attributes, markup) {
  const filter = document.createElementNS(SVG_NAMESPACE, "filter");
  filter.id = id;
  Object.entries(attributes).forEach(([name, value]) => filter.setAttribute(name, value));
  filter.innerHTML = markup;
  definitions.append(filter);
}

function createSvgUse(className, outlineId) {
  const use = document.createElementNS(SVG_NAMESPACE, "use");
  use.setAttribute("class", className);
  use.setAttribute("href", `#${outlineId}`);
  return use;
}

function namespaceSourceSvgIds(svg) {
  const idMap = new Map();
  svg.querySelectorAll("[id]").forEach((element) => {
    const sourceId = element.id;
    const namespacedId = domId(`source-${sourceId}`);
    idMap.set(sourceId, namespacedId);
    element.id = namespacedId;
  });

  const referenceAttributes = [
    "href",
    "xlink:href",
    "fill",
    "stroke",
    "filter",
    "clip-path",
    "mask",
    "marker-start",
    "marker-mid",
    "marker-end",
  ];
  svg.querySelectorAll("*").forEach((element) => {
    referenceAttributes.forEach((attribute) => {
      const value = element.getAttribute(attribute);
      if (!value) {
        return;
      }
      let updatedValue = value;
      idMap.forEach((namespacedId, sourceId) => {
        updatedValue = updatedValue
          .replaceAll(`url(#${sourceId})`, `url(#${namespacedId})`)
          .replaceAll(`#${sourceId}`, `#${namespacedId}`);
      });
      if (updatedValue !== value) {
        element.setAttribute(attribute, updatedValue);
      }
    });
  });
}

function deriveClosedOuterPath(outlinePath, nodeId) {
  const pathData = outlinePath.getAttribute("d");
  const subpaths = pathData
    ?.split(/(?=M)/u)
    .map((subpath) => subpath.trim())
    .filter(Boolean);

  if (!subpaths || subpaths.length < 2 || subpaths.length % 2 !== 0) {
    throw new Error(`The approved outline structure changed while deriving ${nodeId}.`);
  }

  // Excalidraw emits two hand-drawn passes for each edge. The first path from
  // every pair forms one continuous contour using the original coordinates.
  const primaryContour = subpaths.filter((_, index) => index % 2 === 0);
  const numberPattern = String.raw`[-+]?(?:\d*\.?\d+)(?:[eE][-+]?\d+)?`;
  const movePattern = new RegExp(
    `^M\\s*${numberPattern}(?:\\s+|,\\s*)${numberPattern}\\s*`,
    "u",
  );
  const joinedSegments = primaryContour.map((subpath, index) => {
    if (index === 0) {
      return subpath;
    }

    const segment = subpath.replace(movePattern, "");
    if (segment === subpath) {
      throw new Error(`The approved outline commands changed while deriving ${nodeId}.`);
    }
    return segment;
  });

  return `${joinedSegments.join(" ")} Z`;
}

function addNodeGeometryLayers(group, visual, surfaceGroup, config) {
  const outlinePath = surfaceGroup.querySelector(":scope > path");
  if (!outlinePath) {
    throw new Error(`The approved outline path was not found for ${config.id}.`);
  }

  const outlineId = domId(`${config.id}-outline`);
  outlinePath.id = outlineId;
  outlinePath.classList.add("haircutdone-workflow-node__outline");

  const effects = createSvgGroup(null, "haircutdone-workflow-node__effects");
  effects.setAttribute("aria-hidden", "true");
  effects.append(
    createSvgUse("haircutdone-workflow-node__shadow", outlineId),
    createSvgUse("haircutdone-workflow-node__glow haircutdone-workflow-node__glow--large", outlineId),
    createSvgUse("haircutdone-workflow-node__glow haircutdone-workflow-node__glow--near", outlineId),
  );

  const closedOuterPath = deriveClosedOuterPath(outlinePath, config.id);
  const nodeFill = document.createElementNS(SVG_NAMESPACE, "path");
  nodeFill.setAttribute("class", "haircutdone-workflow-node__fill");
  nodeFill.setAttribute("d", closedOuterPath);
  nodeFill.setAttribute("aria-hidden", "true");

  const hitSurface = document.createElementNS(SVG_NAMESPACE, "path");
  hitSurface.setAttribute("class", "haircutdone-workflow-node__hit");
  hitSurface.setAttribute("d", closedOuterPath);
  hitSurface.setAttribute("transform", surfaceGroup.getAttribute("transform"));
  hitSurface.setAttribute("aria-hidden", "true");

  surfaceGroup.insertBefore(effects, outlinePath);
  surfaceGroup.insertBefore(nodeFill, outlinePath);
  group.insertBefore(hitSurface, visual);
}

function addBadgeLayers(config, sourceNodes) {
  if (config.badgeIndex === undefined || config.badgeTextIndex === undefined) {
    return;
  }

  const badgeGroup = sourceNodes[config.badgeIndex];
  const badgeOutline = badgeGroup.querySelector(":scope > path");
  if (!badgeOutline) {
    throw new Error(`The approved badge outline was not found for ${config.id}.`);
  }

  badgeGroup.classList.add("haircutdone-workflow-node__badge");
  badgeOutline.classList.add("haircutdone-workflow-node__badge-outline");

  const badgeFill = document.createElementNS(SVG_NAMESPACE, "path");
  badgeFill.setAttribute("class", "haircutdone-workflow-node__badge-fill");
  badgeFill.setAttribute("d", deriveClosedOuterPath(badgeOutline, `${config.id} badge`));
  badgeFill.setAttribute("aria-hidden", "true");
  badgeGroup.insertBefore(badgeFill, badgeOutline);

  sourceNodes[config.badgeTextIndex].classList.add("haircutdone-workflow-node__badge-text");
}

function addInteractionFilters(svg) {
  const definitions = svg.querySelector(":scope > defs");
  if (!definitions) {
    throw new Error("The approved SVG is missing its definitions block.");
  }

  createSvgFilter(
    definitions,
    "haircutdone-workflow-outline-shadow-default",
    {
      x: "-30%",
      y: "-30%",
      width: "160%",
      height: "170%",
      "color-interpolation-filters": "sRGB",
    },
    `
      <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="shadow-blur" />
      <feOffset in="shadow-blur" dy="7" result="shadow-offset" />
      <feFlood flood-color="#111111" flood-opacity="0.14" result="shadow-color" />
      <feComposite in="shadow-color" in2="shadow-offset" operator="in" />
    `,
  );

  createSvgFilter(
    definitions,
    "haircutdone-workflow-outline-shadow-active",
    {
      x: "-45%",
      y: "-45%",
      width: "190%",
      height: "200%",
      "color-interpolation-filters": "sRGB",
    },
    `
      <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="shadow-blur" />
      <feOffset in="shadow-blur" dy="9" result="shadow-offset" />
      <feFlood flood-color="#111111" flood-opacity="0.24" result="shadow-color" />
      <feComposite in="shadow-color" in2="shadow-offset" operator="in" />
    `,
  );

  createSvgFilter(
    definitions,
    "haircutdone-workflow-outline-glow-large",
    {
      x: "-80%",
      y: "-80%",
      width: "260%",
      height: "260%",
      "color-interpolation-filters": "sRGB",
    },
    `
      <feGaussianBlur in="SourceGraphic" stdDeviation="26" />
    `,
  );

  createSvgFilter(
    definitions,
    "haircutdone-workflow-outline-glow-near",
    {
      x: "-80%",
      y: "-80%",
      width: "260%",
      height: "260%",
      "color-interpolation-filters": "sRGB",
    },
    `
      <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
    `,
  );

  const iconFilterAttributes = {
    x: "-30%",
    y: "-30%",
    width: "160%",
    height: "160%",
    "color-interpolation-filters": "sRGB",
  };
  [
    ["haircutdone-workflow-icon-default", "#111820"],
    ["haircutdone-workflow-icon-featured", "#079DA6"],
    ["haircutdone-workflow-icon-active", "#00F5FF"],
  ].forEach(([id, color]) => {
    createSvgFilter(
      definitions,
      id,
      iconFilterAttributes,
      `
        <feFlood flood-color="${color}" result="icon-color" />
        <feComposite in="icon-color" in2="SourceAlpha" operator="in" />
      `,
    );
  });

  createSvgFilter(
    definitions,
    "haircutdone-workflow-signal-glow-near",
    {
      x: "-300%",
      y: "-300%",
      width: "700%",
      height: "700%",
      "color-interpolation-filters": "sRGB",
    },
    `
      <feGaussianBlur in="SourceGraphic" stdDeviation="14" />
    `,
  );

  createSvgFilter(
    definitions,
    "haircutdone-workflow-signal-glow-outer",
    {
      x: "-500%",
      y: "-500%",
      width: "1100%",
      height: "1100%",
      "color-interpolation-filters": "sRGB",
    },
    `
      <feGaussianBlur in="SourceGraphic" stdDeviation="30" />
    `,
  );
}

function createSvgCircle(className, radius) {
  const circle = document.createElementNS(SVG_NAMESPACE, "circle");
  circle.setAttribute("class", className);
  circle.setAttribute("cx", "0");
  circle.setAttribute("cy", "0");
  circle.setAttribute("r", String(radius));
  return circle;
}

function createMotionLayer(sourceNodes) {
  const motionLayer = createSvgGroup(
    domId("motion-layer"),
    "haircutdone-workflow-motion-layer",
  );
  motionLayer.setAttribute("aria-hidden", "true");
  motionLayer.setAttribute("pointer-events", "none");

  EDGE_MAP.forEach((edge) => {
    const motionPath = document.createElementNS(SVG_NAMESPACE, "path");
    motionPath.id = domId(`motion-${edge.id}`);
    motionPath.setAttribute("class", "haircutdone-workflow-motion-path");
    motionPath.setAttribute("fill", "none");
    motionPath.setAttribute("stroke", "none");
    motionPath.setAttribute("pointer-events", "none");
    motionLayer.append(motionPath);
  });

  EDGE_MAP.forEach((edge) => {
    const signal = createSvgGroup(
      domId(`signal-${edge.id}`),
      "haircutdone-workflow-signal",
    );
    signal.dataset.edgeId = edge.id;
    signal.setAttribute("visibility", "hidden");
    signal.setAttribute("pointer-events", "none");
    signal.append(
      createSvgCircle("haircutdone-workflow-signal__outer-glow", 18),
      createSvgCircle("haircutdone-workflow-signal__near-glow", 18),
      createSvgCircle("haircutdone-workflow-signal__body", 18),
      createSvgCircle("haircutdone-workflow-signal__core", 11),
    );
    motionLayer.append(signal);
  });

  const nodeLayerAnchor = sourceNodes[NODE_MAP[0].sourceIndices[0]];
  nodeLayerAnchor.parentNode.insertBefore(motionLayer, nodeLayerAnchor);
  return motionLayer;
}

function getPrimarySubpathData(path) {
  const pathData = path.getAttribute("d")?.trim();
  if (!pathData) {
    return null;
  }

  // Excalidraw's dashed routed arrows use one path containing contiguous
  // move/curve sections for every bend. Solid rough lines instead repeat the
  // complete stroke as a second hand-drawn pass, so only those are trimmed.
  if (path.hasAttribute("stroke-dasharray")) {
    return pathData;
  }

  const moveCommands = Array.from(pathData.matchAll(/[Mm]/gu));
  return moveCommands.length > 1 ? pathData.slice(0, moveCommands[1].index).trim() : pathData;
}

function samplePrimaryPath(svg, visiblePath) {
  const pathData = getPrimarySubpathData(visiblePath);
  if (!pathData) {
    return [];
  }

  const samplingPath = document.createElementNS(SVG_NAMESPACE, "path");
  samplingPath.setAttribute("d", pathData);
  samplingPath.setAttribute("fill", "none");
  samplingPath.setAttribute("stroke", "none");
  samplingPath.setAttribute("visibility", "hidden");
  samplingPath.setAttribute("pointer-events", "none");
  if (visiblePath.hasAttribute("transform")) {
    samplingPath.setAttribute("transform", visiblePath.getAttribute("transform"));
  }
  visiblePath.parentNode.append(samplingPath);

  try {
    const pathLength = samplingPath.getTotalLength();
    const rootMatrix = svg.getCTM();
    const pathMatrix = samplingPath.getCTM();
    if (!Number.isFinite(pathLength) || pathLength <= 0 || !rootMatrix || !pathMatrix) {
      return [];
    }

    const localToRoot = rootMatrix.inverse().multiply(pathMatrix);
    const sampleCount = Math.max(1, Math.ceil(pathLength / MOTION_SAMPLE_SPACING));
    const point = svg.createSVGPoint();
    return Array.from({ length: sampleCount + 1 }, (_, index) => {
      const localPoint = samplingPath.getPointAtLength((pathLength * index) / sampleCount);
      point.x = localPoint.x;
      point.y = localPoint.y;
      const rootPoint = point.matrixTransform(localToRoot);
      return { x: rootPoint.x, y: rootPoint.y };
    });
  } finally {
    samplingPath.remove();
  }
}

function getVisibleEdgeSegments(svg, edgeId) {
  const edgeGroup = svg.querySelector(`#${domId(edgeId)}`);
  if (!edgeGroup) {
    throw new Error(`Visible connector ${edgeId} was not found.`);
  }

  return Array.from(edgeGroup.children)
    .filter((element) => element.querySelector?.("path"))
    .map((element) =>
      Array.from(element.querySelectorAll("path"))
        .map((path) => samplePrimaryPath(svg, path))
        .filter((points) => points.length > 1)
        .sort((left, right) => right.length - left.length)[0],
    )
    .filter(Boolean);
}

function distanceSquared(left, right) {
  return (left.x - right.x) ** 2 + (left.y - right.y) ** 2;
}

function orientPoints(points, reference) {
  return distanceSquared(points[0], reference) <= distanceSquared(points.at(-1), reference)
    ? points
    : [...points].reverse();
}

function joinEdgeSegments(segments, sourceCenter) {
  const remaining = [...segments];
  const joined = [];
  let reference = sourceCenter;

  while (remaining.length) {
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;
    remaining.forEach((points, index) => {
      const candidateDistance = Math.min(
        distanceSquared(points[0], reference),
        distanceSquared(points.at(-1), reference),
      );
      if (candidateDistance < nearestDistance) {
        nearestDistance = candidateDistance;
        nearestIndex = index;
      }
    });

    let nextPoints = orientPoints(remaining.splice(nearestIndex, 1)[0], reference);
    if (joined.length) {
      let closestPointIndex = 0;
      let closestPointDistance = Number.POSITIVE_INFINITY;
      nextPoints.forEach((point, index) => {
        const pointDistance = distanceSquared(point, reference);
        if (pointDistance < closestPointDistance) {
          closestPointDistance = pointDistance;
          closestPointIndex = index;
        }
      });
      if (closestPointDistance < 24 ** 2 && closestPointIndex < nextPoints.length - 1) {
        nextPoints = nextPoints.slice(closestPointIndex);
      }
    }

    nextPoints.forEach((point) => {
      if (!joined.length || distanceSquared(joined.at(-1), point) > 0.25) {
        joined.push(point);
      }
    });
    reference = joined.at(-1);
  }

  return joined;
}

function getNodeCenter(svg, nodeId) {
  const hitSurface = svg.querySelector(
    `#${domId(nodeId)} .haircutdone-workflow-node__hit`,
  );
  const rootMatrix = svg.getCTM();
  const hitMatrix = hitSurface?.getCTM();
  if (!hitSurface || !rootMatrix || !hitMatrix) {
    throw new Error(`Node geometry for ${nodeId} was not found.`);
  }

  const bounds = hitSurface.getBBox();
  const point = svg.createSVGPoint();
  point.x = bounds.x + bounds.width / 2;
  point.y = bounds.y + bounds.height / 2;
  const rootPoint = point.matrixTransform(rootMatrix.inverse().multiply(hitMatrix));
  return { x: rootPoint.x, y: rootPoint.y };
}

function isPointInsideNode(svg, nodeId, rootPoint) {
  const hitSurface = svg.querySelector(
    `#${domId(nodeId)} .haircutdone-workflow-node__hit`,
  );
  const rootMatrix = svg.getCTM();
  const hitMatrix = hitSurface?.getCTM();
  if (!hitSurface || !rootMatrix || !hitMatrix) {
    throw new Error(`Node geometry for ${nodeId} was not found.`);
  }

  const point = svg.createSVGPoint();
  point.x = rootPoint.x;
  point.y = rootPoint.y;
  const localPoint = point.matrixTransform(hitMatrix.inverse().multiply(rootMatrix));
  return hitSurface.isPointInFill(localPoint);
}

function extendMotionEndpoints(points, edge, sourceCenter) {
  if (points.length < 2) {
    throw new Error("A motion path requires at least two points.");
  }

  const extend = (point, neighbor, amount) => {
    const x = neighbor.x - point.x;
    const y = neighbor.y - point.y;
    const length = Math.hypot(x, y);
    if (!Number.isFinite(length) || length === 0) {
      throw new Error("A motion path endpoint has an invalid tangent.");
    }
    return { x: point.x + (x / length) * amount, y: point.y + (y / length) * amount };
  };

  const first = points[0];
  const last = points.at(-1);
  const sourceExtension = edge.sourceExtension ?? MOTION_PATH_EXTENSION;
  return [
    edge.extendSourceTowardNode
      ? extend(first, sourceCenter, sourceExtension)
      : extend(first, points[1], -sourceExtension),
    ...points,
    extend(last, points.at(-2), -MOTION_PATH_EXTENSION),
  ];
}

function pointsToPathData(points) {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");
}

function initializeMotionFoundation(svg, development, motionPreference) {
  const entries = EDGE_MAP.map((edge) => {
    const visibleSegments = getVisibleEdgeSegments(svg, edge.id);
    if (!visibleSegments.length) {
      throw new Error(`No visible centerline was found for ${edge.id}.`);
    }

    const sourceCenter = getNodeCenter(svg, edge.from);
    const joinedPoints = joinEdgeSegments(visibleSegments, sourceCenter);
    const motionPoints = extendMotionEndpoints(joinedPoints, edge, sourceCenter);
    if (motionPoints.some((point) => !Number.isFinite(point.x) || !Number.isFinite(point.y))) {
      throw new Error(`Invalid motion geometry was generated for ${edge.id}.`);
    }

    const path = svg.querySelector(`#${domId(`motion-${edge.id}`)}`);
    const signal = svg.querySelector(`#${domId(`signal-${edge.id}`)}`);
    path.setAttribute("d", pointsToPathData(motionPoints));
    const length = path.getTotalLength();
    if (!Number.isFinite(length) || length <= 0 || !signal) {
      throw new Error(`Motion geometry validation failed for ${edge.id}.`);
    }
    path.dataset.edgeId = edge.id;
    path.dataset.length = String(length);
    path.dataset.speed = String(TRAVEL_SPEED);
    path.dataset.duration = String(length / TRAVEL_SPEED);
    path.dataset.from = edge.from;
    path.dataset.to = edge.to;
    path.dataset.segmentCount = String(visibleSegments.length);
    path.dataset.startOccluded = String(
      isPointInsideNode(svg, edge.from, path.getPointAtLength(0)),
    );
    path.dataset.endOccluded = String(
      isPointInsideNode(svg, edge.to, path.getPointAtLength(length)),
    );

    if (path.dataset.startOccluded !== "true" || path.dataset.endOccluded !== "true") {
      throw new Error(`Motion path occlusion validation failed for ${edge.id}.`);
    }

    return {
      ...edge,
      path,
      signal,
      length,
      duration: length / TRAVEL_SPEED,
      segmentCount: visibleSegments.length,
    };
  });

  if (
    entries.length !== 13 ||
    svg.querySelectorAll(".haircutdone-workflow-motion-path").length !== 13 ||
    svg.querySelectorAll(".haircutdone-workflow-signal").length !== 13
  ) {
    throw new Error("The motion foundation must contain exactly 13 paths and 13 signals.");
  }

  const entryById = new Map(entries.map((entry) => [entry.id, entry]));
  let animationFrame = null;
  let activeResolve = null;
  let runToken = 0;

  const placeSignal = (entry, distance) => {
    const point = entry.path.getPointAtLength(Math.max(0, Math.min(distance, entry.length)));
    entry.signal.setAttribute("transform", `translate(${point.x} ${point.y})`);
  };

  const hideSignals = () => {
    entries.forEach((entry) => entry.signal.setAttribute("visibility", "hidden"));
  };

  const stopAll = () => {
    runToken += 1;
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    hideSignals();
    if (activeResolve) {
      const resolve = activeResolve;
      activeResolve = null;
      resolve({ status: "stopped" });
    }
  };

  const showEdgeAtProgress = (edgeId, progress) => {
    const entry = entryById.get(edgeId);
    if (!entry) {
      throw new Error(`Unknown HaircutDone edge: ${edgeId}`);
    }
    stopAll();
    placeSignal(entry, entry.length * Math.max(0, Math.min(progress, 1)));
    entry.signal.setAttribute("visibility", "visible");
  };

  const playEdge = (edgeId) => {
    const entry = entryById.get(edgeId);
    if (!entry) {
      return Promise.reject(new Error(`Unknown HaircutDone edge: ${edgeId}`));
    }

    stopAll();
    placeSignal(entry, 0);
    if (motionPreference.matches) {
      return Promise.resolve({ status: "reduced-motion", edgeId });
    }

    entry.signal.setAttribute("visibility", "visible");
    const token = runToken;
    return new Promise((resolve) => {
      activeResolve = resolve;
      let startTime = null;
      const update = (timestamp) => {
        if (token !== runToken) {
          return;
        }
        startTime ??= timestamp;
        const distance = ((timestamp - startTime) / 1000) * TRAVEL_SPEED;
        placeSignal(entry, distance);
        if (distance >= entry.length) {
          entry.signal.setAttribute("visibility", "hidden");
          animationFrame = null;
          activeResolve = null;
          resolve({ status: "complete", edgeId });
          return;
        }
        animationFrame = requestAnimationFrame(update);
      };
      animationFrame = requestAnimationFrame(update);
    });
  };

  const getEdgeMetrics = () =>
    entries.map((entry) => ({
      id: entry.id,
      length: Number(entry.length.toFixed(2)),
      speed: TRAVEL_SPEED,
      duration: Number(entry.duration.toFixed(4)),
      from: entry.from,
      to: entry.to,
    }));

  const developmentEdge = development.motionEdge;
  if (developmentEdge) {
    const progress = development.motionProgress;
    if (progress === undefined) {
      playEdge(developmentEdge);
    } else {
      showEdgeAtProgress(developmentEdge, Number(progress));
    }
  }

  return Object.freeze({
    entries,
    playEdge,
    stopAll,
    getEdgeMetrics,
    showEdgeAtProgress,
  });
}

function validateJourneyDefinitions() {
  const edgeById = new Map(EDGE_MAP.map((edge) => [edge.id, edge]));
  const coveredEdgeIds = new Set();
  const journeyIds = new Set();

  JOURNEYS.forEach((journey) => {
    if (journeyIds.has(journey.id) || journey.edges.length === 0) {
      throw new Error(`Invalid HaircutDone journey definition: ${journey.id}`);
    }
    journeyIds.add(journey.id);

    journey.edges.forEach((edgeId, index) => {
      const edge = edgeById.get(edgeId);
      if (!edge) {
        throw new Error(`Journey ${journey.id} references unknown edge ${edgeId}.`);
      }
      coveredEdgeIds.add(edgeId);

      const nextEdgeId = journey.edges[index + 1];
      if (nextEdgeId && edge.to !== edgeById.get(nextEdgeId)?.from) {
        throw new Error(`Journey ${journey.id} is discontinuous after ${edgeId}.`);
      }
    });
  });

  const missingEdgeIds = EDGE_MAP.map((edge) => edge.id).filter(
    (edgeId) => !coveredEdgeIds.has(edgeId),
  );
  if (coveredEdgeIds.size !== EDGE_MAP.length || missingEdgeIds.length > 0) {
    throw new Error(
      `Journey coverage must be 13/13; missing: ${missingEdgeIds.join(", ") || "unknown"}.`,
    );
  }

  return { coveredEdgeIds: [...coveredEdgeIds], missingEdgeIds };
}

function initializeJourneySequencing(
  svg,
  motionController,
  { documentRef, listen, motionPreference },
  stopAmbient,
) {
  const coverage = validateJourneyDefinitions();
  const edgeById = new Map(EDGE_MAP.map((edge) => [edge.id, edge]));
  const journeyById = new Map(JOURNEYS.map((journey) => [journey.id, journey]));
  const nodeById = new Map(
    NODE_MAP.map((node) => [node.id, svg.querySelector(`#${domId(node.id)}`)]),
  );
  let generation = 0;
  let pendingWaitCancel = null;
  let restartWhenVisible = false;
  let restartAfterReducedMotion = false;
  const state = {
    running: false,
    currentJourney: null,
    currentEdge: null,
    currentStep: null,
  };

  svg.dataset.journeyCoverage = `${coverage.coveredEdgeIds.length}/${EDGE_MAP.length}`;

  const updateState = (updates) => {
    Object.assign(state, updates);
    svg.dataset.journeyRunning = String(state.running);
    svg.dataset.currentJourney = state.currentJourney ?? "";
    svg.dataset.currentEdge = state.currentEdge ?? "";
    svg.dataset.currentStep = state.currentStep ?? "";
  };

  const setNodeActive = (nodeId, isActive) => {
    const node = nodeById.get(nodeId);
    if (!node) {
      throw new Error(`Unknown HaircutDone node: ${nodeId}`);
    }
    node.classList.toggle("haircutdone-workflow-is-journey-active", isActive);
  };

  const clearJourneyNodes = () => {
    nodeById.forEach((node) => node?.classList.remove("haircutdone-workflow-is-journey-active"));
  };

  const waitFor = (duration, token) => {
    if (token !== generation) {
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      let settled = false;
      let timer = null;
      const settle = (completed) => {
        if (settled) {
          return;
        }
        settled = true;
        if (timer !== null) {
          clearTimeout(timer);
        }
        if (pendingWaitCancel === cancel) {
          pendingWaitCancel = null;
        }
        resolve(completed);
      };
      const cancel = () => settle(false);
      pendingWaitCancel = cancel;
      timer = window.setTimeout(() => settle(token === generation), duration);
    });
  };

  const cancelCurrentRun = () => {
    generation += 1;
    pendingWaitCancel?.();
    pendingWaitCancel = null;
    motionController.stopAll();
    clearJourneyNodes();
    updateState({
      running: false,
      currentJourney: null,
      currentEdge: null,
      currentStep: null,
    });
  };

  const runJourney = async (journey, token) => {
    for (let index = 0; index < journey.edges.length; index += 1) {
      const edgeId = journey.edges[index];
      const edge = edgeById.get(edgeId);
      const isTerminalEdge = index === journey.edges.length - 1;

      updateState({
        currentJourney: journey.id,
        currentEdge: edgeId,
        currentStep: "source-precharge",
      });
      setNodeActive(edge.from, true);
      if (!(await waitFor(JOURNEY_TIMING.sourcePrecharge, token))) {
        return { status: "stopped", journeyId: journey.id };
      }

      updateState({ currentStep: "signal-travel" });
      const travel = motionController.playEdge(edgeId);
      setNodeActive(edge.from, false);
      const travelResult = await travel;
      if (token !== generation || travelResult.status !== "complete") {
        return { status: travelResult.status, journeyId: journey.id };
      }

      setNodeActive(edge.to, true);
      updateState({ currentStep: "arrival-hold" });
      if (!(await waitFor(JOURNEY_TIMING.arrivalHold, token))) {
        return { status: "stopped", journeyId: journey.id };
      }

      if (isTerminalEdge) {
        updateState({ currentStep: "terminal-hold" });
        if (!(await waitFor(JOURNEY_TIMING.terminalHold, token))) {
          return { status: "stopped", journeyId: journey.id };
        }
        setNodeActive(edge.to, false);
        return { status: "complete", journeyId: journey.id };
      }

      const nextEdge = edgeById.get(journey.edges[index + 1]);
      if (nextEdge.from !== edge.to) {
        setNodeActive(edge.to, false);
      }
      updateState({ currentStep: "edge-handoff" });
      if (!(await waitFor(JOURNEY_TIMING.edgeHandoffGap, token))) {
        return { status: "stopped", journeyId: journey.id };
      }
    }

    return { status: "complete", journeyId: journey.id };
  };

  const runAutomaticLoop = async (token) => {
    updateState({ currentStep: "initial-delay" });
    if (!(await waitFor(JOURNEY_TIMING.initialDelay, token))) {
      return;
    }

    while (token === generation) {
      for (let index = 0; index < JOURNEYS.length; index += 1) {
        const result = await runJourney(JOURNEYS[index], token);
        if (token !== generation || result.status !== "complete") {
          return;
        }

        clearJourneyNodes();
        const isLastJourney = index === JOURNEYS.length - 1;
        updateState({
          currentJourney: null,
          currentEdge: null,
          currentStep: isLastJourney ? "loop-gap" : "between-journeys",
        });
        const gap = isLastJourney
          ? JOURNEY_TIMING.loopGap
          : JOURNEY_TIMING.betweenJourneys;
        if (!(await waitFor(gap, token))) {
          return;
        }
      }
    }
  };

  const start = () => {
    restartWhenVisible = false;
    restartAfterReducedMotion = false;
    stopAmbient();
    cancelCurrentRun();
    if (documentRef.hidden) {
      restartWhenVisible = true;
      return { status: "hidden" };
    }
    if (motionPreference.matches) {
      restartAfterReducedMotion = true;
      return { status: "reduced-motion" };
    }

    const token = generation;
    updateState({ running: true, currentStep: "initial-delay" });
    void runAutomaticLoop(token).catch((error) => {
      if (token === generation) {
        cancelCurrentRun();
        console.error(error);
      }
    });
    return { status: "started" };
  };

  const stop = () => {
    restartWhenVisible = false;
    restartAfterReducedMotion = false;
    cancelCurrentRun();
    return { status: "stopped" };
  };

  const restart = () => start();

  const playJourney = (journeyId) => {
    const journey = journeyById.get(journeyId);
    if (!journey) {
      return Promise.reject(new Error(`Unknown HaircutDone journey: ${journeyId}`));
    }

    restartWhenVisible = false;
    restartAfterReducedMotion = false;
    stopAmbient();
    cancelCurrentRun();
    if (documentRef.hidden) {
      restartWhenVisible = true;
      return Promise.resolve({ status: "hidden", journeyId });
    }
    if (motionPreference.matches) {
      restartAfterReducedMotion = true;
      return Promise.resolve({
        status: "reduced-motion",
        journeyId,
      });
    }

    const token = generation;
    updateState({ running: true, currentJourney: journeyId });
    return runJourney(journey, token)
      .catch((error) => {
        if (token === generation) {
          cancelCurrentRun();
        }
        throw error;
      })
      .finally(() => {
        if (token === generation) {
          motionController.stopAll();
          clearJourneyNodes();
          updateState({
            running: false,
            currentJourney: null,
            currentEdge: null,
            currentStep: null,
          });
        }
      });
  };

  const getJourneys = () =>
    JOURNEYS.map((journey) => ({ id: journey.id, edges: [...journey.edges] }));
  const getState = () => ({ ...state });

  const controller = Object.freeze({
    start,
    stop,
    restart,
    playJourney,
    getJourneys,
    getState,
  });

  listen(documentRef, "visibilitychange", () => {
    if (documentRef.hidden && state.running) {
      stop();
      restartWhenVisible = true;
      return;
    }
    if (restartWhenVisible) {
      restartWhenVisible = false;
      start();
    }
  });

  listen(motionPreference, "change", (event) => {
    if (event.matches && state.running) {
      stop();
      restartAfterReducedMotion = true;
    } else if (!event.matches && restartAfterReducedMotion && !documentRef.hidden) {
      restartAfterReducedMotion = false;
      start();
    }
  });

  updateState({});
  return controller;
}

function initializeAmbientMotion(
  svg,
  motionEntries,
  motionController,
  { documentRef, listen, motionPreference, windowRef },
  stopJourney,
  development,
) {
  if (motionEntries.length !== EDGE_MAP.length) {
    throw new Error("Ambient motion requires all 13 approved logical edges.");
  }

  const fraction = (value) => value - Math.floor(value);
  const schedule = motionEntries.map((entry, index) => {
    const pathLength = entry.length;
    const travelDuration = pathLength / TRAVEL_SPEED;
    const cycleDuration = travelDuration / AMBIENT_DUTY_CYCLE;
    const hiddenDuration = cycleDuration - travelDuration;
    const goldenPhase = fraction((index + 1) * GOLDEN_FRACTION);
    const phaseAdjustment = AMBIENT_PHASE_ADJUSTMENTS[entry.id];
    const normalizedPhase = fraction(goldenPhase + phaseAdjustment);
    const phaseOffset = normalizedPhase * cycleDuration;
    const metrics = [
      pathLength,
      travelDuration,
      cycleDuration,
      hiddenDuration,
      goldenPhase,
      phaseAdjustment,
      normalizedPhase,
      phaseOffset,
    ];

    if (metrics.some((value) => !Number.isFinite(value)) || pathLength <= 0) {
      throw new Error(`Ambient schedule validation failed for ${entry.id}.`);
    }

    return {
      edgeId: entry.id,
      path: entry.path,
      signal: entry.signal,
      pathLength,
      travelDuration,
      cycleDuration,
      hiddenDuration,
      goldenPhase,
      phaseAdjustment,
      normalizedPhase,
      phaseOffset,
      isVisible: false,
    };
  });

  let animationFrame = null;
  let initialDelayTimer = null;
  let startTimestamp = null;
  let runToken = 0;
  let restartWhenVisible = false;
  let restartAfterReducedMotion = false;
  const state = {
    running: false,
    visibleSignalCount: 0,
    reducedMotion: motionPreference.matches,
  };

  svg.dataset.ambientScheduleCount = String(schedule.length);
  svg.dataset.ambientDutyCycle = String(AMBIENT_DUTY_CYCLE);

  const setSignalVisibility = (entry, isVisible) => {
    if (entry.isVisible === isVisible) {
      return;
    }
    entry.isVisible = isVisible;
    entry.signal.setAttribute("visibility", isVisible ? "visible" : "hidden");
  };

  const hideSignals = () => {
    schedule.forEach((entry) => setSignalVisibility(entry, false));
    state.visibleSignalCount = 0;
  };

  const placeSignal = (entry, distance) => {
    const point = entry.path.getPointAtLength(
      Math.max(0, Math.min(distance, entry.pathLength)),
    );
    entry.signal.setAttribute("transform", `translate(${point.x} ${point.y})`);
  };

  const renderAtElapsed = (elapsed) => {
    let visibleSignalCount = 0;
    schedule.forEach((entry) => {
      const cycleTime = (elapsed + entry.phaseOffset) % entry.cycleDuration;
      const isVisible = cycleTime < entry.travelDuration;
      if (!isVisible) {
        setSignalVisibility(entry, false);
        return;
      }

      placeSignal(entry, cycleTime * TRAVEL_SPEED);
      setSignalVisibility(entry, true);
      visibleSignalCount += 1;
    });
    state.visibleSignalCount = visibleSignalCount;
  };

  const stopRuntime = () => {
    runToken += 1;
    if (initialDelayTimer !== null) {
      clearTimeout(initialDelayTimer);
      initialDelayTimer = null;
    }
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    startTimestamp = null;
    state.running = false;
    hideSignals();
  };

  const stop = () => {
    restartWhenVisible = false;
    restartAfterReducedMotion = false;
    stopRuntime();
    return { status: "stopped" };
  };

  const start = () => {
    restartWhenVisible = false;
    restartAfterReducedMotion = false;
    stopRuntime();
    stopJourney();
    motionController.stopAll();
    state.reducedMotion = motionPreference.matches;

    if (documentRef.hidden) {
      restartWhenVisible = true;
      return { status: "hidden" };
    }
    if (state.reducedMotion) {
      restartAfterReducedMotion = true;
      return { status: "reduced-motion" };
    }

    const token = runToken;
    state.running = true;
    initialDelayTimer = windowRef.setTimeout(() => {
      initialDelayTimer = null;
      if (token !== runToken) {
        return;
      }

      const update = (timestamp) => {
        if (token !== runToken) {
          return;
        }
        startTimestamp ??= timestamp;
        const elapsed = (timestamp - startTimestamp) / 1000;
        renderAtElapsed(elapsed);
        animationFrame = requestAnimationFrame(update);
      };

      animationFrame = requestAnimationFrame(update);
    }, AMBIENT_INITIAL_DELAY);

    return { status: "started" };
  };

  const restart = () => start();
  const getState = () => ({
    running: state.running,
    visibleSignalCount: state.visibleSignalCount,
    elapsed:
      state.running && startTimestamp !== null
        ? Number(((windowRef.performance.now() - startTimestamp) / 1000).toFixed(3))
        : 0,
    reducedMotion: state.reducedMotion,
  });
  const getSchedule = () =>
    schedule.map(
      ({
        edgeId,
        pathLength,
        travelDuration,
        cycleDuration,
        hiddenDuration,
        goldenPhase,
        phaseAdjustment,
        normalizedPhase,
        phaseOffset,
      }) => ({
        edgeId,
        pathLength,
        travelDuration,
        cycleDuration,
        hiddenDuration,
        goldenPhase,
        phaseAdjustment,
        normalizedPhase,
        phaseOffset,
      }),
    );

  const controller = Object.freeze({
    start,
    stop,
    restart,
    getState,
    getSchedule,
  });

  listen(documentRef, "visibilitychange", () => {
    if (documentRef.hidden && state.running) {
      stop();
      restartWhenVisible = true;
      return;
    }
    if (restartWhenVisible) {
      restartWhenVisible = false;
      start();
    }
  });

  listen(motionPreference, "change", (event) => {
    state.reducedMotion = event.matches;
    if (event.matches && state.running) {
      stop();
      state.reducedMotion = true;
      restartAfterReducedMotion = true;
    } else if (!event.matches && restartAfterReducedMotion && !documentRef.hidden) {
      restartAfterReducedMotion = false;
      start();
    }
  });

  hideSignals();
  const developmentAmbientTime = development.ambientTime;
  if (developmentAmbientTime !== undefined) {
    const elapsed = Number(developmentAmbientTime);
    if (!Number.isFinite(elapsed) || elapsed < 0) {
      throw new Error("ambientTime must be a non-negative number of seconds.");
    }
    renderAtElapsed(elapsed);
  }
  return controller;
}

function validateApprovedSource(svg, sourceNodes) {
  if (svg.getAttribute("viewBox") !== EXPECTED_VIEW_BOX || sourceNodes.length !== 94) {
    throw new Error("The approved master SVG structure no longer matches the semantic map.");
  }

  const anchors = [
    [45, "Lead Capture"],
    [52, "Booking & Reminders"],
    [58, "No Booking"],
    [64, "VIP Request"],
    [70, "Completed Visit"],
    [76, "No-show Recovery"],
    [82, "Cancellation Handling"],
    [88, "Booking"],
    [92, "Appointment"],
  ];

  for (const [index, expectedText] of anchors) {
    if (!sourceNodes[index]?.textContent?.includes(expectedText)) {
      throw new Error(`The approved SVG anchor "${expectedText}" was not found.`);
    }
  }
}

function announceActivation(announcement, group) {
  announcement.textContent = `${group.dataset.nodeLabel} activated.`;
}

function makeNodeInteractive(
  group,
  config,
  sourceNodes,
  { announcement, documentRef, listen, onCleanup, windowRef },
) {
  const surfaceGroup = sourceNodes[config.surfaceIndex];
  surfaceGroup.classList.add("haircutdone-workflow-node__surface");
  sourceNodes[config.iconIndex].classList.add("haircutdone-workflow-node__icon");
  sourceNodes[config.titleIndex].classList.add("haircutdone-workflow-node__title");
  sourceNodes[config.subtitleIndex].classList.add("haircutdone-workflow-node__subtitle");
  config.artifactIndices?.forEach((index) => sourceNodes[index].remove());
  addBadgeLayers(config, sourceNodes);

  const visual = createSvgGroup(null, "haircutdone-workflow-node__visual");
  const visualElements = Array.from(group.children);
  group.append(visual);
  visualElements.forEach((element) => visual.append(element));
  addNodeGeometryLayers(group, visual, surfaceGroup, config);

  group.dataset.nodeLabel = config.label;
  group.classList.toggle("haircutdone-workflow-is-featured", config.id === "node-001");
  group.setAttribute("role", "button");
  group.setAttribute("tabindex", "0");
  group.setAttribute("aria-label", config.label);

  let releaseTimer;
  const startPress = () => {
    windowRef.clearTimeout(releaseTimer);
    group.classList.remove("haircutdone-workflow-is-releasing");
    group.classList.add("haircutdone-workflow-is-pressed");
  };
  const releasePress = () => {
    if (!group.classList.contains("haircutdone-workflow-is-pressed")) {
      return;
    }

    group.classList.add("haircutdone-workflow-is-releasing");
    group.classList.remove("haircutdone-workflow-is-pressed");
    windowRef.clearTimeout(releaseTimer);
    releaseTimer = windowRef.setTimeout(
      () => group.classList.remove("haircutdone-workflow-is-releasing"),
      110,
    );
  };
  const finishPointerPress = (event) => {
    if (!group.classList.contains("haircutdone-workflow-is-pressed")) {
      return;
    }
    const pointerTarget = documentRef.elementFromPoint(event.clientX, event.clientY);
    if (pointerTarget?.closest?.(".haircutdone-workflow-node") !== group) {
      group.classList.remove("haircutdone-workflow-is-hovered");
    }
    releasePress();
  };

  listen(group, "pointerenter", () =>
    group.classList.add("haircutdone-workflow-is-hovered"),
  );
  listen(group, "pointerleave", () => {
    group.classList.remove("haircutdone-workflow-is-hovered");
    releasePress();
  });
  listen(group, "pointerdown", (event) => {
    if (event.button !== 0 || event.isPrimary === false) {
      return;
    }
    startPress();
  });
  listen(group, "pointerup", releasePress);
  listen(group, "pointercancel", releasePress);
  listen(windowRef, "pointerup", finishPointerPress);
  listen(windowRef, "pointercancel", finishPointerPress);
  listen(group, "click", () => announceActivation(announcement, group));
  listen(group, "keydown", (event) => {
    if ((event.key !== "Enter" && event.key !== " ") || event.repeat) {
      return;
    }

    event.preventDefault();
    startPress();
  });
  listen(group, "keyup", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    releasePress();
    announceActivation(announcement, group);
  });
  listen(group, "blur", releasePress);
  onCleanup(() => windowRef.clearTimeout(releaseTimer));
}

function resolveRoot(rootElement) {
  if (typeof rootElement === "string") {
    return document.querySelector(rootElement);
  }
  return rootElement;
}

export async function createHaircutDoneWorkflow(rootElement, options = {}) {
  const root = resolveRoot(rootElement);
  if (!(root instanceof Element)) {
    throw new TypeError("HaircutDone requires a valid root Element or selector.");
  }
  if (activeInstance) {
    throw new Error(
      "HaircutDone currently supports one mounted workflow per document. Destroy it before mounting another.",
    );
  }

  const documentRef = root.ownerDocument;
  const windowRef = documentRef.defaultView;
  if (!windowRef) {
    throw new Error("HaircutDone requires a browser Window.");
  }

  const autoStart = options.autoStart ?? true;
  const assetUrl = options.assetUrl ?? masterSvgUrl;
  const development = Object.freeze({ ...(options.development ?? {}) });
  const cleanupCallbacks = [];
  let destroyed = false;
  let motionController;
  let journeyController;
  let ambientController;

  const onCleanup = (callback) => cleanupCallbacks.push(callback);
  const listen = (target, type, listener, listenerOptions) => {
    target.addEventListener(type, listener, listenerOptions);
    onCleanup(() => target.removeEventListener(type, listener, listenerOptions));
  };
  const motionPreference = windowRef.matchMedia("(prefers-reduced-motion: reduce)");
  const lifecycle = { documentRef, listen, motionPreference, onCleanup, windowRef };

  root.classList.add("haircutdone-workflow-root");
  root.dataset.haircutdoneWorkflowMounted = "true";

  const board = documentRef.createElement("div");
  board.className = "haircutdone-workflow-board";
  const viewport = documentRef.createElement("div");
  viewport.className = "haircutdone-workflow-viewport";
  viewport.setAttribute("aria-busy", "true");
  const canvas = documentRef.createElement("div");
  canvas.className = "haircutdone-workflow-canvas";
  const loading = documentRef.createElement("p");
  loading.className = "haircutdone-workflow-loading";
  loading.textContent = "Loading approved workflow…";
  const announcement = documentRef.createElement("p");
  announcement.className = "haircutdone-workflow-sr-only";
  announcement.setAttribute("aria-live", "polite");
  canvas.append(loading);
  viewport.append(canvas);
  board.append(viewport);
  root.replaceChildren(board, announcement);

  const mountingSentinel = Object.freeze({ root });
  activeInstance = mountingSentinel;

  const destroy = () => {
    if (destroyed) {
      return { status: "destroyed" };
    }
    destroyed = true;
    ambientController?.stop();
    journeyController?.stop();
    motionController?.stopAll();
    cleanupCallbacks.splice(0).reverse().forEach((cleanup) => cleanup());
    root.replaceChildren();
    root.classList.remove("haircutdone-workflow-root");
    delete root.dataset.haircutdoneWorkflowMounted;
    if (activeInstance === api || activeInstance === mountingSentinel) {
      activeInstance = null;
    }
    return { status: "destroyed" };
  };

  const assertActive = () => {
    if (destroyed) {
      throw new Error("This HaircutDone workflow instance has been destroyed.");
    }
  };

  let api;
  try {
    const response = await windowRef.fetch(assetUrl);
    if (!response.ok) {
      throw new Error(`Unable to load the approved SVG (${response.status}).`);
    }

    const markup = await response.text();
    const documentFragment = new windowRef.DOMParser().parseFromString(
      markup,
      "image/svg+xml",
    );
    const parseError = documentFragment.querySelector("parsererror");
    if (parseError) {
      throw new Error("The approved SVG could not be parsed.");
    }

    const svg = documentFragment.documentElement;
    namespaceSourceSvgIds(svg);
    const sourceNodes = Array.from(svg.childNodes);
    validateApprovedSource(svg, sourceNodes);
    addInteractionFilters(svg);

    EDGE_MAP.forEach((edge) =>
      wrapOriginalElements(sourceNodes, edge, "haircutdone-workflow-edge"),
    );
    createMotionLayer(sourceNodes);
    NODE_MAP.forEach((node) => {
      const group = wrapOriginalElements(sourceNodes, node, "haircutdone-workflow-node");
      makeNodeInteractive(group, node, sourceNodes, {
        ...lifecycle,
        announcement,
      });
    });

    svg.setAttribute("aria-label", "HaircutDone customer workflow");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    canvas.replaceChildren(svg);

    motionController = initializeMotionFoundation(svg, development, motionPreference);
    journeyController = initializeJourneySequencing(
      svg,
      motionController,
      lifecycle,
      () => ambientController?.stop(),
    );
    ambientController = initializeAmbientMotion(
      svg,
      motionController.entries,
      motionController,
      lifecycle,
      () => journeyController?.stop(),
      development,
    );

    const startAmbient = () => {
      assertActive();
      return ambientController.start();
    };
    const stopAmbient = () => {
      assertActive();
      return ambientController.stop();
    };
    const startJourney = () => {
      assertActive();
      return journeyController.start();
    };
    const stopJourney = () => {
      assertActive();
      return journeyController.stop();
    };
    const playJourney = (journeyId) => {
      assertActive();
      return journeyController.playJourney(journeyId);
    };

    api = Object.freeze({
      root,
      startAmbient,
      stopAmbient,
      startJourney,
      stopJourney,
      playJourney,
      destroy,
      getAmbientState: () => ambientController.getState(),
      getAmbientSchedule: () => ambientController.getSchedule(),
      getJourneyState: () => journeyController.getState(),
      getJourneys: () => journeyController.getJourneys(),
      dimensions: HAIRCUTDONE_WORKFLOW_DIMENSIONS,
      debug: Object.freeze({
        getEdgeMetrics: () => motionController.getEdgeMetrics(),
        playEdge: (edgeId) => motionController.playEdge(edgeId),
        showEdgeAtProgress: (edgeId, progress) =>
          motionController.showEdgeAtProgress(edgeId, progress),
        stopAllSignals: () => motionController.stopAll(),
      }),
    });
    activeInstance = api;

    const developmentJourney = development.journey;
    if (developmentJourney) {
      void playJourney(developmentJourney);
    } else if (development.journeyAutoplay === true) {
      startJourney();
    } else if (
      autoStart &&
      !development.motionEdge &&
      development.ambientTime === undefined &&
      development.journeyAutoplay !== false
    ) {
      startAmbient();
    }

    viewport.scrollLeft = 0;
    viewport.setAttribute("aria-busy", "false");
    return api;
  } catch (error) {
    destroy();
    throw error;
  }
}


import { Edge, Node, Position } from 'reactflow';
import * as dagre from 'dagre';
import { Person, Relationship, RelationshipType } from '../types';

const NODE_WIDTH = 180;
const NODE_HEIGHT = 100;

export const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: 'TB' }); // Top to Bottom

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

// Helper to check if an edge connects two people who are adjacent in the path
const isEdgeInPath = (p1: string, p2: string, path: string[]) => {
  if (!path || path.length < 2) return false;
  for (let i = 0; i < path.length - 1; i++) {
    const u = path[i];
    const v = path[i + 1];
    if ((u === p1 && v === p2) || (u === p2 && v === p1)) {
      return true;
    }
  }
  return false;
};

export const buildGraphData = (
  people: Person[], 
  relationships: Relationship[], 
  onSelect: (p: Person) => void,
  highlightedPath: string[] = []
) => {
  const nodes: Node[] = people.map((person) => ({
    id: person.id,
    type: 'personNode',
    data: { 
      person, 
      label: person.firstName, 
      onSelect,
      isHighlighted: highlightedPath.includes(person.id)
    },
    position: { x: 0, y: 0 }, // Initial position, calculated later
    zIndex: highlightedPath.includes(person.id) ? 10 : 1,
  }));

  const edges: Edge[] = [];

  relationships.forEach((rel) => {
    const isHighlighted = isEdgeInPath(rel.person1Id, rel.person2Id, highlightedPath);
    const baseStyle = isHighlighted 
      ? { stroke: '#10B981', strokeWidth: 4 } // Secondary color (Emerald)
      : { stroke: rel.type === RelationshipType.PARENT ? '#94a3b8' : '#f43f5e', strokeWidth: 2 };

    // Common edge props
    const edgeProps = {
      id: rel.id,
      source: rel.person1Id,
      target: rel.person2Id,
      animated: isHighlighted,
      label: rel.label, // Display custom label if present
      style: { ...baseStyle },
      zIndex: isHighlighted ? 10 : 1,
      labelStyle: { fill: '#64748b', fontWeight: 700, fontSize: 10 },
      labelBgStyle: { fill: 'rgba(255, 255, 255, 0.75)' },
    };

    if (rel.type === RelationshipType.PARENT) {
      edges.push({
        ...edgeProps,
        type: 'smoothstep',
      });
    } else if (rel.type === RelationshipType.SPOUSE) {
      edges.push({
        ...edgeProps,
        type: 'straight',
        style: { 
          ...baseStyle, 
          strokeDasharray: isHighlighted ? 'none' : '5,5' 
        },
      });
    }
  });

  return getLayoutedElements(nodes, edges);
};
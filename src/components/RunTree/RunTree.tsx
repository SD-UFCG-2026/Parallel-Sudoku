import type { NodeDto } from "../../types/node";

import "./RunTree.css";

interface RunTreeProps {
  root: NodeDto;
  selectedNode: NodeDto | null;
  onSelectNode: (node: NodeDto) => void;
}

interface TreeNodeProps {
  node: NodeDto;
  parent: NodeDto | null;
  selectedNode: NodeDto | null;
  onSelectNode: (node: NodeDto) => void;
}

function countAdditions(
  node: NodeDto,
  parent: NodeDto | null,
): number {
  if (!parent) {
    return 0;
  }

  let additions = 0;

  const board = node.value.board;
  const parentBoard = parent.value.board;

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (
        parentBoard[row]?.[col] === 0 &&
        board[row][col] !== 0
      ) {
        additions++;
      }
    }
  }

  return additions;
}

function getInitial(
  identifier: string,
): string {
  return identifier.charAt(0).toUpperCase();
}

function TreeNode({
  node,
  parent,
  selectedNode,
  onSelectNode,
}: TreeNodeProps) {
  const isRoot = parent === null;
  const isSelected = node === selectedNode;

  const additions = countAdditions(
    node,
    parent,
  );

  return (
    <li className="run-tree-item">
      <div className="run-tree-node-wrapper">
        <button
          type="button"
          className={`run-tree-node ${
            isRoot ? "system" : ""
          } ${
            isSelected ? "selected" : ""
          }`}
          onClick={() => onSelectNode(node)}
        >
          <span className="run-tree-avatar">
            {isRoot
              ? "S"
              : getInitial(
                  node.value.signature.identifier,
                )}
          </span>

          <span className="run-tree-node-content">
            <strong  title={isRoot
                  ? "Sistema (Inicial)"
                  : node.value.signature.identifier}>
              {isRoot
                ? "Sistema (Inicial)"
                : node.value.signature.identifier}
            </strong>

            <span className="run-tree-node-subtitle">
              {isRoot
                ? "Raiz"
                : `${additions} ${
                    additions === 1
                      ? "adição"
                      : "adições"
                  }`}
            </span>
          </span>
        </button>
      </div>

      {node.child.length > 0 && (
        <ul className="run-tree-children">
          {node.child.map((child, index) => (
            <TreeNode
              key={index}
              node={child}
              parent={node}
              selectedNode={selectedNode}
              onSelectNode={onSelectNode}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function RunTree({
  root,
  selectedNode,
  onSelectNode,
}: RunTreeProps) {
  return (
    <div className="run-tree">
      <ul className="run-tree-root">
        <TreeNode
          node={root}
          parent={null}
          selectedNode={selectedNode}
          onSelectNode={onSelectNode}
        />
      </ul>
    </div>
  );
}

export default RunTree;
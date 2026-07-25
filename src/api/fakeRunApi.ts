import type { BoardDto } from "../types/board";
import type { NodeDto } from "../types/node";
import type { RunDto } from "../types/run";

import type { RunApi } from "./runApi";

import { runMock } from "../mocks/runMock";

let currentRun: RunDto = structuredClone(runMock);

function findNode(
  current: NodeDto,
  target: NodeDto,
): NodeDto | null {
  if (current === target) {
    return current;
  }

  for (const child of current.child) {
    const result = findNode(child, target);

    if (result) {
      return result;
    }
  }

  return null;
}

export const fakeRunApi: RunApi = {
  async getRun(): Promise<RunDto> {
    return structuredClone(currentRun);
  },

  async submitBoard(
    parent: NodeDto,
    board: BoardDto,
  ): Promise<RunDto> {
    const parentNode = findNode(
      currentRun.root,
      parent,
    );

    if (!parentNode) {
      throw new Error("Nó pai não encontrado.");
    }

    const newNode: NodeDto = {
      value: structuredClone(board),
      child: [],
    };

    parentNode.child.push(newNode);

    return structuredClone(currentRun);
  },
};
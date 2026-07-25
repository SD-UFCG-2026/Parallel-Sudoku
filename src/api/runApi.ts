import type { BoardDto } from "../types/board";
import type { NodeDto } from "../types/node";
import type { RunDto } from "../types/run";

export interface RunApi {
  getRun(): Promise<RunDto>;

  submitBoard(
    parent: NodeDto,
    board: BoardDto,
  ): Promise<RunDto>;
}
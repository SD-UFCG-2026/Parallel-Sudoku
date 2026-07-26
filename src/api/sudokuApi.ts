import type { BoardDto } from "../types/board";
import type { RunDto } from "../types/run";

const API_URL = import.meta.env.VITE_API_URL;

const SUDOKU_URL = `${API_URL}/sudoku`;

async function handleResponse<T>(
  response: Response,
): Promise<T> {
  if (!response.ok) {
    throw new Error(
      `Erro na API: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<T>;
}

export async function getAllSudokus(): Promise<RunDto[]> {
  const response = await fetch(SUDOKU_URL);

  return handleResponse<RunDto[]>(response);
}

export async function getSudokuById(
  id: number,
): Promise<RunDto> {
  const response = await fetch(
    `${SUDOKU_URL}/${id}`,
  );

  return handleResponse<RunDto>(response);
}

export async function submitContribution(
  sudokuId: number,
  board: BoardDto,
): Promise<void> {
  const response = await fetch(
    `${SUDOKU_URL}/${sudokuId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(board),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Erro ao enviar contribuição: ${response.status}`,
    );
  }
}
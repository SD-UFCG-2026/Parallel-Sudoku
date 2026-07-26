import type {NodeDto} from './node';

export interface RunDto {
    id: number;
    root: NodeDto;
    isFinished: boolean;
    final: NodeDto | null;
}
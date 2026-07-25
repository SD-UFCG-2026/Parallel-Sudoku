import type {NodeDto} from './node';

export interface RunDto {
    root: NodeDto;
    isFinished: boolean;
    final: NodeDto | null;
}
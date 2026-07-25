import type {BoardDto} from './board';

export interface NodeDto {
    value: BoardDto;
    child: NodeDto[];
}
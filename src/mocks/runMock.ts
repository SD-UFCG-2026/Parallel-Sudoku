import type { RunDto } from "../types/run";

export const runMock: RunDto = {
  root: {
    value: {
      board: [
        [1, 2, 3, 4],
        [3, 4, 2, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 1],
      ],
      signature: {
        identifier: "SYSTEM",
        key: "",
      },
    },

    child: [
      {
        value: {
          board: [
            [1, 2, 3, 4],
            [3, 4, 2, 1],
            [2, 0, 0, 0],
            [0, 0, 0, 1],
          ],
          signature: {
            identifier: "PlayerOne",
            key: "fake-key-player-one",
          },
        },

        child: [
          {
            value: {
              board: [
                [1, 2, 3, 4],
                [3, 4, 2, 1],
                [2, 1, 4, 3],
                [0, 0, 0, 1],
              ],
              signature: {
                identifier: "PlayerTwo",
                key: "fake-key-player-two",
              },
            },

            child: [],
          },
        ],
      },

      {
        value: {
          board: [
            [1, 2, 3, 4],
            [3, 4, 2, 1],
            [0, 1, 0, 0],
            [0, 0, 0, 1],
          ],
          signature: {
            identifier: "AnotherPlayer",
            key: "fake-key-another-player",
          },
        },

        child: [],
      },
    ],
  },

  isFinished: false,

  final: null,
};
// import { ConditionTypeEnum, type DSL, NodeTypeEnum } from '../../../enums';

// export default {
//   // 串行编排(THEN)
//   THEN: {
//     type: ConditionTypeEnum.THEN,
//     children: [
//       { type: NodeTypeEnum.COMMON, id: 'a', properties: { tag: 'dog' } },
//       { type: NodeTypeEnum.COMMON, id: 'b' },
//       { type: NodeTypeEnum.COMMON, id: 'c' },
//       { type: NodeTypeEnum.COMMON, id: 'd' },
//     ],
//     properties: { id: 'cat' },
//   },
//   // 并行编排(WHEN)
//   WHEN: {
//     type: ConditionTypeEnum.THEN,
//     children: [
//       { type: NodeTypeEnum.COMMON, id: 'a' },
//       {
//         type: ConditionTypeEnum.WHEN,
//         children: [
//           { type: NodeTypeEnum.COMMON, id: 'b' },
//           { type: NodeTypeEnum.COMMON, id: 'c' },
//           { type: NodeTypeEnum.COMMON, id: 'd' },
//         ],
//       },
//       { type: NodeTypeEnum.COMMON, id: 'e' },
//     ],
//   },
//   // 选择编排(SWITCH)
//   SWITCH: {
//     type: ConditionTypeEnum.SWITCH,
//     condition: { type: NodeTypeEnum.SWITCH, id: 'x' },
//     children: [
//       { type: NodeTypeEnum.COMMON, id: 'a' },
//       { type: NodeTypeEnum.COMMON, id: 'b' },
//       { type: NodeTypeEnum.COMMON, id: 'c' },
//       { type: NodeTypeEnum.COMMON, id: 'd' },
//     ],
//   },
//   // 条件编排(IF)
//   IF: {
//     type: ConditionTypeEnum.IF,
//     condition: { type: NodeTypeEnum.BOOLEAN, id: 'x' },
//     children: [{ type: NodeTypeEnum.COMMON, id: 'a' }],
//   },
//   // FOR循环
//   FOR: {
//     type: ConditionTypeEnum.FOR,
//     condition: { type: NodeTypeEnum.BOOLEAN, id: 'x' },
//     children: [
//       {
//         type: ConditionTypeEnum.THEN,
//         children: [
//           { type: NodeTypeEnum.COMMON, id: 'a' },
//           { type: NodeTypeEnum.COMMON, id: 'b' },
//         ],
//       },
//     ],
//   },
//   // WHILE循环
//   WHILE: {
//     type: ConditionTypeEnum.WHILE,
//     condition: { type: NodeTypeEnum.BOOLEAN, id: 'x' },
//     children: [
//       {
//         type: ConditionTypeEnum.THEN,
//         children: [
//           { type: NodeTypeEnum.COMMON, id: 'a' },
//           { type: NodeTypeEnum.COMMON, id: 'b' },
//         ],
//       },
//     ],
//   },
//   // ITERATOR循环
//   ITERATOR: {
//     type: ConditionTypeEnum.ITERATOR,
//     condition: { type: NodeTypeEnum.ITERATOR, id: 'x' },
//     children: [
//       {
//         type: ConditionTypeEnum.THEN,
//         children: [
//           { type: NodeTypeEnum.COMMON, id: 'a' },
//           { type: NodeTypeEnum.COMMON, id: 'b' },
//         ],
//       },
//     ],
//   },
//   // CATCH 捕获异常
//   CATCH: {
//     type: ConditionTypeEnum.CATCH,
//     condition: {
//       type: ConditionTypeEnum.WHEN,
//       children: [
//         { type: NodeTypeEnum.COMMON, id: 'a' },
//         { type: NodeTypeEnum.COMMON, id: 'b' },
//         { type: NodeTypeEnum.COMMON, id: 'c' },
//       ],
//     },
//     children: [
//       {
//         type: ConditionTypeEnum.IF,
//         condition: { type: NodeTypeEnum.IF, id: 'x' },
//         children: [{ type: NodeTypeEnum.COMMON, id: 'y' }],
//       },
//     ],
//   },
//   // AND_OR_NOT 与或非
//   AND: {
//     type: ConditionTypeEnum.IF,
//     condition: {
//       type: ConditionTypeEnum.AND,
//       children: [
//         {
//           type: ConditionTypeEnum.OR,
//           children: [
//             { type: NodeTypeEnum.BOOLEAN, id: 'a' },
//             { type: NodeTypeEnum.BOOLEAN, id: 'b' },
//           ],
//         },
//         {
//           type: ConditionTypeEnum.NOT,
//           children: [{ type: NodeTypeEnum.BOOLEAN, id: 'c' }],
//         },
//       ],
//     },
//     children: [
//       { type: NodeTypeEnum.COMMON, id: 'x' },
//       { type: NodeTypeEnum.COMMON, id: 'y' },
//     ],
//   },
//   // CHAIN 子流程
//   CHAIN: {
//     type: ConditionTypeEnum.THEN,
//     children: [
//       { type: NodeTypeEnum.COMMON, id: 'A' },
//       { type: NodeTypeEnum.COMMON, id: 'B' },
//       {
//         type: ConditionTypeEnum.WHEN,
//         children: [
//           {
//             type: ConditionTypeEnum.CHAIN,
//             id: 't1',
//             children: [
//               {
//                 type: ConditionTypeEnum.THEN,
//                 children: [
//                   { type: NodeTypeEnum.COMMON, id: 'C' },
//                   {
//                     type: ConditionTypeEnum.WHEN,
//                     children: [
//                       { type: NodeTypeEnum.COMMON, id: 'J' },
//                       { type: NodeTypeEnum.COMMON, id: 'K' },
//                     ],
//                   },
//                 ],
//               },
//             ],
//           },
//           { type: NodeTypeEnum.COMMON, id: 'D' },
//           {
//             type: ConditionTypeEnum.CHAIN,
//             id: 't2',
//             children: [
//               {
//                 type: ConditionTypeEnum.THEN,
//                 children: [
//                   { type: NodeTypeEnum.COMMON, id: 'H' },
//                   { type: NodeTypeEnum.COMMON, id: 'I' },
//                 ],
//               },
//             ],
//           },
//         ],
//       },
//       {
//         type: ConditionTypeEnum.SWITCH,
//         condition: { type: NodeTypeEnum.COMMON, id: 'X' },
//         children: [
//           { type: NodeTypeEnum.COMMON, id: 'M' },
//           { type: NodeTypeEnum.COMMON, id: 'N' },
//           {
//             type: ConditionTypeEnum.CHAIN,
//             id: 'w1',
//             children: [
//               {
//                 type: ConditionTypeEnum.WHEN,
//                 children: [
//                   { type: NodeTypeEnum.COMMON, id: 'Q' },
//                   {
//                     type: ConditionTypeEnum.THEN,
//                     children: [
//                       { type: NodeTypeEnum.COMMON, id: 'P' },
//                       { type: NodeTypeEnum.COMMON, id: 'R' },
//                     ],
//                   },
//                 ],
//                 properties: {
//                   id: 'w01',
//                 },
//               },
//             ],
//           },
//         ],
//       },
//     ],
//   },
// } as DSL;

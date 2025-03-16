// import React, { useCallback, useState } from 'react';
// import { Select } from 'antd';

// import { ConditionTypeEnum, type KeyValue } from '../../../enums';
// import { fromJSON } from '../../../store';

// import data from './data';

// const Mock: React.FC = () => {
//   const [current, setCurrent] = useState<string>('');
//   const handleOnChange = useCallback((value: string) => {
//     setCurrent(value);
//     const mockData = data[value] as KeyValue;

//     fromJSON(mockData);
//   }, []);

//   return (
//     <div>
//       <span>测试数据：</span>
//       <Select
//         placeholder="请选择测试数据"
//         value={current}
//         style={{ width: 175 }}
//         onChange={handleOnChange}
//         options={[
//           {
//             label: '顺序类',
//             options: [
//               { label: '串行编排(THEN)', value: ConditionTypeEnum.THEN },
//               { label: '并行编排(WHEN)', value: ConditionTypeEnum.WHEN },
//             ],
//           },
//           {
//             label: '分支类',
//             options: [
//               {
//                 label: '选择编排(SWITCH)',
//                 value: ConditionTypeEnum.SWITCH,
//               },
//               { label: '条件编排(IF)', value: ConditionTypeEnum.IF },
//             ],
//           },
//           {
//             label: '循环类',
//             options: [
//               { label: 'FOR循环', value: ConditionTypeEnum.FOR },
//               { label: 'WHILE循环', value: ConditionTypeEnum.WHILE },
//               { label: 'ITERATOR循环', value: ConditionTypeEnum.ITERATOR },
//             ],
//           },
//           {
//             label: '其他类',
//             options: [
//               { label: '捕获异常(CATCH)', value: ConditionTypeEnum.CATCH },
//               { label: '与或非(AND_OR_NOT)', value: ConditionTypeEnum.AND },
//               { label: '子流程(CHAIN)', value: ConditionTypeEnum.CHAIN },
//             ],
//           },
//         ]}
//       />
//     </div>
//   );
// };

// export default Mock;

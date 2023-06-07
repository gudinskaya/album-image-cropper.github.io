import React from 'react';
import { Select as AntdSelect } from 'antd';

const Select = ({handleChange}:{handleChange: any}) => (
    <AntdSelect
      defaultValue="square"
      style={{ width: 120 }}
      onChange={handleChange}
      options={[
        { value: 6/4, label: 'horizontal (6x4cm)' },
        { value: 5/5, label: 'square (5x5cm)' },
        { value: 4/6, label: 'vertical (4x6cm)' },
      ]}
    />
);

export default Select;
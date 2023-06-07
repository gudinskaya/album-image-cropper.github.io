import React from 'react';
import { Checkbox as AntdCheckbox } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';

const Checkbox = ({isChecked, onChange}: {isChecked: boolean, onChange: (e: CheckboxChangeEvent) => void}) => {
  return (
    <>
      <p style={{ marginBottom: '0' }}>
        <AntdCheckbox checked={isChecked} onChange={onChange}>
          With frame
        </AntdCheckbox>
      </p>
    </>
  );
};

export default Checkbox;
import { FC } from "react";
import Switch from "antd/es/switch";
import { Icon } from "@iconify/react";

interface Props {
  isDark: boolean;
  onChange: () => void;
}

const ThemeSwitch: FC<Props> = ({ isDark, onChange }) => {
  return (
    <Switch
      checkedChildren={
        <Icon width={16} icon="mdi:moon-and-stars" className="mt-1" />
      }
      unCheckedChildren={
        <Icon width={16} icon="mdi:white-balance-sunny" className="mb-1" />
      }
      value={isDark}
      onChange={onChange}
    />
  );
};

export default ThemeSwitch;

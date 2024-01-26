import { FC, PropsWithChildren, useEffect, useState } from "react";
import { Input } from "antd";
import useInput from "@/hooks/useInput";
import SafeText from "./SafeText";

interface Props extends PropsWithChildren {
  label: string;
  className: string;
  onClick: (e: any) => void | Promise<void>;
  onConfirm: (newLabel: string) => void | Promise<void>;
}

const EditableText: FC<Props> = ({ className, label, onClick, onConfirm }) => {
  const [edit, setEdit] = useState(false);
  const [value, handleValue, setValue] = useInput(label);

  const handleConfirm = () => {
    onConfirm(value);
    setEdit(false);
  };

  useEffect(() => {
    setValue(label);
  }, [label]);

  return edit ? (
    <Input
      className={className}
      value={value}
      onChange={handleValue}
      onBlur={handleConfirm}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleConfirm();
        }
      }}
    />
  ) : (
    <div
      onDoubleClick={() => setEdit(true)}
      onClick={onClick}
      className={className}
    >
      <SafeText className="line-clamp-2">{label}</SafeText>
    </div>
  );
};

export default EditableText;

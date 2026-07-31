import React, { FC, useEffect } from "react";

interface IProps {
  message: string;
  title?: string;
  onClose: () => void;
}

const CustomAlert: FC<IProps> = ({ message, title, onClose }: IProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Close after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="slide-in bottom-24 fixed transform rounded-lg bg-blue px-6 py-4 text-white shadow-lg">
      {title && <div className="mb-1 font-semibold">{title}</div>}
      <div className={title ? "text-sm" : ""}>{message}</div>
    </div>
  );
};

export default CustomAlert;

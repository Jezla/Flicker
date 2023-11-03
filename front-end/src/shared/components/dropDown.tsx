import React from "react";
import { Dropdown as ADropdown, ConfigProvider, MenuProps } from "antd";
import { Language } from "@/redux/slices/language";

type Props = {
  value: number;
  values: Language[];
  onChange: Function;
};

const Dropdown = ({ value, values, onChange }: Props) => {
  const handleMenuClick: MenuProps["onClick"] = (info) => {
    onChange(Number(info.key));
  };

  const menuProps = {
    items: values.map((v, i) => ({ label: `${v.name} (${v.code})`, key: i })),
    onClick: handleMenuClick,
    selectable: true,
    defaultSelectedKeys: [value.toString()],
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#435334",
          controlItemBgActive: "#CEDEBD",
          controlItemBgActiveHover: "#C7EC99",
        },
      }}
    >
      <ADropdown
        menu={menuProps}
        trigger={["click"]}
        getPopupContainer={() => {
          const area = document.getElementById("dropdownArea");
          return area ? area : document.body;
        }}
        placement="bottomRight"
      >
        <button
          type="button"
          className="flex justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          id="menu-button"
          aria-expanded="true"
          aria-haspopup="true"
        >
          {values[value].name}
          <svg
            className="-mr-1 h-5 w-5 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </ADropdown>
    </ConfigProvider>
  );
};

export { Dropdown };

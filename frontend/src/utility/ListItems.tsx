// Reusable ListItem Component
interface ListItemProps {
  label: string;
  value?: string | number;
  borderColor: string;
}

export const ListItem: React.FC<ListItemProps> = ({ label, value, borderColor }) => {
  return (
    <li style={{borderColor: borderColor }} className={`grow border-2 rounded-lg flex flex-col items-start justify-start px-3 py-2 duration-200 ease-in-out`}>
      <p className="text-base font-semibold flex flex-col text-wrap">
        {label}
      </p>
      <p className="text-lg">{value ?? "--"}</p>
    </li>
  );
};

interface ListItemSearchProps<T extends string | number> {
  label: string;
  value?: T;
  borderColor: string;
  options: Array<T>;
  onChange?: (value: T) => void;
}

export const ListItemWithSearch = <T extends string | number>({
  label,
  value,
  borderColor,
  options,
  onChange,
}: ListItemSearchProps<T>) => {
  return (
    <li
      style={{ borderColor }}
      className="border-2 rounded-lg flex flex-col items-start justify-start px-3 py-2 duration-200 ease-in-out"
    >
      <p className="text-base font-semibold flex flex-col text-wrap">{label}</p>
      <select
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value as T)}
        className="py-1 text-lg w-full border-slate-400 rounded-md border"
      >
        <option value="" disabled>
          Select an option
        </option>
        {options.map((option, i) => (
          <option key={i} value={option}>
            {option}
          </option>
        ))}
      </select>
    </li>
  );
};

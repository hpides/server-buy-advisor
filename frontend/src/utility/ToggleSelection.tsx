import { useState } from "react";
import edit from "../assets/edit.png";

const EXTRA_DEFAULT = "Custom";

interface ToggleSelectionProps<T> {
  label: string;
  options: Array<T>;
  currentState: T;
  capitalize?: boolean;
  extraInput?: boolean;
  flexGrow?: boolean;
  disabled?: Array<T>;
  color?: 'New' | 'Current' | 'None';
  setState: (value: T) => void;
}

const ToggleSelection = <T,>({ 
  label,
  options,
  setState,
  currentState,
  capitalize = false,
  extraInput = false,
  flexGrow = false,
  disabled = [],
  color = 'None'
}: ToggleSelectionProps<T>) => {

  const [extra, setExtra] = useState(EXTRA_DEFAULT);

  const extraFocus = (value: any, initial: boolean = false) => {
    setExtra((initial && value == EXTRA_DEFAULT) ? "" : value);
    if (value == Number(value)) setState(value as unknown as T);
  }

  const extraUnfocus = (value: any) => {
    if (value === "") {
      setExtra(EXTRA_DEFAULT);
      setState(options[0]);
      return;
    }

    setExtra(value);

    const isNumber = !isNaN(value);
    setState(isNumber ? value : options[0]);
  };

  // Tailwind no dynamic class generation moment
  let border = 'border-hpi-orange';
  let borderHover = 'hover:border-b-hpi-orange/30'
  if (color == 'New') {
    border = 'border-hpi-new';
    borderHover = 'hover:border-b-hpi-new/30';
  }
  if (color == 'Current') {
    border = 'border-hpi-current';
    borderHover = 'hover:border-b-hpi-current/30';
  }

  return (
    <div className="flex items-center flex-wrap w-full gap-2">
      <p className={`${flexGrow ? 'font-mono text-sm ' : ''} border-b-4 border-transparent`}>{label}</p>
      {options.map((option) => (
        <button
          key={String(option)}
          onFocus={() => setState(option)}
          disabled={disabled.includes(option)}
          className={`border-b-4 duration-150 
${flexGrow ? 'flex-1' : 'px-4'}
${currentState === option ? `${border} font-bold` : `border-b-transparent font-normal hover:font-medium opacity-85 ${borderHover}`} 
${capitalize ? " capitalize" : ""} 
${disabled.includes(option) ? "cursor-not-allowed text-gray-300 hover:border-b-transparent" : "cursor-pointer"}
`}
        >
            {String(option)}
        </button>
      ))}
      { extraInput &&
        <div className={`flex items-start duration-150 ${currentState == extra ? '' : 'opacity-80'}`}>
          <input type="text" className={`${currentState == extra ? `${border} font-bold` : `border-b-transparent ${borderHover}`} cursor-pointer text-center duration-150 border-b-4 ${color == 'New' ? 'focus:outline-hpi-new/30' : 'focus:outline-hpi-current/30'} w-14`}
            onFocus={(e) => extraFocus(e.target.value, true)}
            onChange={(e) => extraFocus(e.target.value)}
            onBlur={(e) => extraUnfocus(e.target.value)}
            value={extra} />
          <img src={edit} className="h-5" />
        </div>
      }
    </div>
  );
};

export default ToggleSelection;

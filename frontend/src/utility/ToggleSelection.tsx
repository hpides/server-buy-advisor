import { useState } from "react";
import edit from "../assets/edit.png";

interface ToggleSelectionProps<T> {
  label: string;
  options: Array<T>;
  currentState: T;
  capitalize?: boolean;
  extraInput?: boolean;
  flexJustify?: string;
  disabled?: Array<T>;
  setState: (value: T) => void;
}

const ToggleSelection = <T,>({ 
  label,
  options,
  setState,
  currentState,
  capitalize = false,
  extraInput = false,
  flexJustify = "justify-start",
  disabled = []
}: ToggleSelectionProps<T>) => {

  const [extra, setExtra] = useState('Other');

  const extraFocus = (value: any, initial: boolean = false) => {
    setExtra((initial && value == "Other") ? "" : value);
    if (value == Number(value)) setState(value as unknown as T);
  }

  const extraUnfocus = (value: any) => {
    if (value === "") {
      setExtra("Other");
      setState(options[0]);
      return;
    }

    setExtra(value);

    const isNumber = !isNaN(value);
    setState(isNumber ? value : options[0]);
  };

  return (
    <div className={`flex gap-4 items-center flex-wrap w-full ${flexJustify}`}>
      <p className="border-b-4 border-transparent">{label}</p>
      {options.map((option) => (
        <button
          key={String(option)}
          onFocus={() => setState(option)}
          disabled={disabled.includes(option)}
          className={`px-2 min-w-16 border-b-4 duration-150 
${currentState === option ? "border-orange-400 font-bold" : "border-b-transparent font-normal hover:border-b-orange-400/30"} 
${capitalize ? " capitalize" : ""} 
${disabled.includes(option) ? "cursor-not-allowed text-gray-300 hover:border-b-transparent" : "cursor-pointer"}
`}
        >
          {String(option)}
        </button>
      ))}
      { extraInput &&
        <div className="flex items-start">
          <input type="text" className={`${currentState == extra ? 'border-orange-400 font-bold' : 'border-b-transparent hover:border-b-orange-400/30'} cursor-pointer text-center duration-150 border-b-4 focus:outline-orange-400/30 w-14`}
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

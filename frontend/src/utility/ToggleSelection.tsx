import { useState } from "react";
import edit from "../assets/edit.png";

interface ToggleSelectionProps<T> {
  label: string;
  options: Array<T>;
  currentState: T;
  capitalize?: boolean;
  extraInput?: boolean;
  setState: (value: T) => void;
}

const ToggleSelection = <T,>({ label, options, setState, currentState, capitalize = false, extraInput = false }: ToggleSelectionProps<T>) => {

  const [extra, setExtra] = useState('Other');

  const extraFocus = (value: any) => {
    setExtra(value);
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
    <div className="flex gap-4 items-center flex-wrap">
      <p className="border-b-4 border-transparent font-medium">{label}</p>
      {options.map((option) => (
        <button
          key={String(option)}
          onFocus={() => setState(option)}
          className={
            `px-3 py-0.5 cursor-pointer border-b-4 duration-150
${currentState === option ? "border-orange-400 font-bold" : "border-b-transparent font-normal hover:border-b-orange-400/30"}
${capitalize ? 'capitalize' : ''}`
          }
        >
          {String(option)}
        </button>
      ))}
      { extraInput &&
        <div className="flex items-start">
          <input type="text" className={`${currentState == extra ? 'border-orange-400 font-bold' : 'border-b-transparent hover:border-b-orange-400/30'} cursor-pointer text-center duration-150 border-b-4 border-orange-400 focus:outline-none w-14`}
            onFocus={(e) => extraFocus(e.target.value)}
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

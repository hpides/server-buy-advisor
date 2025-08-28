import Tooltip from "./Tooltip";

interface ToggleSelectionProps<T> {
  label: string;
  options: Array<T>;
  optionsTooltip?: Array<string>;
  currentState: T;
  capitalize?: boolean;
  extraInput?: boolean;
  flexGrow?: boolean;
  disabled?: Array<T>;
  color?: 'New' | 'Current' | 'None';
  zIndex?: string; // I cannot find another workaround...remove this and see hover tooltip interaction
  setState: (value: T) => void;
}

const ToggleSelection = <T,>({ 
  label,
  options,
  optionsTooltip = [],
  setState,
  currentState,
  capitalize = false,
  flexGrow = false,
  disabled = [],
  zIndex = '', // FIX: Horrible implementation but don't want to waste time on a z-index
  color = 'None'
}: ToggleSelectionProps<T>) => {

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
      {options.map((option, index) => (
        <button
          key={String(option)}
          onMouseDown={() => setState(option)} 
          disabled={disabled.includes(option)}
          className={`border-b-4 duration-150 ${zIndex}
${flexGrow ? 'flex-1' : 'px-4'}
${currentState === option ? `${border} font-bold` : `border-b-transparent font-normal hover:font-medium ${borderHover}`}
${capitalize ? " capitalize" : ""}
${disabled.includes(option) ? "cursor-not-allowed text-gray-300 hover:border-b-transparent" : "cursor-pointer"}
`}
        >
          <Tooltip tooltipText={optionsTooltip[index]}>
            {String(option)}
          </Tooltip>
        </button>
      ))}
    </div>
  );
};

export default ToggleSelection;

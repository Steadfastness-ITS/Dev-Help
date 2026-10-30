import { SelectDropDown } from '@librechat/client';
import type { TModelSelectProps } from '~/common';
import SelectDropDownPop from '~/components/Input/ModelSelect/SelectDropDownPop';
import { cn, cardStyle } from '~/utils';

export default function Google({
  conversation,
  setOption,
  models,
  showAbove,
  popover = false,
}: TModelSelectProps) {
  const Menu = popover ? SelectDropDownPop : SelectDropDown;
  
  // Override display: always show "Dev help" but keep actual model value
  const customDisplayValue = { label: 'Dev help', value: conversation?.model ?? '' };
  
  return (
    <Menu
      value={customDisplayValue}
      setValue={(newModel) => {
        // Extract the actual model value if it's an object
        const modelValue = typeof newModel === 'string' ? newModel : newModel.value;
        setOption('model')(modelValue);
      }}
      availableValues={models}
      showAbove={showAbove}
      showLabel={false}
      className={cn(
        cardStyle,
        'z-50 flex h-[40px] w-48 min-w-48 flex-none items-center justify-center px-4 ring-0 hover:cursor-pointer',
      )}
    />
  );
}

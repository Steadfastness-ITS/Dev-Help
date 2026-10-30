import { SelectDropDown } from '@librechat/client';
import SelectDropDownPop from '~/components/Input/ModelSelect/SelectDropDownPop';
import { cn, cardStyle } from '~/utils';

export default function ChatGPT({
  conversation,
  setOption,
  models = ['gpt-4', 'gpt-3.5-turbo', 'gemini-pro', 'claude-3'], // MOCKED MODELS
  showAbove,
  popover = false,
}) {
  /** * UI/UX MOCK: 
   * We comment out the 'return null' guards. 
   * This forces the component to render even if there is no backend conversation.
   */
  // if (!conversation) {
  //   return null;
  // }

  // Fallback values so the UI doesn't crash when looking for 'conversation.model'
  const currentModel = conversation?.model || 'gpt-4';
  const currentSetOption = setOption || ((key) => (val) => console.log(`Mock Set ${key}: ${val}`));

  const Menu = popover ? SelectDropDownPop : SelectDropDown;

  return (
    <div className="flex items-center justify-center py-2">
      <Menu
        value={currentModel}
        setValue={currentSetOption('model')}
        availableValues={models}
        showAbove={showAbove}
        showLabel={false}
        className={cn(
          cardStyle,
          'z-50 flex h-[40px] w-60 min-w-48 flex-none items-center justify-center px-4 ring-0 hover:cursor-pointer',
        )}
      />
    </div>
  );
}
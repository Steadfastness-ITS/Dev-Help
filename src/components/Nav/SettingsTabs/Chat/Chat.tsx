import { memo } from 'react';
import FontSizeSelector from './FontSizeSelector';
import { ForkSettings } from './ForkSettings';
import ChatDirection from './ChatDirection';
import ToggleSwitch from '../ToggleSwitch';
import store from '~/store';

const toggleSwitchConfigs = [
  // Hidden: Enter to Send
  // {
  //   stateAtom: store.enterToSend,
  //   localizationKey: 'com_nav_enter_to_send',
  //   switchId: 'enterToSend',
  //   hoverCardText: 'com_nav_info_enter_to_send',
  //   key: 'enterToSend',
  // },
  // Hidden: Maximize Chat Space
  // {
  //   stateAtom: store.maximizeChatSpace,
  //   localizationKey: 'com_nav_maximize_chat_space',
  //   switchId: 'maximizeChatSpace',
  //   hoverCardText: undefined,
  //   key: 'maximizeChatSpace',
  // },
  // Hidden settings:
  // - Center Chat Input on Welcome Screen (centerFormOnLanding)
  // - Open Thinking Dropdowns by Default (showThinking)
  // - Parsing LaTeX in messages (LaTeXParsing)
  // - Save drafts locally (saveDrafts)
  // - Scroll to the end button (showScrollButton)
  // - Save badges state (saveBadgesState)
  // - Enable switching Endpoints mid-conversation (modularChat)
  {
    stateAtom: store.showCode,
    localizationKey: 'com_nav_show_code',
    switchId: 'showCode',
    hoverCardText: undefined,
    key: 'showCode',
  },
];

function Chat() {
  return (
    <div className="flex flex-col gap-3 p-1 text-sm text-text-primary">
      <div className="pb-3">
        <FontSizeSelector />
      </div>
      {/* Chat Direction hidden */}
      {/* <div className="pb-3">
        <ChatDirection />
      </div> */}
      {toggleSwitchConfigs.map((config) => (
        <div key={config.key} className="pb-3">
          <ToggleSwitch
            stateAtom={config.stateAtom}
            localizationKey={config.localizationKey}
            hoverCardText={config.hoverCardText}
            switchId={config.switchId}
          />
        </div>
      ))}
      {/* ForkSettings hidden - contains:
          - Use default fork option
          - Start fork from target message by default
      */}
      {/* <ForkSettings /> */}
    </div>
  );
}

export default memo(Chat);

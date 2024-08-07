import { MediaLinks } from '@/constant/common';
import { Modal, ModalBody, ModalContent, ModalHeader, cn } from '@nextui-org/react';
import type { FC } from 'react';

interface RuleLi {
  label: string;
  desc?: string;
  noMark?: boolean;
  bold?: boolean;
  indent?: boolean;
}

interface Rule {
  title: string;
  desc?: string;
  lis: RuleLi[];
}

const AlphaTestGuidelinesModal: FC<{ disclosure: Disclosure }> = ({ disclosure: { isOpen, onOpenChange } }) => {
  const rules: Rule[] = [
    {
      title: 'Recommended Devices for AstrArk Alpha Test 2.0',
      lis: [
        {
          label: 'iOS Devices:',
          bold: true,
          noMark: true,
        },
        {
          label: 'Model: iphone 12 or above',
          indent: true,
        },
        {
          label: 'CPU: A14',
          indent: true,
        },
        {
          label: 'RAM: 6GB or more',
          indent: true,
        },
        {
          label: 'Storage: 10GB',
          indent: true,
        },
        {
          label: 'System: IOS 15',
          indent: true,
        },
        {
          label: 'Android Devices:',
          bold: true,
          noMark: true,
        },
        {
          label: 'CPU: Snapdragon 8 Gen 1, Dimensity 9000 or above',
          indent: true,
        },
        {
          label: 'RAM: 8GB or more',
          indent: true,
        },
        {
          label: 'Storage: 10GB',
          indent: true,
        },
        {
          label: 'Devices with less than 4GB of RAM may cause lag',
          indent: true,
        },
      ],
    },
    {
      title: 'Recommended Network Regions for AstrArk Alpha Test 2.0',
      desc: 'The game will run more smoothly if your network is in one of these regions:',
      lis: [
        { label: 'North America' },
        { label: 'Latin America' },
        { label: 'Europe' },
        { label: 'Japan, Korea, Southeast Asia' },
        { label: 'India & Nigeria' },
      ],
    },
    {
      title: 'Common Questions and Solutions',
      lis: [
        {
          label: 'Log in notice',
          desc: 'Use your Moonveil account to log in to the game. Make sure your login details are correct.',
        },
        {
          label: 'How to claim the rewards of Alpha Test 1.0',
          desc: 'Log in with your Alpha Test 1.0 account to claim your rewards in the game.',
        },
        {
          label: 'How to claim the rewards of Premium Pass',
          desc: 'Check <a href="https://moonveil.gg/" target="_blank" class="text-basic-yellow hover:underline">Moonveil.gg</a> for your Redeem Code and enter it in AstrArk.',
        },
        {
          label: 'How to claim the rewards of the Lottery System',
          desc: 'Review your Draw History in 4th prize pool for Redeem Code and redeem it in AstrArk.',
        },
        {
          label: 'Is this a data-deleted Test?',
          desc: 'Yes, this is a data-deleted test. Your in-game data will be deleted after the test concludes.',
        },
        {
          label: 'How to report bugs and crashes',
          desc: `Join our official <a href="${MediaLinks.DISCORD}" target="_blank" class="text-basic-yellow hover:underline">Discord</a> community and reach out in the #support-general channel. We are still in a playtest stage and always welcome all the feedbacks from our players.`,
        },
        {
          label: 'Can I use an emulator to play?',
          desc: 'We recommend using the specified devices for better game experience. Emulators may cause lag or other issues.',
        },
      ],
    },
    {
      title: 'Feedback & Suggestions',
      desc: 'Alternatively, you can fill out a feedback form through other <a href="https://docs.google.com/forms/d/e/1FAIpQLSeG2QXW6iiN_q5vt4tw8kYJmvavlLWDgCxKc2NM61yZvm9EwQ/viewform?usp=sf_link" target="_blank" class="text-basic-yellow hover:underline">channels</a>. We appreciate feedback from all Commanders.',
      lis: [],
    },
  ];
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      classNames={{
        base: 'bg-black max-w-[40rem]',
        header: 'p-0',
        closeButton: 'z-10',
        body: 'text-[#CCCCCC] font-poppins text-base leading-[1.875rem] py-8 px-10 max-h-[37.5rem] overflow-y-auto',
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader>
              <div className="relative w-full h-16 bg-no-repeat bg-[url('/img/invite/bg_rule_head.png')] bg-contain flex items-center gap-3 px-6">
                <div className="font-semakin text-basic-yellow text-2xl">Alpha Test Guidelines</div>
              </div>
            </ModalHeader>

            <ModalBody>
              {rules.map((rule, index) => (
                <ul key={index}>
                  <li className="text-basic-yellow text-lg">
                    <b>
                      {index + 1}. {rule.title}
                    </b>
                  </li>

                  {rule.desc && <li className="indent-[1em]" dangerouslySetInnerHTML={{ __html: rule.desc }}></li>}

                  {rule.lis.map((item, ci) => (
                    <li key={ci} className="indent-[1em]">
                      <div className={cn([(item.desc || item.bold) && 'font-bold', item.indent && 'indent-[2em]'])}>
                        {item.noMark ? '' : '· '}
                        {item.label}
                      </div>
                      {item.desc && <p className="indent-[2em]" dangerouslySetInnerHTML={{ __html: item.desc }}></p>}
                    </li>
                  ))}
                </ul>
              ))}
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AlphaTestGuidelinesModal;

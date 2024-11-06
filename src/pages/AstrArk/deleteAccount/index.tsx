import AstrArkLayout from '@/components/layouts/AstrArkLayout';
import useDeleteAccount from '@/components/pages/astrark/deleteAccount/useDeleteAccount';
import { Button, cn } from '@nextui-org/react';
import dayjs from 'dayjs';
import { observer } from 'mobx-react-lite';
import { NextPage } from 'next';
import Image from 'next/image';

const DeleteAccountPage: NextPage & BasePage = () => {
  const { data, status, loading, onContinue } = useDeleteAccount();

  function onBackToGame() {
    const userAgent = navigator.userAgent;

    if (userAgent.indexOf('Firefox') != -1 || userAgent.indexOf('Chrome') != -1) {
      window.location.href = 'about:blank';
    } else if (userAgent.indexOf('Android') > -1 || userAgent.indexOf('Linux') > -1) {
      window.opener = null;
      window.open('about:blank', '_self', '')?.close();
    } else {
      window.opener = null;
      window.open('about:blank', '_self');
      window.close();
    }
  }

  return (
    <section
      className={cn([
        'relative w-screen h-screen',
        'flex flex-col justify-between items-center',
        'pt-6 pb-9',
        "bg-[url('https://d3dhz6pjw7pz9d.cloudfront.net/astrark/deleteAccount/bg.png')] bg-cover bg-center bg-no-repeat font-fzdb",
      ])}
    >
      <div className="flex-1 flex justify-center items-center">
        <div className="relative w-[78.75rem] h-[37.1875rem] pt-16 pl-[4.5rem] pr-[3.125rem] pb-[5.0625rem] flex flex-col">
          <Image
            className="object-contain"
            src="https://d3dhz6pjw7pz9d.cloudfront.net/astrark/deleteAccount/bg_card.png"
            alt=""
            fill
            sizes="100%"
            unoptimized
          />

          <div className="flex justify-between items-center relative z-0">
            <div className="font-fzsb font-semibold text-[2.5rem] text-transparent bg-clip-text bg-[linear-gradient(to_bottom,#FDEFBC_28%,#E4BA80_67.5%)] leading-[3.125rem]">
              Delete My Account
            </div>
          </div>

          <p
            className={cn([
              'relative z-0 font-poppins mt-[4.5rem] text-2xl leading-[2.75rem] flex-1 flex',
              status !== 0 && 'text-center justify-center items-center',
            ])}
          >
            {status < 1 ? (
              <>
                You can request to delete all data associated with your account here. Deleting all data means closing
                and deleting your account. After clicking [Confirm Deletion], you will have a 90-day reconsideration
                period. Your account and all its information will be permantely deleted after [
                {dayjs().add(90, 'days').format('MMMM DD, YYYY, hh:mm A Z')}]
              </>
            ) : status === 1 ? (
              <>Are you sure you want to proceed with account deletion?</>
            ) : (
              <>
                Your account will be permantely cleared of all information after [
                {data?.selfdestruct_finish_time
                  ? dayjs(data.selfdestruct_finish_time).format('MMMM DD, YYYY, hh:mm A Z')
                  : '--'}
                ]. Please note that once the account is cleared, your game progress cannot be recovered.
              </>
            )}
          </p>

          <div className="flex justify-center items-center relative z-0 mt-[3.375rem]">
            {status === 2 ? (
              <Button
                className="w-[19.375rem] h-[7.375rem] bg-[url('https://d3dhz6pjw7pz9d.cloudfront.net/astrark/deleteAccount/btn_yellow.png')] bg-contain bg-transparent bg-no-repeat text-2xl leading-none -ml-[1.375rem]"
                isLoading={loading}
                onPress={onContinue}
              >
                Cancel Deletion
              </Button>
            ) : (
              <Button
                className="w-[19.375rem] h-[7.375rem] bg-[url('https://d3dhz6pjw7pz9d.cloudfront.net/astrark/deleteAccount/btn_gray.png')] bg-contain bg-transparent bg-no-repeat text-2xl leading-none"
                isLoading={loading}
                disabled={status < 0}
                onPress={onContinue}
              >
                Confirm Deletion
              </Button>
            )}
          </div>
        </div>
      </div>

      <p>Copyright 2024 Moonveil Entertainment.</p>
    </section>
  );
};

DeleteAccountPage.getLayout = AstrArkLayout;

export default observer(DeleteAccountPage);

import { useUserContext } from '@/store/User';
import { Modal, ModalBody, ModalContent, ModalFooter, useDisclosure } from '@nextui-org/react';
import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import { FC, useEffect, useState } from 'react';
import DotSVG from 'svg/dot.svg';
import iconImg from 'img/icon/icon_success.png';
import bgImg from 'img/oauth/bg.png';
import BasicButton from '../components/common/BasicButton';
import LGButton from '../components/common/buttons/LGButton';
import { throttle } from 'lodash';
import CircularLoading from '../components/common/CircularLoading';
import { oauthAuthorization } from '@/http/services/oauth2';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { appendQueryParamsToUrl } from '@/lib/common/url';
import { OAuth2ScopeAuth } from '@/lib/models/OAuth2Scopes';

interface RouteQuery {
  client_id: string;
  client_name: string;
  icon_url: string;
  redirect_uri: string;
  response_type: string;
  state: string;
  scope: string;
  error?: string;
}

const OAuthPage: FC & BasePage = () => {
  const router = useRouter();
  const query = router.query as unknown as RouteQuery;
  const { userInfo, token, toggleLoginModal, logout } = useUserContext();
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const projectInfo = {
    title: query.client_name,
    fullTitle: `Project ${query.client_name}`,
    logo: query.icon_url,
  };

  const scopes = query.scope ? query.scope.split(' ') : [];
  const authList = scopes.map((scope) => OAuth2ScopeAuth[scope] || []).flat();
  const tipsList = [
    `After authorization, you will be redirected to ${query.redirect_uri}.`,
    "Your authorization may expire. You'll need to reauthorize to continue using these features.",
    `By authorizing, you agree to ${query.client_name} Privacy Policy and Terms of Service.`,
  ];

  const onAuth = throttle(async () => {
    setLoading(true);
    try {
      let { authorization_code, expires_at, state } = await oauthAuthorization({
        client_id: router.query.client_id as string,
        redirect_uri: router.query.redirect_uri as string,
        response_type: router.query.response_type as string,
        state: router.query.state as string,
        scope: router.query.scope as string,
      });
      if (authorization_code) {
        const landing_url = appendQueryParamsToUrl(router.query.redirect_uri as string, {
          authorization_code: authorization_code,
          expires_at: expires_at,
          state: state,
        });
        window.location.href = landing_url;
      }
    } catch (error: any) {
      toast.error(error?.message || error);
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLoading(false);
  }, 500);

  const onSwithAccount = throttle(async () => {
    setLoginLoading(true);
    await logout(true);
    onClose();
    toggleLoginModal(true);
    setLoginLoading(false);
  });

  useEffect(() => {
    if (!userInfo) return;
    onOpen();
  }, [userInfo]);

  useEffect(() => {
    if (token) return;

    toggleLoginModal(true);
  }, [token]);

  useEffect(() => {
    const errorMsg = query.error;
    if (!errorMsg) return;

    toast.error(errorMsg);
  }, [query.error]);

  return (
    <div className="w-screen h-screen relative">
      <Image className="object-cover" src={bgImg} alt="" fill sizes="100%" />

      <Modal
        placement="center"
        classNames={{
          base: 'max-w-[32rem] bg-[#070707]',
          body: 'pt-12 pb-6 flex flex-col items-center',
          footer: 'justify-between',
        }}
        hideCloseButton
        isOpen={isOpen}
        isDismissable={false}
        isKeyboardDismissDisabled
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>
                <div className="flex justify-between items-center px-20 w-full mt-7 text-xl">
                  <div className="relative w-16 h-16">
                    <div className="absolute left-1/2 -translate-x-1/2 -top-3 -translate-y-full w-max">
                      {projectInfo.title}
                    </div>

                    {projectInfo.logo && (
                      <Image className="object-cover rounded-full" src={projectInfo.logo} alt="" fill sizes="100%" />
                    )}
                  </div>

                  <DotSVG className="w-4 h-4 fill-gray-300" />

                  <div className="relative w-16 h-16">
                    <div className="absolute left-1/2 -translate-x-1/2 -top-3 -translate-y-full w-max">
                      {userInfo?.username || '--'}
                    </div>

                    <Image
                      className="object-cover rounded-full"
                      src={userInfo?.avatar_url || ''}
                      alt=""
                      fill
                      sizes="100%"
                    />
                  </div>
                </div>

                <div className="text-xl text-basic-yellow">{projectInfo.fullTitle}</div>

                <p className="text-center px-12 text-lg">
                  wants to access your moonveil.gg account {userInfo?.username}.{' '}
                  <a className="text-basic-blue hover:underline cursor-pointer" onClick={onSwithAccount}>
                    Not you?
                  </a>
                </p>

                <div className="border-1 border-basic-gray rounded-base p-4">
                  <p className="text-basic-yellow">
                    By clicking &quot;Authorize,&quot; you agree to allow the Gyoza app developers to:
                  </p>

                  <ul>
                    {authList.map((item, index) => (
                      <li key={index} className="flex mt-2">
                        <div className="relative w-6 h-6 mt-1 shrink-0">
                          <Image className="object-contain" src={iconImg} alt="" fill sizes="100%" />
                        </div>

                        <div className="ml-4 text-lg">{item}</div>
                      </li>
                    ))}
                  </ul>
                </div>

                <ul>
                  {tipsList.map((item, index) => (
                    <li key={index} className="flex mt-1">
                      <div className="w-3 h-3 rounded-full bg-[#999] shrink-0 mt-[0.375rem]"></div>

                      <div className="ml-4">{item}</div>
                    </li>
                  ))}
                </ul>
              </ModalBody>

              <ModalFooter>
                <BasicButton label="Cancel" onClick={() => window.close()} />

                <LGButton label="Authorize" actived loading={loading} onClick={onAuth} />
              </ModalFooter>

              {loginLoading && <CircularLoading />}
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

OAuthPage.noLoading = true;
OAuthPage.hideLoginCloseButton = true;

export default observer(OAuthPage);

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
import errorIcon from 'img/icon/icon_error.png';
import { formatUserName } from '@/utils/common';

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
  const title = formatName(query.client_name);
  const projectInfo = {
    title,
    fullTitle: `Project ${title}`,
    logo: query.icon_url,
  };
  let error = query.error;

  if (
    !query.redirect_uri ||
    !query.client_id ||
    !query.client_name ||
    !query.icon_url ||
    !query.response_type ||
    !query.scope ||
    !query.state
  ) {
    error = 'Invalid Authorization Flow';
  }

  function formatName(val: string) {
    val = val || '';
    if (val.length <= 8) return val;
    return `${val.substring(0, 4)}...${val.substring(val.length - 4)}`;
  }

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
        // client_id: router.query.client_id as string,
        // redirect_uri: router.query.redirect_uri as string,
        // response_type: router.query.response_type as string,
        // state: router.query.state as string,
        // scope: router.query.scope as string,
        // 此处直接透传从服务器传递过来的查询参数到请求体
        ...router.query,
      });
      if (authorization_code) {
        // 解构查询参数
        const {client_id, redirect_uri,response_type, scope, code_challenge,code_challenge_method, ...restQuery} = router.query;
        const landingURL = appendQueryParamsToUrl(redirect_uri as string, {
          ...restQuery,
          authorization_code: authorization_code,
          expires_at: expires_at
        });
        window.location.href = landingURL;
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

  function onCloseClick() {
    const url = appendQueryParamsToUrl(query.redirect_uri, {
      state: query.state,
      error: 'access_denied',
      error_description: 'The request has been denied',
    });

    window.location.href = url;
  }

  useEffect(() => {
    if (!userInfo) return;
    onOpen();
  }, [userInfo]);

  useEffect(() => {
    if (token) return;

    toggleLoginModal(true);
  }, [token]);

  return (
    <div className="w-screen h-screen relative">
      <Image className="object-cover" src={bgImg} alt="" fill sizes="100%" />

      <Modal
        placement="center"
        classNames={{
          base: error ? 'max-w-[42rem] bg-[#1c1c1c]' : 'max-w-[32rem] bg-[#070707]',
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
                {error ? (
                  <div className="px-20 pb-24 w-full mt-7 text-xl">
                    <div className="text-basic-yellow text-3xl flex items-center">
                      <Image className="w-8 h-8" src={errorIcon} alt="" width={48} height={48} />

                      <span className="font-semakin ml-4 mt-2">Error</span>
                    </div>

                    <div className="mt-8">{error}</div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center px-20 w-full mt-7 text-xl">
                      <div className="relative w-16 h-16">
                        <div className="absolute left-1/2 -translate-x-1/2 -top-3 -translate-y-full w-max">
                          {projectInfo.title}
                        </div>

                        {projectInfo.logo && (
                          <Image
                            className="object-cover rounded-full"
                            src={projectInfo.logo}
                            alt=""
                            fill
                            sizes="100%"
                          />
                        )}
                      </div>

                      <DotSVG className="w-4 h-4 fill-gray-300" />

                      <div className="relative w-16 h-16">
                        <div className="absolute left-1/2 -translate-x-1/2 -top-3 -translate-y-full w-max">
                          {formatUserName(userInfo?.username) || '--'}
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
                      wants to access your moonveil.gg account {formatUserName(userInfo?.username) || '--'}.{' '}
                      <a className="text-basic-blue hover:underline cursor-pointer" onClick={onSwithAccount}>
                        Not you?
                      </a>
                    </p>

                    <div className="border-1 border-basic-gray rounded-base p-4">
                      <p className="text-basic-yellow">
                        By clicking &quot;Authorize,&quot; you agree to allow the {title} app developers to:
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

                    <ul className="text-[#999]">
                      {tipsList.map((item, index) => (
                        <li key={index} className="flex mt-1">
                          <div className="w-3 h-3 rounded-full bg-[#999] shrink-0 mt-[0.375rem]"></div>

                          <div className="ml-4">{item}</div>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </ModalBody>

              {!error && (
                <ModalFooter>
                  <BasicButton label="Cancel" onClick={onCloseClick} />

                  <LGButton label="Authorize" actived loading={loading} onClick={onAuth} />
                </ModalFooter>
              )}

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

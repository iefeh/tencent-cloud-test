import { delay } from 'lodash';
import LGButton from './LGButton';
import { useEffect, useRef, useState } from 'react';
import useConnectDialog from '@/hooks/useConnectDialog';
import { QuestType } from '@/constant/task';
import { KEY_AUTHORIZATION_CONNECT } from '@/constant/storage';
import { toast } from 'react-toastify';
import { verifyTaskAPI } from '@/http/services/task';

interface CVInitStatus {
  connectable?: boolean;
  connected?: boolean;
  verifiable?: boolean;
  verified?: boolean;
}

interface CVOptions {
  type: QuestType;
  init?: () => CVInitStatus | undefined | Promise<CVInitStatus | undefined>;
  connect?: (args?: any) => string | undefined | Promise<string | undefined>;
  verify?: (args?: any) => undefined;
}

export function useConnectAndVerify(options: CVOptions) {
  const { type, init, connect, verify } = options || {};
  const dialogWindowRef = useRef<Window | null>(null);

  function openAuthWindow(authURL: string) {
    const dialog = window.open(
      authURL,
      'Authrization',
      'width=800,height=600,menubar=no,toolbar=no,location=no,alwayRaised=yes,depended=yes,z-look=yes',
    );
    dialogWindowRef.current = dialog;
    dialog?.addEventListener('close', () => {
      dialogWindowRef.current = null;
    });
  }

  const {
    enabled: connectable,
    checked: connected,
    loading: connectLoading,
    setEnabled: setConnectable,
    setChecked: setConnected,
    onCheck: onConnect,
  } = useCheck({
    check: async () => {
      if (!connect) return false;
      const path = await connect();
      if (!path) return false;
      openAuthWindow(path);
    },
  });

  const {
    enabled: verifiable,
    checked: verified,
    loading: verifyLoading,
    setEnabled: setVerifiable,
    setChecked: setVerified,
    onCheck: onVerify,
  } = useCheck({
    check: async () => {
      try {
        const res = await verifyTaskAPI({ quest_id: type });
        return !!res.verified;
      } catch (error) {
        return false;
      }
    },
  });

  async function initData() {
    if (!init) return;

    try {
      const initRes = await init();
      setConnectable(!!initRes?.connectable);
      setConnected(!!initRes?.connected);
      setVerifiable(!!initRes?.verifiable);
      setVerified(!!initRes?.verified);
    } catch (error) {}
  }

  initData();

  useConnectDialog(dialogWindowRef, () => {
    const tokens = localStorage.read<Dict<Dict<string>>>(KEY_AUTHORIZATION_CONNECT) || {};
    const { code, msg } = tokens[type] || {};
    const isConnected = +code === 1;
    setConnected(isConnected);
    if (isConnected) return;

    delete tokens[type];
    localStorage.save(KEY_AUTHORIZATION_CONNECT, tokens);

    toast.error(msg);
  });

  return { connectable, connected, connectLoading, verifiable, verified, verifyLoading, onConnect, onVerify };
}

interface CheckOptions {
  init?: () => CVInitStatus | undefined | Promise<CVInitStatus | undefined>;
  check?: () => boolean | undefined | Promise<boolean | undefined>;
  onChecked?: () => void;
}

export function useCheck(options?: CheckOptions) {
  const [enabled, setEnabled] = useState(true);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const { init, check, onChecked } = options || {};

  async function initData() {
    if (!init) return;

    try {
      const initRes = await init();
      setEnabled(!!initRes?.connectable);
      setChecked(!!initRes?.connected);
    } catch (error) {}
  }

  async function onCheck() {
    setLoading(true);

    if (!check) {
      delay(() => {
        setChecked(true);
        onChecked && onChecked();
        setLoading(false);
      }, 500);
      return;
    }

    try {
      const res = await check();
      setChecked(!!res);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  initData();

  return { enabled, checked, loading, setEnabled, setChecked, onCheck };
}

interface Props {
  connectTexts?: VerifyTexts;
  verifyTexts?: VerifyTexts;
}

export interface VerifyTexts {
  label: string;
  loadingLabel: string;
  finishedLabel: string;
}

interface CheckButtonProps {
  texts: VerifyTexts;
  options: CheckOptions;
}

export function CheckButton(props: CheckButtonProps) {
  const {
    texts: { label, loadingLabel, finishedLabel },
    options,
  } = props;
  const { loading, enabled, checked, onCheck } = useCheck(options);

  return (
    <LGButton
      label={loading ? loadingLabel : checked ? finishedLabel : label}
      loading={loading}
      disabled={!enabled || checked}
      onClick={onCheck}
    />
  );
}

export default function ConnectAndVerify(props: Props & CVOptions) {
  const { connectTexts, verifyTexts } = props;
  const { connectable, connected, connectLoading, verifiable, verified, verifyLoading, onConnect, onVerify } =
    useConnectAndVerify(props);

  const getButtonLabel = (texts: VerifyTexts, isLoading: boolean, isFinished: boolean) => {
    const { label, loadingLabel, finishedLabel } = texts;
    return isLoading ? loadingLabel : isFinished ? finishedLabel : label;
  };

  return (
    <div className="flex items-center">
      <LGButton
        label={getButtonLabel(
          connectTexts || { label: 'Connect', loadingLabel: 'Connecting', finishedLabel: 'Connected' },
          connectLoading,
          connected,
        )}
        loading={connectLoading}
        disabled={!connectable || connected}
        onClick={onConnect}
      />

      <LGButton
        className="ml-2"
        label={getButtonLabel(
          verifyTexts || { label: 'Verify', loadingLabel: 'Verifying', finishedLabel: 'Verified' },
          verifyLoading,
          verified,
        )}
        loading={verifyLoading}
        disabled={!connected || !verifiable || verified}
        onClick={onVerify}
      />
    </div>
  );
}

import { delay } from 'lodash';
import LGButton from './LGButton';
import { useState } from 'react';

interface CVInitStatus {
  connectable?: boolean;
  connected?: boolean;
  verifiable?: boolean;
  verified?: boolean;
}

interface CVOptions {
  init?: () => CVInitStatus | undefined | Promise<CVInitStatus | undefined>;
  connect?: () => void;
  verify?: () => void;
}

export function useConnectAndVerify(options?: CVOptions) {
  const [connectable, setConnectable] = useState(true);
  const [connected, setConnected] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const [verifiable, setVerifiable] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const { init, connect, verify } = options || {};

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

  async function onConnect() {
    setConnectLoading(true);

    if (!connect) {
      delay(() => {
        setConnected(true);
        setVerifiable(true);
        setConnectLoading(false);
      }, 500);
      return;
    }

    try {
      await connect();
      setConnected(true);
    } catch (error) {
    } finally {
      setVerifyLoading(false);
    }
  }

  async function onVerify() {
    setVerifyLoading(true);

    if (!verify) {
      delay(() => {
        setVerified(true);
        setVerifyLoading(false);
      }, 500);
      return;
    }

    try {
      await verify();
      setVerified(true);
    } catch (error) {
    } finally {
      setVerifyLoading(false);
    }
  }

  initData();

  return { connectable, connected, connectLoading, verifiable, verified, verifyLoading, onConnect, onVerify };
}

interface Props {
  connectTexts?: VerifyTexts;
  verifyTexts?: VerifyTexts;
  connectProps?: CVOptions;
  verifyProps?: CVOptions;
}

interface VerifyTexts {
  label: string;
  loadingLabel: string;
  finishedLabel: string;
}

export default function ConnectAndVerify(props: Props & CVOptions) {
  const { connectTexts, verifyTexts, connectProps, verifyProps } = props;
  const { connectable, connected, connectLoading, verifiable, verified, verifyLoading, onConnect, onVerify } =
    useConnectAndVerify(props);

  const getButtonLabel = (texts: VerifyTexts, isLoading: boolean, isEnabled: boolean, isFinished: boolean) => {
    const { label, loadingLabel, finishedLabel } = texts;
    return isLoading ? loadingLabel : isFinished ? finishedLabel : label;
  };

  return (
    <div className="flex items-center">
      <LGButton
        label={getButtonLabel(
          connectTexts || { label: 'Connect', loadingLabel: 'Connecting', finishedLabel: 'Connected' },
          connectLoading,
          connectable,
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
          verifiable,
          verified,
        )}
        loading={verifyLoading}
        disabled={!connected || !verifiable || verified}
        onClick={onVerify}
      />
    </div>
  );
}

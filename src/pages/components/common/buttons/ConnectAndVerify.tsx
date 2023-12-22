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
  const { init, connect, verify } = options || {};

  const {
    enabled: connectable,
    checked: connected,
    loading: connectLoading,
    setEnabled: setConnectable,
    setChecked: setConnected,
    onCheck: onConnect,
  } = useCheck({ check: connect });

  const {
    enabled: verifiable,
    checked: verified,
    loading: verifyLoading,
    setEnabled: setVerifiable,
    setChecked: setVerified,
    onCheck: onVerify,
  } = useCheck({ check: verify });

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

  return { connectable, connected, connectLoading, verifiable, verified, verifyLoading, onConnect, onVerify };
}

interface CheckOptions {
  init?: () => CVInitStatus | undefined | Promise<CVInitStatus | undefined>;
  check?: () => void;
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
      await check();
      setChecked(true);
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
  const { texts: { label, loadingLabel, finishedLabel }, options } = props;
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

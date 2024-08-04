declare class InformableError {
  code: string | number;
  message: string;
}

declare interface Window {
  InformableError: typeof InformableError;
}

declare interface Disclosure {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onOpenChange: (isOpen: boolean) => void;
  isControlled: boolean;
  getButtonProps: (props?: any) => any;
  getDisclosureProps: (props?: any) => any;
}

declare interface UpdateForwardRenderFunction {
  update: () => void;
}

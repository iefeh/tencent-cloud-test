import React from 'react';
import NextLink, { LinkProps } from 'next/link';

interface Props extends LinkProps {
  refEl?: React.Ref<HTMLAnchorElement>;
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
  onMouseDown?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
}

const Link: React.FC<Props> = (props) => {
  const { refEl, className, disabled, children, ...LinkProps } = props;

  const eventProps = {
    onClick: LinkProps?.onClick,
    onMouseEnter: LinkProps?.onMouseEnter,
    onTouchStart: LinkProps?.onTouchStart,
    onMouseDown: LinkProps?.onMouseDown,
  }

  const withOutLinkComp = (
    <a
      ref={refEl}
      {...eventProps}
      className={className}
    >
      {children}
    </a >
  )

  if (disabled || !props.href) {
    return withOutLinkComp
  }

  return (
    <NextLink
      ref={refEl && refEl}
      className={className}
      {...LinkProps}
    >
      {children}
    </NextLink>
  )
}

export default Link;

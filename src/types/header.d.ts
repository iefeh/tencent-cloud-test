declare interface RouteMenu {
  name: string;
  route?: string;
  children?: RouteMenu[];
  disabled?: boolean;
  icon?: StaticImageData | string;
  render?: (name: string) => JSX.Element;
}

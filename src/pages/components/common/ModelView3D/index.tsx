interface Props {
  source: string;
  texture?: string;
}

export default function ModelView3D(props: Props) {
  const { source, texture } = props;

  return <div className="inline-block w-48 h-48"></div>;
}

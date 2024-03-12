import { Kafka, Message, Producer } from 'kafkajs';

export function getKafkaProducer(): Producer {
  const broker = process.env.KAFKA_DEV_BROKER!;
  if (!broker) {
    throw new Error('Please define the KAFKA_DEV_BROKER environment variable');
  }
  const username = process.env.KAFKA_DEV_USERNAME!;
  if (!username) {
    throw new Error('Please define the KAFKA_DEV_USERNAME environment variable');
  }
  const password = process.env.KAFKA_DEV_PASSWORD!;
  if (!password) {
    throw new Error('Please define the KAFKA_DEV_PASSWORD environment variable');
  }

  const kafka = new Kafka({
    clientId: 'my-app',
    brokers: [broker], // 替换为你的MSK集群broker列表
    ssl: {
      rejectUnauthorized: true,
    },
    sasl: {
      mechanism: 'plain', // 根据你的设置，可能是'scram-sha-256'或'scram-sha-512'
      username: username,
      password: password,
    },
  });

  return kafka.producer();
}

export default getKafkaProducer;

export const KAFKA_BADGE_MSG_KEY = 'badge_check';
export const KAFKA_badge_MSG_SEP = '-_-=_+';

//发送单条消息
export async function sendBadgeCheckMessage(userId: string, metric: string) {
  const producer = getKafkaProducer();
  await producer.connect();
  const jsonStr = JSON.stringify({ userId: userId, metric: metric, timestamp: Date.now() });
  await producer.send({
    topic: 'badge-distributes',
    messages: [{ value: jsonStr }],
  });

  // 断开连接
  await producer.disconnect();
}

//发送多条消息
export async function sendBadgeCheckMessages(userId: string, metrics: { [key: string]: string | number | boolean }) {
  const producer = getKafkaProducer();
  await producer.connect();
  const msgs: Message[] = [];

  for (const [metric, value] of Object.entries(metrics)) {
    if (typeof value === 'number') {
      msgs.push({ value: JSON.stringify({ userId: userId, metric: metric, timestamp: Date.now() }) });
    }
  }

  await producer.send({
    topic: 'badge-distributes',
    messages: msgs,
  });

  // 断开连接
  await producer.disconnect();
}

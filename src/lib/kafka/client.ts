import { Kafka, Message, Producer } from 'kafkajs';
import logger from '../logger/winstonLogger';

let producer: Producer;

async function connectKafkaProducer(): Promise<Producer> {
  // 如果已经存在producer，则直接返回
  if (producer) {
    return producer;
  }
  // 创建新的producer
  const broker = process.env.KAFKA_BROKER!;
  if (!broker) {
    throw new Error('Please define the KAFKA_BROKER environment variable');
  }
  const username = process.env.KAFKA_USERNAME!;
  if (!username) {
    throw new Error('Please define the KAFKA_USERNAME environment variable');
  }
  const password = process.env.KAFKA_PASSWORD!;
  if (!password) {
    throw new Error('Please define the KAFKA_PASSWORD environment variable');
  }

  const kafka = new Kafka({
    clientId: 'my-app',
    // MSK集群broker列表
    brokers: [broker],
    ssl: true,
    sasl: {
      // 根据设置，可能是'scram-sha-256'或'scram-sha-512'
      mechanism: 'plain',
      username: username,
      password: password,
    },
  });

  producer = kafka.producer();
  await producer.connect(); 
  return producer;
}

//发送单条消息
export async function sendBadgeCheckMessage(userId: string, metric: string) {
  logger.debug("connecting to kafka producer");
  const producer = await connectKafkaProducer();
  logger.debug("sending badge check message");
  const jsonStr = JSON.stringify({ userId: userId, metric: metric, timestamp: Date.now() });
  await producer.send({
    topic: 'badge-distributes',
    messages: [{ value: jsonStr }],
  });
  logger.debug("badge check message sent");
  // 由于我们是serverless环境，不优雅的断开连接
  // await producer.disconnect();
}

//发送多条消息
export async function sendBadgeCheckMessages(userId: string, metrics: { [key: string]: string | number | boolean }) {
  logger.debug("connecting to kafka producer");
  const producer = await connectKafkaProducer();
  logger.debug("sending badge check messages");
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
  logger.debug("badge check messages sent");
  // 由于我们是serverless环境，不优雅的断开连接
  // await producer.disconnect();
}

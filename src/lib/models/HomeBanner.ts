import { Document, Schema, models } from 'mongoose';
import connectToMongoDbDev from '@/lib/mongodb/client';

// 主页banner
export interface IHomeBanner extends Document, HomePage.BannerItem {
  // Banner是否激活，不展示未激活
  active: boolean;
  // Banner排序，按升序排列 /
  order: number;
  // Banner开始的日期
  start_time: number;
  // Banner结束的日期
  end_time: number;
}

const HomeBannerSchema = new Schema<IHomeBanner>({
  name: { type: String },
  url: { type: String },
  url_target: { type: String },
  mask: { type: Number },
  source_url: { type: String },
  source_fit: { type: String },
  has_card: { type: Boolean },
  card_class: { type: String },
  title: { type: String },
  subtitle: { type: String },
  btn_label: { type: String },
  btn_url: { type: String },
  logo: { type: String },
  need_auth: { type: Boolean },
  vertical: { type: Object },
  active: { type: Boolean, default: false },
  order: { type: Number },
  start_time: { type: Number },
  end_time: { type: Number },
  extra_content: { type: String },
});

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const HomeBanner = models.HomeBanner || connection.model<IHomeBanner>('HomeBanner', HomeBannerSchema, 'home_banners');
export default HomeBanner;

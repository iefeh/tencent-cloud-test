import activeCardImg1 from 'img/nft/trifle/trifle_card_1_active.png';
import activeCardImg2 from 'img/nft/trifle/trifle_card_2_active.png';
import inactiveCardImg2 from 'img/nft/trifle/trifle_card_2_inactive.png';
import activeCardImg3 from 'img/nft/trifle/trifle_card_3_active.png';
import inactiveCardImg3 from 'img/nft/trifle/trifle_card_3_inactive.png';

export const Privileges = [
  // level i
  'Early access to future events',
  'Exclusive Benefits within the Community',
  '$MORE token airdrop privileges',
  'Guaranteed game test privileges for future games produced by Moonveil',
  'Holders can claim free BattlePass',
  'Lifetime in-game discount',
  'Special in-game props airdrop',
  // level ii
  // 'Join the private VIP Discord channel',
  // 'Early access to future events',
  // 'A certain amount of free token airdrop',
  // 'Offline event VIP hospitality rights',
  'Access to Moonveil ecosystem financialization tools',
  'Moonveil Loyalty Program privileges',
  'Future NFT privileges (discount, airdrop, and more)',
  // level iii
  'Guaranteed Beta test right of future games produced by Moonveil',
  'Holders can claim free BattlePass',
  'Lifetime ingame discount',
  'Special in-game props airdrop',
];

export const TrifleCards = [
  {
    activeImg: activeCardImg1,
    inactiveImg: activeCardImg1,
    isActive: true,
    rocketLevelText: 'Level I',
    rocketTitle: 'Destiny TETRA',
    privilegeLimitRow: 6,
  },
  {
    activeImg: activeCardImg2,
    inactiveImg: inactiveCardImg2,
    isActive: true,
    rocketLevelText: 'Level II',
    rocketTitle: 'Eternity TETRA',
    privilegeLimitRow: 9,
  },
  {
    activeImg: activeCardImg3,
    inactiveImg: inactiveCardImg3,
    isActive: false,
    rocketLevelText: 'Level III',
    rocketTitle: 'Infinity TETRA',
    privilegeLimitRow: -1,
  },
];

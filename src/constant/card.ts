import activeCardImg1 from 'img/nft/trifle/trifle_card_1_active.png';
import activeCardImg2 from 'img/nft/trifle/trifle_card_2_active.png';
import inactiveCardImg2 from 'img/nft/trifle/trifle_card_2_inactive.png';
import activeCardImg3 from 'img/nft/trifle/trifle_card_3_active.png';
import inactiveCardImg3 from 'img/nft/trifle/trifle_card_3_inactive.png';

export const Privileges = [
  // level i
  'Early access to future events',
  'Exclusive Benefits within the Community',
  'Token airdrop privileges',
  'Guaranteed game test privileges for future games produced by Moonveil',
  'Holders can claim free BattlePass',
  'Lifetime ingame discount',
  'Special in-game props airdrop',
  // level ii
  'Join the private VIP Discord channel',
  'Early access to future events',
  'A certain amount of free token airdrop',
  'Offline event VIP hospitality rights',
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
    rocketTitle: 'Destiny Tetra',
    privilegeLimitRow: 6,
  },
  {
    activeImg: activeCardImg2,
    inactiveImg: inactiveCardImg2,
    isActive: false,
    rocketLevelText: 'Level II',
    rocketTitle: 'Eternity Tetra',
    privilegeLimitRow: 10,
  },
  {
    activeImg: activeCardImg3,
    inactiveImg: inactiveCardImg3,
    isActive: false,
    rocketLevelText: 'Level III',
    rocketTitle: 'Infinity Tetra',
    privilegeLimitRow: -1,
  },
];

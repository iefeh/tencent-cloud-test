declare namespace MiniGames {
  interface GameItem {
    client_id: string;
    url: string;
    img_url: string;
    ticket: {
      remain: number;
    };
    start_time: number;
    end_time: number;
    status: string;
    client_name: string;
    icon_url: string;
  }
}

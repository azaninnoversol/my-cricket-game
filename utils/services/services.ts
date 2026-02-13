export interface UpdatedData {
  gameId: string;
  userId: string;
  yourTeam: string;
  opponentTeam: string;
  overs: number;
  target: number;
  status: "achieved" | "not-achieved" | "ongoing";
  wickets: number;
  score: number;
  thisGameId?: any;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

class GameService {
  private static BASE_URL = "/api/play-match";

  static async updateGame(updatedData: UpdatedData): Promise<ApiResponse> {
    try {
      const res = await fetch(GameService.BASE_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      const data: ApiResponse = await res.json();

      return data;
    } catch (err) {
      return { success: false, message: String(err) };
    }
  }

  static async addMatch(newData: UpdatedData): Promise<ApiResponse> {
    try {
      const res = await fetch(GameService.BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });

      const data: ApiResponse = await res.json();

      return data;
    } catch (err) {
      return { success: false, message: String(err) };
    }
  }
}

export default GameService;

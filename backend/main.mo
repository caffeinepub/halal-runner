import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Text "mo:core/Text";

actor {
  type ScoreEntry = {
    nickname : Text;
    score : Nat;
    coins : Nat;
  };

  module ScoreEntry {
    public func compareByScore(a : ScoreEntry, b : ScoreEntry) : Order.Order {
      Nat.compare(b.score, a.score);
    };
  };

  let scoreMap = Map.empty<Text, ScoreEntry>();

  public shared ({ caller }) func submitScore(nickname : Text, score : Nat, coins : Nat) : async () {
    let newEntry : ScoreEntry = {
      nickname;
      score;
      coins;
    };
    scoreMap.add(nickname, newEntry);
  };

  public query ({ caller }) func getLeaderboard(limit : Nat) : async [ScoreEntry] {
    let allScores = scoreMap.values().toArray();
    let sortedScores = allScores.sort(ScoreEntry.compareByScore);
    let safeLimit = if (limit >= Nat.max(1, sortedScores.size())) {
      sortedScores.size();
    } else {
      limit;
    };
    Array.tabulate<ScoreEntry>(safeLimit, func(i) { sortedScores[i] });
  };
};

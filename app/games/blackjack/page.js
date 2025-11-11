'use client';

import { useState, useCallback } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const createDeck = () => {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  return deck;
};

const shuffleDeck = (deck) => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

const getCardValue = (card) => {
  if (card.rank === 'A') return 11;
  if (['K', 'Q', 'J'].includes(card.rank)) return 10;
  return parseInt(card.rank);
};

const calculateHandValue = (hand) => {
  let value = 0;
  let aces = 0;

  for (const card of hand) {
    value += getCardValue(card);
    if (card.rank === 'A') aces++;
  }

  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  return value;
};

export default function BlackjackGame() {
  const { t } = useLanguage();
  const [deck, setDeck] = useState(shuffleDeck(createDeck()));
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [playerScore, setPlayerScore] = useState(0);
  const [dealerScore, setDealerScore] = useState(0);
  const [showDealerCard, setShowDealerCard] = useState(false);

  const dealCard = useCallback((currentDeck) => {
    const newDeck = [...currentDeck];
    const card = newDeck.pop();
    return { card, newDeck };
  }, []);

  const startGame = () => {
    let newDeck = shuffleDeck(createDeck());

    const { card: playerCard1, newDeck: deck1 } = dealCard(newDeck);
    const { card: dealerCard1, newDeck: deck2 } = dealCard(deck1);
    const { card: playerCard2, newDeck: deck3 } = dealCard(deck2);
    const { card: dealerCard2, newDeck: deck4 } = dealCard(deck3);

    setDeck(deck4);
    setPlayerHand([playerCard1, playerCard2]);
    setDealerHand([dealerCard1, dealerCard2]);
    setGameStarted(true);
    setGameOver(false);
    setMessage('');
    setShowDealerCard(false);

    // Check for blackjack
    const playerValue = calculateHandValue([playerCard1, playerCard2]);
    const dealerValue = calculateHandValue([dealerCard1, dealerCard2]);

    if (playerValue === 21 && dealerValue === 21) {
      setGameOver(true);
      setMessage('Push! Both have Blackjack!');
      setShowDealerCard(true);
    } else if (playerValue === 21) {
      setGameOver(true);
      setMessage('Blackjack! You Win!');
      setPlayerScore(s => s + 1);
      setShowDealerCard(true);
    } else if (dealerValue === 21) {
      setGameOver(true);
      setMessage('Dealer has Blackjack! You Lose!');
      setDealerScore(s => s + 1);
      setShowDealerCard(true);
    }
  };

  const hit = () => {
    if (gameOver) return;

    const { card, newDeck } = dealCard(deck);
    const newHand = [...playerHand, card];
    setPlayerHand(newHand);
    setDeck(newDeck);

    const value = calculateHandValue(newHand);
    if (value > 21) {
      setGameOver(true);
      setMessage('Bust! You Lose!');
      setDealerScore(s => s + 1);
      setShowDealerCard(true);
    }
  };

  const stand = () => {
    if (gameOver) return;

    setShowDealerCard(true);
    let currentDeck = [...deck];
    let currentDealerHand = [...dealerHand];

    // Dealer must hit on 16 and below
    while (calculateHandValue(currentDealerHand) < 17) {
      const { card, newDeck } = dealCard(currentDeck);
      currentDealerHand.push(card);
      currentDeck = newDeck;
    }

    setDealerHand(currentDealerHand);
    setDeck(currentDeck);

    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(currentDealerHand);

    if (dealerValue > 21) {
      setMessage('Dealer Busts! You Win!');
      setPlayerScore(s => s + 1);
    } else if (playerValue > dealerValue) {
      setMessage('You Win!');
      setPlayerScore(s => s + 1);
    } else if (playerValue < dealerValue) {
      setMessage('Dealer Wins!');
      setDealerScore(s => s + 1);
    } else {
      setMessage('Push! It\'s a tie!');
    }

    setGameOver(true);
  };

  const Card = ({ card, hidden }) => {
    const isRed = card.suit === '♥' || card.suit === '♦';

    if (hidden) {
      return (
        <div className="w-20 h-28 bg-blue-600 border-2 border-white rounded-lg flex items-center justify-center">
          <div className="text-white text-4xl">🂠</div>
        </div>
      );
    }

    return (
      <div className="w-20 h-28 bg-white border-2 border-gray-300 rounded-lg p-2 flex flex-col justify-between">
        <div className={`text-2xl font-bold ${isRed ? 'text-red-600' : 'text-black'}`}>
          {card.rank}
          <div className="text-xl">{card.suit}</div>
        </div>
        <div className={`text-2xl font-bold self-end ${isRed ? 'text-red-600' : 'text-black'}`}>
          {card.suit}
          <div className="text-xl">{card.rank}</div>
        </div>
      </div>
    );
  };

  return (
    <GameLayout gameId="blackjack">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-green-800 rounded-lg shadow-lg p-8 min-w-[600px]">
          <div className="flex justify-between items-center mb-6">
            <div className="text-white text-lg font-semibold">
              Player: <span className="text-yellow-400">{playerScore}</span>
            </div>
            <div className="text-white text-lg font-semibold">
              Dealer: <span className="text-yellow-400">{dealerScore}</span>
            </div>
          </div>

          {/* Dealer's hand */}
          <div className="mb-8">
            <div className="text-white text-lg mb-2">
              Dealer {showDealerCard && `(${calculateHandValue(dealerHand)})`}
            </div>
            <div className="flex gap-2">
              {dealerHand.map((card, i) => (
                <Card key={i} card={card} hidden={i === 1 && !showDealerCard} />
              ))}
            </div>
          </div>

          {/* Player's hand */}
          <div className="mb-6">
            <div className="text-white text-lg mb-2">
              You {gameStarted && `(${calculateHandValue(playerHand)})`}
            </div>
            <div className="flex gap-2">
              {playerHand.map((card, i) => (
                <Card key={i} card={card} />
              ))}
            </div>
          </div>

          {/* Game message */}
          {message && (
            <div className="text-center mb-4">
              <div className="text-yellow-400 text-2xl font-bold">{message}</div>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-4 justify-center">
            {!gameStarted && (
              <button
                onClick={startGame}
                className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-xl font-bold"
              >
                {t.start}
              </button>
            )}

            {gameStarted && !gameOver && (
              <>
                <button
                  onClick={hit}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  Hit
                </button>
                <button
                  onClick={stand}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold"
                >
                  Stand
                </button>
              </>
            )}

            {gameOver && (
              <button
                onClick={startGame}
                className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-xl font-bold"
              >
                New Hand
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
          <h3 className="font-bold text-lg mb-2">{t.controls}</h3>
          <p className="text-gray-700 mb-4">{t.games.blackjack.controls}</p>
          <div className="text-sm text-gray-600">
            <p>• {t.games.blackjack.description}</p>
            <p className="mt-2">• Hit: Take another card</p>
            <p>• Stand: Keep your current hand</p>
            <p>• Dealer must hit on 16 and below</p>
            <p>• Aces count as 11 or 1</p>
            <p>• Face cards count as 10</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}

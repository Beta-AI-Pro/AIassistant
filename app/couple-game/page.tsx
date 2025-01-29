"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Particles from "../components/particles"; // Import Particles component

const CoupleGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [player1, setPlayer1] = useState({ x: 100, y: 300, score: 0 });
  const [player2, setPlayer2] = useState({ x: 700, y: 300, score: 0 });
  const [hearts, setHearts] = useState<{ x: number; y: number }[]>([]);
  const [gameTime, setGameTime] = useState(60); // 60 seconds
  const [gameOver, setGameOver] = useState(false);
  const [keysPressed, setKeysPressed] = useState<{ [key: string]: boolean }>({});

  // Initialize hearts randomly
  useEffect(() => {
    const generateHearts = () => {
      const newHearts = [];
      for (let i = 0; i < 10; i++) {
        newHearts.push({
          x: Math.random() * 800,
          y: Math.random() * 600,
        });
      }
      setHearts(newHearts);
    };

    generateHearts();
  }, []);

  // Handle player movement
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setKeysPressed((prev) => ({ ...prev, [event.key]: true }));
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      setKeysPressed((prev) => ({ ...prev, [event.key]: false }));
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const speed = 5;

    const movePlayers = () => {
      if (keysPressed["w"] || keysPressed["W"]) {
        setPlayer1((prev) => ({ ...prev, y: prev.y - speed }));
      }
      if (keysPressed["s"] || keysPressed["S"]) {
        setPlayer1((prev) => ({ ...prev, y: prev.y + speed }));
      }
      if (keysPressed["a"] || keysPressed["A"]) {
        setPlayer1((prev) => ({ ...prev, x: prev.x - speed }));
      }
      if (keysPressed["d"] || keysPressed["D"]) {
        setPlayer1((prev) => ({ ...prev, x: prev.x + speed }));
      }

      if (keysPressed["ArrowUp"]) {
        setPlayer2((prev) => ({ ...prev, y: prev.y - speed }));
      }
      if (keysPressed["ArrowDown"]) {
        setPlayer2((prev) => ({ ...prev, y: prev.y + speed }));
      }
      if (keysPressed["ArrowLeft"]) {
        setPlayer2((prev) => ({ ...prev, x: prev.x - speed }));
      }
      if (keysPressed["ArrowRight"]) {
        setPlayer2((prev) => ({ ...prev, x: prev.x + speed }));
      }
    };

    const interval = setInterval(movePlayers, 100); // Move players every 100ms
    return () => clearInterval(interval);
  }, [keysPressed]);

  // Check for heart collection
  useEffect(() => {
    const checkHeartCollection = () => {
      setHearts((prevHearts) =>
        prevHearts.filter((heart) => {
          const player1Distance = Math.hypot(player1.x - heart.x, player1.y - heart.y);
          const player2Distance = Math.hypot(player2.x - heart.x, player2.y - heart.y);

          if (player1Distance < 30) {
            setPlayer1((prev) => ({ ...prev, score: prev.score + 1 }));
            return false; // Remove heart
          }
          if (player2Distance < 30) {
            setPlayer2((prev) => ({ ...prev, score: prev.score + 1 }));
            return false; // Remove heart
          }
          return true; // Keep heart
        })
      );
    };

    const interval = setInterval(checkHeartCollection, 100); // Check every 100ms
    return () => clearInterval(interval);
  }, [player1, player2]);

  // Game timer
  useEffect(() => {
    const timer = setInterval(() => {
      setGameTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    if (gameTime === 0) {
      setGameOver(true);
      clearInterval(timer);
    }

    return () => clearInterval(timer);
  }, [gameTime]);

  // Draw the game
  const drawGame = (context: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    context.fillStyle = "#FFE6E6"; // Romantic pink background
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw hearts
    hearts.forEach((heart) => {
      context.fillStyle = "#FF69B4"; // Pink hearts
      context.beginPath();
      context.arc(heart.x, heart.y, 10, 0, Math.PI * 2);
      context.fill();
    });

    // Draw Player 1 (Heart)
    context.fillStyle = "#0000FF"; // Blue
    context.beginPath();
    context.arc(player1.x, player1.y, 15, 0, Math.PI * 2);
    context.fill();

    // Draw Player 2 (Heart)
    context.fillStyle = "#FF0000"; // Red
    context.beginPath();
    context.arc(player2.x, player2.y, 15, 0, Math.PI * 2);
    context.fill();

    // Draw scores
    context.fillStyle = "#000000";
    context.font = "20px Arial";
    context.fillText(`Player 1: ${player1.score}`, 20, 30);
    context.fillText(`Player 2: ${player2.score}`, 600, 30);
    context.fillText(`Time: ${gameTime}`, 350, 30);

    // Draw game over message
    if (gameOver) {
      context.fillStyle = "#000000";
      context.font = "40px Arial";
      context.fillText("Game Over!", 300, 300);
      context.fillText(
        player1.score > player2.score
          ? "Player 1 Wins! 💖"
          : player2.score > player1.score
          ? "Player 2 Wins! 💖"
          : "It's a Tie! 💕",
        250,
        350
      );
    }
  };

  useEffect(() => {
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;

    const animate = () => {
      drawGame(context);
      requestAnimationFrame(animate);
    };

    animate();
  }, [player1, player2, hearts, gameTime, gameOver]);

  const handleRetry = () => {
    window.location.reload(); // Refresh the page to retry
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-tl from-zinc-900/0 via-zinc-900 to-zinc-900/0">
      <Particles className="absolute inset-0 -z-10" quantity={100} /> {/* Add Particles component */}
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="flex justify-center gap-4 mb-4">
          <Link href="/" className="text-sm duration-500 text-zinc-500 hover:text-zinc-300">
            ← Back
          </Link>
          {gameOver && (
            <button
              onClick={handleRetry}
              className="text-sm duration-500 text-zinc-500 hover:text-zinc-300"
            >
              Retry
            </button>
          )}
        </div>
        <div className="flex flex-col items-center mt-4 w-full px-4">
          <p className="text-sm text-zinc-500">
            Player 1: Use WASD to move.
          </p>
          <p className="text-sm text-zinc-500">
            Player 2: Use Arrow Keys to move.
          </p>
        </div>
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border border-gray-700 rounded-lg shadow-lg bg-gray-800 mx-auto mt-4"
        />
      </div>
    </div>
  );
};

export default CoupleGame;
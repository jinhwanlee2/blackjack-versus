import QH from './cards/Q-H.png'
import QS from './cards/Q-S.png'
import QD from './cards/Q-D.png'
import QC from './cards/Q-C.png'
import KH from './cards/K-H.png'
import KS from './cards/K-S.png'
import KD from './cards/K-D.png'
import KC from './cards/K-C.png'
import JH from './cards/J-H.png'
import JS from './cards/J-S.png'
import JD from './cards/J-D.png'
import JC from './cards/J-C.png'
import AH from './cards/A-H.png'
import AS from './cards/A-S.png'
import AD from './cards/A-D.png'
import AC from './cards/A-C.png'
import H2 from './cards/2-H.png'
import S2 from './cards/2-S.png'
import D2 from './cards/2-D.png'
import C2 from './cards/2-C.png'
import H3 from './cards/3-H.png'
import S3 from './cards/3-S.png'
import D3 from './cards/3-D.png'
import C3 from './cards/3-C.png'
import H4 from './cards/4-H.png'
import S4 from './cards/4-S.png'
import D4 from './cards/4-D.png'
import C4 from './cards/4-C.png'
import H5 from './cards/5-H.png'
import S5 from './cards/5-S.png'
import D5 from './cards/5-D.png'
import C5 from './cards/5-C.png'
import H6 from './cards/6-H.png'
import S6 from './cards/6-S.png'
import D6 from './cards/6-D.png'
import C6 from './cards/6-C.png'
import H7 from './cards/7-H.png'
import S7 from './cards/7-S.png'
import D7 from './cards/7-D.png'
import C7 from './cards/7-C.png'
import H8 from './cards/8-H.png'
import S8 from './cards/8-S.png'
import D8 from './cards/8-D.png'
import C8 from './cards/8-C.png'
import H9 from './cards/9-H.png'
import S9 from './cards/9-S.png'
import D9 from './cards/9-D.png'
import C9 from './cards/9-C.png'
import H10 from './cards/10-H.png'
import S10 from './cards/10-S.png'
import D10 from './cards/10-D.png'
import C10 from './cards/10-C.png'


import './blackjack.css';
import React, { useEffect, useState } from 'react';

var dealerSum = 0;
var yourSum = 0;

var dealerAceCount = 0;
var yourAceCount = 0; 

var hidden;
var deck;

var canHit = true; 

export function cardToSrc(val) {
  switch(val){
    case 'Q-H':
      return QH;
    case 'Q-S':
      return QS;
    case 'Q-D':
      return QD;
    case 'Q-C':
      return QC;
    case 'K-H':
      return KH;
    case 'K-S':
      return KS;
    case 'K-D':
      return KD;
    case 'K-C':
      return KC;
    case 'J-H':
      return JH;
    case 'J-S':
      return JS;
    case 'J-D':
      return JD;
    case 'J-C':
      return JC;
    case 'A-H':
      return AH;
    case 'A-S':
      return AS;
    case 'A-D':
      return AD;
    case 'A-C':
      return AC;
    case '2-H':
      return H2;
    case '2-S':
      return S2;
    case '2-D':
      return D2;
    case '2-C':
      return C2;
    case '3-H':
      return H3;
    case '3-S':
      return S3;
    case '3-D':
      return D3;
    case '3-C':
      return C3;
    case '4-H':
      return H4;
    case '4-S':
      return S4;
    case '4-D':
      return D4;
    case '4-C':
      return C4;
    case '5-H':
      return H5;
    case '5-S':
      return S5;
    case '5-D':
      return D5;
    case '5-C':
      return C5;
    case '6-H':
      return H6;
    case '6-S':
      return S6;
    case '6-D':
      return D6;
    case '6-C':
      return C6;
    case '7-H':
      return H7;
    case '7-S':
      return S7;
    case '7-D':
      return D7;
    case '7-C':
      return C7;
    case '8-H':
      return H8;
    case '8-S':
      return S8;
    case '8-D':
      return D8;
    case '8-C':
      return C8;
    case '9-H':
      return H9;
    case '9-S':
      return S9;
    case '9-D':
      return D9;
    case '9-C':
      return C9;
    case '10-H':
      return H10;
    case '10-S':
      return S10;
    case '10-D':
      return D10;
    case '10-C':
      return C10;
    default:
      return;
  }
}

export function buildDeck() {
  let value = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
  let suit = ["H", "C", "D", "S"];
  deck = [];

  for (let i = 0; i < suit.length; i++) {
    for (let j = 0; j < value.length; j++) {
      deck.push(value[j] + "-" + suit[i]);
    }
  }
}

export function shuffleDeck() {
  for (let i = 0; i < deck.length; i++) {
    let j = Math.floor(Math.random() * deck.length); 
    let temp = deck[i];
    deck[i] = deck[j];
    deck[j] = temp;
  }
  console.log(deck);
}

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function startGame() {
  hidden = deck.pop();
  dealerSum += getValue(hidden);
  dealerAceCount += checkAce(hidden);

  let cardImg = document.createElement("img");
  let card = deck.pop();
  await delay(700);
  cardImg.src = cardToSrc(card);
  cardImg.classList.add("slide-in");
  dealerSum += getValue(card);
  dealerAceCount += checkAce(card);
  document.getElementById("dealer-cards").append(cardImg);
  document.getElementById("dealer-sum").innerText = getValue(card);


  for (let i = 0; i < 2; i++) {
      await delay(700);
      let cardImg = document.createElement("img");
      let card = deck.pop();
      cardImg.src = cardToSrc(card);
      cardImg.classList.add("slide-in");
      yourSum += getValue(card);
      yourAceCount += checkAce(card);

      if (yourSum > 21) {
        reduceAce(yourSum, yourAceCount);
      }
      document.getElementById("your-cards").append(cardImg);
  
  }


  document.getElementById("your-sum").innerText = yourSum;

  document.getElementById("hit").addEventListener("click", hit);
  document.getElementById("stand").addEventListener("click", stand);
}

export function getValue(card) {
  let data = card.split("-"); // "4-C" -> ["4", "C"]
  let value = data[0];

  if (isNaN(value)) { //A J Q K
    if (value === "A") {
      return 11;
    }
    return 10;
  }
  return parseInt(value);
}

export function checkAce(card) {
  if (card[0] === "A") {
    return 1;
  }
  return 0;
}

export function reduceAce(playerSum, playerAceCount) {
  while (playerSum > 21 && playerAceCount > 0) {
    playerSum -= 10;
    playerAceCount -= 1;
  }
  return playerSum;
}

export async function hit() {
  if (!canHit) {
    return;
  }
  await delay(300);
  let cardImg = document.createElement("img");
  let card = deck.pop();
  cardImg.src = cardToSrc(card);
  cardImg.classList.add("slide-in");
  yourSum += getValue(card);
  yourAceCount += checkAce(card);
  document.getElementById("your-cards").append(cardImg);

  if (yourSum > 21 && yourAceCount > 0){
    document.getElementById("your-sum").innerText = reduceAce(yourSum, yourAceCount);
  }
  else{
    document.getElementById("your-sum").innerText = yourSum;
  }

  if (reduceAce(yourSum, yourAceCount) >= 21) { 
    stand();
  }
}

export async function stand() {
  dealerSum = reduceAce(dealerSum, dealerAceCount);
  yourSum = reduceAce(yourSum, yourAceCount);

  canHit = false;
  await delay(300);
  document.getElementById("hidden").src = cardToSrc(hidden);
  document.getElementById("dealer-sum").innerText = dealerSum;

  while (reduceAce(dealerSum, dealerAceCount) < 17) {
    await delay(800);
    let cardImg = document.createElement("img");
    let card = deck.pop();
    cardImg.src = cardToSrc(card);
    cardImg.classList.add("slide-in");
    dealerSum += getValue(card);
    dealerAceCount += checkAce(card);
    document.getElementById("dealer-cards").append(cardImg);
    document.getElementById("dealer-sum").innerText = dealerSum;
  }

  let message = "";
  if (yourSum > 21) {
      message = "You Lose";
  }
  else if (dealerSum > 21) {
      message = "You win";
  }
  //both you and dealer <= 21
  else if (yourSum === dealerSum) {
      message = "Tie";
  }
  else if (yourSum > dealerSum) {
      message = "You Win";
  }
  else if (yourSum < dealerSum) {
      message = "You Lose";
  }

  document.getElementById("dealer-sum").innerText = dealerSum;
  document.getElementById("your-sum").innerText = yourSum;
  document.getElementById("results").innerText = message;
}
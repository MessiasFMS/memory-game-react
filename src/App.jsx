import { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Button,
  DialogTitle
} from "@material-ui/core";
import Card from "./card";
import "./app.scss";


const uniqueElementsArray = [
  {
    type: "Pikachu",
    image: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/025.png"
  },
  {
    type: "ButterFree",
    image: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/012.png"
  },
  {
    type: "Charmander",
    image: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/004.png"
  },
  {
    type: "Squirtle",
    image: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/007.png"
  },
  {
    type: "Pidgetto",
    image: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/017.png"
  },
  {
    type: "Bulbasaur",
    image: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/001.png"
  }
];

function shuffleCards(array) {
  const length = array.length;
  for (let i = length; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * i);
    const currentIndex = i - 1;
    const temp = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temp;
  }
  return array;
}
export default function App() {
  const [cards, setCards] = useState(
    shuffleCards.bind(null, uniqueElementsArray.concat(uniqueElementsArray))
  );
  const [openCards, setOpenCards] = useState([]);
  const [clearedCards, setClearedCards] = useState({});
  const [shouldDisableAllCards, setShouldDisableAllCards] = useState(false);
  const [moves, setMoves] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [bestScore, setBestScore] = useState(
    JSON.parse(localStorage.getItem("bestScore")) || Number.POSITIVE_INFINITY
  );
  const timeout = useRef(null);

  const disable = () => {
    setShouldDisableAllCards(true);
  };
  const enable = () => {
    setShouldDisableAllCards(false);
  };

  const checkCompletion = () => {
    if (Object.keys(clearedCards).length === uniqueElementsArray.length) {
      setShowModal(true);
      const highScore = Math.min(moves, bestScore);
      setBestScore(highScore);
      localStorage.setItem("bestScore", highScore);
    }
  };
  const evaluate = () => {
    const [first, second] = openCards;
    enable();
    if (cards[first].type === cards[second].type) {
      setClearedCards((prev) => ({ ...prev, [cards[first].type]: true }));
      setOpenCards([]);
      return;
    }
    // This is to flip the cards back after 500ms duration
    timeout.current = setTimeout(() => {
      setOpenCards([]);
    }, 500);
  };
  const handleCardClick = (index) => {
    if (openCards.length === 1) {
      setOpenCards((prev) => [...prev, index]);
      setMoves((moves) => moves + 1);
      disable();
    } else {
      clearTimeout(timeout.current);
      setOpenCards([index]);
    }
  };

  useEffect(() => {
    let timeout = null;
    if (openCards.length === 2) {
      timeout = setTimeout(evaluate, 300);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [openCards]);

  useEffect(() => {
    checkCompletion();
  }, [clearedCards]);
  const checkIsFlipped = (index) => {
    return openCards.includes(index);
  };

  const checkIsInactive = (card) => {
    return Boolean(clearedCards[card.type]);
  };

  const handleRestart = () => {
    setClearedCards({});
    setOpenCards([]);
    setShowModal(false);
    setMoves(0);
    setShouldDisableAllCards(false);
    // set a shuffled deck of cards
    setCards(shuffleCards(uniqueElementsArray.concat(uniqueElementsArray)));
  };

  return (
    <div className="App">
      <header>
        <h3>Clique em uma carta para iniciar o game</h3>
        <div>
        Selecione duas cartas com o mesmo conteúdo consequentemente para fazê-las desaparecer
        </div>
      </header>
      <div className="container">
        {cards.map((card, index) => {
          return (
            <Card
              key={index}
              card={card}
              index={index}
              isDisabled={shouldDisableAllCards}
              isInactive={checkIsInactive(card)}
              isFlipped={checkIsFlipped(index)}
              onClick={handleCardClick}
            />
          );
        })}
      </div>
      <footer>
        <div className="score">
          <div className="moves">
            <span className="bold">Movimentos:</span> {moves}
          </div>
          {localStorage.getItem("bestScore") && (
            <div className="high-score">
              <span className="bold">Melhor pontuação:</span> {bestScore}
            </div>
          )}
        </div>
        <div className="restart">
          <Button onClick={handleRestart} color="primary" variant="contained">
            Reiniciar
          </Button>
        </div>
      </footer>
      <Dialog
        open={showModal}
        disableBackdropClick
        disableEscapeKeyDown
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Hurray!!! Você completou o desafio
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Você comepletou o game com {moves} movimentos. Sua melhor pontuação até agora é {" "}
            {bestScore} movimentos.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRestart} color="primary">
            Reiniciar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
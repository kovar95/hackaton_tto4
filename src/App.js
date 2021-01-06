import './App.scss';
import { useState, useEffect } from 'react';
import { Button, Alert } from 'reactstrap';
import { Circle, Iks } from './icons';
import {
  winningCombinations,
  fields,
  findPossibleCombinations,
  updateTempTable
} from './helpers/combinationsHelper';

const App = () => {
  //Setuju se state-ovi
  const [gameFields, setFields] = useState([]);
  const [playerFileds, setPlayerFileds] = useState([]);
  const [computerFields, setComputerFields] = useState([]);
  const [compWinCombs, setCompWinCombs] = useState([]);
  const [playerWinCombs, setPlayerWinCombs] = useState([]);
  const [winner, setWinner] = useState(0);
  const [message, setMessage] = useState('');
  const [start, setStart] = useState(true);
  const [end, setEnd] = useState();

  //Setuju se inicijalna stanja prilikom renderovanja komponente
  useEffect(() => {
    setFields([...fields]);
    setCompWinCombs(winningCombinations);
    setPlayerWinCombs(winningCombinations);
    setPlayerFileds([]);
    setComputerFields([]);
    setEnd(false);
  }, [end]);

  //pokretanje igre
  const startGame = () => {
    chooseRandPlayer();
    setStart(false);
  };

  //restartovanje igre nakon zavrsetka partije
  const restart = () => {
    setWinner(0);
    emptyBoard();
    chooseRandPlayer();
    setEnd(true);
  };

  //Generise random igraca
  const chooseRandPlayer = () => {
    let player = Math.round(Math.random());
    if (player === 0) {
      showMessage('You play first!');
    } else {
      showMessage('Computer plays first!');
      computerFirstMove();
    }
  };

  //Ocisti tablu
  const emptyBoard = () => {
    let emptyFields = gameFields.map((f) => {
      f.owner = 0;
      return f;
    });
    setFields(emptyFields);
  };

  //Smanji mogucnost pobede kada protivnik odigra potez
  const reduceWinCombinations = (coord, winCombs) => {
    let newWinCombs = winCombs.filter(
      (comb) =>
        !comb.combination.some((el) => el.x === coord.x && el.y === coord.y)
    );

    return newWinCombs;
  };

  //update table
  const updateTable = (selectedField, owner) => {
    let tempBoard = gameFields.filter((f) => {
      if (f.filed.x === selectedField.x && f.filed.y === selectedField.y) {
        f.owner = owner;
      }
      return f;
    });
    return tempBoard;
  }

  //prvi potez kompjutera kada je na potezu
  const computerFirstMove = () => {
    //izabere random polje i update izabranog polja
    let choosenField =
      fields[Math.round(Math.random() * (fields.length - 1))].filed;

    let newComputerFields = [...computerFields, choosenField];
    let newPlayerFields = [...playerFileds];
    setComputerFields(newComputerFields);
    setPlayerFileds(newPlayerFields);

    //redukuje playerova moguca polja za pobedu
    let reducedPlayerWinCombinations = reduceWinCombinations(
      choosenField,
      playerWinCombs
    );
    setPlayerWinCombs(reducedPlayerWinCombinations);

    let tempFields = updateTable(choosenField, 2)
    setFields(tempFields);
  };

  const selectField = (coord) => {
    //doda izabrano polje za igraca
    let newPlayerFields = [...playerFileds, coord];
    let newComputerFields = [...computerFields];

    //setuje igraceva polja jer je dodao jos jedno
    setPlayerFileds(newPlayerFields);

    //redukuje kompjuterova moguca polja za pobedu
    let reducedCompWinCombinations = reduceWinCombinations(coord, compWinCombs);
    setCompWinCombs(reducedCompWinCombinations);

    let tempFields = updateTable(coord, 1)
    setFields(tempFields);

    //pretpostavalja koju kombinaciju bi player trebao da sledi
    let playerCombinations = findPossibleCombinations(
      newPlayerFields,
      playerWinCombs
    );

    //pronalazi najbolju soluciju za kompjuter da pobedi
    let computerCombinations = findPossibleCombinations(
      newComputerFields,
      reducedCompWinCombinations
    );

    //proverava da li je igrac pobednik
    if (playerCombinations.movesToWin === 0) {
      setWinner('Player ');
      return;
    }

    //da li da se brani ili da napada
    if (
      newComputerFields.length !== 0 &&
      computerCombinations &&
      playerCombinations
    ) {
      if (computerCombinations.movesToWin <= playerCombinations.movesToWin) {
        //Trebao bi da napadne

        //nadji polja iz kombinacije koju pretpostavljamo da ce igrati kompjuter a da nisu vec zauzeta
        let compFields = winningCombinations[
          computerCombinations.id
        ].combination.filter(
          (c) =>
            !computerCombinations.com.some(
              (ownedFiled) => ownedFiled.x === c.x && ownedFiled.y === c.y
            )
        );

        //uzmem prvo od nadjenih polja
        newComputerFields.push(compFields[compFields.length - 1]);
        setComputerFields(newComputerFields);

        //setuje ponovo tablu
        let myField = {
          x: compFields[compFields.length - 1].x,
          y:compFields[compFields.length - 1].y
        }
        let newTempFields = updateTempTable(tempFields, myField, 2)

        //nove kombinacije za igraca koje mogu voditi do pobede
        let reducedPlayerWinCombinations = reduceWinCombinations(
          compFields[compFields.length - 1],
          playerWinCombs
        );
        setPlayerWinCombs(reducedPlayerWinCombinations);

        //update tabele
        setFields(newTempFields);

        let endComputerCombinations = findPossibleCombinations(
          newComputerFields,
          reducedCompWinCombinations
        );

        //proverava da li je kompjuter pobednik
        if (endComputerCombinations.movesToWin === 0) {
          setWinner('Computer ');
        }
      } else {
        //Trebao bi da se brani

        //nadji polja iz kombinacije koju pretpostavljamo da ce igrati igrac a da nisu vec zauzeta
        let myFields = winningCombinations[
          playerCombinations.id
        ].combination.filter(
          (c) =>
            !playerCombinations.com.some(
              (ownedFiled) => ownedFiled.x === c.x && ownedFiled.y === c.y
            )
        );

        //uzmem prvo od nadjenih polja
        setComputerFields([
          ...computerFields,
          myFields[Math.round((myFields.length - 1) / 2)],
        ]);

        //setuje ponovo tablu
         let myField = {
          x: myFields[Math.round((myFields.length - 1) / 2)].x,
          y: myFields[Math.round((myFields.length - 1) / 2)].y
        }
        let newTempFields = updateTempTable(tempFields, myField, 2)

        //nove kombinacije za igraca koje mogu voditi do pobede
        let reducedPlayerWinCombinations = reduceWinCombinations(
          myFields[Math.round((myFields.length - 1) / 2)],
          playerWinCombs
        );
        setPlayerWinCombs(reducedPlayerWinCombinations);

        //update tabele
        setFields(newTempFields);
      }
    } else {
      //nadji polja iz kombinacije koju pretpostavljamo da ce igrati igrac a da nisu vec zauzeta
      let myFields = winningCombinations[
        playerCombinations.id
      ].combination.filter(
        (c) =>
          !playerCombinations.com.some(
            (ownedFiled) => ownedFiled.x === c.x && ownedFiled.y === c.y
          )
      );

      //uzmem prvo od nadjenih polja
      setComputerFields([
        ...computerFields,
        myFields[Math.round((myFields.length - 1) / 2)],
      ]);

      //setuje ponovo tablu
       let myField = {
        x:  myFields[Math.round((myFields.length - 1) / 2)].x,
        y: myFields[Math.round((myFields.length - 1) / 2)].y
      }
      let newTempFields = updateTempTable(tempFields, myField, 2);

      //nove kombinacije za igraca koje mogu voditi do pobede
      setPlayerWinCombs(
        reduceWinCombinations(
          myFields[Math.round((myFields.length - 1) / 2)],
          playerWinCombs
        )
      );

      //update tabele
      setFields(newTempFields);
    }

    //proverava da li je nereseno
    if (compWinCombs.length === 0 && playerWinCombs.length === 0) {
      showMessage("It's tie!");
      setWinner('Tie');
    }
  };

  //prikaz poruke
  const showMessage = (message) => {
    setMessage(message);
    setTimeout(() => {
      setMessage('');
    }, 1300);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Tic Tac Toe 4x4</h1>
        <div className="board">
          {gameFields.map((gf,i) => (
            <div
              onClick={() =>
                !start &&
                !message &&
                !winner &&
                gf.owner === 0 &&
                selectField(gf.filed)
              }
              className="field"
              key={i}
            >
              {gf.owner === 1 && <Iks />}
              {gf.owner === 2 && <Circle />}
            </div>
          ))}
        </div>

        <div style={{ maxHeight: '65px', fontSize: '18px' }}>
          {winner !== 0 && winner !== 'Tie' && (
            <Alert color="primary">
              {winner}
              is winner!
            </Alert>
          )}
          {message && <Alert color="info">{message}</Alert>}
        </div>
        {winner !== 0 && (
          <Button outline color="warning" onClick={() => restart()}>
            Restart
          </Button>
        )}

        {start && (
          <Button outline color="warning" onClick={() => startGame()}>
            Start
          </Button>
        )}
      </header>
    </div>
  );
};

export default App;

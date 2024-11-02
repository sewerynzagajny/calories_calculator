import { useState } from "react";

const units = [
  { id: 0, unit: "g" },
  { id: 1, unit: "kg" },
  { id: 2, unit: "ml" },
  { id: 3, unit: "l" },
];

const genderAge = [
  { id: 0, gneder: "Mężczyzna" },
  { id: 1, gneder: "Kobieta" },
  { id: 2, gneder: "Dziecko" },
];

function Button({ style, onClick, children }) {
  return (
    <button style={style} onClick={onClick} className="button">
      {children}
    </button>
  );
}

export default function App() {
  const [foodItems, setFoodItems] = useState([]);

  function handleAddItems(foodItem) {
    setFoodItems((foodItems) => [...foodItems, foodItem]);
  }
  return (
    <div className="app">
      <Headline />
      <AddItemForm />
      <Footer />
    </div>
  );
}

function Headline() {
  return (
    <>
      <h1 className="headline">Szacuj Kalorie!</h1>
    </>
  );
}

function AddItemForm() {
  const [food, setFood] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [who, setWho] = useState("");

  return (
    <form className="add_item">
      <input
        id="input-food"
        className="add_item__food"
        type="text"
        placeholder="Danie lub składnik"
        value={food}
        onChange={(e) => setFood(e.target.value)}
      />
      <div className="add_item__container">
        <input
          id="input-quantity"
          className="add_item__container--quantity"
          type="number"
          placeholder="Ilość"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <label
          className="add_item__container--label"
          htmlFor="item-select-unit"
        >
          Wybierz jednostkę:
        </label>
        <select
          id="item-select-unit"
          className="add_item__container--select-unit"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        >
          {units.map((el) => (
            <option value={el.unit} key={el.id}>
              {el.unit}
            </option>
          ))}
        </select>
        <select
          id="item-select-who"
          className="add_item__container--select-who"
          value={who}
          onChange={(e) => setWho(e.target.value)}
        >
          {genderAge.map((el) => (
            <option value={el.gneder} key={el.id}>
              {el.gneder}
            </option>
          ))}
        </select>
      </div>
      <Button style={{ width: "12%" }}>Dodaj</Button>
    </form>
  );
}

function Footer() {
  return (
    <footer>
      <p className="copyright">
        Copyright &copy; <span>{new Date().getFullYear()}</span> by Seweryn
        Zagajny. <br />
        All rights reserved.
      </p>
    </footer>
  );
}

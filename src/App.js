import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";

const units = [
  { id: 0, unit: "g" },
  { id: 1, unit: "kg" },
  { id: 2, unit: "ml" },
  { id: 3, unit: "l" },
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
  const [selectedItemId, setSelectedItemId] = useState(null);

  function handleAddItems(foodItem) {
    setFoodItems((foodItems) => [...foodItems, foodItem]);
    console.log(foodItems);
  }

  function handleDeleteItem(id) {
    setFoodItems((foodItems) => foodItems.filter((item) => item.id !== id));
  }

  function handleEditItem(id, newFoodItem) {}

  function handleSelectedItem(id) {
    setSelectedItemId((cur) => (cur === id ? null : id));
  }

  return (
    <div className="app">
      <Headline />
      <AddItemForm onAddItems={handleAddItems} />
      <FoodItemsList
        foodItems={foodItems}
        selectedItemId={selectedItemId}
        onSelectedItem={handleSelectedItem}
        onEditItem={handleEditItem}
        onDeleteItem={handleDeleteItem}
      />
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

function AddItemForm({ onAddItems }) {
  const [food, setFood] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState(`${units[0].unit}`);
  const inputRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    if (!food) return;

    const id = crypto.randomUUID();
    const newFoodItem = { id, food, quantity, unit };
    // ;
    setFood("");
    setQuantity("");
    setUnit("g");
    onAddItems(newFoodItem);
    console.log(newFoodItem);
  }

  function handleKeyDown(e) {
    const charCode = e.keyCode || e.which;
    if (
      (charCode >= 48 && charCode <= 57) ||
      (charCode >= 96 && charCode <= 105)
    ) {
      e.preventDefault();
      alert("Wipisz ilość w innym polu!");
      inputRef.current.blur();
    }
  }

  function handleQuantity(e) {
    const value = e.target.value;
    if (value > 0) {
      setQuantity(value);
    } else {
      setQuantity("");
    }
  }

  return (
    <form className="add_item" onSubmit={handleSubmit}>
      <input
        id="input-food"
        className="add_item__food"
        type="text"
        placeholder="Danie lub składnik"
        value={food}
        onChange={(e) => setFood(e.target.value)}
        onKeyDown={handleKeyDown}
        ref={inputRef}
      />
      <div className="add_item__container">
        <input
          id="input-quantity"
          className="add_item__container--quantity"
          type="number"
          placeholder="Ilość"
          value={quantity}
          onChange={handleQuantity}
        />
        <label
          className="add_item__container--label"
          htmlFor="item-select-unit"
        >
          Wybierz jednostkę:
        </label>
        <select
          id="item-select-unit"
          className="add_item__container--unit"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        >
          {units.map((el) => (
            <option value={el.unit} key={el.id}>
              {el.unit}
            </option>
          ))}
        </select>

        <Button style={{ width: "10%" }}>Dodaj</Button>
      </div>
    </form>
  );
}

function FoodItemsList({
  foodItems,
  selectedItemId,
  onSelectedItem,
  onEditItem,
  onDeleteItem,
}) {
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    foodItems.length
      ? setShowButtons(true)
      : setTimeout(() => setShowButtons(false), 250);
  }, [foodItems.length]);

  return (
    <div className="food-items">
      <div className="food-items__food-list">
        <ol>
          {foodItems.map((foodItem) => (
            <FoodItem
              foodItem={foodItem}
              key={foodItem.id}
              selectedItemId={selectedItemId}
              onSelectedItem={onSelectedItem}
              onEdit={onEditItem}
              onDelete={onDeleteItem}
            />
          ))}
        </ol>
      </div>
      {showButtons && (
        <div
          className={`food-items__action ${
            !foodItems.length ? "move-out" : ""
          }`}
        >
          <Button
            style={{
              animation: "moveInBotton 0.5s backwards ease-in-out 0.5s",
            }}
          >
            Szacuj!
          </Button>
          <Button
            style={{
              animation: "moveInBotton 0.5s backwards ease-in-out 0.5s",
            }}
          >
            Usuń listę
          </Button>
        </div>
      )}
    </div>
  );
}

function FoodItem({
  foodItem,
  selectedItemId,
  onSelectedItem,
  onEdit,
  onDelete,
}) {
  const isSelected = selectedItemId === foodItem.id;
  const elementRef = useRef(null);

  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.classList.add("animated");
    }
  }, []);

  return (
    <li
      ref={elementRef}
      className="food-item"
      onClick={() => onSelectedItem(foodItem.id)}
    >
      {foodItem.quantity.length ? (
        <>
          {foodItem.food}:
          <span className="food-item__quantity">
            {" "}
            {foodItem.quantity} <span className="food-item__unit"></span>
            {foodItem.unit}
          </span>
        </>
      ) : (
        <span>{foodItem.food}</span>
      )}

      {isSelected && (
        <div className="food-item__btn">
          <button onClick={() => onEdit(foodItem.id)}>Edytuj</button>
          <button onClick={() => onDelete(foodItem.id)}>Usuń</button>
        </div>
      )}
    </li>
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

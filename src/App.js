import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";

const units = [
  { id: 0, unit: "g" },
  { id: 1, unit: "kg" },
  { id: 2, unit: "ml" },
  { id: 3, unit: "l" },
];

function Button({ type, style, onClick, children }) {
  return (
    <button type={type} style={style} onClick={onClick} className="button">
      {children}
    </button>
  );
}

export default function App() {
  const [foodItems, setFoodItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [showButtons, setShowButtons] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [popupVisible, setPopupVisible] = useState(false);

  const [food, setFood] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState(`${units[0].unit}`);
  const inputRef = useRef(null);

  const [itemToEdit, setItemToEdit] = useState(null);
  const [originalItem, setOriginalItem] = useState(null);

  const [isCheck, setIsCheck] = useState(false);
  const [containerHeight, setContainerHeight] = useState("auto");

  // const [kcalItems, setKcalItems] = useState([]);

  const container = document.querySelector(".food-items__food-list");

  const kcalItems = [
    {
      id: 0,
      food: "Kotlet schabowy: 200 g, ziemniaki gotowane: 180 g, buraczki zasmażane z cebulą: 90 g",
      kcal: 570,
      fat: 23,
      carbohydrates: 52,
      protein: 13,
    },
    // { id: 1, food: "Mleko", kcal: 42, fat: 1, carbs: 5, protein: 3 },
    // { id: 2, food: "Chleb", kcal: 250, fat: 1, carbs: 5, protein: 3 },
  ];

  function handleAddItems(foodItem) {
    setFoodItems((foodItems) => [...foodItems, foodItem]);
    console.log(foodItems);
  }

  function handleUpdateItem(updatedItem) {
    setFoodItems((foodItems) =>
      foodItems.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    console.log(foodItems);
  }

  function handleDeleteItem(id) {
    setFoodItems((foodItems) => foodItems.filter((item) => item.id !== id));
    setSelectedItemId(null);
    if (foodItems.length === 1) {
      setContainerHeight(container.offsetHeight + "px");
      setTimeout(() => {
        setContainerHeight("auto");
      }, 270);
    }
  }

  function handleEditItem(id, e) {
    const item = foodItems.find((item) => item.id === id);
    setItemToEdit(item);
    setCursorPosition({ x: 0, y: e.clientY });
    setPopupVisible(true);
    setOriginalItem({ ...item });
  }

  function handleSelectedItem(id) {
    setSelectedItemId((cur) => (cur === id ? null : id));
  }

  function handleClearList() {
    const confirmed = window.confirm(
      "Czy na pewno chcesz usunąć listę składników?"
    );
    if (confirmed) {
      setContainerHeight(container.offsetHeight + "px");
      setFoodItems([]);
      setTimeout(() => {
        setContainerHeight("auto");
      }, 270);
    }
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

  const handleClick = () => {
    const input = inputRef.current;
    if (input) {
      const length = input.value.length;
      input.setSelectionRange(length, length);
      input.scrollLeft = input.scrollWidth;
    }
    setTimeout(() => {
      setIsCheck(true);
    }, 1);
  };

  const handleFocus = () => {
    setIsCheck(false);
  };

  useEffect(() => {
    const storedFoodItems = localStorage.getItem("foodItems");
    if (storedFoodItems) {
      setFoodItems(JSON.parse(storedFoodItems));
      setShowButtons(true);
    }
    setDataLoaded(true);
  }, []);

  useEffect(() => {
    if (dataLoaded) {
      if (foodItems.length > 0) {
        localStorage.setItem("foodItems", JSON.stringify(foodItems));
        setShowButtons(true);
      } else {
        localStorage.removeItem("foodItems");
        setTimeout(() => {
          if (foodItems.length === 0) {
            setShowButtons(false);
          }
        }, 270);
      }
    }
  }, [foodItems, dataLoaded]);

  return (
    <div className="app">
      <Headline />
      <AddItemForm
        onAddItems={handleAddItems}
        onKeyDown={handleKeyDown}
        onQuantity={handleQuantity}
        food={food}
        setFood={setFood}
        quantity={quantity}
        setQuantity={setQuantity}
        unit={unit}
        setUnit={setUnit}
        inputRef={inputRef}
        isCheck={isCheck}
        onClick={handleClick}
        onFocus={handleFocus}
        setShowButtons={setShowButtons}
      />

      <FoodItemsList
        foodItems={foodItems}
        selectedItemId={selectedItemId}
        onSelectedItem={handleSelectedItem}
        onEditItem={handleEditItem}
        onDeleteItem={handleDeleteItem}
        onClearList={handleClearList}
        showButtons={showButtons}
        cursorPosition={cursorPosition}
        onCursorPosition={setCursorPosition}
        popupVisible={popupVisible}
        setPopupVisible={setPopupVisible}
        setShowButtons={setShowButtons}
        containerHeight={containerHeight}
        dataLoaded={dataLoaded}
      />

      <KcalOutputList
        kcalItems={kcalItems}
        foodItems={foodItems}
        dataLoaded={dataLoaded}
      />
      <Footer />
      {popupVisible && (
        <Popup
          onAddItems={handleAddItems}
          onKeyDown={handleKeyDown}
          setPopupVisible={setPopupVisible}
          cursorPosition={cursorPosition}
          itemToEdit={itemToEdit}
          setItemToEdit={setItemToEdit}
          setSelectedItemId={setSelectedItemId}
          onUpdateItem={handleUpdateItem}
          originalItem={originalItem}
          setOriginalItem={setOriginalItem}
          isCheck={isCheck}
          onClick={handleClick}
          onFocus={handleFocus}
          inputRef={inputRef}
          setShowButtons={setShowButtons}
        />
      )}
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

function AddItemForm({
  onAddItems,
  onKeyDown,
  onQuantity,
  food,
  setFood,
  setQuantity,
  quantity,
  unit,
  setUnit,
  inputRef,
  isCheck,
  onClick,
  onFocus,
  setShowButtons,
}) {
  function handleSubmit(e) {
    e.preventDefault();
    if (!food || !quantity) return alert("Wypełnij własciwie wszystkie pola!");

    const id = crypto.randomUUID();
    const newFoodItem = {
      id,
      food: food[0].toUpperCase() + food.slice(1),
      quantity,
      unit,
    };
    // ;
    setShowButtons(false);
    setFood("");
    setQuantity("");
    setUnit("g");
    onAddItems(newFoodItem);
    console.log(newFoodItem);
    setTimeout(() => {
      setShowButtons(true);
    }, 1);
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
        onKeyDown={onKeyDown}
        ref={inputRef}
        {...(!isCheck && { onClick: onClick })}
        onFocus={onFocus}
      />
      <div className="add_item__container">
        <input
          id="input-quantity"
          className="add_item__container--quantity"
          type="number"
          placeholder="Ilość"
          value={quantity}
          onChange={onQuantity}
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

        <Button style={{ width: "12rem" }}>Dodaj</Button>
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
  onClearList,
  showButtons,
  cursorPosition,
  onCursorPosition,
  popupVisible,
  setPopupVisible,
  setShowButtons,
  containerHeight,
  dataLoaded,
}) {
  const [showDelayedButton, setShowDelayedButton] = useState(true);
  const hasSelectedItem = selectedItemId !== null;
  const elementRef = useRef(null);

  useEffect(() => {
    if (dataLoaded) {
      elementRef.current.classList.add("long-animated");
    }
  }, [dataLoaded]);

  useEffect(() => {
    setTimeout(() => {
      setShowDelayedButton(false);
    }, 1600);
  }, []);

  return (
    <div className="food-items">
      <div
        className="food-items__food-list"
        style={{ height: containerHeight }}
        // style={foodItems.length === 0 ? { maxHeight: "4vh", flex: 1 } : {}}
      >
        <ul
          ref={elementRef}
          className={hasSelectedItem ? "has-selected-item" : ""}
        >
          {foodItems.map((foodItem, numItem) => (
            <FoodItem
              foodItem={foodItem}
              numItem={numItem}
              key={foodItem.id}
              selectedItemId={selectedItemId}
              onSelectedItem={onSelectedItem}
              onEdit={onEditItem}
              onDelete={onDeleteItem}
              cursorPosition={cursorPosition}
              onCursorPosition={onCursorPosition}
              popupVisible={popupVisible}
              setPopupVisible={setPopupVisible}
              setShowButtons={setShowButtons}
              foodItems={foodItems}
            />
          ))}
        </ul>
      </div>
      {showButtons && (
        <div
          className={`food-items__action ${
            !foodItems.length ? "move-out" : ""
          }`}
        >
          <Button
            style={{
              animation: !showDelayedButton
                ? "moveInBotton 0.5s backwards ease-in-out"
                : "",
            }}
          >
            Szacuj!
          </Button>
          <Button
            style={{
              animation: !showDelayedButton
                ? "moveInBotton 0.5s backwards ease-in-out"
                : "",
            }}
            onClick={onClearList}
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
  numItem,
  selectedItemId,
  onSelectedItem,
  onEdit,
  onDelete,
  cursorPosition,
  onCursorPosition,
  popupVisible,
  setShowButtons,
  foodItems,
}) {
  const isSelected = selectedItemId === foodItem.id;
  const elementRef = useRef(null);

  function handleClickItem(e) {
    onSelectedItem(foodItem.id);
    onCursorPosition({ x: e.clientX, y: e.clientY + window.scrollY });
  }

  function handleDeleteItemEffect() {
    onDelete(foodItem.id);
    if (foodItems.length === 1) return;
    setShowButtons(false);
    setTimeout(() => {
      setShowButtons(true);
    }, 1);
  }

  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.classList.add("animated");
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        elementRef.current &&
        !e.target.classList.contains("food-item__btn--action") &&
        !elementRef.current.contains(e.target)
      ) {
        if (!popupVisible && isSelected) {
          onSelectedItem(null);
        }
      }
    }

    function handleEscKey(e) {
      if (e.key === "Escape") {
        onSelectedItem(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [onSelectedItem, popupVisible, isSelected]);

  return (
    <li className={`food-item ${isSelected ? "selected" : ""}`}>
      <span ref={elementRef} onClick={handleClickItem}>
        {foodItem.quantity.length ? (
          <>
            <span className="food-item__number">{numItem + 1}. </span>
            <span>{foodItem.food}: </span>
            <span className="food-item__quantity">
              {foodItem.quantity}{" "}
              <span className="food-item__unit">{foodItem.unit}</span>
            </span>
          </>
        ) : (
          <>
            <span className="food-item__number">{numItem + 1}. </span>
            <span>{foodItem.food}</span>
          </>
        )}
      </span>

      {isSelected && !popupVisible && (
        <div
          className="food-item__btn"
          style={{ top: cursorPosition.y, left: cursorPosition.x }}
        >
          <button
            className="food-item__btn--action"
            onClick={(e) => onEdit(foodItem.id, e)}
          >
            Edytuj
          </button>
          <button
            className="food-item__btn--action"
            onClick={handleDeleteItemEffect}
          >
            Usuń
          </button>
        </div>
      )}
    </li>
  );
}

function KcalOutputList({ kcalItems, foodItems, dataLoaded }) {
  const prevFoodItemsLength = useRef(foodItems.length);

  useEffect(() => {
    const elements = document.querySelectorAll(".kcal-item");
    if (foodItems.length !== prevFoodItemsLength.current) {
      if (dataLoaded) {
        elements.forEach((element) => {
          element.classList.add("long-animated");
          const timer = setTimeout(() => {
            element.classList.remove("long-animated");
          }, 1300);
          return () => clearTimeout(timer);
        });
      } else {
        elements.forEach((element) => {
          element.classList.add("animated");
          const timer = setTimeout(() => {
            element.classList.remove("animated");
          }, 300);
          return () => clearTimeout(timer);
        });
      }
    }
    prevFoodItemsLength.current = foodItems.length;
  }, [foodItems, dataLoaded]);

  return (
    <div className="kcal-items">
      <div className="kcal-items__kcal-list">
        <ul>
          {kcalItems
            .map((kcalItem) => (
              <KcalOutputLItem kcalItem={kcalItem} key={kcalItem.id} />
            ))
            .reverse()}
        </ul>
      </div>
    </div>
  );
}

function KcalOutputLItem({ kcalItem }) {
  return (
    <li className="kcal-item">
      <ul>
        <li>
          <span className="kcal-item__food">{kcalItem.food}</span>
        </li>
        <li>
          <span className="kcal-item__food">
            {" "}
            Kalorie: {kcalItem.kcal} kcal
          </span>
        </li>
        <li>
          <span className="kcal-item__food">Tłuszcze: {kcalItem.fat} g</span>
        </li>
        <li>
          <span className="kcal-item__food">
            Węglowodany: {kcalItem.carbohydrates} g
          </span>
        </li>
        <li>
          <span className="kcal-item__food">Białko: {kcalItem.protein} g</span>
        </li>
      </ul>
    </li>
  );
}

function Footer() {
  return (
    <footer className="copyright">
      <p>Aplikacja wykorzystuje OpenAI.</p>
      <p>
        Copyright &copy; <span>{new Date().getFullYear()}</span> by Seweryn
        Zagajny. <br />
        All rights reserved.
      </p>
    </footer>
  );
}

function Popup({
  onKeyDown,
  setPopupVisible,
  cursorPosition,
  itemToEdit,
  setItemToEdit,
  setSelectedItemId,
  onUpdateItem,
  originalItem,
  setOriginalItem,
  isCheck,
  onClick,
  onFocus,
  inputRef,
}) {
  const popupRef = useRef(null);

  function handleCancelEdit() {
    setPopupVisible(false);
    setSelectedItemId(null);
  }

  function isItemUnchanged(originalItem, editedItem) {
    return JSON.stringify(originalItem) === JSON.stringify(editedItem);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!itemToEdit.food || !itemToEdit.quantity)
      return alert("Wypełnij poprawnie wszystkie pola!");

    setPopupVisible(false);
    setSelectedItemId(null);

    if (isItemUnchanged(originalItem, itemToEdit)) {
      console.log("Item has not been changed.");
      return;
    }
    const updatedItem = {
      ...itemToEdit,
      food: itemToEdit.food[0].toUpperCase() + itemToEdit.food.slice(1),
    };
    onUpdateItem(updatedItem);
    setOriginalItem(null);
    console.log(updatedItem);
  }
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        popupRef.current &&
        !e.target.classList.contains("popup__content") &&
        !popupRef.current.contains(e.target)
      ) {
        setSelectedItemId(null);
        setPopupVisible(false);
      }
    }

    function handleEscKey(e) {
      if (e.key === "Escape") {
        setSelectedItemId(null);
        setPopupVisible(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [setSelectedItemId, setPopupVisible]);

  return (
    <div className="popup">
      <div
        ref={popupRef}
        className="popup__content"
        style={{ top: `${cursorPosition.y}px` }}
      >
        <form className="popup__content--edit_item" onSubmit={handleSubmit}>
          <input
            id="input-food"
            className="popup__content--edit_item__food"
            type="text"
            placeholder="Danie lub składnik"
            value={itemToEdit.food}
            onChange={(e) =>
              setItemToEdit({ ...itemToEdit, food: e.target.value })
            }
            onKeyDown={onKeyDown}
            ref={inputRef}
            {...(!isCheck && { onClick: onClick })}
            onFocus={onFocus}
          />
          <div className="popup__content--edit_item__container">
            <input
              id="input-quantity"
              className="popup__content--edit_item__container--quantity"
              type="number"
              placeholder="Ilość"
              value={itemToEdit.quantity}
              onChange={(e) =>
                setItemToEdit({ ...itemToEdit, quantity: e.target.value })
              }
            />
            <label
              className="popup__content--edit_item__container--label"
              htmlFor="item-select-unit"
            >
              Wybierz jednostkę:
            </label>
            <select
              id="item-select-unit"
              className="popup__content--edit_item__container--unit"
              value={itemToEdit.unit}
              onChange={(e) =>
                setItemToEdit({ ...itemToEdit, unit: e.target.value })
              }
            >
              {units.map((el) => (
                <option value={el.unit} key={el.id}>
                  {el.unit}
                </option>
              ))}
            </select>
            <Button
              type="button"
              onClick={handleCancelEdit}
              className="popup__content--btn"
              style={{
                width: "12rem",
                animation: "none",
              }}
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              className="popup__content--btn"
              style={{
                width: "12rem",
                animation: "none",
              }}
            >
              Zapisz
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

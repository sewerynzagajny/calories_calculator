import { useState, useRef, useEffect } from "react";

const units = [
  { id: 0, unit: "g" },
  { id: 1, unit: "kg" },
  { id: 2, unit: "ml" },
  { id: 3, unit: "l" },
];

function Button({ type, style, onClick, children, loading }) {
  return (
    <button
      type={type}
      style={style}
      onClick={!loading ? onClick : null}
      disabled={loading}
      className={`button ${loading ? "button--loading" : ""}`}
    >
      {children}
    </button>
  );
}

export default function App() {
  const [delayedVisibility, setDelayedVisibility] = useState(false);
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
  const [containerKcalHeight, setContainerKcalHeight] = useState("auto");

  const [kcalItems, setKcalItems] = useState([]);
  const [showKcalButtons, setShowKcalButtons] = useState(false);
  const [dataKcalLoaded, setDataKcalLoaded] = useState(false);
  const [selectedKcalItemId, setSelectedKcalItemId] = useState(null);

  const [loading, setLoading] = useState(false);

  const apiKey = process.env.REACT_APP_API_KEY;
  const apiURL = "https://api.openai.com/v1/chat/completions";
  const model = "gpt-3.5-turbo";

  function Timeout(s) {
    return new Promise(function (_, reject) {
      setTimeout(function () {
        reject(new Error(`Request took too long! Timeout after ${s} second`));
      }, s * 1000);
    });
  }

  async function AJAX(
    url,
    uploadData = undefined,
    KeyName = undefined,
    authKey = undefined,
    contentType = "application/json"
  ) {
    try {
      const headers = { "Content-Type": contentType };

      if (authKey) {
        headers["Authorization"] = `${KeyName} ${authKey}`;
      }

      let body;
      if (uploadData) {
        if (contentType === "application/json") {
          body = JSON.stringify(uploadData);
        } else if (contentType === "application/x-www-form-urlencoded") {
          body = new URLSearchParams(uploadData).toString();
        }
      }

      const fetchPro = fetch(url, {
        method: uploadData ? "POST" : "GET",
        headers: headers,
        body: body,
      });

      const res = await Promise.race([fetchPro, Timeout(10)]);
      const data = await res.json();

      if (!res.ok) throw new Error(`${data.message} ${res.status}`);
      return data;
    } catch (err) {
      console.error("Error in AJAX function:", err);
      throw err;
    }
  }

  function handleAddItems(foodItem) {
    setFoodItems((foodItems) => [...foodItems, foodItem]);
  }

  function handleAddKcalItems(kcalItem) {
    setKcalItems((kcalItems) => [...kcalItems, kcalItem]);
  }

  function handleUpdateItem(updatedItem) {
    setFoodItems((foodItems) =>
      foodItems.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  }

  function handleDeleteItem(id) {
    const container = document.querySelector(".food-items__food-list");
    setFoodItems((foodItems) => foodItems.filter((item) => item.id !== id));
    setSelectedItemId(null);
    if (foodItems.length === 1) {
      setContainerHeight(container.offsetHeight + "px");
      if (kcalItems.length) {
        setShowKcalButtons(false);
        setTimeout(() => {
          setShowKcalButtons(true);
        }, 1);
      }
      setTimeout(() => {
        setContainerHeight("auto");
      }, 270);
    }
  }

  function handleDeleteKcalItem(id) {
    const container = document.querySelector(".kcal-items__kcal-list");
    setKcalItems((kcalItems) => kcalItems.filter((item) => item.id !== id));
    setSelectedKcalItemId(null);
    if (kcalItems.length === 1) {
      setContainerKcalHeight(container.offsetHeight + "px");
      setTimeout(() => {
        setContainerKcalHeight("auto");
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
  function handleSelectedKcalItem(id) {
    setSelectedKcalItemId((cur) => (cur === id ? null : id));
  }

  function handleClearList() {
    const container = document.querySelector(".food-items__food-list");
    const confirmed = window.confirm(
      "Czy na pewno chcesz usunąć listę składników?"
    );
    if (confirmed) {
      setContainerHeight(container.offsetHeight + "px");
      setFoodItems([]);
      setTimeout(() => {
        setContainerHeight("auto");
      }, 270);
      if (kcalItems.length) {
        setShowKcalButtons(false);
        setTimeout(() => {
          setShowKcalButtons(true);
        }, 1);
      }
    }
  }

  function handleClearKcalList() {
    const container = document.querySelector(".kcal-items__kcal-list");
    const confirmed = window.confirm(
      "Czy na pewno chcesz usunąć listę z wynikami?"
    );
    if (confirmed) {
      setContainerKcalHeight(container.offsetHeight + "px");
      setKcalItems([]);
      setTimeout(() => {
        setContainerKcalHeight("auto");
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
      alert("Wpisz ilość w innym polu!");
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

  function handleClick() {
    const input = inputRef.current;
    if (input) {
      const length = input.value.length;
      input.setSelectionRange(length, length);
      input.scrollLeft = input.scrollWidth;
    }
    setTimeout(() => {
      setIsCheck(true);
    }, 1);
  }

  function handleFocus() {
    setIsCheck(false);
  }

  async function handleEstimate() {
    // setLoading(true);
    const container = document.querySelector(".food-items__food-list");
    const foodItemString = foodItems
      .map((item) => `${item.food}: ${item.quantity} ${item.unit}`)
      .join(". ");
    const estimateText = `Oszacuj kaloryczność i makroskładniki dla: ${foodItemString}. Zwróć wynik bez żadnych opisów i komentarzy tylko w formacie JSON z kluczami: calories, protein, fat, carbohydrates.`;

    const dataInput = {
      model,
      messages: [
        { role: "system", content: "Jesteś pomocnym asystentem." },
        { role: "user", content: estimateText },
      ],
      max_tokens: 200,
      temperature: 0.7,
    };

    try {
      // const response = await AJAX(apiURL, dataInput, "Bearer", apiKey);
      // const output = response.choices[0].message.content;
      // const dataOutput = JSON.parse(output);
      const id = crypto.randomUUID();
      // const newKcalItem = {
      //   id,
      //   food: foodItemString,
      //   calories: dataOutput.calories,
      //   fat: dataOutput.fat,
      //   carbohydrates: dataOutput.carbohydrates,
      //   protein: dataOutput.protein,
      // };

      const newKcalItem = {
        id,
        food: foodItemString,
        calories: "test",
        fat: "test",
        carbohydrates: "test",
        protein: "test",
      };
      console.log("test");

      // if (containerRef.current) {
      //   setContainerHeight(containerRef.current.offsetHeight + "px");
      // }
      handleAddKcalItems(newKcalItem);
      setContainerHeight(container.offsetHeight + "px");
      setFoodItems([]);
      setTimeout(() => {
        setContainerHeight("auto");
        setLoading(false);
      }, 270);
    } catch (error) {
      console.error("Error fetching estimate:", error);
    }
  }

  useEffect(() => {
    setTimeout(() => {
      setDelayedVisibility(true);
    }, 10);
  }, []);

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

  useEffect(() => {
    const storedKcalItems = localStorage.getItem("kcalItems");
    if (storedKcalItems) {
      setKcalItems(JSON.parse(storedKcalItems));
      setShowKcalButtons(true);
    }
    setDataKcalLoaded(true);
  }, []);

  useEffect(() => {
    if (dataKcalLoaded) {
      if (kcalItems.length > 0) {
        localStorage.setItem("kcalItems", JSON.stringify(kcalItems));
        setShowKcalButtons(true);
      } else {
        localStorage.removeItem("kcalItems");
        setTimeout(() => {
          if (kcalItems.length === 0) {
            setShowKcalButtons(false);
          }
        }, 270);
      }
    }
  }, [kcalItems, dataKcalLoaded]);

  return (
    <div className="app">
      {delayedVisibility && (
        <>
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
            loading={loading}
            setShowKcalButtons={setShowKcalButtons}
            kcalItems={kcalItems}
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
            setShowKcalButtons={setShowKcalButtons}
            containerHeight={containerHeight}
            dataLoaded={dataLoaded}
            onEstimate={handleEstimate}
            loading={loading}
            setLoading={setLoading}
            kcalItems={kcalItems}
          />

          <KcalOutputList
            kcalItems={kcalItems}
            foodItems={foodItems}
            selectedKcalItemId={selectedKcalItemId}
            onSelectedKcalItem={handleSelectedKcalItem}
            dataLoaded={dataLoaded}
            onClearKcalList={handleClearKcalList}
            showKcalButtons={showKcalButtons}
            setShowKcalButtons={setShowKcalButtons}
            containerKcalHeight={containerKcalHeight}
            cursorPosition={cursorPosition}
            onCursorPosition={setCursorPosition}
            onDeleteKcalItem={handleDeleteKcalItem}
            loading={loading}
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
              loading={loading}
            />
          )}
        </>
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
  loading,
  setShowKcalButtons,
  kcalItems,
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
    setShowKcalButtons(false);
    setFood("");
    setQuantity("");
    setUnit("g");
    onAddItems(newFoodItem);
    setTimeout(() => {
      setShowButtons(true);
      if (kcalItems.length) setShowKcalButtons(true);
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

        <Button loading={loading} style={{ width: "12rem" }}>
          Dodaj
        </Button>
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
  setShowKcalButtons,
  containerHeight,
  dataLoaded,
  onEstimate,
  loading,
  setLoading,
  kcalItems,
}) {
  const [showDelayedButton, setShowDelayedButton] = useState(true);
  const hasSelectedItem = selectedItemId !== null;
  const elementRef = useRef(null);

  function getAIanswer() {
    setLoading(true);
    onEstimate();
    setShowKcalButtons(true);
    if (kcalItems.length) setShowKcalButtons(false);
    setTimeout(() => {
      setShowKcalButtons(true);
    }, 1);
  }

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
          className={hasSelectedItem || loading ? "has-selected-item" : ""}
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
              setShowKcalButtons={setShowKcalButtons}
              foodItems={foodItems}
              loading={loading}
              kcalItems={kcalItems}
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
            onClick={getAIanswer}
            loading={loading}
          >
            {loading ? <Spinner /> : "Szacuj"}
          </Button>
          <Button
            style={{
              animation: !showDelayedButton
                ? "moveInBotton 0.5s backwards ease-in-out"
                : "",
            }}
            onClick={onClearList}
            loading={loading}
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
  setShowKcalButtons,
  foodItems,
  loading,
  kcalItems,
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
    if (kcalItems.length) setShowKcalButtons(false);
    setTimeout(() => {
      setShowButtons(true);
      if (kcalItems.length) setShowKcalButtons(true);
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
      <span ref={elementRef} onClick={!loading ? handleClickItem : null}>
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

function KcalOutputList({
  kcalItems,
  foodItems,
  selectedKcalItemId,
  onSelectedKcalItem,
  dataLoaded,
  onClearKcalList,
  showKcalButtons,
  setShowKcalButtons,
  containerKcalHeight,
  cursorPosition,
  onCursorPosition,
  onDeleteKcalItem,
  loading,
}) {
  const prevFoodItemsLength = useRef(foodItems.length);
  const prevKcalItemsLength = useRef(kcalItems.length);
  const [showDelayedButton, setShowDelayedButton] = useState(true);
  const hasSelectedKcalItem = selectedKcalItemId !== null;

  useEffect(() => {
    const elements = document.querySelectorAll(".kcal-item");
    if (foodItems.length !== prevFoodItemsLength.current) {
      if (foodItems.length === 0 && prevFoodItemsLength.current > 0) {
        // Usunięto ostatni element lub wszystkie elementy z foodItems
        elements.forEach((element) => {
          element.classList.add("long-animated");
          const timer = setTimeout(() => {
            element.classList.remove("long-animated");
          }, 1300);
          setShowDelayedButton(true);
          return () => clearTimeout(timer);
        });
      } else {
        // Dodano elementy lub usunięto pojedyncze elementy, ale nie wszystkie
        elements.forEach((element) => {
          element.classList.add("animated");
          const timer = setTimeout(() => {
            element.classList.remove("animated");
          }, 300);
          setShowDelayedButton(false);
          return () => clearTimeout(timer);
        });
      }
    }

    // Sprawdź, czy `foodItems` jest puste i `kcalItems` się zmieniło
    if (
      foodItems.length === 0 &&
      kcalItems.length < prevKcalItemsLength.current
    ) {
      setShowDelayedButton(false);
    }

    prevFoodItemsLength.current = foodItems.length;
    prevKcalItemsLength.current = kcalItems.length;
  }, [foodItems, kcalItems, dataLoaded, setShowKcalButtons]);

  const elementRef = useRef(null);

  useEffect(() => {
    if (dataLoaded) {
      elementRef.current.classList.add("long-animated");
    }
  }, [dataLoaded]);

  return (
    <div ref={elementRef} className="kcal-items">
      <div
        className="kcal-items__kcal-list"
        style={{ height: containerKcalHeight }}
      >
        <ul
          className={`kcal-items__kcal-list--list ${
            hasSelectedKcalItem ? "has-selected-item" : ""
          }`}
        >
          {kcalItems
            .map((kcalItem) => (
              <KcalOutputLItem
                kcalItem={kcalItem}
                key={kcalItem.id}
                selectedKcalItemId={selectedKcalItemId}
                onSelectedKcalItem={onSelectedKcalItem}
                cursorPosition={cursorPosition}
                onCursorPosition={onCursorPosition}
                onDeleteKcalItem={onDeleteKcalItem}
                setShowKcalButtons={setShowKcalButtons}
                loading={loading}
              />
            ))
            .reverse()}
        </ul>
      </div>
      {showKcalButtons && (
        <div
          className={`kcal-items__action ${
            !kcalItems.length ? "move-out" : ""
          }`}
        >
          <Button
            style={{
              animation: !showDelayedButton
                ? "moveInBotton 0.5s backwards ease-in-out"
                : "",
            }}
          >
            Suma
          </Button>
          <Button
            style={{
              animation: !showDelayedButton
                ? "moveInBotton 0.5s backwards ease-in-out"
                : "",
            }}
            onClick={onClearKcalList}
          >
            Usuń listę kcal
          </Button>
        </div>
      )}
    </div>
  );
}

function KcalOutputLItem({
  kcalItem,
  selectedKcalItemId,
  onSelectedKcalItem,
  cursorPosition,
  onCursorPosition,
  onDeleteKcalItem,
  setShowKcalButtons,
  loading,
}) {
  const isKcalSelected = selectedKcalItemId === kcalItem.id;
  const elementRef = useRef(null);

  function handleClickKcalItem(e) {
    if (e.target.tagName === "SPAN") {
      onSelectedKcalItem(kcalItem.id);
      onCursorPosition({
        x: e.clientX - 40,
        y: e.clientY + window.scrollY,
      });
    }
  }

  function handleDeleteKcalItemEffect() {
    onDeleteKcalItem(kcalItem.id);
    if (kcalItem.length === 1) return;
    setShowKcalButtons(false);
    setTimeout(() => {
      setShowKcalButtons(true);
    }, 1);
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        elementRef.current &&
        !e.target.classList.contains("kcal-item__btn--action") &&
        !elementRef.current.contains(e.target)
      ) {
        if (isKcalSelected) {
          onSelectedKcalItem(null);
        }
      } else if (e.target.tagName === "LI" || e.target.tagName === "UL") {
        onSelectedKcalItem(null);
      }
    }

    function handleEscKey(e) {
      if (e.key === "Escape") {
        onSelectedKcalItem(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isKcalSelected, onSelectedKcalItem]);

  return (
    <li className={`kcal-item ${isKcalSelected ? "selected" : ""}`}>
      <ul ref={elementRef} onClick={!loading ? handleClickKcalItem : null}>
        <li>
          <span className="kcal-item__food">{kcalItem.food}</span>
        </li>
        <li>
          <span className="kcal-item__food">
            {" "}
            Kalorie: {kcalItem.calories} kcal
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
      {isKcalSelected && (
        <div
          className="kcal-item__btn"
          style={{ top: cursorPosition.y, left: cursorPosition.x }}
        >
          <button
            className="kcal-item__btn--action"
            onClick={handleDeleteKcalItemEffect}
          >
            Usuń
          </button>
        </div>
      )}
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

function Spinner() {
  return (
    <div className="spinner">
      <svg width="24" height="24">
        <use href="/icons.svg#icon-loader" />
      </svg>
    </div>
  );
}

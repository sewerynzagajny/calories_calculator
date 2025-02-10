import { useState, useRef, useEffect } from "react";
import { units } from "../utils/units"; /// przy dodawaniu i edycji
import AJAX from "../utils/AJAX";
import Headline from "./Headline";
import AddItemForm from "./AddItemForm";
import FoodItemsList from "./FoodItemsList";
import KcalOutputList from "./KcalOutputList";
import Footer from "./Footer";
import Popup from "./Popup";
import PopupTotal from "./PopupTotal";

export default function App() {
  const [delayedVisibility, setDelayedVisibility] = useState(false);
  const [foodItems, setFoodItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [showButtons, setShowButtons] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupTotalVisible, setPopupTotalVisible] = useState(false);

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
  const [showKcalDetails, setShowKcalDetails] = useState(() => {
    const storedKcalDetails = localStorage.getItem("kcalDetails");
    return storedKcalDetails ? JSON.parse(storedKcalDetails) : {};
  });
  const [sum, setSum] = useState({});
  const [loading, setLoading] = useState(false);

  const apiKey = process.env.REACT_APP_API_KEY;
  const apiURL = "https://api.openai.com/v1/chat/completions";
  // const model = "gpt-3.5-turbo";
  const model = "gpt-4";

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
    const container = document.querySelector(".kcal__items__kcal-list");
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
    let cursorY = e.clientY;
    const mediaQuery = window.matchMedia("(max-width: 992px)");
    if (mediaQuery.matches) {
      if (cursorY < 65) {
        cursorY += 120;
      } else cursorY += 40;
    } else if (cursorY < 40) {
      cursorY += 30;
    }

    setCursorPosition({ x: 0, y: cursorY });
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
    const container = document.querySelector(".kcal__items__kcal-list");
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

  function sumValues(items, key) {
    const sum = items.reduce((acc, item) => acc + +item[key], 0);
    return Math.ceil(sum * 100) / 100;
  }

  function handleShowTotal() {
    setPopupTotalVisible(true);
    const totalSum = {
      quantity: kcalItems.length,
      calories: sumValues(kcalItems, "calories"),
      fat: sumValues(kcalItems, "fat"),
      carbohydrates: sumValues(kcalItems, "carbohydrates"),
      protein: sumValues(kcalItems, "protein"),
    };
    setSum(totalSum);
  }

  function handleKeyDown(e) {
    const charCode = e.keyCode || e.which;
    if (
      !e.shiftKey &&
      !e.ctrlKey &&
      !e.altKey &&
      !e.metaKey &&
      ((charCode >= 48 && charCode <= 57) ||
        (charCode >= 96 && charCode <= 105))
    ) {
      e.preventDefault();
      alert("Wpisz ilość w innym polu.");
      inputRef.current.blur();
    }
  }

  function handlePaste(e) {
    const paste = e.clipboardData?.getData("text");
    if (paste && /\d/.test(paste)) {
      e.preventDefault();
      alert("Wklej treść bez liczb, a ilość wpisz w innym polu.");
      if (inputRef.current) {
        inputRef.current.blur();
      }
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
    const container = document.querySelector(".food-items__food-list");
    const foodItemString = foodItems
      .map((item) => `${item.food}: ${item.quantity} ${item.unit}`)
      .join("; ")
      .trim();
    const estimateText = `Oszacuj razem kaloryczność i makroskładniki dla: ${foodItemString}. Odpowiedz tylko w JSON {calories, protein, fat, carbohydrates}, bez komentarzy, sugestii. Jeśli co najmniej jeden składnik nie nadaje się do spożycia, odpowiedz -1.`;

    const dataInput = {
      model,
      messages: [
        { role: "system", content: "Jesteś pomocnym asystentem." },
        { role: "user", content: estimateText },
      ],
      max_tokens: 200,
      temperature: 0.7,
    };

    function wrongInput() {
      setLoading(false);
      setTimeout(() => {
        alert(
          "Błąd. Możliwe, że nie rozpoznano składnika lub dania. Sprawdź poprawność nazwy i spróbuj ponownie."
        );
      }, 270);
    }

    try {
      const response = await AJAX(apiURL, dataInput, "Bearer", apiKey);
      const output = response.choices[0].message.content;
      if (output === "-1") {
        wrongInput();
        return;
      }

      const dataOutput = JSON.parse(output);
      if (
        dataOutput.calories === -1 ||
        dataOutput.protein === -1 ||
        dataOutput.carbohydrates === -1 ||
        dataOutput.fat === -1
      ) {
        wrongInput();
        return;
      }
      const id = crypto.randomUUID();
      const newKcalItem = {
        id,
        food: foodItemString,
        calories: Math.ceil(dataOutput.calories * 100) / 100,
        fat: Math.ceil(dataOutput.fat * 100) / 100,
        carbohydrates: Math.ceil(dataOutput.carbohydrates * 100) / 100,
        protein: Math.ceil(dataOutput.protein * 100) / 100,
      };

      handleAddKcalItems(newKcalItem);
      setContainerHeight(container.offsetHeight + "px");
      setFoodItems([]);
      setLoading(false);
      setTimeout(() => {
        setContainerHeight("auto");
      }, 270);
      setShowKcalButtons(true);
      if (kcalItems.length) setShowKcalButtons(false);
      setTimeout(() => {
        setShowKcalButtons(true);
      }, 1);
    } catch (error) {
      console.error("Error fetching estimate:", error);
      wrongInput();
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

  useEffect(() => {
    localStorage.setItem("kcalDetails", JSON.stringify(showKcalDetails));
  }, [showKcalDetails]);

  return (
    <div className="app">
      {delayedVisibility && (
        <>
          <Headline />
          <AddItemForm
            onAddItems={handleAddItems}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
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
            foodItems={foodItems}
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
            onShowTotal={handleShowTotal}
            showKcalDetails={showKcalDetails}
            setShowKcalDetails={setShowKcalDetails}
          />
          <Footer />
          {popupVisible && (
            <Popup
              onAddItems={handleAddItems}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
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
          {popupTotalVisible && (
            <PopupTotal
              popupTotalVisible={popupTotalVisible}
              setPopupTotalVisible={setPopupTotalVisible}
              sum={sum}
            />
          )}
        </>
      )}
    </div>
  );
}

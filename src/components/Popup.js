import { useState, useRef, useEffect } from "react";
import { units } from "../utils/units";
import Button from "./Btn";

export default function Popup({
  onKeyDown,
  onPaste,
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

  const [foodEditCorrected, setFoodEditCorrected] = useState("");
  const [initialFood] = useState(itemToEdit.food);
  const workerRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL("../workers/spellWorker.js", import.meta.url)
      );

      workerRef.current.onmessage = (event) => {
        console.log("Otrzymano wiadomość od workera:", event.data);
        if (event.data.result) {
          setFoodEditCorrected(event.data.result);
        } else if (event.data.error) {
          console.error(event.data.error);
        }
      };

      workerRef.current.onerror = (error) => {
        console.error("Worker crashed:", error);
        workerRef.current.terminate();
        workerRef.current = null;
      };
    }
  }, []);

  useEffect(() => {
    if (itemToEdit.food.length === 0 || itemToEdit.food === initialFood) return;

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (workerRef.current) {
        console.log("Wysyłanie wiadomości do workera:", itemToEdit.food);
        workerRef.current.postMessage({ text: itemToEdit.food });
      }
    }, 500);
  }, [itemToEdit.food, initialFood]);

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
      return alert("Wypełnij poprawnie wszystkie pola.");

    if (foodEditCorrected === -1) {
      return alert("Znaleziono błędy w tekście. Proszę poprawić.");
    }

    setPopupVisible(false);
    setSelectedItemId(null);

    if (isItemUnchanged(originalItem, itemToEdit)) {
      return;
    }

    const updatedItem = {
      ...itemToEdit,
      food: foodEditCorrected[0].toUpperCase() + foodEditCorrected.slice(1),
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
            onPaste={onPaste}
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
            {/* <label
              className="popup__content--edit_item__container--label"
              htmlFor="item-select-unit"
            >
              Wybierz jednostkę:
            </label> */}
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

import { useState, useRef, useEffect } from "react";
import Button from "./Btn";
import { units } from "../utils/units";

export default function AddItemForm({
  onAddItems,
  onKeyDown,
  onPaste,
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
  foodItems,
}) {
  const [foodCorrected, setFoodCorrected] = useState("");
  const workerRef = useRef(null);
  const timeoutRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL("../workers/spellWorker.js", import.meta.url)
      );

      workerRef.current.onmessage = (event) => {
        console.log("Otrzymano wiadomość od workera:", event.data);
        if (event.data.result) {
          setFoodCorrected(event.data.result);
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
    if (food.length === 0) return;

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (workerRef.current) {
        console.log("Wysyłanie wiadomości do workera:", food);
        workerRef.current.postMessage({ text: food });
      }
    }, 500);
  }, [food]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!food || !quantity) return alert("Wypełnij właściwie wszystkie pola.");
    if (foodItems.length === 10)
      return alert(
        "Możesz za każdym razem dodać tylko 10 pozycji. Usuń niepotrzebne pozycje albo oszacuj dodane."
      );
    if (foodCorrected === -1) {
      return alert("Znaleziono błędy w tekście. Proszę poprawić.");
    }

    const id = crypto.randomUUID();
    const newFoodItem = {
      id,
      food: foodCorrected[0].toUpperCase() + foodCorrected.slice(1).trim(),
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
        onPaste={onPaste}
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

        <Button
          loading={loading}
          style={{ width: windowWidth < 496 ? "10rem" : "12rem" }}
        >
          Dodaj
        </Button>
      </div>
    </form>
  );
}

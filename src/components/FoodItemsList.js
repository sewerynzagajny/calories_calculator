import { useRef, useEffect, useState } from "react";
import FoodItem from "./FoodItem";
import Button from "./Btn";
import Spinner from "./Spinner";

export default function FoodItemsList({
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
    if (kcalItems.length === 20)
      return alert(
        "Lista kcal może składać się maksymalnie z 40 pozycji! Skasuj niepotrzebne, aby dodać nowe."
      );
    setLoading(true);
    onEstimate();
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

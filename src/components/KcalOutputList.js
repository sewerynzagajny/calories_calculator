import { useState, useRef, useEffect } from "react";
import KcalOutputLItem from "./KcalOutputLItem";
import Button from "./Btn";

export default function KcalOutputList({
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
  onShowTotal,
  showKcalDetails,
  setShowKcalDetails,
  delayedVisibilityKcal,
}) {
  const prevFoodItemsLength = useRef(foodItems.length);
  const prevKcalItemsLength = useRef(kcalItems.length);
  const [showDelayedButton, setShowDelayedButton] = useState(true);
  const hasSelectedKcalItem = selectedKcalItemId !== null;

  useEffect(() => {
    const elements = document.querySelectorAll(".kcal");
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
  }, [
    foodItems,
    kcalItems,
    dataLoaded,
    setShowKcalButtons,
    setShowDelayedButton,
  ]);

  const elementRef = useRef(null);

  useEffect(() => {
    if (dataLoaded) {
      elementRef.current.classList.add("long-animated");
    }
  }, [dataLoaded]);

  return (
    <div className="kcal__items">
      <div
        className="kcal__items__kcal-list"
        style={{ height: containerKcalHeight }}
      >
        <div
          ref={elementRef}
          className={`kcal__items__kcal-list--list ${
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
                kcalItems={kcalItems}
                showKcalDetails={showKcalDetails}
                setShowKcalDetails={setShowKcalDetails}
                delayedVisibilityKcal={delayedVisibilityKcal}
              />
            ))
            .reverse()}
        </div>
      </div>
      {showKcalButtons && (
        <div
          className={`kcal__items__action ${
            !kcalItems.length ? "move-out" : ""
          }`}
        >
          <Button
            style={{
              animation: !showDelayedButton
                ? "moveInBotton 0.5s backwards ease-in-out"
                : "",
            }}
            onClick={onShowTotal}
            loading={loading}
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
            loading={loading}
          >
            Usuń listę kcal
          </Button>
        </div>
      )}
    </div>
  );
}

import { useRef, useEffect } from "react";

export default function FoodItem({
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

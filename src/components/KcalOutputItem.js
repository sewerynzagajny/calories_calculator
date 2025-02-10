import { useRef, useEffect } from "react";

export default function KcalOutputLItem({
  kcalItem,
  selectedKcalItemId,
  onSelectedKcalItem,
  cursorPosition,
  onCursorPosition,
  onDeleteKcalItem,
  setShowKcalButtons,
  loading,
  kcalItems,
  showKcalDetails,
  setShowKcalDetails,
}) {
  const isKcalSelected = selectedKcalItemId === kcalItem.id;
  const isKcalDetailsSelected = showKcalDetails[kcalItem.id];

  const elementRef = useRef(null);
  const kcalItemRef = useRef(null);

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
    if (kcalItems.length === 1) return;
    setShowKcalButtons(false);
    setTimeout(() => {
      setShowKcalButtons(true);
    }, 1);
  }

  function handleToggleKcalDetails() {
    setShowKcalDetails((prev) => ({
      ...prev,
      [kcalItem.id]: !prev[kcalItem.id],
    }));
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        elementRef.current &&
        !e.target.classList.contains("kcal__item__btn--action") &&
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

  useEffect(() => {
    const updateHeight = () => {
      if (kcalItemRef.current) {
        requestAnimationFrame(() => {
          const height = kcalItemRef.current.offsetHeight;
          elementRef.current.style.setProperty(
            "--collapsed-height",
            `${height}px`
          );
        });
      }
    };

    // updateHeight();
    setTimeout(updateHeight, 100); // Dodaj opóźnienie, aby uniknąć błędu związane z animacją

    window.addEventListener("resize", updateHeight); // Dodaj nasłuchiwanie na zdarzenie zmiany rozmiaru
    const currentElement = elementRef.current;
    currentElement.addEventListener("transitionend", updateHeight); // Dodaj nasłuchiwanie na zdarzenie zakończenia animacji

    return () => {
      window.removeEventListener("resize", updateHeight); // Usuń nasłuchiwanie przy odmontowaniu komponentu
      currentElement.removeEventListener("transitionend", updateHeight); // Usuń nasłuchiwanie przy odmontowaniu komponentu
    };
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      setTimeout(() => {
        element.classList.add("initial-position");
        setTimeout(() => {
          element.classList.remove("initial-position");
        }, 50);
      }, 0);
    }
  }, [kcalItems]);

  return (
    <div className="kcal">
      <div className={`kcal__icon ${isKcalSelected ? "selected" : ""}`}>
        {/* {isKcalDetailsSelected ? "▼" : "▲"} */}
        <span
          className={isKcalDetailsSelected ? "rotate-270" : "rotate-90"}
          onClick={handleToggleKcalDetails}
        >
          {">"}
        </span>
      </div>
      <ul>
        <li className={`kcal__item ${isKcalSelected ? "selected" : ""}`}>
          <ul
            ref={elementRef}
            onClick={!loading ? handleClickKcalItem : null}
            className={`kcal__details ${
              !isKcalDetailsSelected
                ? "kcal__details--expanded"
                : "kcal__details--collapsed"
            }`}
          >
            <li>
              <span ref={kcalItemRef} className="kcal__item__food">
                {kcalItem.food}
              </span>
            </li>
            <li>
              <span className="kcal__item__food">
                {" "}
                Kalorie:{" "}
                <span className="kcal__item__value">
                  {kcalItem.calories} kcal
                </span>
              </span>
            </li>
            <li>
              <span className="kcal__item__food">
                Tłuszcze:{" "}
                <span className="kcal__item__value">{kcalItem.fat} g</span>
              </span>
            </li>
            <li>
              <span className="kcal__item__food">
                Węglowodany:{" "}
                <span className="kcal__item__value">
                  {kcalItem.carbohydrates} g
                </span>
              </span>
            </li>
            <li>
              <span className="kcal__item__food">
                Białko:{" "}
                <span className="kcal__item__value">{kcalItem.protein} g</span>
              </span>
            </li>
          </ul>
          {isKcalSelected && (
            <div
              className="kcal__item__btn"
              style={{ top: cursorPosition.y, left: cursorPosition.x }}
            >
              <button
                className="kcal__item__btn--action"
                onClick={handleDeleteKcalItemEffect}
              >
                Usuń
              </button>
            </div>
          )}
        </li>
      </ul>
    </div>
  );
}

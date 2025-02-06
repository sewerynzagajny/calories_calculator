import { useEffect } from "react";
import Button from "./Btn";

export default function PopupTotal({
  popupTotalVisible,
  setPopupTotalVisible,
  sum,
}) {
  useEffect(() => {
    function handleClickOutside(e) {
      const container = document.querySelector(".popup_total__content");

      if (container && !container.contains(e.target)) {
        setPopupTotalVisible(false);
      }
    }

    function handleEscKey(e) {
      if (e.key === "Escape") {
        setPopupTotalVisible(false);
      }
    }

    function handleEnterKey(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        setPopupTotalVisible(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscKey);
    document.addEventListener("keydown", handleEnterKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
      document.removeEventListener("keydown", handleEnterKey);
    };
  }, [popupTotalVisible, setPopupTotalVisible]);

  function handleSubmit(e) {
    e.preventDefault();
    setPopupTotalVisible(false);
  }
  return (
    <div className="popup_total">
      <div className="popup_total__content">
        <form onSubmit={handleSubmit}>
          <ul className="popup_total__content__list">
            <li>
              Ilość dań/składników:{" "}
              <span className="popup_total__content__list--item-value">
                {sum.quantity}
              </span>
            </li>
            <li>
              Kalorie:{" "}
              <span className="popup_total__content__list--item-value">
                {sum.calories} kcal
              </span>
            </li>
            <li>
              Tłuszcze:{" "}
              <span className="popup_total__content__list--item-value">
                {sum.fat} g
              </span>
            </li>
            <li>
              Węglowodany:{" "}
              <span className="popup_total__content__list--item-value">
                {sum.carbohydrates} g
              </span>
            </li>
            <li>
              Białko:{" "}
              <span className="popup_total__content__list--item-value">
                {sum.protein} g
              </span>
            </li>
          </ul>
          <Button
            type="submit"
            className="popup-total__content__btn"
            style={{
              width: "12rem",
              animation: "none",
              display: "block",
              margin: "0 auto",
            }}
          >
            Ok
          </Button>
        </form>
      </div>
    </div>
  );
}

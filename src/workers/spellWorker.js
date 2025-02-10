// /* eslint-env worker */
/* eslint-disable no-restricted-globals */
import AJAX from "../utils/AJAX";

// Funkcja usuwająca znaki interpunkcyjne na końcu wyrażenia
function removeTrailingPunctuation(text) {
  if (typeof text !== "string") return text;
  return text.replace(/[.,!?<>\-+*/^%&|=\s:;]+$/, "");
}

self.onmessage = async function (event) {
  const { text } = event.data;

  // Funkcja sprawdzająca, czy wyraz jest w cudzysłowie i zwracająca tekst bez cudzysłowów
  function isInQuotes(word) {
    const quotePattern = /^["„”''](.+?)["„”'']$/;
    const quotesAndSpacesPattern = /^["„”'']\s*["„”'']$/;
    const match = word.match(quotePattern);

    if (quotesAndSpacesPattern.test(word.trim())) {
      return -1; // Jeśli tekst to tylko dwa cudzysłowy i spacje, zwróć -1
    }
    return match ? match[1].trim() : null;
  }

  // Funkcja sprawdzająca, czy tekst zawiera tylko cudzysłowy, znaki interpunkcyjne, wykrzykniki, znaki zapytania, <, > i symbole działania
  function containsOnlySpecialChars(text) {
    const specialCharsPattern = /^[„”"'.,!?<>\-+*/^%&|=\s]*$/;

    return specialCharsPattern.test(text.trim());
  }

  const strippedText = isInQuotes(text);

  if (!text || text.trim().length === 0 || strippedText !== null) {
    const resultText = strippedText !== null ? strippedText : text;
    self.postMessage({ result: removeTrailingPunctuation(resultText) });
    return;
  }

  if (containsOnlySpecialChars(text)) {
    self.postMessage({ result: -1 });
    return;
  }

  try {
    const result = await AJAX(
      "https://api.languagetool.org/v2/check",
      { text, language: "pl" },
      undefined,
      undefined,
      "application/x-www-form-urlencoded"
    );

    if (result.matches.length > 0) {
      let correctedText = text;
      let hasCorrections = [];

      // Przechodzimy przez błędy i poprawiamy tekst
      result.matches.forEach((match) => {
        if (match.replacements.length > 0) {
          correctedText = correctedText.replace(
            match.context.text.substring(
              match.context.offset,
              match.context.offset + match.context.length
            ),
            match.replacements[0].value
          );
          hasCorrections.push(true);
        } else if (
          match.shortMessage ===
          "Przyimek wymaga biernika, dopełniacza lub narzędnika"
        ) {
          hasCorrections.push(true);
        } else hasCorrections.push(false);
      });

      if (hasCorrections.some((value) => value === false)) {
        self.postMessage({ result: -1 });
        return;
      }

      self.postMessage({ result: removeTrailingPunctuation(correctedText) });
    } else {
      self.postMessage({ result: removeTrailingPunctuation(text) });
    }
  } catch (error) {
    console.error("Błąd podczas sprawdzania tekstu:", error);
    self.postMessage({ error: "Błąd podczas sprawdzania tekstu." });
  }
};

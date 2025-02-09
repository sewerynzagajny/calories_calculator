// /* eslint-env worker */
/* eslint-disable no-restricted-globals */
import AJAX from "../utils/AJAX";

self.onmessage = async function (event) {
  const { text } = event.data;

  // Funkcja sprawdzająca, czy wyraz jest w cudzysłowie
  // function isInQuotes(word) {
  //   const quotePattern = /^["„”''].+["„”'']$/;
  //   return quotePattern.test(word);
  // }

  // if (!text || text.trim().length === 0 || isInQuotes(text)) {
  //   self.postMessage({ result: text });
  //   return;
  // }

  // Funkcja sprawdzająca, czy wyraz jest w cudzysłowie i zwracająca tekst bez cudzysłowów
  function isInQuotes(word) {
    const quotePattern = /^["„”''](.+?)["„”'']$/;
    const match = word.match(quotePattern);
    return match ? match[1] : null;
  }

  // Funkcja sprawdzająca, czy tekst zawiera tylko cudzysłowy, znaki interpunkcyjne, wykrzykniki, znaki zapytania, <, > i symbole działania
  function containsOnlySpecialChars(text) {
    const specialCharsPattern = /^[„”"'.,!?<>\-+*/^%&|=\s]*$/;
    const quotesAndSpacesPattern = /^["„”'']\s*["„”'']$/;
    return (
      specialCharsPattern.test(text.trim()) ||
      quotesAndSpacesPattern.test(text.trim())
    );
  }

  const strippedText = isInQuotes(text);

  if (!text || text.trim().length === 0 || strippedText !== null) {
    self.postMessage({ result: strippedText !== null ? strippedText : text });
    return;
  }

  if (containsOnlySpecialChars(text)) {
    self.postMessage({ result: -1 });
    return;
  }
  try {
    console.log("Wysyłanie zapytania do LanguageTool API...");
    const result = await AJAX(
      "https://api.languagetool.org/v2/check",
      { text, language: "pl" },
      undefined,
      undefined,
      "application/x-www-form-urlencoded"
    );
    console.log("Otrzymano odpowiedź z API:", result);

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

      self.postMessage({ result: correctedText });
    } else {
      self.postMessage({ result: text });
    }
  } catch (error) {
    console.error("Błąd podczas sprawdzania tekstu:", error);
    self.postMessage({ error: "Błąd podczas sprawdzania tekstu." });
  }
};

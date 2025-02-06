// /* eslint-env worker */
/* eslint-disable no-restricted-globals */
import AJAX from "../utils/AJAX";

self.onmessage = async function (event) {
  const { text } = event.data;

  if (!text || text.trim().length === 0) {
    self.postMessage({ result: text }); // Jeśli pusty, zwróć to samo
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

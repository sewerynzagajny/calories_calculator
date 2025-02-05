/* eslint-env worker */
/* eslint-disable no-restricted-globals */

self.onmessage = async function (event) {
  const { text } = event.data;

  if (!text || text.trim().length === 0) {
    self.postMessage({ result: text }); // Jeśli pusty, zwróć to samo
    return;
  }

  try {
    console.log("Wysyłanie zapytania do LanguageTool API...");
    const response = await fetch("https://api.languagetool.org/v2/check", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ text, language: "pl" }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Otrzymano odpowiedź z API:", result);

    if (result.matches.length > 0) {
      let correctedText = text;
      let hasCorrections = false;

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
          hasCorrections = true;
        } else hasCorrections = false;
      });

      if (!hasCorrections) {
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

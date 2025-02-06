export default function Footer() {
  return (
    <footer className="copyright">
      <p>The app uses LanguageTool and OpenAI.</p>
      <p>
        Copyright &copy; <span>{new Date().getFullYear()}</span> by Seweryn
        Zagajny. <br />
        All rights reserved.
      </p>
    </footer>
  );
}

var mt = {
  init: function() {

    const highlight = (editor) => {
      editor.textContent = editor.textContent;
      hljs.highlightBlock(editor);
    };
    
    const editor = document.querySelector(".editor");
    const jar = new CodeJar(editor, highlight);
    
    let currentStyle = 0;
    const styles = [
      "dracula",
      "github",
      "solarized-dark",
      "solarized-light",
      "railscasts",
      "monokai-sublime",
      "mono-blue",
      "tomorrow",
      "color-brewer",
      "zenburn",
      "agate",
      "androidstudio",
      "atom-one-light",
      "rainbow",
      "vs",
      "atom-one-dark"
    ].map((name) => {
      const link = document.createElement("link");
      link.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.18.1/styles/${name}.min.css`;
      link.rel = "stylesheet";
      link.disabled = "true";
      document.head.appendChild(link);
      return link;
    });
    styles[currentStyle].removeAttribute("disabled");
    const switchStyleButton = document.querySelector(".switch-style");
    
    switchStyleButton.addEventListener("click", (event) => {
      event.preventDefault();
    
      styles[currentStyle].setAttribute("disabled", "true");
      currentStyle = (currentStyle + 1) % styles.length;
      styles[currentStyle].removeAttribute("disabled");
    
      let [, name] = styles[currentStyle].href.match(
        /highlight.js.+?\/styles\/(.+?)\.min\.css$/
      );
      switchStyleButton.textContent = name;
    });
    
    let currentLanguage = 0;
    const languages = [
      function () {
        editor.className = "editor language-js";
        jar.updateCode(`import {CodeJar} from '@medv/codejar';
    import Prism from 'prismjs';
    
    const editor = document.querySelector('#editor');
    const jar = new CodeJar(editor, Prism.highlightElement, {tab: '\\t'});
    
    // Update code
    jar.updateCode('let foo = bar');
    
    // Get code
    let code = jar.toString();
    
    // Listen to updates
    jar.onUpdate(code => {
      console.log(code);
    });
    `);
        jar.updateOptions({ tab: "  " });
      },
      function () {
        editor.className = "editor language-md";
        jar.updateCode(`# CodeJar
    An embeddable code editor for the browser 🍯
    
    ## Features
    
    * Lightweight (**2 kB** only)
    * Preserves indentation on a new line
    * Adds closing brackets, quotes
    * Indents line with the \`Tab\` key
    * Supports *undo*/*redo*
    
    ## Getting Started
    
    \`\`\`bash
    npm i @medv/codejar
    \`\`\``);
        jar.updateOptions({ tab: "    " });
      },
      function () {
        editor.className = "editor language-go";
        jar.updateCode(`package main
    
    import (
    \t"fmt"
    \t"github.com/antonmedv/expr"
    )
    
    func main() {
    \tfmt.Println("Hello, CodeJar")
    
    \toutput, err := expr.Eval("1+2")
    \tif err != nil {
    \t\tpanic(err)
    \t}
    }
    `);
        jar.updateOptions({ tab: "\t" });
      },
      function () {
        editor.className = "editor language-ts";
        jar.updateCode(`interface Person {
        firstName: string;
        lastName: string;
    }
    
    function greeter(person: Person) {
        return "Hello, " + person.firstName + " " + person.lastName;
    }
    
    let user = {
        firstName: "Jane",
        lastName: "User"
    };
    
    document.body.textContent = greeter(user);`);
        jar.updateOptions({ tab: "    " });
      },
      function () {
        editor.className = "editor language-rust";
        jar.updateCode(`#[derive(Debug)]
    struct Rectangle {
        width: u32,
        height: u32,
    }
    
    impl Rectangle {
        fn area(&self) -> u32 {
            self.width * self.height
        }
    }
    
    fn main() {
        let rect1 = Rectangle { width: 30, height: 50 };
    
        println!(
            "The area of the rectangle is {} square pixels.",
            rect1.area()
        );
    }`);
        jar.updateOptions({ tab: "    " });
      },
      function () {
        editor.className = "editor language-html";
        jar.updateCode(`<!doctype html>
    
    <html lang="en">
    <head>
      <meta charset="utf-8">
    
      <title>CodeJar</title>
    
      <meta name="author" content="Anton Medvedev">
      <meta name="description" content="Micro Code Editor">
    </head>
    <body>
      <h1>CodeJar — Micro Code Editor</h1>
    </body>
    </html>`);
        jar.updateOptions({ tab: "  " });
      },
      function () {
        editor.className = "editor language-kotlin";
        jar.updateCode(`suspend fun main() = coroutineScope {
        for (i in 0 until 10) {
            launch {
                delay(1000L - i * 10)
                print("❤️$i ")
            }
        }
    }
    
    val positiveNumbers = list.filter { it > 0 }
    
    fun calculateTotal(obj: Any) {
        if (obj is Invoice)
            obj.calculateTotal()
    }`);
        jar.updateOptions({ tab: "    " });
      }
    ];
    
    languages[currentLanguage]();
    
    const switchLanguageButton = document.querySelector(".switch-language");
    switchLanguageButton.addEventListener("click", (event) => {
      event.preventDefault();
      currentLanguage = (currentLanguage + 1) % languages.length;
      languages[currentLanguage]();
      const [, name] = editor.className.match(/language-(\w+)/);
      switchLanguageButton.textContent = name;
    });
    
  }
};